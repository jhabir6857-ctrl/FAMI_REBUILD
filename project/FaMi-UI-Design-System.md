# FaMi — UI Design System Plan (v2)

Standalone from the broader UX plan. This document is the visual rulebook: typography, spacing, color usage, component states, motion, imagery, and navigation — detailed enough to build from without guessing.

Guiding line, kept from the earlier discussion: **quiet luxury, not Diamond World's density.** Every rule below exists to protect that.

---

## 1. Typography

| Role | Font | Size | Weight | Line height |
|---|---|---|---|---|
| Display (hero headline) | Fraunces | 40px / 28px mobile | 500 | 1.15 |
| Section heading (H2) | Fraunces | 28px / 22px mobile | 500 | 1.2 |
| Card/product title (H3) | Newsreader | 18px | 500 | 1.3 |
| Body | Inter | 16px | 400 | 1.6 |
| Secondary/meta text | Inter | 14px | 400 | 1.5 |
| Caption/label | Inter | 12px | 500 | 1.4 |
| Button label | Inter | 14px | 500 | — |

Rules:
- Fraunces (serif, editorial) is reserved for headlines and the logo wordmark — never for UI chrome (buttons, nav, labels). This is what separates FaMi from Diamond World's single-sans-everywhere look.
- Newsreader sits between the two — used for product names and blog body copy, where a touch of editorial warmth helps without slowing scanning.
- Inter carries every functional UI element: nav, buttons, forms, prices, badges.
- Two weights only per family in practice (400 regular, 500 medium) — no bold (700) anywhere except the display headline on desktop, sparingly.
- Sentence case everywhere. No ALL CAPS nav items, no Title Case buttons.

## 2. Color usage (formalized)

Existing tokens: Ink Plum, Emerald, Rose Gold, Parchment, Terracotta.

| Token | Role | Where it's allowed |
|---|---|---|
| Rose Gold | Single accent | Logo, primary CTA button, price text, sale/new badges, active nav underline. **Never** as a section background. |
| Ink Plum | Primary text/dark surfaces | Body text, header background if dark header is used |
| Parchment | Page/section background | Default page bg, alternating section backgrounds |
| Emerald | Secondary accent | **Final:** strictly loyalty point count, rewards badges, referral success banners — nowhere else |
| Terracotta | Tertiary/warm accent | **Final:** strictly editorial blog tags and quiet category callouts in journal articles — nowhere else |

**The restraint rule:** at most one Rose Gold–filled element per screen (one primary button). Everything else uses outline or ghost style. Keeping roughly 90% of the site in Ink Plum, Parchment, and Rose Gold is what preserves the boutique feel and keeps FaMi from reading like a busy multi-vendor marketplace — this is the single biggest lever for looking "professional" instead of "template," and it's where Diamond World breaks down with colored badges and buttons everywhere.

## 3. Spacing & grid

- Base unit: 4px. All spacing values are multiples of 4 (8, 12, 16, 24, 32, 48, 64).
- Section vertical rhythm: 64px between major homepage sections on desktop, 40px on mobile.
- Card internal padding: 16px mobile, 20px desktop.
- Grid: 12-column on desktop (1024px+), 4-column on tablet, single-column flow on mobile with 2-up product grids.
- Container max-width: 1280px, centered, 24px side gutters on desktop, 16px on mobile.

## 4. Component states

Every interactive element needs four states designed, not just default + hover:

| State | Rule |
|---|---|
| Default | As specified in the component |
| Hover (desktop only) | Subtle — border darkens one step or background shifts to Parchment-100, never a color change on text |
| Focus (keyboard) | 2px Rose Gold outline, offset 2px — visible, never suppressed |
| Active/pressed | Scale 0.98 on buttons, no color flash |
| Disabled | A dedicated muted-gray fill + text token (not opacity alone — opacity dimming can drop below WCAG AA contrast depending on the base color), cursor not-allowed. Never used for "out of stock" — that's a badge, not a disabled button |

Product card specifically: wishlist heart icon is always visible (not hover-only) on mobile since there's no hover state on touch — this was flagged in the earlier plan and stays a hard requirement.

Checkout forms use standard `autocomplete` attributes (`name`, `email`, `tel`, `street-address`, etc.) so browser/device autofill works for returning shoppers, and logged-in users get their last-used address pre-filled from account data — low-cost friction reduction, no new infrastructure required.

## 5. Motion

- Duration: 150ms for micro-interactions (button press, toggle), 250ms for panel transitions (cart drawer, mobile menu), 300ms max for page-level transitions.
- Easing: ease-out for things entering (cart drawer sliding in), ease-in for things leaving.
- Add-to-cart feedback: item briefly animates toward the cart icon or the cart icon does a single subtle bounce — confirms the action without a blocking toast.
- No auto-playing carousels, no parallax, no scroll-jacking — these read as dated marketing-site tricks, not luxury.
- Respect `prefers-reduced-motion` — disable non-essential animation for users who request it.

## 6. Imagery

- Product photography: consistent 4:5 aspect ratio across all product cards — mixed ratios are the fastest way to make a catalog look unpolished.
- **Enforced automatically, not manually.** Admins don't crop images by hand — serve every product image through Cloudinary's named transformation `c_fill,ar_4:5,g_auto`, which auto-detects the product subject and crops to a perfect 4:5 on the fly. Removes the recurring failure mode of relying on people to crop consistently over time.
- **Admin upload safeguard:** the Phase 6 upload form shows a 4:5 preview frame (running the same transformation) before the admin saves, so they see the actual card crop up front and can re-frame the source photo if auto-detection picks the wrong subject.
- Consistent background (white or a single neutral studio tone) across the primary product image; lifestyle/detail shots can vary in the gallery.
- Hero images: 16:9 or 21:9 on desktop, cropped to a taller ratio on mobile rather than shrinking the same crop.
- Compress and serve via Next.js Image with explicit width/height to prevent layout shift — ties to the Cloudinary decision already made.

