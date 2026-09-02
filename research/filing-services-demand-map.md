# The Filing-Services Demand Map

**Date:** September 2026 · Where demand for automatable filing/compliance services is today, where it's about to appear, and the capture machine that turns each obligation into revenue.

## The demand law (why these products sell themselves)

Demand concentrates wherever four things stack: **(1) a government or counterparty forces an action, (2) on a deadline with a fine, (3) on a non-expert, (4) under confusing, fragmented rules.** Michigan LLC Service converted because it sits on all four. Every entry below is scored against that stack. Present demand = existing obligations underserved. **Future demand = brand-new laws creating obligations — the window where SERPs are empty and being *first* beats being better.**

---

## Where demand is RIGHT NOW (existing obligations, underserved)

### Business entities
| Service | Revenue shape | Notes |
|---|---|---|
| **State retirement-mandate registration/exemption** | $49–79 one-off + $29/yr multi-state monitor | **16 states active** (CA, CO, CT, DE, IL, ME, MD, MA, MN, NV, NJ, NY, OR, RI, VT, VA); fines **$100–750/employee**, with escalation schedules running through 2026–27 (VT jumps to $75/employee Oct 2026; VA to $100 July 2027). Most employers literally just need to register or certify exemption — a 15-minute confusion we sell for $49. Sources: [Betterment 50-state guide](https://www.betterment.com/work/resources/guide-to-state-mandated-retirement-plans), [Gusto mandate tracker](https://gusto.com/resources/states/retirementmandates), [CalSavers penalties](https://onpay.com/insights/what-is-calsavers-mandate/). Competitor signal: retirementmandate.com exists (content play) — filing productization still open. |
| Sales-tax registration + economic-nexus monitor | $99/state one-off + $19/mo monitor | Every growing e-commerce seller crosses state thresholds and owes registration; Avalara/TaxJar serve filing, but the *registration + "you just triggered nexus" alert* layer is underserved at micro-seller price points. |
| Foreign qualification (register your LLC in another state) | $149 + state fees | High intent, transactional, same fulfillment engine as formations. |
| Charitable solicitation registration (nonprofits) | $99/state + **annual renewals = MRR** | ~40 states require it to fundraise; renewals recur; agencies charge $400+/state. Fragmentation moat. |
| IRS 990-N autopilot (tiny nonprofits) | $49/yr | Miss 3 years → automatic loss of tax exemption. Tiny ARPU, huge urgency, zero competition. |
| 1099-NEC/W-9 January filing service | $5–10/form, recurring annually | Seasonal spike (Jan), quasi-MRR through annual repetition; Track1099 exists but fragmented demand persists. |

### Property owners
- **Homestead/principal-residence exemption filing** — $39–59 one-off; enormous awareness gap (new homeowners overpay property tax for years); every county different; pairs with a free "are you overpaying?" checker tool. One-off, but the lead flows into…
- **Property tax appeal season** (annual, deadline-driven) and **rental compliance autopilot** (already mapped: [Detroit](https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department-bseed/bseed-divisions/property-maintenance/tenant-rental-property/landlord-rental)/[Grand Rapids](https://www.grandrapidsmi.gov/departments/code-compliance/rental-properties/rental-certification-program/) certificate cycles = structural MRR).

### Construction (already modeled in `pilot-model-sept-2026.md`)
- Preliminary notice autopilot (deadline-fragmented, Levelset-proven) · COI tracking (MRR, $30–60/vendor/yr price umbrella).

### Individuals (life events — one-off but high intent)
- Executor/estate settlement packets · marriage/divorce name change · deed transfers (add spouse/remove deceased — county-fragmented, $99–149, adjacent to executor traffic).

---

## Where demand is COMING (file these under "be first, not better")

1. **NY LLC Transparency Act** — took effect **Jan 1, 2026**: BOI-style disclosure to NY DOS, existing LLCs due by **Dec 31, 2026**, new LLCs within 30 days of formation ([Crowell](https://www.crowell.com/en/insights/client-alerts/new-york-llc-transparency-act-key-requirements-and-deadlines), [Winston](https://www.winston.com/en/insights-news/new-yorks-llc-transparency-act-goes-into-effect-january-1-2026)). A Dec-31 cliff for every existing NY LLC = a 2026 gold rush for a $49–99 filing service, and fileforms.com is already selling it (market confirmation). ⚠ **VERIFY SCOPE FIRST:** a January 2026 [Holland & Knight alert](https://www.hklaw.com/en/insights/publications/2026/01/new-york-llc-transparency-act-reporting-limited) suggests reporting may have been limited to non-U.S. LLCs — if that amendment holds, the TAM collapses. One hour of verification decides this play.
2. **More state transparency acts** — NY is the template; California and others have introduced similar bills. The legislative-monitoring agent (below) catches these at introduction.
3. **Retirement-mandate expansion** — new states join the current 16 yearly, each with a fresh registration wave and empty SERPs ([Georgetown CRI tracker](https://cri.georgetown.edu/states/)).
4. **Data-broker registration regimes** — CA/TX/OR/VT already require annual registration with fees and deadlines; state privacy laws keep spawning new registries.
5. **AI-disclosure and bot-labeling laws** — early-stage state bills; when one passes with a business obligation attached, the playbook below applies on day one.

## The capture machine (how we profit from every row above)

This is the actual asset to build — a **repeatable obligation-to-revenue pipeline**, not any single service:

1. **Legislative radar (internal tool):** a Claude+n8n agent monitoring state legislature feeds and agency rulemaking for the words that mean money — "shall register," "shall file," "civil penalty," "per employee." Output: a ranked weekly digest of *new obligations before they're searchable*.
2. **Day-one content strike:** within days of enactment, publish the definitive plain-English guide + a free deadline/applicability checker (the pipeline already does this). Empty SERPs + fresh panic = the cheapest traffic that will ever exist for that term.
3. **Fixed-price one-off filing** ($49–149) — converts the panic. One-offs are the CAC engine, not the business.
4. **Attach the perpetual monitor:** every one-off buyer is offered **Compliance Autopilot — "we watch every deadline your business owes any government, and file or alert, $29–49/mo."** This is the meta-product where MRR compounds: each new obligation we productize becomes a *feature* of the same subscription, raising its value and switching costs without raising CAC. (Competitive flag: Mosey sells multi-state employer compliance to startups — our lane is micro-business at self-serve prices.)
5. **Cross-sell ladder:** every funnel feeds the others (homestead → property tax appeal → executor; formation → retirement mandate → sales tax; nonprofit reg → 990-N).

**Profit mechanics:** one-offs at ~90% GM fund acquisition; the monitor subscription is near-pure margin; the moat is *speed-to-new-obligation* — nobody outranks the page that existed before they knew the law passed.

## Sequencing recommendation
1. Verify NYLLCTA scope (1 hour). If broad → build that filing service immediately (hard Dec 31, 2026 deadline does the marketing).
2. Ship retirement-mandate registration ($49) across the 16 active states — fines-per-employee sell it, fragmentation moats it.
3. Stand up the legislative radar agent (a weekend of n8n) — it feeds every future decision.
4. Fold everything into the Compliance Autopilot subscription as the umbrella MRR product.
5. Keep the three construction/COI/leads pilots from `pilot-model-sept-2026.md` running in parallel — different buyer, same machine.
