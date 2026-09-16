# Knot Nannies — Instagram highlight card

Design canvas for a reusable Instagram carousel slide highlighting Knot Nannies'
services, service area, and booking info. Published as a Claude Artifact:
https://claude.ai/artifact/FiuZvqSxZjw5zsUe11g1sx

## Contents

- `src/*.dc.html` — artboard sources with `__TOKEN__` placeholders for fonts
  - `Main.dc.html` — 1080×1350 feed card (4:5), the primary deliverable
  - `Square.dc.html` — 1080×1080 variant for square posts/carousels
  - `DustyBlueClassic.dc.html`, `BlushModern.dc.html` — low-fi alternate directions
- `fonts/` — Cormorant Garamond + Karla latin woff2 subsets (from @fontsource, OFL-licensed),
  embedded so PNG/PDF export keeps the real typography
- `canvas.json` — canvas layout
- `build.mjs` — inlines the fonts: `node build.mjs` writes final `*.dc.html` next to it

## Business facts used (from public listings; site itself was network-blocked)

- Event + wedding childcare; based in Jenison, MI; serving Grand Rapids & West
  Michigan (Holland, Grand Haven & surrounding areas); select travel on request
- Services: wedding-day childcare, on-site event nanny care, structured
  age-appropriate activities, background-checked caregivers
- Contact: knotnannies.com, @knotnannies — phone/email left as a visible
  placeholder on the card (not publicly listed)

The sage palette and type pairing are a best-guess wedding aesthetic, not lifted
from the live site; the card exposes a `brand` color tweak to re-skin quickly.
