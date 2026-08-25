# FaMi — UI/UX Plan

Companion to the project plan. Covers how the site should look, feel, and behave — not just what gets built.

---

## 1. UX principles

FaMi sits between two references: famibd.shop (small, personal, multi-category boutique) and Diamond World (large, institutional, single-category trust machine). The UX should borrow Diamond World's **confidence signals** without borrowing its **density**. Four working principles:

1. **Quiet luxury, not loud luxury.** Generous whitespace, restrained color use (rose-gold as accent, not wallpaper), no auto-playing carousels or flashing badges.
2. **Trust is earned in small moments**, not one big "About" page — visible stock status, clear delivery/payment info at checkout, real product photography, a working WhatsApp line always in reach.
3. **Every page has one job.** Home sells the brand, Shop sells the category, PDP sells the item, Checkout removes friction. Don't let secondary content (blog teasers, loyalty banners) compete with the primary job of the page.
4. **Mobile is the primary surface.** BD e-commerce traffic skews heavily mobile — design mobile-first, then adapt up, not the reverse.

## 2. Personas (working assumptions — confirm with client if these don't match reality)

**The browser** — arrives from an Instagram post, hasn't decided to buy yet. Wants: fast visual scanning, category clarity, no login wall to look around.

**The gift buyer** — knows roughly what they want (e.g. "earrings under ৳3000"), time-pressured. Wants: filters/sort that work, clear pricing, WhatsApp as an escape hatch when unsure.

**The repeat customer** — has bought before, cares about loyalty points and order status. Wants: account page that surfaces this immediately, not buried behind clicks.

## 3. Key user flows

**Purchase flow (primary):**
Home or Instagram link → Shop/category → Product detail → Add to cart (or WhatsApp quick-order for the undecided) → Cart review → Checkout (guest-friendly) → Order confirmation → (if logged in) loyalty points reflected on account page.

Friction points to protect against: forcing login before checkout, hiding total cost until the last checkout step, and category pages that don't let a user narrow down fast enough on mobile.

**Account flow (secondary):**
Register/Login → Account page shows order history + loyalty snapshot + referral code immediately, no extra clicks → Wishlist and past orders reachable from the same page, not scattered.

**Admin flow (internal, Phase 6):**
Staff login → Dashboard shows today's orders + revenue at a glance → drill into Orders to update status, or Products to manage stock. Admin UX should optimize for speed of repetitive tasks (adding products, marking orders shipped), not visual polish — see Section 8.

## 4. Site map

