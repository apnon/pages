# Synolia B2B Ecommerce Campaign - Landing Pages

## Campaign Overview

This repository contains two landing pages that are part of a **2-step advertising campaign** for Synolia's B2B ecommerce services targeting the US market.

---

## Step 1: Traffic Campaign - B2B Starter Kit

**Directory:** `b2b-starter-kit/`
**Final URL:** https://us.synolia.com/b2b-starter-kit/

### Purpose
The first step is a **traffic campaign** designed to attract and educate prospects who are considering a B2B ecommerce project. The page offers a free, editable PDF document (the "B2B Ecommerce Project Starter Kit") that helps businesses:

- Define strategic business objectives
- Map internal stakeholders & responsibilities
- Segment and prioritize customer types
- Clarify pricing rules, quoting, approvals & roles
- Prepare ERP/PIM/CRM integration expectations
- Understand budget impacts and set expectations
- Choose the right platform for their needs
- Avoid common B2B ecommerce mistakes

### Lead Capture
The PDF is hosted on **LinkedIn SmartLink** (`https://www.linkedin.com/smart-links/AQH0YMdKbCOPNQ`), which captures visitor information (name and email) before granting access to the document.

### Target Audience
- Manufacturers looking to digitize their catalog and ordering process
- Distributors & Wholesalers managing complex pricing and high-volume orders
- B2B Brands serving resellers or empowering field sales teams
- Companies replacing legacy tools (portals, emails, Excel sheets, PDF order forms)
- Leaders exploring digital commerce without a locked scope yet

---

## Step 2: Retargeting Campaign - B2B Consultation

**Directory:** `b2b-consultation/`
**Final URL:** https://us.synolia.com/b2b-consultation/

### Purpose
The second step is a **retargeting campaign** targeting the audience from Step 1 (people who visited the starter kit page or downloaded the PDF). This page invites visitors to book a **free 30-minute strategy consultation** with a senior B2B ecommerce expert.

### Value Proposition
The consultation offers:
- A reality check on scope, timeline & budget
- Integration considerations for ERP, CRM, PIM, OMS
- Platform direction guidance (Oro, Adobe, Shopify B2B, BigCommerce, SFCC, etc.)
- Identification of blockers & dependencies
- Clarity on where to start and what to ignore

### Expert
**Alexandre Perrachon** — B2B Ecommerce Strategist at Synolia with 20+ years experience designing and implementing complex B2B commerce ecosystems across North America, LATAM & Europe.

### Booking
The page includes a HubSpot calendar embed (placeholder currently) for direct scheduling without back-and-forth emails.

### Connection to Step 1
The consultation page references the Starter Kit as a prerequisite, encouraging visitors to review it before the call to maximize the value of the session.

---

## Technical Details

- **Tracking:** Both pages use Google Tag Manager (GTM-5X7TNR8L)
- **Font:** Poppins (Google Fonts)
- **Icons:** Font Awesome 6.4.0
- **Responsive:** Both pages are mobile-responsive

## File Structure

```
Pages/
├── CLAUDE.md                    # This file
├── index.html                   # Root redirect/landing
├── favicon.svg                  # Shared favicon
├── CNAME                        # Custom domain config
├── b2b-starter-kit/
│   ├── index.html               # Step 1 landing page
│   ├── style.css                # Styles
│   └── assets/
│       ├── slides/              # PDF preview slideshow images
│       └── [various images]     # Logos, hero images, etc.
└── b2b-consultation/
    ├── index.html               # Step 2 landing page
    ├── style.css                # Styles
    └── assets/
        └── [various images]     # Expert photo, logos, etc.
```

## Campaign Flow

```
[Ad Traffic] → [b2b-starter-kit page] → [LinkedIn SmartLink PDF download]
                        ↓
              [Retargeting Pixel]
                        ↓
[Retargeting Ad] → [b2b-consultation page] → [HubSpot Calendar Booking]
```

---

