/* Court Live header badge — The Shiawassee Current
 *
 * Shows a red "● Court live" pill in the site header whenever a hearing is streaming,
 * so readers on any page can jump straight to /court-live.
 *
 * Markup (add next to the existing "Watch court live" nav link):
 *   <a class="cl-nav-badge" href="/court-live" data-court-live-badge hidden>Court live</a>
 * Styles live in court-live.css (.cl-nav-badge).
 */
(function () {
  'use strict';
  const badge = document.querySelector('[data-court-live-badge]');
  if (!badge) return;
  const url = badge.dataset.statusUrl || '/court-live/status.json';
  const STALE_MS = 180000;

  async function tick() {
    try {
      const r = await fetch(`${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`, { cache: 'no-store' });
      const s = await r.json();
      const fresh = s.updatedAt && Date.now() - Date.parse(s.updatedAt) < STALE_MS;
      badge.hidden = !(fresh && Array.isArray(s.live) && s.live.length > 0);
    } catch (e) {
      badge.hidden = true;
    }
  }

  tick();
  setInterval(tick, 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') tick(); });
})();
