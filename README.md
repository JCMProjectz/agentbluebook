# AgentBluebook

**The Kelley Blue Book for real estate agent tools.**

Honest, data-backed reviews and comparisons of CRM software, lead generation platforms, marketing tools, and more — built for real estate agents.

## Stack
- Astro 4 (static site generation)
- Cloudflare Pages (hosting + deployment)
- n8n (automated content generation)
- Claude API (research agent + article writer)
- Google Indexing API (instant crawl on publish)

## Deploy
Connect to Cloudflare Pages:
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18+

## Content Generation
Articles are auto-generated via n8n workflow and pushed to `src/pages/` via GitHub API. See `.env.example` for required environment variables.

# agentbluebook