Four functional groups (see diagram above): **Storefront** (revenue-generating, gets the most design attention), **Account** (utility, should be fast and unglamorous), **Content & trust** (blog, about, contact, store locator — supports the sale, doesn't need to convert directly), **Admin** (internal tool, different design language entirely — see Section 8).

## 5. Page-by-page UX

### Home
- Hero establishes brand mood in one screen (no scroll needed to "get" the brand) — real photography over stock imagery once available.
- Category shelf is the primary navigation aid for browsers who don't know what they want yet — large tap targets, category name always visible (not hover-only).
- Trust badges (authenticity, delivery, WhatsApp support) sit above the fold on mobile — this is where Diamond World's instinct is right: BD jewelry/fashion buyers want reassurance before they scroll.
- Loyalty and blog previews are secondary — place after products, never compete with the shelf for first-screen attention.

### Shop / category listing
- Filter chips must be reachable with the thumb on mobile — sticky filter bar or bottom sheet, not a sidebar that pushes products off-screen.
- Sort control default should be "Featured" or "Newest," not price — price-sorting first frames the store as discount-driven.
- Empty state (filtered to zero results) needs an explicit message + a way to clear filters, not a blank grid.

### Product detail page
- Gallery first, price and add-to-cart immediately visible without scrolling on mobile (this is the single highest-leverage UX fix if it isn't already true).
- WhatsApp quick-order button should sit beside — not replace — Add to Cart. It's for the undecided buyer who wants to ask a question, not the default purchase path.
- Stock status ("In stock" / "Only 2 left" / "Out of stock") should be visible, not just enforced silently at checkout.
- Related products at the bottom, not interrupting the primary decision.

### Cart
- Line-item edit (quantity, remove) without a full page reload feel — optimistic UI updates.
- Running total always visible, especially on mobile where the cart can get long.
- Clear path back to Shop for "add one more thing" — cart shouldn't be a dead end.

### Checkout
- Single biggest UX risk on the whole site: **don't make guest checkout feel like a second-class option.** It should be the default, with "sign in for faster checkout next time" as a soft nudge, not a wall.
- Payment method selection (COD / WhatsApp / bKash / Nagad) needs one-line explanations under each — a first-time buyer won't know what "WhatsApp confirmation" means as a payment method without a hint.
- Order summary stays visible (sticky sidebar on desktop, collapsible summary on mobile) through every checkout step — no surprise totals.

### Account
- Order history, loyalty points, and referral code all visible on load — no tabs hiding any of the three behind a click, per the plan's existing scope.
- Loyalty/referral gets its own dedicated page (Phase 5 backlog item) once the snapshot proves people want more detail — don't over-build this until there's signal it's needed.

### Blog
- Supports SEO and brand storytelling, not conversion — keep it visually distinct from shop pages (more editorial, serif-forward using the Fraunces/Newsreader type pairing already in the design system) so it doesn't feel like a product page pretending to be an article.

### Store locator (backlog)
- Map + list view, not map-only — BD users on slower mobile connections often prefer a scannable list with address/phone/hours over waiting on a map tile load.

### About / Contact (backlog)
- About: brand story + a real photo of the founder/team if available — this is a trust page, not a features page.
- Contact: WhatsApp and phone number above the contact form, not below it — most BD customers will call or message before they'll fill out a form.

## 6. Design system — component inventory

Building on the tokens already in `globals.css` (Ink Plum, Emerald, Rose Gold, Parchment, Terracotta):

| Component | Notes |
|---|---|
| Product card | Image, name, price, wishlist heart (top-right corner, always visible not hover-only on mobile), stock badge if low/out |
| Buttons | Primary (rose-gold fill), secondary (outline), and a distinct WhatsApp-green variant reserved only for WhatsApp actions — don't reuse it elsewhere or it loses meaning |
| Badges | Stock status, "New," loyalty tier — small, sentence case, never more than one per product card to avoid clutter |
| Forms | Consistent error state (inline, red text under field, not a toast) across login/register/checkout/contact |
| Modals | Cart drawer (slide-in from right), quick-view if added later — avoid full-page modals on mobile, prefer bottom sheets |
| Toasts | Add-to-cart confirmation, wishlist add/remove — auto-dismiss, non-blocking |

## 7. Responsive strategy

- **Mobile-first breakpoints:** base (< 640px), tablet (640–1024px), desktop (1024px+).
- Header: hamburger + mega menu already planned — confirm the mobile drawer groups categories the same way as desktop mega menu (Ornament > Ring/Earrings/etc.) so users don't relearn the hierarchy switching devices.
- Product grid: 2 columns mobile, 3 tablet, 4 desktop — avoid single-column mobile grids, they push good products below the fold too fast.
- Checkout: collapse the order summary into an expandable "Order summary (৳X,XXX) ▾" bar on mobile rather than cutting it.

## 8. Interaction states (often skipped, easy to miss at handoff)

Every data-driven view needs three states designed, not just the happy path:
- **Loading** — skeleton screens for product grids and PDP, not spinners (skeletons feel faster and reduce layout shift)
- **Empty** — filtered shop with no results, empty cart, empty wishlist, empty order history — each needs a message + a clear next action, not a blank space
- **Error** — failed checkout submission, failed login — inline and specific ("This email is already registered" not "An error occurred")

## 9. Accessibility baseline

- Color contrast: rose-gold accent on parchment background needs a contrast check for text use (fine for backgrounds/borders, likely too light for body text — use Ink Plum for text, rose-gold for accents only).
- All interactive elements (wishlist heart, quantity steppers, filter chips) need visible focus states, not just hover states — many BD mobile users navigate with a mix of touch and switch/assistive tech.
- Images need real alt text (product name + key attribute), not filenames — matters for SEO too, ties back to the Phase 7 SEO work.

## 10. Admin panel UX (Phase 6 — different rules than the storefront)

The admin panel should look and behave like a **tool**, not a continuation of the brand experience:
- Dense data tables over cards — staff scanning 50 orders want rows, not product-card-style tiles.
- Inline edit where possible (update order status from the table row) rather than forcing a full detail-page navigation for every small change.
- Bulk actions (mark multiple orders shipped) if order volume justifies it — flag this to the client rather than assuming; skip if order volume is low, it's not worth the build time yet.
- Product creation form should support the Cloudinary upload inline with a preview, not a separate "upload then paste URL" step.
- Keep this UI in a neutral, functional palette (not rose-gold-branded) — reduces the chance of visual confusion between "editing the site" and "viewing the site."

---

## Open questions to confirm with the client before finalizing visuals

1. Is there real product photography coming, or should the design account for stock/placeholder imagery for launch?
2. Any brand guideline on how literally the rose-gold accent should be used (backgrounds vs. accents only)?
3. Expected order volume — informs whether admin bulk actions are worth building now vs. later.
