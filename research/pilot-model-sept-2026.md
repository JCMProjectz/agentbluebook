# Next-Project Selection: Investor-Grade Model + Mini-Pilot Protocol

**Date:** September 2026 · Fresh-slate analysis. Candidates are scored on the metrics an investor would model, then the top ones go into cheap parallel smoke tests. **The pilots pick the winner, not opinions.**

## 1. The metric model

For every candidate we estimate, with sources or stated assumptions:

| Metric | Definition / target |
|---|---|
| Demand proxy | Search CPC + incumbent revenue/pricing (a high CPC = strangers already pay for this click) |
| ARPU / ACV | Blended monthly revenue per customer |
| Gross margin | After API/mail/data costs (our delivery is machine labor) |
| Churn | Benchmark: SMB self-serve SaaS runs **3–7%/mo (31–58%/yr)**; workflow-embedded compliance tools run materially lower ([2026 churn benchmarks](https://www.koji.so/blog/saas-churn-rate-benchmarks-2026), [NRR data](https://www.digitalapplied.com/blog/net-revenue-retention-benchmarks-2026-saas-expansion-data): SMB median NRR 97%) |
| LTV | ARPU × GM ÷ monthly churn |
| CAC | Measured CPC ÷ funnel conversion (pilot measures the real number) |
| LTV:CAC | ≥3 required to build; payback ≤12 months |
| Automation % | Human minutes per customer per month at steady state |
| Time to first dollar | Weeks from build start (Michigan LLC benchmark: ~8 weeks) |
| Moat | What stops a copycat or incumbent in 12 months |

Reference CPC data: legal services averages **$9.87/click** with attorney head terms at **$42–47** ([2026 legal CPC benchmarks](https://cpctools.com/tools/reports/legal), [industry CPC data](https://www.get-ryze.ai/blog/average-cpc-by-industry-google-ads-2026)) — relevant because several candidates monetize legal-adjacent intent *without* attorney economics.

## 2. Fresh candidate set with modeled numbers

Assumptions are stated; unverified numbers are flagged ⚠ — the pilot exists to replace them with measurements.

### A. Preliminary Notice Autopilot (construction subcontractors & suppliers)
Deadline-driven, state-fragmented lien-rights paperwork: e.g. California preliminary notice due **within 20 days** of first furnishing, North Carolina lien-agent notice within 15 days ([Levelset state guides](https://www.levelset.com/mechanics-lien/california-lien-law-faqs/)). Miss the notice → lose lien rights on the invoice.
- **Proof of money:** Levelset built this category (acquired by Procore, 2021, ~$500M reported) and charges **$349 per lien filing** with freemium + paid plans; [Siteline](https://www.siteline.com/compare/levelset) targets *commercial* subs — the sub-$5M/yr small sub is underserved post-acquisition.
- **Model:** $39/mo + ~$19/notice (cert. mail via Lob API) → blended ARPU ~$59/mo · GM ~85% · churn 4%/mo (construction volatility) → **LTV ≈ $1,250**. CAC ⚠ (construction-software CPC unmeasured; pilot measures it). Automation ~95% (doc gen + API mailing; certified-mail edge cases human).
- **Positives:** perfect match to the proven formula (deadline+fine+fragmentation+confusion); both subscription AND per-event revenue; urgent, invoice-sized stakes → price-insensitive.
- **Negatives:** Levelset owns the SEO for every "[state] mechanics lien" query — organic entry is a siege, so acquisition leans paid/partnership (suppliers, bookkeepers); **accuracy liability is severe** (a wrong deadline costs the customer their lien rights); construction customers churn with project cycles.

### B. COI Tracking for small property managers & GCs
Collect, parse, and chase vendor certificates of insurance before they expire.
- **Proof of money:** [myCOI charges $30–60/vendor/yr](https://www.certificial.com/blog-post/best-mycoi-alternatives-2026); mid-market tools run [$200–800/mo](https://www.certificial.com/blog-post/we-compared-7-best-coi-tracking-software-in-depth-feedback-and-review); SMB entrant [TrackMyVendor at Free/$39/$79/mo](https://trackmyvendor.com/mycoi-alternatives) proves the low end is monetizable.
- **Model:** $59/mo · GM ~80% (Claude parses the COI PDFs — our actual edge) · churn 2.5%/mo (workflow-embedded) → **LTV ≈ $1,890**. Automation ~90% (parsing + expiry chasing automated; odd certificates human-reviewed).
- **Positives:** stickiest product on the list (it *holds the customer's compliance records*); document-parsing is a genuine Claude advantage over legacy OCR vendors; boring = durable.
- **Negatives:** the SMB flank is **already being attacked** (TrackMyVendor et al. launched for exactly this reason); B2B buyers may expect demos → threatens the no-sales-touch requirement; differentiation is execution, not category creation.

### C. Executor Autopilot (estate settlement for pro-se executors)
- **Proof of money:** probate attorneys charge $3–7K; [Empathy raised $47M](https://www.calcalistech.com/ctechnews/article/bk0xfd3tp) selling this job B2B2C, leaving direct-pay-once thin; ~3.1M US deaths/yr; pro-se probate legal in most states.
- **Model:** $199 flat (or $29/mo × ~7-month settlement ≈ $203) · GM ~92% → **LTV ≈ $185 one-shot**. That LTV **cannot support paid acquisition** at legal CPCs ($9.87 avg → CAC $300+ at 3% conv) — this is an **organic-only** economics profile, which our content pipeline happens to be built for.
- **Positives:** highest willingness-to-pay vs. alternative on the list; county-level localization moat; Claude-native fulfillment; immediate intent.
- **Negatives:** paid channels are structurally closed (investor red flag: single-channel dependence); UPL guardrails; tasteful-marketing constraint; revenue ends when the estate closes.

### D. Rental Compliance Autopilot (from prior analysis, retained for scoring)
- **Model:** $79/property/yr × ~2.2 properties = $174/yr ARPU · GM ~90% · ~25%/yr churn → **LTV ≈ $560**. CAC via direct mail to public assessor lists (⚠ ~$200 at 1% response — pilot-measurable). Automation ~90%.
- **Positives:** recurring legal obligation = structural MRR ([Detroit](https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed/bseed-divisions/property-maintenance/tenant-rental-property/landlord-rental)/[Grand Rapids](https://www.grandrapidsmi.gov/departments/code-compliance/rental-properties/rental-certification-program/) rules mapped); findable buyers. **Negatives:** small per-city TAM; per-city research grind; enforcement-dependent urgency.

### E. New-Business Leads Feed (sell newly-registered-business data to insurance agents, lenders, web designers)
- **Proof of money:** [new-business lists start at $99.75](https://www.leadsplease.com/mailing-lists/business/new-business-list), [Salesgenie subscriptions from $149/mo](https://www.salesgenie.com/leads/business-insurance-leads/), per-lead prices $1–150 depending on qualification ([lender leads guide](https://smbsalesboost.com/blog/business-loan-leads-guide)); ~169K new US businesses/mo to harvest.
- **Model:** $99/mo feed · GM ~95% · churn 7%/mo (lead buyers churn on ROI — top of the SMB benchmark) → **LTV ≈ $1,340**. Automation ~98% — the most automatable candidate (scrape registries → enrich → deliver).
- **Positives:** buyers are self-identified and already paying incumbents; cheapest pilot on the list (cold email costs ~nothing); no consumer-trust problem.
- **Negatives:** commodity data race (Data Axle/Salesgenie scale); some state registries restrict bulk access; churn is outcome-driven and high; selling B2B lists means *being* the cold-emailer.

### F. Name Change Autopilot — proven market ([NewlyNamed $49–99](https://newlynamed.com/blogs/guides/best-name-change-service), [HitchSwitch $39.99–129.99](https://blog.hitchswitch.com/2026/01/best-name-change-services-after-marriage-2026/)) but **LTV ≈ $44 one-time** → organic/affiliate-only economics, fortified incumbent SERPs. Scored, not piloted.

### G. Website legal-policy suite — crowded at $0–10/mo, no wedge. Killed at the model stage.

## 3. Scorecard

| | A Prelim Notice | B COI | C Executor | D Rental | E Leads Feed |
|---|---|---|---|---|---|
| LTV (modeled) | ~$1,250 | ~$1,890 | ~$185 | ~$560 | ~$1,340 |
| Revenue shape | MRR + per-event | MRR | one-shot | annual MRR | MRR |
| Automation | 95% | 90% | 97% | 90% | 98% |
| Paid channel viable? | ⚠ pilot | ⚠ pilot | **No** | mail ⚠ | cold email |
| Category proof | $500M exit | priced market | $47M raised | fees exist | priced market |
| Main risk | accuracy liability + Levelset SEO | crowding SMB flank | channel-locked | small TAM | commodity churn |
| Time to first $ | ~6 wks | ~8 wks | ~10 wks (SEO lag) | ~6 wks | **~2 wks** |

## 4. Mini-pilot protocol (the actual decision mechanism)

Run **three pilots in parallel, 14 days, ≤$500 total.** Standardized so results are comparable:

**Pilot α — Preliminary Notice ($200 budget):** one-page Astro landing ("Never lose lien rights again — notices generated and mailed for $19, deadlines tracked free"), Google Ads exact-match on ~8 buying keywords (*"preliminary notice service", "20 day preliminary notice california", "notice to owner florida service"*), checkout = real $19 Stripe charge for one generated notice (we can actually fulfill by hand+Claude — a *real* pilot, not a fake door). **Measures:** true CPC, visitor→purchase %, implied CAC.
**Pilot β — COI Tracking ($150):** landing + "start free — track 10 vendors" waitlist with company-size qualifier; ads on *"coi tracking software", "certificate of insurance tracking"*; plus 100 cold emails to small property-management firms. **Measures:** CPC, signup rate, % who'd self-serve without a demo (the kill question).
**Pilot γ — Leads Feed ($50, cold-email only):** 200 personalized emails to insurance agents/business lenders in our states offering a free week of the feed (we can generate it today), then $99/mo. **Measures:** reply rate, free→paid conversion. Cheapest, fastest signal.

(Executor runs as a **zero-cost SEO probe** in parallel: publish 10 pipeline-generated "[county] probate checklist" pages, watch 60-day impressions — its economics only work organic, so that's the honest test.)

**Kill/scale gates (per pilot):** CPC ≤2× modeled ✚ visitor→intent ≥2% ✚ implied CAC ≤ LTV/3 ✚ ≥5 paid actions (α), ≥25 qualified signups (β), or ≥3 paid conversions (γ). **Any pilot passing all gates gets built; two passing → build the higher LTV:CAC; none passing → the $500 bought us three avoided mistakes, rerun with next candidates.**

## 5. Honest flags
- All churn/CAC figures are modeled from benchmarks until pilots replace them — that's the point of piloting.
- Niche CPCs (construction, COI) were not retrievable from public sources ⚠ — pilot α/β's first job is measuring them.
- Pilot α touches legal-deadline accuracy: during pilot, every notice is human-reviewed before mailing; the automation ships only after the state-rules engine is verified per state.
