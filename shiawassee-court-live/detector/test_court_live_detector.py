"""Simulates a court day against a fake YouTube API. Run: python3 -m unittest -v"""
import json
import os
import tempfile
import unittest
from datetime import datetime, timedelta, timezone

import court_live_detector as d

# Wednesday Oct 7 2026, 2:00 PM Eastern (EDT = UTC-4)
T0 = datetime(2026, 10, 7, 18, 0, tzinfo=timezone.utc)


class FakeYouTube:
    channel_id = "UCY7MUpeiV56M4M5zZPNG69Q"

    def __init__(self):
        self.videos = {}      # id -> details dict
        self.uploads = []     # newest first
        self.calls = {"uploads": 0, "search": 0, "details": 0}

    def add(self, vid, title, started, live=True, ended=None, embeddable=True):
        self.videos[vid] = {"videoId": vid, "title": title, "isLive": live,
                            "startedAt": d.iso(started), "endedAt": d.iso(ended) if ended else None,
                            "embeddable": embeddable}
        self.uploads.insert(0, vid)

    def end(self, vid, at):
        self.videos[vid].update(isLive=False, endedAt=d.iso(at))

    def recent_upload_ids(self, n=8):
        self.calls["uploads"] += 1
        return self.uploads[:n]

    def live_search_ids(self):
        self.calls["search"] += 1
        return [v for v, x in self.videos.items() if x["isLive"]]

    def details(self, ids):
        self.calls["details"] += 1
        return {i: dict(self.videos[i]) for i in ids if i in self.videos}


class CourtDay(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.path = os.path.join(self.dir, "court-live", "status.json")
        self.yt = FakeYouTube()
        self.alerts = []

    def run_at(self, when, **kw):
        return d.run_once(self.yt, self.path, now=when, notify=lambda t, b: self.alerts.append((t, b)), **kw)

    def test_hearings_start_and_stop_through_the_day(self):
        # Yesterday's hearing is still in the uploads list and must not appear in today's log.
        self.yt.add("OLD", "Yesterday", T0 - timedelta(days=1), live=False, ended=T0 - timedelta(days=1, hours=-1))
        self.yt.add("A", "People v. Doe — Sentencing", T0)
        s = self.run_at(T0 + timedelta(seconds=30))
        self.assertEqual(s["phase"], "live")
        self.assertEqual([v["videoId"] for v in s["live"]], ["A"])
        self.assertEqual([t["videoId"] for t in s["today"]], ["A"])
        self.assertIsNone(s["today"][0]["endedAt"])
        self.assertEqual(len(self.alerts), 1)

        # Hearing A ends, hearing B starts.
        self.yt.end("A", T0 + timedelta(minutes=20))
        self.yt.add("B", "People v. Roe — Pretrial", T0 + timedelta(minutes=22))
        s = self.run_at(T0 + timedelta(minutes=22, seconds=30))
        self.assertEqual([v["videoId"] for v in s["live"]], ["B"])
        self.assertEqual([t["videoId"] for t in s["today"]], ["A", "B"])
        self.assertEqual(s["today"][0]["endedAt"], d.iso(T0 + timedelta(minutes=20)))
        self.assertEqual(len(self.alerts), 1, "only the first hearing of the day alerts by default")

        # B ends; court in recess.
        self.yt.end("B", T0 + timedelta(minutes=40))
        s = self.run_at(T0 + timedelta(minutes=41))
        self.assertEqual(s["phase"], "recess")
        self.assertEqual(s["live"], [])
        self.assertTrue(all(t["endedAt"] for t in s["today"]))

        # Written atomically as valid JSON where the page expects it.
        with open(self.path) as f:
            self.assertEqual(json.load(f)["phase"], "recess")

    def test_two_courtrooms_at_once(self):
        self.yt.add("A", "Courtroom 1", T0)
        self.yt.add("B", "Courtroom 2", T0 + timedelta(minutes=1))
        s = self.run_at(T0 + timedelta(minutes=2))
        self.assertEqual([v["videoId"] for v in s["live"]], ["A", "B"])

    def test_not_embeddable_is_passed_to_page(self):
        self.yt.add("A", "Hearing", T0, embeddable=False)
        s = self.run_at(T0 + timedelta(seconds=30))
        self.assertFalse(s["live"][0]["embeddable"])

    def test_vanished_video_is_closed(self):
        self.yt.add("A", "Hearing", T0)
        self.run_at(T0 + timedelta(seconds=30))
        del self.yt.videos["A"]
        self.yt.uploads.remove("A")
        s = self.run_at(T0 + timedelta(minutes=5))
        self.assertEqual(s["live"], [])
        self.assertIsNotNone(s["today"][0]["endedAt"])

    def test_off_hours_throttle_keeps_heartbeat_without_api_calls(self):
        evening = datetime(2026, 10, 7, 22, 5, tzinfo=timezone.utc)  # 6:05 PM Eastern
        s = self.run_at(evening)
        self.assertEqual(s["phase"], "closed")
        before = dict(self.yt.calls)
        s = self.run_at(evening + timedelta(minutes=3))
        self.assertEqual(self.yt.calls, before, "no API calls within 10 minutes off-hours")
        self.assertEqual(s["updatedAt"], d.iso(evening + timedelta(minutes=3)))
        self.run_at(evening + timedelta(minutes=11))
        self.assertEqual(self.yt.calls["uploads"], before["uploads"] + 1)

    def test_search_safety_net_is_rate_limited(self):
        for i in range(10):  # 5 minutes of 30-second checks
            self.run_at(T0 + timedelta(seconds=30 * i))
        self.assertEqual(self.yt.calls["search"], 1)
        self.run_at(T0 + timedelta(minutes=16))
        self.assertEqual(self.yt.calls["search"], 2)

    def test_new_day_resets_log_and_alerts_again(self):
        self.yt.add("A", "Monday hearing", T0)
        self.run_at(T0 + timedelta(seconds=30))
        self.yt.end("A", T0 + timedelta(minutes=10))
        next_day = T0 + timedelta(days=1)
        self.yt.add("B", "Tuesday hearing", next_day)
        s = self.run_at(next_day + timedelta(seconds=30))
        self.assertEqual([t["videoId"] for t in s["today"]], ["B"])
        self.assertEqual(len(self.alerts), 2)

    def test_court_hours(self):
        et = d.TZ
        self.assertTrue(d.in_court_hours(datetime(2026, 10, 7, 8, 0, tzinfo=et)))
        self.assertFalse(d.in_court_hours(datetime(2026, 10, 7, 18, 0, tzinfo=et)))
        self.assertFalse(d.in_court_hours(datetime(2026, 10, 10, 10, 0, tzinfo=et)))  # Saturday


if __name__ == "__main__":
    unittest.main()
