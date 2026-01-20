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