## Campaign 3: ORO × Synolia joint LATAM campaign (Aug 2026)

Joint paid-media effort with OroCommerce. Keyword split agreed with Mark Erspamer:
Oro bids on branded terms ("OroCommerce", "Oro B2B"), Synolia bids on the partner and
services terms and sets Oro's branded terms as **exact match** negatives. Each side
runs its own landing pages and shares form submissions with the other.

Keyword source: Mark's sheet, tab "Synolia Keywords to Bid On".

**Four pages, one per buyer intent:**

| Directory | URL | Serves |
|-----------|-----|--------|
| `orocommerce-partner/` | `/orocommerce-partner/` | OroCommerce partner / official partner / agency / agency Chile |
| `orocommerce-implementation/` | `/orocommerce-implementation/` | OroCommerce implementation / integration services |
| `orocommerce-developers/` | `/orocommerce-developers/` | OroCommerce developers / programmers / experts / support |
| `agencia-orocommerce/` | `/agencia-orocommerce/` | Agencia OroCommerce México, Partner OroCommerce Colombia, consultoría Perú/Argentina (Spanish) |

`orocommerce-partner` and `agencia-orocommerce` are hreflang twins with an EN/ES header
switch. All four cross-link and point at the live demo lander.

### Structure
Each folder is self-contained, same as the demo landers:
`index.html`, `style.css`, `config.js`, `track.js`, `lead.js`, `assets/`.

- `style.css` is the demo-lander stylesheet plus a campaign block (proof strip, process
  steps, country chips, "questions to ask" list, integration grid, navy demo band,
  single-step lead panel, takeover comparison). Identical in all four folders: edit one,
  copy to the other three.
- `lead.js` is shared and language-agnostic. Strings come from
  `CAMPAIGN_CONFIG.i18n`, so the Spanish page uses the same file untouched.
- `config.js` sets `campaign`, `intent` and `landingPath` per page. Same PostHog key and
  GA4 id as the other campaigns.

### Lead flow
Single-step form → `POST {leadApiBase}/save` with `notify: true`, carrying
`CampaignTrack.attribution()` (gclid/gbraid/wbraid/msclkid + UTMs) so the VPS can upload
server-side conversions. Unlike the demo landers there is no `/submit` call: `/submit`
sends the prospect a demo-store confirmation email, which is wrong copy for a partner
enquiry.

**Known gap:** the copy of the API in `b2b-demo-store/vps/apps/demo-store/server.js` does
not implement `notify`. Confirm the deployed version does, or the internal alert email
will not fire. Leads are persisted regardless.

### Consent
Every form carries a "Loop in OroCommerce" checkbox (`share_with_oro`), the reciprocal of
the consent checkbox Oro puts on its own forms. It is what makes the two-way lead handoff
legitimate.

---

## Campaign 4: LATAM category funnel (Spanish)

`ecommerce-b2b/` → `/ecommerce-b2b/`

**Why it exists.** The Campaign 3 pages are Oro-branded and serve Oro-branded keywords.
Pointing category keywords (`ecommerce B2B`, `plataforma ecommerce B2B`, `portal de
pedidos`) at an Oro-branded page fails twice: category searchers bounce off a page
branded for a vendor they have never heard of, and every resulting lead arrives
pre-committed to OroCommerce, which removes Synolia's freedom on platform choice.

**Two funnels, deliberately separate:**

| | Joint funnel (Campaign 3) | Synolia funnel (this page) |
|---|---|---|
| Keywords | OroCommerce-branded | Spanish category terms |
| Branding | OroCommerce throughout | No platform named at all |
| Consent box | `share_with_oro` present | **Absent by design** |
| Lead sharing | With Oro by default | Only after Synolia decides the platform |

Do not add a `share_with_oro` checkbox here. Registering a lead with a vendor at
form-fill is what creates the lock-in this page exists to avoid.

