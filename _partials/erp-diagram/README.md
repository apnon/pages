# ERP integration diagram — reusable section

Pulled out of `/ecommerce-b2b/` on 2026-09-07 so it can be dropped into another
landing-page variant. It was removed from that page, not deleted.

## What it is

A white panel answering "¿y esto se conecta con mi ERP?" — the objection that comes
up first on nearly every B2B deal. Your ERP on the left cycling real vendor logos,
your storefront on the right, two packet tracks between them showing what syncs in
each direction.

## Dropping it into a page

1. `section.html`  → paste where you want it. It expects the page's existing
   `.section`, `.container`, `.sec-head`, `.eyebrow`, `.lead`, `.btn` classes,
   which every campaign page already has.
2. `style.css`     → append to that page's `style.css`.
3. `rotator.js`    → paste inside the page's `lead.js` IIFE (it needs nothing from
   the surrounding scope).
4. `assets/`       → copy into the page's `assets/logos/`.

## Things that will bite you if you change them

- **The markup ships with `class="erp-rotator static"`.** That renders all ten marks
  as a logo grid. The JS *removes* `static` and starts the rotation. That order is
  deliberate: with JS blocked, reduced motion on, or before JS runs, the visitor sees
  a complete logo wall instead of an empty box. Do not "fix" it by shipping without
  `static`.
- **The swap is sequential, not a crossfade.** Fade out, wait 200ms, fade in. These
  marks have wildly different shapes (Oracle is a wide wordmark, TOTVS a dark square)
  and two overlapping at partial opacity reads as a rendering fault.
- **Logos are local files, never hotlinked.** Sourced from Simple Icons and Wikimedia
  Commons. Keep the `.tm-note` line stating the marks belong to their owners and
  indicate integration compatibility only.
- **Section id is `erp`.** If the host page links to it, keep the anchor.

Defontana and Infor have no clean public SVG, so they are named in the text line
under the node rather than shown as logos.
