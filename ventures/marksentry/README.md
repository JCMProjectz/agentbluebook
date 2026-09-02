# MarkSentry — Automated Trademark Monitoring

**$89/yr trademark watch service. 100% automated fulfillment. National market from day one.**

Why this venture: the industry charges $200–600/yr per mark (attorney-managed: $500–1,500/yr) for what is, mechanically, a weekly scan of free public USPTO data plus a readable summary. We undercut everyone at $89/yr, hold ~95% gross margin, and cross-sell it to every LLC-formation customer we already have. Full ranking rationale: `../../research/venture-rankings.md`.

## What's in this folder

```
site/
  index.html      Landing page: hero, FREE conflict-check funnel, pricing, FAQ, disclaimers
  success.html    Post-checkout page (Stripe redirect target)
n8n/
  free-check-workflow.json      Webhook → USPTO search → Claude report → email + lead log
  stripe-onboard-workflow.json  Stripe checkout.session.completed → subscriber record → welcome email
  weekly-monitor-workflow.json  Nightly cron → due subscribers → search → Claude compare → alert/all-clear
data/
  subscribers/    One JSON file per subscriber (created by the Stripe workflow; scanned nightly)
  leads/          One JSON file per free-check lead (nurture-sequence fuel)
```

The whole delivery loop is: **customer pays once a year, machines do literally everything else.** Human minutes per customer per month: 0.

## Launch checklist (~1 hour of clicking, in order)

1. **Name & domain.** "MarkSentry" is a placeholder — run it through our own free-check flow (fittingly) and check domain availability before committing. Update the name/site copy if needed.
2. **Search provider (one decision).** Default in the workflows is [markerapi.com](https://markerapi.com) (simple REST trademark search; set `MARKERAPI_USERNAME` / `MARKERAPI_PASSWORD`). Alternatives if it disappoints: the official [USPTO APIs](https://developer.uspto.gov) (free key; TSDR is status-by-serial — pair with bulk data for search), a RapidAPI trademark-search API, or an Apify USPTO actor. Only the two "USPTO Trademark Search" HTTP nodes need their URL swapped; **verify the exact request format against the provider's docs** — the scaffolded URL follows markerapi's documented pattern but was written offline.
3. **Stripe.** Create a Product ("MarkSentry Monitoring", $89/yr recurring, plus a $49/yr "additional mark" price for later). Create a **Payment Link** with custom fields `business_name` and `industry`, redirect to `/success.html`. Replace `STRIPE_PAYMENT_LINK_HERE` in `site/index.html` and in `free-check-workflow.json` (upsell link in the report prompt). Add a webhook endpoint for `checkout.session.completed` pointing at the n8n stripe webhook URL; put the signing secret in `STRIPE_WEBHOOK_SECRET` and add signature verification (noted in the workflow) before real traffic.
4. **n8n.** Import the three workflows. Env vars needed: `ANTHROPIC_API_KEY`, `GITHUB_TOKEN` (repo scope), `MARKERAPI_USERNAME`/`MARKERAPI_PASSWORD` (or your provider's), SMTP credentials for the email nodes. Replace `reports@YOUR-DOMAIN.com` and `https://YOUR-N8N-HOST/...` (webhook URL also lives in `site/index.html`).
5. **Deploy the site.** New Cloudflare Pages project → this repo → root directory `ventures/marksentry/site`, no build command, output `.`. Attach the domain. (Long-term: move to its own repo; the GitHub-API paths in the workflows then change accordingly.)
6. **Test end-to-end** with your own business name: free check → report email arrives → Stripe test checkout → welcome email → force-run the monitor → baseline report arrives → subscriber file shows `last_scanned` + snapshot.
7. **Turn on the funnel.**
   - Day-7 email to every Michigan LLC customer: "You registered *[name]* — 3,000+ trademark applications were filed last week. Watch yours for $89/yr."
   - Point the AgentBluebook-style content pipeline at a new sitelet: "is my business name trademarked", "[state] LLC name vs trademark", "how much does trademark monitoring cost", "what to do if someone trademarks your business name".
   - Add the free-check as a checkout add-on step in the LLC service flow.

## Economics

| | Per subscriber / yr |
|---|---|
| Revenue | $89 |
| Search API + Claude API (52 scans + reports) | ~$3–5 |
| Email + hosting | ~$0 |
| **Gross margin** | **~94%** |

500 subscribers = ~$44.5K ARR on autopilot; 5,000 = ~$445K. Churn floor is business-closure rate (~10–15%/yr), offset by the formation funnel refilling the top — the same flywheel as registered agents, without needing a street address in every state.

## Legal guardrails (already baked into the copy and prompts — keep them)

- **We monitor and inform; we never advise.** The system prompts forbid legal advice and require the disclaimer on every report. The site says "not a law firm" in the form note, FAQ, and footer. Never remove these; unauthorized-practice-of-law is the one way this business gets hurt.
- Reports must stay honest — the monitor prompt explicitly allows (and values) "all clear." A monitoring service that cries wolf churns; one that's calmly right retains.
- When alerts are material, we *refer out* to trademark attorneys. Later, that referral is itself monetizable (attorney partner network).

## Roadmap after first 25 subscribers

1. **State-level watch** (business registrations in subscriber's state — catches the local copycat USPTO never sees) — same pipeline, new data source, justifies a $129/yr tier.
2. **Domain + social-handle watch** rolled into a "Brand Guard" bundle ($149/yr).
3. **Attorney referral partnerships** for material conflicts (rev-share on engagements).
4. **White-label** for the LLC service itself: monitoring included free for 90 days with every formation, auto-converting to paid — turning formation customers into MRR by default.
