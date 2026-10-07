#!/usr/bin/env python3
"""Court Live detector — The Shiawassee Current.

The Shiawassee County Circuit Court streams each hearing on YouTube as its own
video: a stream starts when a case is called and stops when it ends. This script
watches the court's channel through the official YouTube Data API and writes a
small status.json that /court-live polls, so the page always plays whichever
hearing is live right now.

Run it every 30 seconds (see com.shiawassee.court-live.plist), or with --loop.

Environment:
  YOUTUBE_API_KEY      required. A YouTube Data API v3 key (Google Cloud console, free).
  COURT_STATUS_PATH    where to write status.json (the site's public /court-live/ folder).
  COURT_CHANNEL_ID     default UCY7MUpeiV56M4M5zZPNG69Q (Shiawassee County Circuit Court).
  NTFY_URL             optional, e.g. https://ntfy.sh/<topic>. Alerts Jordan when court goes live.
  NTFY_EVERY_HEARING   "1" to alert on every hearing; default alerts on the first one each day.
  COURT_SEARCH_EVERY_MIN  safety-net live search interval in court hours (default 15).

Quota (free tier is 10,000 units/day): each 30-second check costs 2 units
(playlistItems + videos), checks slow to every 10 minutes outside court hours,
and the safety-net search costs 100 units every 15 minutes in court hours.
That is roughly 7,000 units on a court day.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

API = "https://www.googleapis.com/youtube/v3"
TZ = ZoneInfo("America/Detroit")
DEFAULT_CHANNEL = "UCY7MUpeiV56M4M5zZPNG69Q"

COURT_DAYS = {0, 1, 2, 3, 4}          # Mon–Fri
COURT_OPEN = (7, 30)                  # watch closely from 7:30 AM …
COURT_CLOSE = (18, 0)                 # … to 6:00 PM, Eastern
OFF_HOURS_EVERY = timedelta(minutes=10)
PAGE_URL = "https://shiawassee.news/court-live"


# ---------------------------------------------------------------- utilities

def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_iso(s: str | None) -> datetime | None:
    if not s:
        return None
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def in_court_hours(local: datetime) -> bool:
    if local.weekday() not in COURT_DAYS:
        return False
    hm = (local.hour, local.minute)
    return COURT_OPEN <= hm < COURT_CLOSE


def load_status(path: str) -> dict:
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def write_status(path: str, status: dict) -> None:
    """Atomic write so viewers never fetch a half-written file."""
    directory = os.path.dirname(os.path.abspath(path))
    os.makedirs(directory, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=".status-", suffix=".json", dir=directory)
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(status, f, ensure_ascii=False, indent=1)
    os.chmod(tmp, 0o644)
    os.replace(tmp, path)


def log(msg: str) -> None:
    print(f"{datetime.now(TZ):%Y-%m-%d %H:%M:%S} {msg}", flush=True)


# ------------------------------------------------------------- YouTube API

class YouTube:
    def __init__(self, api_key: str, channel_id: str):
        self.key = api_key
        self.channel_id = channel_id

    def _get(self, path: str, params: dict) -> dict:
        q = urllib.parse.urlencode({**params, "key": self.key})
        req = urllib.request.Request(f"{API}/{path}?{q}", headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.load(r)

    def recent_upload_ids(self, n: int = 8) -> list[str]:
        """Newest videos on the channel. Live hearings show up here (1 unit)."""
        playlist = "UU" + self.channel_id[2:]
        data = self._get("playlistItems", {"part": "contentDetails", "playlistId": playlist, "maxResults": n})
        return [i["contentDetails"]["videoId"] for i in data.get("items", [])]

    def live_search_ids(self) -> list[str]:
        """Safety net that finds any live video directly (100 units, so used sparingly)."""
        data = self._get("search", {"part": "id", "channelId": self.channel_id,
                                    "eventType": "live", "type": "video", "maxResults": 5})
        return [i["id"]["videoId"] for i in data.get("items", []) if i.get("id", {}).get("videoId")]

    def details(self, ids: list[str]) -> dict[str, dict]:
        """Live state, title, times and embeddability for up to 50 videos (1 unit)."""
        if not ids:
            return {}
        data = self._get("videos", {"part": "snippet,liveStreamingDetails,status", "id": ",".join(ids[:50])})
        out = {}
        for v in data.get("items", []):
            lsd = v.get("liveStreamingDetails") or {}
            snip = v.get("snippet") or {}
            out[v["id"]] = {
                "videoId": v["id"],
                "title": snip.get("title", ""),
                "isLive": snip.get("liveBroadcastContent") == "live",
                "startedAt": lsd.get("actualStartTime"),
                "endedAt": lsd.get("actualEndTime"),
                "embeddable": (v.get("status") or {}).get("embeddable", True),
            }
        return out


# ------------------------------------------------------------- one check

def run_once(yt: YouTube, status_path: str, now: datetime | None = None,
             search_every: timedelta = timedelta(minutes=15),
             notify=None, notify_every: bool = False) -> dict:
    now = now or datetime.now(timezone.utc)
    local = now.astimezone(TZ)
    today_key = local.date().isoformat()
    hours = in_court_hours(local)

    prev = load_status(status_path)
    meta = dict(prev.get("_meta") or {})
    prev_live = prev.get("live") or []

    # Outside court hours with nothing live, only check every 10 minutes, but keep
    # the heartbeat fresh so the page trusts "not in session".
    last_check = parse_iso(meta.get("lastCheck"))
    if not hours and not prev_live and last_check and now - last_check < OFF_HOURS_EVERY:
        status = dict(prev)
        status.update(updatedAt=iso(now), phase="closed", live=[])
        if meta.get("day") != today_key:
            status["today"] = []
        write_status(status_path, status)
        return status

    candidates = set(yt.recent_upload_ids())
    candidates |= {v["videoId"] for v in prev_live if v.get("videoId")}
    last_search = parse_iso(meta.get("lastSearch"))
    if hours and (not last_search or now - last_search >= search_every):
        candidates |= set(yt.live_search_ids())
        meta["lastSearch"] = iso(now)

    details = yt.details(sorted(candidates))
    live = sorted((d for d in details.values() if d["isLive"]), key=lambda d: d["startedAt"] or "")
    live_ids = {d["videoId"] for d in live}

    # Today's hearing log (resets at local midnight).
    today = list(prev.get("today") or []) if meta.get("day") == today_key else []
    by_id = {t["videoId"]: t for t in today}
    for d in details.values():
        started = parse_iso(d["startedAt"])
        if not started or started.astimezone(TZ).date().isoformat() != today_key:
            continue
        entry = by_id.setdefault(d["videoId"], {"videoId": d["videoId"]})
        entry["title"] = d["title"]
        entry["startedAt"] = d["startedAt"]
        if d["isLive"]:
            entry["endedAt"] = None
        else:
            entry["endedAt"] = d["endedAt"] or entry.get("endedAt") or iso(now)
    # A hearing that was live but vanished (made private or deleted) has ended.
    for t in by_id.values():
        if not t.get("endedAt") and t["videoId"] not in live_ids and t["videoId"] not in details:
            t["endedAt"] = iso(now)
    today = sorted(by_id.values(), key=lambda t: t.get("startedAt") or "")

    status = {
        "updatedAt": iso(now),
        "channelId": yt.channel_id,
        "phase": "live" if live else ("recess" if hours else "closed"),
        "live": [{k: d[k] for k in ("videoId", "title", "startedAt", "embeddable")} for d in live],
        "today": today,
        "_meta": {**meta, "day": today_key, "lastCheck": iso(now)},
    }

    # Alert Jordan when court goes live (first hearing of the day by default).
    prev_ids = {v.get("videoId") for v in prev_live}
    new_hearing = any(d["videoId"] not in prev_ids for d in live)
    if notify_every:
        should_alert = new_hearing
    else:
        should_alert = bool(live) and meta.get("notifiedDay") != today_key
    if should_alert and notify:
        first = live[0]
        try:
            notify("Circuit Court is live", f"{first['title']}\n{PAGE_URL}")
            status["_meta"]["notifiedDay"] = today_key
        except Exception as e:  # never let an alert failure stop the page updating
            log(f"ntfy failed: {e}")

    write_status(status_path, status)
    return status


def make_ntfy(url: str):
    def send(title: str, body: str) -> None:
        req = urllib.request.Request(url, data=body.encode(), method="POST",
                                     headers={"Title": title, "Tags": "classical_building", "Click": PAGE_URL})
        urllib.request.urlopen(req, timeout=10).read()
    return send


# ------------------------------------------------------------------- main

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--loop", action="store_true", help="run forever, checking every 30 seconds")
    ap.add_argument("--interval", type=int, default=30)
    args = ap.parse_args()

    key = os.environ.get("YOUTUBE_API_KEY", "").strip()
    if not key:
        print("YOUTUBE_API_KEY is not set. Until it is, /court-live runs in its built-in "
              "fallback mode (YouTube's channel live player).", file=sys.stderr)
        return 2
    yt = YouTube(key, os.environ.get("COURT_CHANNEL_ID", DEFAULT_CHANNEL))
    path = os.environ.get("COURT_STATUS_PATH", "./status.json")
    ntfy_url = os.environ.get("NTFY_URL", "").strip()
    notify = make_ntfy(ntfy_url) if ntfy_url else None
    every = os.environ.get("NTFY_EVERY_HEARING") == "1"
    search_every = timedelta(minutes=int(os.environ.get("COURT_SEARCH_EVERY_MIN", "15")))

    while True:
        try:
            s = run_once(yt, path, search_every=search_every, notify=notify, notify_every=every)
            if s.get("live"):
                log(f"LIVE: {', '.join(v['title'] for v in s['live'])}")
        except urllib.error.HTTPError as e:
            # Quota exhausted or bad key: leave status.json untouched. It goes stale in
            # 3 minutes and the page switches to fallback mode on its own.
            body = e.read().decode("utf-8", "replace")[:300]
            log(f"YouTube API error {e.code}: {body}")
        except Exception as e:  # network blips etc.
            log(f"check failed: {e!r}")
        if not args.loop:
            return 0
        time.sleep(args.interval)


if __name__ == "__main__":
    sys.exit(main())
