# FaMi — Setup & Handoff Notes

## Quick start

```bash
npm install
cp .env.example .env       # fill in AUTH_SECRET at minimum — see below
npm run db:seed            # creates fami.db, seeds categories/products/blog/stores/demo accounts
npm run dev                # http://localhost:3000
```

Generate a real `AUTH_SECRET` with:
```bash
openssl rand -base64 32
```

### Demo accounts (seeded, password `password123` for both)
- `admin@famibd.shop` — role: admin, can access `/admin`
- `customer@famibd.shop` — role: customer

### Promoting another user to admin
Run this against `fami.db` (or your Postgres DB in production):
```sql
UPDATE users SET role = 'admin' WHERE email = 'someone@example.com';
```
Using the Drizzle Studio shortcut:
```bash
npm run db:studio   # opens a browser UI — find the user row, change role to 'admin'
```

### Wiring order notification email
The checkout route already calls `sendOrderNotification()` after every successful order.
To activate real email delivery:
1. Sign up at [resend.com](https://resend.com) (free — 3 000 emails/month)
2. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
   ORDER_NOTIFICATION_EMAIL=your-real-inbox@example.com
   ```
3. Restart the dev server — emails will start flowing immediately.

Without the key the function logs order details to the server console instead, so no orders are ever silently lost.

### Production build
```bash
npm run build
npm run start
```
Verified clean on this snapshot: `tsc --noEmit`, `next build`, and a real `next start` smoke test (register, login, wishlist, guest checkout, authenticated checkout, stock-exceeded rollback) all pass — see "What was verified" below.

## Admin panel (added this session)

Scope: orders only — the piece that was actually blocking the site from
being usable as a real business tool. Visit `/admin` logged in as
`admin@famibd.shop`.

- **Dashboard** (`/admin`) — total orders, total revenue, pending count,
  customer count, last 5 orders.
- **Orders list** (`/admin/orders`) — every order, filterable by status.
- **Order detail** (`/admin/orders/[id]`) — line items, customer contact,
  shipping address, payment method, and a status-update control
  (pending → confirmed → shipped → delivered, or cancelled).
- **Protection, two independent layers**: `src/proxy.ts` (Next 16's
  replacement for `middleware.ts`) blocks any non-admin from reaching
  `/admin/*` before the page even renders, redirecting to `/login` if
  logged out or `/` if logged in as a non-admin. The status-update API
  route (`/api/admin/orders/[id]/status`) does its own independent
  `session.user.role === 'admin'` check too, since it doesn't live under
  `/admin` and so isn't covered by the proxy matcher — relying on the
  proxy alone would leave that endpoint unprotected.
- Verified against the real running server, not just read through: confirmed
  an unauthenticated request gets redirected, confirmed a logged-in
  *customer* gets bounced (both the page and the API return the expected
  redirect/401), logged in as admin, updated a real order's status through
  the UI's API call, and confirmed the change actually persisted in SQLite
  by querying the database directly afterward.

Still admin-panel scope, not done: product management + Cloudinary upload,
blog management, store management. The sidebar has grayed-out placeholder
links for these so it's clear they're coming, not silently missing.

## What this session added

The zip this was built from was missing its entire foundation layer even though
the project plan marked it "done" — `lib/db`, `lib/auth`, `lib/data`, `lib/currency`,
`context`, `types`, all of `components/ui|layout|shop`, the root `layout.tsx`, and
`globals.css` were all empty or absent, so nothing compiled. That's rebuilt here,
matching the exact contracts the existing page/component code already assumed
(same CSS variables, same function signatures, same prop shapes) rather than
introducing a divergent API.

Also fixed, since they were real bugs, not just missing scaffolding:
- **Checkout race condition** — stock check and decrement now happen inside a single
  DB transaction with a conditional `WHERE stock >= quantity` update, so two
  concurrent orders on the last item can't both succeed and oversell.
- **Loyalty points** — now an atomic `SET loyalty_points = loyalty_points + N` in SQL
  instead of reading a possibly-stale count off the session object.
- **Unhandled JSON parse errors** — `register`, `checkout`, and `wishlist` now return
  a clean 400 instead of an unhandled 500 if the request body isn't valid JSON.
- **Search endpoint NaN** — a non-numeric `?limit=` no longer produces `NaN` and
  silently misbehaves; it falls back to the default.
- **Referral code collisions** — register now retries on the rare random collision
  instead of throwing an unhandled 500.
- **Basic rate limiting** — added to `/api/auth/register` and `/api/checkout`
  (in-memory, single-instance; swap for a Redis-backed limiter before scaling to
  multiple server instances).
- **`/login` prerender crash** — `useSearchParams()` wasn't wrapped in `<Suspense>`,
  which fails Next's static export for that route. Fixed.

## What was verified (not just "the build is green")

Ran the actual production server and hit the real endpoints:
- Registration, including the malformed-JSON guard (400, not 500)
- Login via NextAuth credentials, session returns the right shape (`id`, `role`,
  `loyaltyPoints`, etc.)
- Search with a garbage `limit` param — no crash, sane fallback
- Guest checkout — order created, total/shipping/points math correct
- Authenticated checkout — `userId` attached correctly, loyalty points incremented
  atomically and confirmed directly in the DB (not just the API response)
- Checkout against insufficient stock — clean 409, and confirmed stock was **not**
  partially decremented (transaction rolled back correctly)
- Wishlist add while authenticated, and a clean 401 when not

## Phase 6 — Admin panel (completed)

Full CRUD for all content types, all admin-only with double auth guard (proxy + layout + API route each independently check `role === 'admin'`).

- **Products** (`/admin/products`) — list, create, edit, delete. Image upload via Cloudinary unsigned upload (set `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_UPLOAD_PRESET`). Falls back to plain URL input when Cloudinary is not configured.
- **Blog** (`/admin/blog`) — list, create, edit, delete. Content field accepts HTML.
- **Stores** (`/admin/stores`) — list, create, edit, delete. Changes immediately reflected on `/store-locator` and the footer.

## Phase 7 — Polish & handoff (completed)

- **Sitemap** — `/sitemap.xml` auto-generated by `src/app/sitemap.ts`. Includes all static pages, every product slug, every blog slug. Priorities: home=1.0, products/shop=0.9, blog=0.8.
- **Robots** — `/robots.txt` via `src/app/robots.ts`. Blocks `/admin`, `/api/`, `/checkout`, `/account`, `/login`, `/register`.
- **Favicon** — `src/app/icon.tsx` + `src/app/apple-icon.tsx` generate FM-monogram icons via Next.js `ImageResponse`. No external files needed.
- **Analytics** — `src/components/layout/Analytics.tsx` conditionally injects GA4 and Meta Pixel `<Script>` tags. Set env vars to activate:
  ```
  NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
  NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXX
  ```
- **SEO metadata** — root layout has full `openGraph`, `twitter`, `robots`, `metadataBase`. Per-page titles already on all public routes.

## Still open

- **Cloudinary upload preset** — create an unsigned upload preset named `fami_products` in your Cloudinary dashboard (or set `CLOUDINARY_UPLOAD_PRESET` env var to your chosen preset name). Without this, the admin product form falls back to a plain URL text input.
- **Brand fonts** — drop `.woff2` files into `public/fonts/` (see `public/fonts/README.md`). Site degrades to system serif/sans-serif until then.
- **Hosting/domain** — not yet decided. SQLite works for a single server; migrate to Postgres before multi-instance deployment.
- **Payment gateway** — checkout supports COD, WhatsApp, bKash, Nagad (UI only). Wire SSLCommerz or similar for real card/mobile payments.

## Known non-blocking items

- Linting is now actually configured and passing (`npm run lint` — 0 errors,
  0 warnings). It wasn't wired up correctly earlier in this project's history:
  eslint was listed as a dependency but had no working flat-config file.
- `npm audit`: the one **high**-severity finding (SQL injection in
  `drizzle-orm` <0.45.2, via improperly escaped identifiers) is fixed —
  bumped to `^0.45.2`. One **moderate** finding remains
  (`esbuild`, via `drizzle-kit`'s dev-time bundler) — this only affects
  `drizzle-kit`'s local dev tooling (e.g. `db:studio`), not the running app,
  and the only available fix path downgrades `drizzle-kit` in a way that's
  incompatible with the patched `drizzle-orm`. Left as-is; re-check when
  `drizzle-kit` ships a non-`rc` release with the fix.
- Rate limiting is in-memory and per-process; fine for a single Node instance,
  not for a multi-instance/serverless deployment.
