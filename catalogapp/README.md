# 📦 CatalogApp — WhatsApp Catalog SaaS for SMBs

MVP implementation of the CatalogApp PRD v1.0: sellers upload product photos, AI (Claude vision) extracts names, bilingual descriptions (English + Hindi), suggested prices and tags, and the result is a shareable mobile-first mini storefront with WhatsApp ordering.

## Quick start

```bash
cd catalogapp
npm install
cp .env.example .env        # add ANTHROPIC_API_KEY for real AI extraction
npm run dev                 # http://localhost:3000
```

Sign up with any phone number — **demo OTP is `123456`** (no SMS gateway wired in dev). Without an `ANTHROPIC_API_KEY`, photo upload still works but fields must be filled manually (demo mode).

## What's implemented (PRD §6 MVP scope)

| Feature | Status |
|---|---|
| Phone OTP signup + business profile (P0) | ✅ (demo OTP; plug an SMS gateway for prod) |
| AI photo bulk upload, up to 20, parallel (P0) | ✅ client-side downscale → `/api/extract` |
| AI extraction: name, desc EN+HI, price, category, tags (P0) | ✅ Claude vision via structured JSON output |
| Manual product entry form (P0) | ✅ |
| CSV bulk upload (P1) | ✅ |
| Product edit / delete / duplicate / pin / out-of-stock (P0) | ✅ |
| Grid/list, search, filter, sort dashboard (P0) | ✅ |
| Auto-generated storefront `/store/{slug}` (P0) | ✅ SSR, mobile-first, EN/हिं toggle, accent colors |
| WhatsApp share + pre-filled messages (P0) | ✅ catalog link + multi-product message generator |
| "Order on WhatsApp" per product (P0) | ✅ pre-filled `wa.me` message |
| QR code generator 1000×1000 PNG (P1) | ✅ `/api/qr` |
| Basic analytics: views, taps, shares, top products (P1) | ✅ |
| Free plan limit (10 products) | ✅ enforced server-side |
| Collections, payments, custom domain | ⏳ Phase 2/3 per PRD |

## Tech stack

- **Next.js 14** (App Router) — UI + API routes in one deployable app
- **SQLite** (better-sqlite3) for zero-setup dev; swap to Postgres/Supabase for production (PRD §5.1)
- **Claude vision** via `@anthropic-ai/sdk` — model `claude-sonnet-4-6` (the PRD's `claude-sonnet-4-20250514` is deprecated, retiring 2026-06-15; override with `CATALOG_AI_MODEL`)
- **Tailwind CSS**, `qrcode` for QR generation

## Project layout

```
catalogapp/
├── app/
│   ├── page.js                  # landing page
│   ├── onboarding/              # phone OTP → business profile
│   ├── dashboard/               # products, upload (AI/manual/CSV), share, analytics, settings
│   ├── store/[slug]/            # public storefront (SSR + client interactivity)
│   └── api/                     # auth, seller, products, extract (AI), track, analytics, qr
├── lib/                         # db (SQLite schema), ai (Claude extraction), session
├── capacitor.config.json        # iOS/Android wrapper config
└── DISTRIBUTION.md              # 👉 store submission guide (start here for Play/App Store)
```

## Store distribution

See **[DISTRIBUTION.md](./DISTRIBUTION.md)** — deploy the web app, then Google Play via Trusted Web Activity (Bubblewrap) and iOS via the included Capacitor config, with the submission checklist and a day-by-day timeline.

## Production hardening before launch

1. **SMS OTP**: replace the demo code in `app/api/auth/send-otp/route.js` with MSG91/Twilio.
2. **Database**: move to Supabase Postgres; the schema in `lib/db.js` maps 1:1.
3. **Images**: store on Cloudflare R2/S3 instead of data URLs in the DB.
4. **Payments**: Razorpay subscriptions for the Starter/Growth/Pro plans.
5. **Rate limiting**: per-plan AI extraction quotas (PRD open question §10).