## 7. Icon system

- One icon set only (outline style, consistent stroke width) — mixing icon styles is a common tell of a site assembled from templates.
- Icon sizing: 18px inline with text, 20–24px standalone (nav, cart, wishlist).
- Icons never carry meaning alone in critical actions (checkout, delete) — always paired with a text label or accessible label.

## 8. Product video

Client has or can source product video footage, so this is scoped in — but deliberately narrower than a full cinematic hero:

- **PDP gallery only at launch.** A short (3–6s), muted, looping clip sits as one item in the existing product gallery alongside stills — same swipe/click interaction as photos, not a separate feature. Poster frame (a still) shows until the clip loads so there's no layout shift or blank flash.
- **No hero video at launch.** A scroll-driven video hero directly conflicts with the "no scroll-jacking, no parallax" rule set earlier — that rule stays. Revisit a restrained hero loop (static crop with a single subtle looping detail, not a narrative sequence) as a v2 enhancement once there's a full library of footage and real performance data from the PDP rollout.
- **Technical guardrails:** host via Cloudinary (same pipeline as images — no new infrastructure), autoplay only when the clip is in viewport and only over Wi-Fi or fast connections where feasible, always muted with a visible unmute control, and respect `prefers-reduced-motion` by falling back to the poster frame.
- **Content requirement:** vertical 9:16 crop, consistent lighting/background per the imagery guidelines above — inconsistent video treatment will stand out more than inconsistent photos.
- **Video is a strictly optional field on the product schema.** If a product has no clip, the gallery renders stills only — no empty slot, no broken player, no placeholder. The gallery component checks for a video field and simply doesn't render that slot if it's absent.
- **Client shooting guide (hand off as a one-pager before they film anything):**
  1. **Lighting** — continuous neutral daylight or a single ring light; no mixed yellow indoor lighting.
  2. **Background** — matte white, beige, or soft acrylic surface matching the product photo background.
  3. **Duration & loop** — 3–5 seconds of smooth rotation or light catching the item, starting and ending on the same still position so the loop reads seamlessly.

## 9. Navigation pattern

- **Desktop:** single-level dropdown per category (per the earlier Diamond-World comparison — no mega-menu wall of subcategories). If a category needs more depth, that depth lives in shop-page filter chips.
- **Mobile:** slide-in drawer from the hamburger for full navigation, plus a persistent bottom tab bar with four items — Home, Shop, Wishlist, Cart/Account — since BD mobile shopping behavior favors thumb-reachable persistent nav over a header that scrolls away. **Committed** — add to the phase plan as a build item under Phase 4 (Core Shopping Experience), since it touches the header/layout shell already built.
- Search: expands inline from the header (not a separate page) with live results appearing below as the user types, capped at 5 suggestions plus a "see all results" link.

## 10. Overlay & popup policy (formalized)

This was said verbally last turn — now it's a rule:
- Maximum **one** unsolicited overlay per session.
- Never on initial page load.
- Newsletter signup may appear after scroll depth or exit-intent, not before.
- Cart drawer, quick-view, and filter sheets are user-triggered and don't count against this limit — the rule is specifically about unsolicited marketing overlays, which is where Diamond World overwhelms.

## 11. Content & voice

- Buttons: verb-first, sentence case, no punctuation — "Add to cart", "Shop the collection", not "Buy Now!" or "Click Here".
- Errors: state what happened and what to do next, no "Error:" prefix — "That email's already registered. Try logging in instead."
- Empty states: an invitation, not an apology — "Your wishlist is empty" + a link to shop, not "No items found."
- No exclamation marks in system copy (confirmations, labels) — reserve energy for actual brand moments (hero headline, campaign copy).

## 12. Accessibility specifics

- Contrast: Rose Gold on Parchment fails for body text — confirmed unsafe, use Ink Plum for all text, Rose Gold for accents/borders/large headline type only.
- All form fields have visible labels (not placeholder-only), inline error text tied to the field via `aria-describedby`.
- Focus order follows visual order — verify this explicitly once the mega-menu is simplified, since dropdowns are a common place focus order breaks.

## 13. Admin panel — separate visual language

Confirmed from the earlier plan: the admin UI does **not** use Rose Gold, Fraunces, or the storefront's editorial tone. Neutral grays, Inter only, dense tables, functional over expressive — this prevents staff from confusing "editing" with "viewing the live site," and it's faster to build since it doesn't need the same design polish pass.

---

## Resolved since v1

- Bottom tab bar: **committed**, scoped into Phase 4.
- Product video: **committed**, scoped to PDP gallery clips at launch, strictly optional per product, no scroll-driven hero video.
- Store address/hours: move into the footer immediately as a content addition, decoupled from the full store locator page build (still Phase 5).
- Product photo cropping: **automated** via Cloudinary `c_fill,ar_4:5,g_auto`, not manual admin cropping — with an admin-side preview safeguard.
- Emerald/Terracotta usage: **final** — loyalty/rewards and editorial blog tags only, no wider use.

## Nothing currently open — all v1 questions resolved. Revisit this list if new scope surfaces.