### `/ecommerce-b2b/` names no commerce platform
Earlier drafts compared OroCommerce, Medusa and Adobe Commerce side by side. That was
removed deliberately: this page sits on the same domain as the joint campaign, so
showcasing an Oro competitor (especially Medusa, which undercuts Oro's licence model and
carries Synolia's own B2B suite) reads as hostile to the partner it is meant to sit
alongside. That page now names **no commerce platform at all**, which keeps Synolia's
platform freedom without advertising alternatives. Keep it that way. The comparison page
is the deliberate exception — see **Platform naming** below.

That constraint extends to `lead.js`, which is served publicly: routing hints must not
name platforms either. Neutrality is carried by the "somos integradores, no fabricantes
de software, no tenemos una licencia que colocarte" statement instead.

### Single conversion path per page
One CTA everywhere: the personalized demo, through the form. No links to the live
Meridian demos or to `b2b-ecommerce-demo/` — those are competing exits that leak traffic
away from the only action this page wants. ERP vendors are named freely (SAP, NetSuite,
Acumatica...) because those are integration targets, not commerce competitors.

### The ERP diagram (`#erp`)
The top objection on every B2B deal, so it sits directly under the hero, on the soft
section fill. White card: ERP node on the left cycling real vendor logos, commerce node
on the right, two packet tracks showing what syncs each way (ERP→store: productos, stock,
precios, estado de cuenta / store→ERP: pedidos, cotizaciones, clientes, datos de entrega).

**Logos are local files in `assets/logos/`** — SAP, Oracle NetSuite, Dynamics 365,
Acumatica, Oracle, Sage, Odoo, Softland, TOTVS (72 KB total), plus an "o el tuyo"
wordmark closer. Sourced from Simple Icons and Wikimedia Commons, then committed: never
hotlink, the page must not depend on a third-party host. Defontana and Infor had no clean
public SVG, so they live in the text line under the node instead. To add a vendor, drop
the file in `assets/logos/` and add one `.erp-logo` span; nothing else changes.

A `.tm-note` under the diagram states that the marks belong to their owners and indicate
integration compatibility only. Keep it: naming vendors this way is normal nominative use
for an integrator, and the disclaimer is what makes that explicit.

Behaviour details that matter:
- Brand marks vary enormously in aspect ratio (Oracle is a wide wordmark, TOTVS a dark
  square), so each sits in a fixed-height box with `object-fit: contain`.
- The swap is **sequential, not a crossfade**: fade the current logo out, wait 380ms, fade
  the next one in. Two differently-shaped logos overlapping at partial opacity reads as a
  rendering fault. Verified never more than one visible at a time.
- The markup ships with `class="erp-rotator static"`, which renders all ten as a 3-column
  logo grid. `lead.js` removes `static` and starts the rotation only when JS runs and the
  visitor has not asked for reduced motion. So no-JS, reduced-motion and the pre-JS paint
  all show a complete logo wall rather than an empty box.
- `#erp` is the section id. The form input is `id="erp_current"` with `name="erp"` to keep
  the anchor unambiguous.

### Two intents, two pages
The category funnel is two pages, because the doubts split by search intent and the two
readers do not respond to the same thing:

| | `/ecommerce-b2b/` | `/comparar-plataformas-b2b/` |
|---|---|---|
| Reader | Has an operational pain, does not know the market | Has a shortlist, has seen five demos |
| Searches | `ecommerce B2B`, `portal de pedidos`, `ecommerce para distribuidores` | `comparar plataformas ecommerce B2B`, `mejor plataforma B2B` |
| Offer | A call that answers their doubts | Up to six platforms on their own catalogue in 48h |
| Will not respond to | A platform comparison | "Let us show you a demo" |

**Do not bid on `OroCommerce vs ...` from the comparison page.** Oro-branded terms are
Oro's side of the keyword split agreed on 5 August; taking them breaks the deal.

### The offer is the call, not the demo
Both pages sell a conversation. On `/ecommerce-b2b/` the demo is a single compact
`.demo-aside` band near the bottom, explicitly optional. It used to be the whole premise
and that was wrong: a page that only offers a demo filters out everyone who has already
seen demos and just wants answers.

### The doubt list is the heart of `/ecommerce-b2b/`
Six doubts, each with a real position and an "En la llamada" answer. Ranked by how hard
they block a decision:

1. **Pricing structure.** The most underestimated thing in B2B commerce, and the failure is
   visible to customers (list price shown instead of contract price, buyer returns to email
   the same day). The answer is per-platform, not per-rule: bring your rules plus your
   customer and product volumes, and we say which platforms handle your model natively,
   which need custom development, and which simply do not fit. No comparison article can
   answer that, because it does not know your rules.
2. **ERP integration.** Carried by the animation section, which is titled "la duda 02".
   If the doubts are ever renumbered, that title must move with it.
3. **Real cost.** We publish **no budget range** on purpose: the same scope varies
   three-fold with data quality and pricing-rule count, so a published range is noise.
   Saying that plainly reads as more honest than a fake number.
4. **Sales-team resistance.** The differentiator. More B2B projects die on rep resistance
   than on technology, and no competitor puts it on a landing page because software vendors
   have no answer to it. Keep this one.
5. **Customer adoption.** Recurring buyers come to reorder, not to browse.
6. **"My customers already order by WhatsApp, why change?"** The business-case reframe: the
   biggest return is not more sales, it is the time given back to the internal team that
   today transcribes orders and answers price and stock questions by hand. Ends by
   connecting back to doubt 04 — this is why the sales team that resisted ends up wanting
   the portal.

**Dropped deliberately:** "¿Cuánto demora?" and "mi catálogo está desordenado". Both were
generic enough that any vendor could have written them, which is the opposite of this
page's job. Timeline still appears in the comparison page's criteria and in project
conversations, just not as a doubt card here.

An earlier draft had a six-card grid of B2B capabilities in this slot. It was replaced: on
a page whose only action is booking a call, a feature list explains the category instead of
arguing for the click.

### Vocabulary is LatAm Spanish, not US sales jargon
"SDR" shipped in a heading and had to be pulled: it is standard US sales vocabulary and
largely unknown in LatAm. The heading is now "No hay un vendedor entre medio", which also
echoes the hero. Watch for the same trap with BDR, AE, pipeline, prospecting.

### Platform naming
Named **non-exclusively**. `/comparar-plataformas-b2b/` lists OroCommerce, Adobe Commerce,
Magento and "open source & headless" as chips, followed by "y las que tengan sentido para
tu caso", plus a line saying the set is agreed on the call. This is deliberate: it is
specific enough to be credible to someone comparing, and vague enough that we never
publish a fixed roster of Oro competitors we implement. `/ecommerce-b2b/` still names no
commerce platform at all. `lead.js` routing hints must stay platform-free — it is served
publicly.

### Never inline `grid-template-columns`
An inline `style="grid-template-columns:repeat(3,1fr)"` on a `.cap-grid` beat the
`@media (max-width: 900px)` rule that collapses it to one column, so a phone rendered three
unreadable ~90px columns. Set column counts in the stylesheet only.

Note this class of bug does **not** show up in an overflow check: grid tracks shrink rather
than overflow, so `scrollWidth - clientWidth` stayed 0 while the layout was unusable. Check
computed `gridTemplateColumns` and rendered card width per breakpoint, not just overflow.

### Silent qualification
Four sizing questions (revenue band, B2B customer count, how orders arrive today, current
ERP) produce a `score` out of 8, a `segment` and a `routing_hint` attached to the lead and
sent to analytics.

- **All four blank → `unknown`**, never `smb`. An unqualified lead must never be filed as
  a disqualified one.
- **Stated `<5M` → `smb` regardless of score.** A stated number outranks inferred signals.
- `>=5` → `enterprise`, `>=3` → `mid-market`.

The prospect never sees any of this: no score, no "you are too small", no platform
recommendation on the page. That conversation happens on the call.
