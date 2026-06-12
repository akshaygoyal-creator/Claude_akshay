# 📲 App Store Distribution Guide — CatalogApp

This guide takes CatalogApp from this repo to the **Google Play Store** and **Apple App Store**, starting tomorrow.

> ⚠️ **Set expectations on timing.** You can *start submission* tomorrow, but the stores control approval:
>
> | Step | Typical time |
> |---|---|
> | Google Play developer account verification | 1–3 days (one-time, $25) |
> | Apple Developer Program enrollment | 1–2 days (one-time, $99/yr) |
> | Google Play first-app review | 1–7 days |
> | Apple App Store review | 1–3 days |
>
> Also note the PRD (§9) scoped Phase 1 as **web-first** with native apps out of scope — this guide wraps the web app so you can be in stores without building native code.

## Step 0 — Deploy the web app first (today/tomorrow)

The store apps are wrappers around your **deployed** web app, so deploy first:

1. Deploy to Vercel (recommended per PRD): `npx vercel` from `catalogapp/`, or any Node host (`npm run build && npm start`).
   - For production swap SQLite for Postgres/Supabase (see README → Production hardening).
2. Set env vars on the host: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_BASE_URL=https://<your-domain>`.
3. Point your domain (e.g. `catalogapp.in`) at the deployment, with HTTPS (automatic on Vercel).

## Path A — Google Play via Trusted Web Activity (fastest, recommended)

A TWA publishes your PWA as a Play Store app with no app code to maintain.

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://<your-domain>/manifest.webmanifest
bubblewrap build        # produces app-release-signed.apk + .aab
```

Then in [Play Console](https://play.google.com/console) ($25 one-time):
1. Create app → upload the `.aab` to **Production** (or **Internal testing** first — instant, no review).
2. Fill the store listing: title (max 30 chars), short description (80), full description (4000), screenshots (min 2, 16:9 or 9:16), 512×512 icon, 1024×500 feature graphic.
3. Complete Data safety + content rating questionnaires, set countries (India first), submit for review.

Notes:
- A `manifest.webmanifest` and service worker make the web app installable; `public/manifest.webmanifest` is included in this repo.
- Host the `assetlinks.json` Bubblewrap generates at `https://<your-domain>/.well-known/assetlinks.json` so the app opens full-screen without the browser bar.

## Path B — iOS App Store via Capacitor

Apple has no TWA equivalent; use the included Capacitor wrapper (`capacitor.config.json` — update `server.url` to your domain):

```bash
cd catalogapp
npm i @capacitor/core @capacitor/cli @capacitor/ios
npx cap add ios
npx cap open ios        # requires a Mac with Xcode
```

In Xcode: set the bundle ID (`in.catalogapp.seller`), signing team, app icons, then **Product → Archive → Distribute** to App Store Connect.

In [App Store Connect](https://appstoreconnect.apple.com) ($99/yr):
1. Create the app record, upload the build from Xcode.
2. Store listing: name, subtitle, description, keywords, screenshots for 6.7" and 5.5" iPhones, privacy policy URL, App Privacy questionnaire.
3. Submit for review.

⚠️ **Apple Guideline 4.2:** pure website wrappers get rejected. Mitigate before submitting by adding at least camera-based photo capture for uploads (Capacitor Camera plugin) and push notifications — or launch Android tomorrow and give iOS a few extra days.

## Path C — Android via Capacitor (if you want one codebase for both wrappers)

```bash
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
cd android && ./gradlew bundleRelease   # sign with your keystore, upload .aab
```

## Pre-submission checklist (both stores)

- [ ] Privacy policy URL live (required by both stores) — covers phone numbers, product photos, analytics
- [ ] Support email & contact page
- [ ] App icon 512×512 (Play) / 1024×1024 (Apple)
- [ ] Screenshots from a real device (onboarding, AI upload, storefront, share screen)
- [ ] Demo OTP replaced with a real SMS gateway (MSG91 / Twilio) — reviewers will test sign-in; provide a demo account in the review notes
- [ ] Production DB + image storage (Supabase + R2/S3 per PRD §5.1)

## Suggested timeline from tomorrow

| Day | Action |
|---|---|
| Day 1 | Deploy web app, buy domain, register Play + Apple developer accounts, prepare store assets |
| Day 2 | Bubblewrap build → Play **Internal testing** track (instant install link for your team) |
| Day 3 | Submit Play production + start Capacitor iOS build |
| Day 4–7 | Address review feedback; Play approval typically lands here |
| Week 2 | iOS approval after Guideline 4.2 mitigation |
