# Knot Nannies — Instagram highlight card

Design canvas for a reusable Instagram carousel slide highlighting Knot Nannies'
services, certifications, service area, and booking info. Published as a Claude
Artifact: https://claude.ai/artifact/FiuZvqSxZjw5zsUe11g1sx

## Contents

- `src/Main.dc.html` — 1080×1350 feed card (4:5), the primary deliverable
- `src/Square.dc.html` — 1080×1080 variant (Instagram crops carousel slides to
  the first image's ratio, so both sizes are provided)
- `src/logo.png` — the real Knot Nannies logo, cropped from a website screenshot
  supplied by the owner and converted to black-on-transparent
- `fonts/` — Poppins latin woff2 subsets (from @fontsource, OFL-licensed),
  embedded as data URIs so PNG/PDF export keeps the brand typography
- `canvas.json` — canvas layout
- `build.mjs` — inlines the fonts: `node build.mjs` writes final `*.dc.html`
  next to it (those generated files are gitignored)

## Brand values (sampled from owner-supplied screenshots of knotnannies.com)

- Blush accent (buttons/bands): `#E1CCBE`
- Page background cream: `#EEEDEB`
- Ink: `#1A1918`
- Type: Poppins (matches the site's rounded geometric sans)

## Business facts used

- Tagline: "So parents can be fully present — while we handle the childcare."
- Certifications: First Aid Certified · CPR Certified · Background Checked
- Services (site list): Wedding Ceremonies, Wedding Receptions, Rehearsal
  Dinners, Private Events, Corporate Events, Destination Weddings
- Service area (from public listings; not shown on site): based in Jenison,
  serving Grand Rapids & West Michigan (Holland, Grand Haven & surrounding
  areas), travel/destination weddings on request
- Contact (from the business-card Instagram post): 616-329-1170,
  info@knotnannies.com, www.knotnannies.com, @knotnannies
