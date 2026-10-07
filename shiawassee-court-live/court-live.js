/* Court Live — The Shiawassee Current
 *
 * Follows the court's YouTube channel through a day of start-and-stop hearings.
 *
 * Primary mode: polls status.json (written by detector/court_live_detector.py on the
 * newsroom Mac) and swaps the player to whichever hearing is live, without a reload.
 * Fallback mode: if status.json is missing or stale, plays YouTube's "current live
 * stream for this channel" embed and re-checks after each hearing ends.
 *
 * The court's own YouTube player is always used. Nothing is recorded or re-streamed.
 */
(function () {
  'use strict';

  const root = document.querySelector('[data-court-live]');
  if (!root) return;

  const CFG = {
    statusUrl: root.dataset.statusUrl || '/court-live/status.json',
    channelId: root.dataset.channelId,
    pollMs: 15000,          // how often viewers re-check status.json
    staleMs: 180000,        // status older than this -> fallback mode
    ytLoadTimeoutMs: 12000, // YouTube player script blocked/slow -> "watch on YouTube"
    fallbackStartMs: 20000, // fallback embed not playing after this -> no live stream
    fallbackRetryMs: 45000, // fallback re-check interval between hearings
    endedGraceMs: 180000,   // ignore a just-ended video if status.json still lists it
  };
  const TZ = 'America/Detroit';

  const $ = (sel) => root.querySelector(sel);
  const el = {
    statusText: $('.cl-status-text'),
    stage: $('.cl-stage'),
    tabs: $('.cl-tabs'),
    now: $('.cl-now'),
    nowTitle: $('.cl-now-title'),
    nowMeta: $('.cl-now-meta'),
    today: $('.cl-today'),
    recessTitle: $('.cl-overlay--recess h2'),
    last: $('.cl-last'),
    noembedText: $('.cl-noembed-text'),
    unmute: $('.cl-unmute'),
    share: $('.cl-share'),
  };
  const ytLinks = root.querySelectorAll('.cl-yt-link');

  const STATUS_TEXT = {
    loading: 'Connecting…',
    live: 'Live now',
    recess: 'Between hearings',
    closed: 'Not in session',
    noembed: 'Live on YouTube',
  };

  let player = null;
  let playerMode = null;      // 'video' (status mode) | 'channel' (fallback mode)
  let currentId = null;
  let selectedId = null;
  let fallback = false;
  let pollTimer = null;
  let fallbackTimer = null;
  let fallbackStartTimer = null;
  const endedIds = new Map(); // videoId -> time we saw it end

  // ---------------------------------------------------------------- helpers

  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ });

  function courtHoursNow() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, weekday: 'short', hour: 'numeric', hourCycle: 'h23',
    }).formatToParts(new Date());
    const wd = parts.find((p) => p.type === 'weekday').value;
    const h = Number(parts.find((p) => p.type === 'hour').value);
    return wd !== 'Sat' && wd !== 'Sun' && h >= 8 && h < 17;
  }

  function setState(state) {
    if (root.dataset.state === state) return;
    root.dataset.state = state;
    el.statusText.textContent = STATUS_TEXT[state];
    document.dispatchEvent(new CustomEvent('courtlive:state', { detail: { state } }));
  }

  function setYouTubeLink(videoId) {
    const href = videoId
      ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
      : `https://www.youtube.com/channel/${encodeURIComponent(CFG.channelId)}/live`;
    ytLinks.forEach((a) => { a.href = href; });
  }

  function showNow(title, startedAt, videoId) {
    el.now.hidden = false;
    el.nowTitle.textContent = title || 'Live hearing';
    el.nowMeta.textContent = startedAt ? `Started ${fmtTime(startedAt)}` : 'Streaming now from the courtroom';
    setYouTubeLink(videoId);
  }

  function hideNow() {
    el.now.hidden = true;
    setYouTubeLink(null);
  }

  // ---------------------------------------------------------- YouTube player

  let ytReady = null;
  function loadYT() {
    if (!ytReady) {
      ytReady = new Promise((resolve, reject) => {
        if (window.YT && window.YT.Player) { resolve(window.YT); return; }
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(window.YT); };
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.async = true;
        s.onerror = () => reject(new Error('youtube api blocked'));
        document.head.appendChild(s);
        setTimeout(() => reject(new Error('youtube api timeout')), CFG.ytLoadTimeoutMs);
      });
    }
    return ytReady;
  }

  function destroyPlayer() {
    if (player) {
      try { player.destroy(); } catch (e) { /* already gone */ }
      player = null;
    }
    playerMode = null;
    el.unmute.hidden = true;
    if (!el.stage.querySelector('#cl-player')) {
      const mount = document.createElement('div');
      mount.id = 'cl-player';
      mount.className = 'cl-player';
      el.stage.prepend(mount);
    }
  }

  function stopPlayer() {
    destroyPlayer();
    currentId = null;
  }

  async function createPlayer({ mode, videoId, host, vars }) {
    let YT;
    try {
      YT = await loadYT();
    } catch (e) {
      // Player script blocked (content blocker, school network…): send people to YouTube.
      stopPlayer();
      el.noembedText.textContent = "The video player couldn't load on this device. You can still watch on YouTube.";
      setState('noembed');
      return;
    }
    destroyPlayer();
    playerMode = mode;
    player = new YT.Player('cl-player', {
      width: '100%',
      height: '100%',
      host,
      videoId,
      playerVars: Object.assign({ autoplay: 1, mute: 1, playsinline: 1, rel: 0 }, vars || {}),
      events: {
        onReady: (e) => {
          // Browsers only autoplay muted video; offer sound with one tap.
          e.target.mute();
          e.target.playVideo();
          el.unmute.hidden = false;
        },
        onStateChange: onPlayerState,
        onError: onPlayerError,
      },
    });
  }

  function onPlayerState(e) {
    const S = window.YT.PlayerState;
    if (e.data === S.PLAYING && playerMode === 'channel') {
      clearTimeout(fallbackStartTimer);
      const d = (player && player.getVideoData) ? player.getVideoData() : {};
      showNow(d.title, null, d.video_id);
      setState('live');
    } else if (e.data === S.ENDED) {
      hearingEnded();
    }
  }

  function onPlayerError(e) {
    if (e.data === 101 || e.data === 150) {
      // The court turned off playback on other sites for this video.
      const id = currentId;
      stopPlayer();
      el.noembedText.textContent = 'The court has turned off playback on other websites for this hearing. It is streaming live on the court’s YouTube channel.';
      setState('noembed');
      setYouTubeLink(id);
      return;
    }
    hearingEnded();
  }

  function hearingEnded() {
    if (playerMode === 'channel') { scheduleFallbackRetry(); return; }
    if (currentId) endedIds.set(currentId, Date.now());
    stopPlayer();
    hideNow();
    showRecess(null);
    schedulePoll(4000); // pick up the next hearing quickly
  }

  function playVideo(v) {
    selectedId = v.videoId;
    showNow(v.title, v.startedAt, v.videoId);
    if (v.embeddable === false) {
      stopPlayer();
      el.noembedText.textContent = 'The court has turned off playback on other websites for this hearing. It is streaming live on the court’s YouTube channel.';
      setState('noembed');
      return;
    }
    setState('live');
    if (currentId === v.videoId) return;
    currentId = v.videoId;
    if (player && playerMode === 'video' && player.loadVideoById) {
      player.loadVideoById(v.videoId); // seamless switch to the next hearing
    } else {
      createPlayer({ mode: 'video', videoId: v.videoId, host: 'https://www.youtube-nocookie.com' });
    }
  }

  // ------------------------------------------------------------ recess/closed

  function showRecess(today) {
    const list = today || [];
    const lastEnded = list.filter((t) => t.endedAt).map((t) => t.endedAt).sort().pop();
    el.recessTitle.textContent = list.length || today === null ? 'Between hearings' : 'Waiting for the first hearing';
    el.last.textContent = lastEnded ? `Last hearing ended at ${fmtTime(lastEnded)}.` : '';
    setState('recess');
  }

  // ------------------------------------------------------------ status mode

  async function poll() {
    clearTimeout(pollTimer);
    let s = null;
    try {
      const sep = CFG.statusUrl.includes('?') ? '&' : '?';
      const r = await fetch(`${CFG.statusUrl}${sep}t=${Date.now()}`, { cache: 'no-store' });
      if (r.ok) s = await r.json();
    } catch (e) { /* network hiccup -> treated as stale */ }

    const fresh = s && s.updatedAt && Date.now() - Date.parse(s.updatedAt) < CFG.staleMs;
    if (!fresh) {
      enterFallback();
    } else {
      leaveFallback();
      applyStatus(s);
    }
    schedulePoll();
  }

  function schedulePoll(ms) {
    clearTimeout(pollTimer);
    pollTimer = setTimeout(poll, ms == null ? CFG.pollMs : ms);
  }

  function applyStatus(s) {
    const today = Array.isArray(s.today) ? s.today : [];
    renderToday(today);

    const now = Date.now();
    for (const [id, t] of endedIds) if (now - t > CFG.endedGraceMs) endedIds.delete(id);
    const live = (Array.isArray(s.live) ? s.live : []).filter((v) => v && v.videoId && !endedIds.has(v.videoId));
    renderTabs(live);

    if (live.length) {
      playVideo(live.find((v) => v.videoId === selectedId) || live[0]);
      return;
    }
    stopPlayer();
    hideNow();
    if (s.phase === 'closed') setState('closed');
    else showRecess(today);
  }

  function renderTabs(live) {
    if (live.length < 2) {
      el.tabs.hidden = true;
      el.tabs.replaceChildren();
      return;
    }
    const active = live.some((v) => v.videoId === selectedId) ? selectedId : live[0].videoId;
    el.tabs.hidden = false;
    el.tabs.replaceChildren(...live.map((v, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cl-tab';
      b.textContent = v.title || `Courtroom stream ${i + 1}`;
      b.title = v.title || '';
      b.setAttribute('aria-pressed', String(v.videoId === active));
      b.addEventListener('click', () => { playVideo(v); renderTabs(live); });
      return b;
    }));
  }

  function renderToday(list) {
    if (!list.length) {
      const li = document.createElement('li');
      li.className = 'cl-empty';
      li.textContent = 'No hearings have streamed yet today.';
      el.today.replaceChildren(li);
      return;
    }
    el.today.replaceChildren(...list.slice().sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)).map((t) => {
      const li = document.createElement('li');
      li.className = 'cl-hearing' + (t.endedAt ? '' : ' is-live');
      const time = document.createElement('span');
      time.className = 'cl-hearing-time';
      time.textContent = t.endedAt ? `${fmtTime(t.startedAt)} – ${fmtTime(t.endedAt)}` : `${fmtTime(t.startedAt)} · Live`;
      const title = document.createElement('a');
      title.className = 'cl-hearing-title';
      title.href = `https://www.youtube.com/watch?v=${encodeURIComponent(t.videoId)}`;
      title.target = '_blank';
      title.rel = 'noopener';
      title.textContent = t.title || 'Hearing';
      li.append(time, title);
      return li;
    }));
  }

  // ---------------------------------------------------------- fallback mode

  function enterFallback() {
    if (fallback) return;
    fallback = true;
    root.dataset.mode = 'fallback';
    el.tabs.hidden = true;
    // Without status.json we can't list today's hearings; say so rather than "none yet".
    const li = document.createElement('li');
    li.className = 'cl-empty';
    li.textContent = "Today's hearing list isn't available right now. The live player above still works.";
    el.today.replaceChildren(li);
    startChannelPlayer();
  }

  function leaveFallback() {
    if (!fallback) return;
    fallback = false;
    delete root.dataset.mode;
    clearTimeout(fallbackTimer);
    clearTimeout(fallbackStartTimer);
    if (playerMode === 'channel') stopPlayer();
  }

  function startChannelPlayer() {
    clearTimeout(fallbackTimer);
    if (!root.dataset.state || root.dataset.state === 'loading') setState('loading');
    // "Whatever this channel is streaming right now" — YouTube resolves the video.
    createPlayer({ mode: 'channel', videoId: 'live_stream', vars: { channel: CFG.channelId } });
    clearTimeout(fallbackStartTimer);
    fallbackStartTimer = setTimeout(() => {
      const S = window.YT && window.YT.PlayerState;
      const st = player && player.getPlayerState ? player.getPlayerState() : -1;
      if (!S || (st !== S.PLAYING && st !== S.BUFFERING)) scheduleFallbackRetry();
    }, CFG.fallbackStartMs);
  }

  function scheduleFallbackRetry() {
    clearTimeout(fallbackStartTimer);
    stopPlayer();
    hideNow();
    if (courtHoursNow()) showRecess(null); else setState('closed');
    clearTimeout(fallbackTimer);
    fallbackTimer = setTimeout(() => { if (fallback) startChannelPlayer(); }, CFG.fallbackRetryMs);
  }

  // ------------------------------------------------------------ interactions

  el.unmute.addEventListener('click', () => {
    if (player && player.unMute) {
      player.unMute();
      if (player.setVolume) player.setVolume(100);
    }
    el.unmute.hidden = true;
  });

  if (el.share) {
    el.share.addEventListener('click', async () => {
      const data = { title: 'Watch Shiawassee County Circuit Court live — The Shiawassee Current', url: location.href };
      if (navigator.share) {
        try { await navigator.share(data); } catch (e) { /* dismissed */ }
        return;
      }
      try {
        await navigator.clipboard.writeText(location.href);
        el.share.textContent = 'Link copied';
        setTimeout(() => { el.share.textContent = 'Share'; }, 2000);
      } catch (e) { /* clipboard unavailable */ }
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') poll();
  });

  setState('loading');
  setYouTubeLink(null);
  poll();
})();
