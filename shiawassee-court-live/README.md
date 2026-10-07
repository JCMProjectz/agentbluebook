# Court Live — The Shiawassee Current

An upgrade for **shiawassee.news/court-live**. The Shiawassee County Circuit Court
(35th Circuit) streams each hearing on YouTube as its own video. A stream starts when
a case is called and stops when it ends, so a page that embeds one video goes dead
after the first case. This page follows the court through the whole day.

```
Court's YouTube channel ──(official API, every 30s)──► detector on the newsroom Mac
                                                              │ writes
                                                              ▼
                                         /court-live/status.json  (tiny file, no-store)
                                                              │ polled every 15s
                                                              ▼
                        /court-live page: plays whatever is live, switches to the next
                        hearing on its own, shows "Between hearings" in the gaps,
                        lists today's hearings, and falls back to YouTube's channel
                        live player if the detector is ever down.
```

Court channel: `UCY7MUpeiV56M4M5zZPNG69Q` (youtube.com/@shiawasseecountycircuitcou184)

## Files

| File | What it is |
|---|---|
| `index.html` | The page section (between the `COURT LIVE` comments) plus a demo wrapper |
| `court-live.css` | Styles, scoped under `.cl`, in the site's board-green and Figtree look |
| `court-live.js` | Player logic: status mode, seamless switching, fallback mode |
| `court-live-badge.js` | Red "● Court live" pill for the site header while court is streaming |
| `status.example.json` | What the detector writes |
| `detector/court_live_detector.py` | Python 3 (standard library only) watcher |
| `detector/com.shiawassee.court-live.plist` | launchd job: runs the detector every 30 seconds |
| `detector/test_court_live_detector.py` | Simulated court day: `cd detector && python3 -m unittest -v` |

## Install on the newsroom Mac

1. **YouTube API key (free, about 10 minutes).** In Google Cloud console, create a
   project, enable *YouTube Data API v3*, then Credentials → Create API key. Restrict
   the key to that API. The free 10,000 units/day covers about 7,000 units on a court day.
2. **Page.** Put `court-live.css`, `court-live.js` and `court-live-badge.js` in the
   site's static assets. Replace the body of the existing /court-live page with the
   `<section class="cl" …>` block from `index.html`, keeping the site's own header and
   footer. Figtree is already the site font.
3. **status.json.** Serve the detector's output at `/court-live/status.json` with
   `Cache-Control: no-store` (it changes every 30 seconds; do not let the tunnel/CDN cache it).
4. **Detector.** Fill in the paths, API key and ntfy topic in the plist, then:
   ```
   cp detector/com.shiawassee.court-live.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.shiawassee.court-live.plist
   tail -f ~/Library/Logs/court-live.log
   ```
   It checks every 30 seconds from 7:30 AM to 6 PM on weekdays and every 10 minutes
   otherwise. It sends one ntfy alert when court first goes live each day
   (`NTFY_EVERY_HEARING=1` sends one for every hearing).
5. **Header badge.** Next to the existing "Watch court live" nav link:
   `<a class="cl-nav-badge" href="/court-live" data-court-live-badge hidden>Court live</a>`
   and load `court-live-badge.js` site-wide.
6. **Check.** Open /court-live during a hearing. The status pill should read LIVE NOW and
   switch to BETWEEN HEARINGS when the case ends, without a refresh.

The page works **before** the detector is installed. With no status.json it runs in
fallback mode using YouTube's "current live stream for this channel" player. That
mode can't list today's hearings or show two courtrooms at once, so install the
detector for the full experience.

## How the page behaves

- **Live:** plays the hearing muted (browsers block sound on autoplay) with a "Tap for
  sound" button, and shows the court's title and start time.
- **Next case starts:** the same player switches to it. No reload, no refresh.
- **Between hearings:** a calm waiting screen and the time the last hearing ended.
- **Two courtrooms at once:** tabs to pick a stream.
- **Embedding turned off by the court:** a "Watch on YouTube" button instead of a broken player.
- **Detector down or YouTube quota exhausted:** status.json goes stale after 3 minutes
  and the page switches to fallback mode on its own.
- **Off hours:** "Court isn't in session" with a Morning Current signup.

## Ground rules

- We only ever show **the court's own YouTube player**. Never record, clip,
  screenshot or re-stream proceedings. Michigan courts have held people in contempt
  over recording livestreamed hearings.
- Keep the notice box on the page.
- Before promoting the page heavily, email the court administrator to say we embed the
  official stream, and ask whether the court has any conditions.
- Don't publish AI summaries of live hearings without a human editor checking them.
