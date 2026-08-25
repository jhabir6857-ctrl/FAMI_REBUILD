# FaMi Website Rebuild — Project Plan & Progress Tracker

**Stack:** Next.js 16 (App Router, TypeScript) · Drizzle ORM + SQLite (swap-in-ready for Postgres) · NextAuth v5 · Tailwind v4
**Brand basis:** Real "FM" rose-gold monogram logo (client-confirmed) · Categories carried over from famibd.shop · Diamond World used for structural/trust inspiration, not literal feature parity

**Legend:** ✅ Done & build-verified · 🆕 New (added after plan review) · ⬜ Not started yet

---

## Phase 0 — Discovery
- ✅ Audited old site (famibd.shop) — structure, categories, contact channels
- ✅ Audited reference site (Diamond World) — identified inspiration vs. over-scope
- ✅ Gathered requirements (tech stack, must-have features, backend depth, content readiness)
- ✅ Received real logo — corrected palette to true rose-gold/copper brand color

## Phase 1 — Project Foundation
- ✅ Scaffolded Next.js 16 project (TypeScript, Tailwind v4, App Router, src dir)
- ✅ Installed Drizzle ORM + better-sqlite3 (swapped from Prisma — Prisma's engine download is blocked in this sandbox's network; Drizzle needed zero external binaries)
- ✅ Installed NextAuth v5, bcryptjs, lucide-react, zod
- ✅ Self-hosted brand fonts (Fraunces, Newsreader, Inter) as local files instead of live Google Fonts calls

## Phase 2 — Design System
- ✅ Built color/type token system in globals.css (Ink Plum, Emerald, Rose Gold, Parchment, Terracotta)
- ✅ Built signature visual elements: hallmark-stamp category emblems, hand-stitched gold hairline dividers

## Phase 3 — Data Layer & Auth
- ✅ Designed database schema — categories, products, users, orders, orderItems, wishlist, blogPosts, stores, referrals
- ✅ Wrote & ran seed script — 9 categories, 19 products, 3 blog posts, 2 store locations, 2 demo accounts
- ✅ Built NextAuth credentials auth (login backed by real DB + bcrypt)
- ✅ Built shared data-access helpers (lib/data.ts)
- 🆕 ⬜ Define admin role assignment path (seed one hardcoded admin account now; document how to promote another user later)

## Phase 4 — Core Shopping Experience
- ✅ Cart system (context + localStorage, guest-friendly)
- ✅ Header — mega menu, mobile drawer, live search, cart counter
- ✅ Footer — newsletter, social, sitemap links
- ✅ Homepage — hero, trust badges, category shelf, featured/new products, brand story, loyalty teaser, journal preview
- ✅ Shop/category listing pages — sorting, subcategory filter chips
- ✅ Product detail page — gallery, related products, WhatsApp quick-order
- ✅ Wishlist — DB-backed, per logged-in account
- ✅ Cart page
- ✅ Checkout — real order creation in DB, payment method selection (COD / WhatsApp / bKash / Nagad), loyalty points awarded on purchase
- 🆕 ⬜ Order notification: email the client on every new order (Resend/SMTP), in addition to the order already appearing in the admin dashboard (Phase 6)
- 🆕 ⬜ BDT/৳ currency formatting pass across cart, checkout, product cards
- 🆕 ⬜ Mobile bottom tab bar (Home, Shop, Wishlist, Cart/Account) — committed per UI Design System v2
- 🆕 ⬜ PDP gallery video support (short muted looping clips via Cloudinary, poster-frame fallback, `videoUrl` added as an optional field on the products schema) — committed per UI Design System v2, content-dependent on client-supplied 9:16 footage
- 🆕 ⬜ Checkout autocomplete attributes + address pre-fill for logged-in returning shoppers

## Phase 5 — Accounts & Content
- ✅ Login page
- ✅ Register page
- ✅ Account page — order history, loyalty points, referral code, sign out
- ✅ Blog listing page
- ✅ Blog post detail page
- ⬜ Store locator page
- 🆕 ⬜ Store address/hours added to footer now (content addition, doesn't need to wait for the full store locator page)
- ⬜ Dedicated Loyalty & Referral page (account page currently shows a snapshot only)
- ⬜ About page
- ⬜ Contact page
- 🆕 ⬜ Basic spam/rate-limit protection on newsletter signup, register, and contact form

## Phase 6 — Admin Panel (explicit must-have)
- ⬜ Admin layout + route protection (admin-role-only access)
- ⬜ Admin dashboard (orders/revenue/customer snapshot)
- ⬜ Product management (create, edit, delete, stock)
  - 🆕 Image upload → **Cloudinary** (recommended: generous free tier, built-in resize/optimization, less setup than raw S3 — confirm before this sub-phase starts)
  - 🆕 All product images served via Cloudinary named transform `c_fill,ar_4:5,g_auto` — auto-crops to 4:5, no manual admin cropping required
  - 🆕 Upload form shows a 4:5 preview frame (same transform) before save, so admin can re-frame the source photo if subject detection picks the wrong crop
- ⬜ Order management (view, update status)
- ⬜ Blog post management (create, edit, delete)
- ⬜ Store location management

## Phase 7 — Polish & Handoff
- ⬜ Real favicon/browser icon from the client's logo
- 🆕 ⬜ Per-page SEO metadata (title/description), Open Graph tags + image, sitemap.xml, robots.txt
- 🆕 ⬜ Analytics: Google Analytics 4 + Meta Pixel wired in (client will likely run Instagram/Facebook ads)
- ⬜ Full site build + lint pass, fix any remaining errors
- 🆕 ⬜ Lightweight manual QA checklist before handoff (checkout flow, auth, admin CRUD, mobile pass)
- ⬜ Write handoff README — env setup, run/build/seed commands, admin login, how to move SQLite → Postgres for production, how to plug in a real payment gateway later, Cloudinary env vars
- 🆕 ⬜ Write one-page client shooting guide for PDP product video (lighting, background, duration/loop rules — see UI Design System v2)
- ⬜ Package project and deliver for download

---

## Framework version notes
- **TypeScript: 6.x, not 7.** TypeScript 7 (Go-native compiler) reached GA July 8, 2026 with genuine 8–12x build-speed gains, but ships without a stable programmatic API — ESLint, ts-jest, and parts of the framework tooling ecosystem aren't fully compatible yet. Staying on 6.x is a deliberate stability choice for a production client build, not an oversight; revisit once the ecosystem catches up.
- **Next.js 16 (Turbopack, stable):** official gains are 2–5x faster production builds, up to 10x faster Fast Refresh — cited here at the verified numbers, not rounded up.
- **Tailwind v4:** Rust-based Lightning CSS engine, CSS-first config — current stable architecture, no concerns.

## Notes on decisions made along the way
- **Payment:** left flexible — checkout supports Cash on Delivery and WhatsApp confirmation today; bKash/Nagad/card can be wired to a real gateway (SSLCommerz is the BD standard) without touching the rest of the app.
- **Database:** SQLite for zero-config local development; schema is written to move to Postgres with a small, mechanical change when ready to deploy.
- **Product images:** Cloudinary, chosen over local storage or raw S3 for lower setup overhead and built-in image optimization. *(confirmed with client Aug 4)*
- **Order notifications:** Email to client on new orders + admin dashboard as source of truth. WhatsApp Business API considered and rejected for this — requires Meta business approval and per-message cost, not worth it for a simple order alert. WhatsApp stays as the customer-facing quick-order channel only. *(confirmed with client Aug 4)*
- **Hosting/domain:** still open — flagged earlier, no answer yet. Doesn't block development, but needed before final deployment.
