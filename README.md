# DinElportal — Source of Truth

This repo contains the DinElportal Next.js app and the partner tracking stack (script + APIs + partner tools).

Use this README as the single source of truth. All other docs are indexed from here. Legacy docs live under `docs/archive/`.

## Key URLs

- App (prod): https://www.dinelportal.dk/
- Partner Platform (self‑serve setup + tests): `/partner-platform.html`
- Health: `/api/health`

## Partner Tracking — TL;DR

Partners paste one script tag in `<head>` on all pages. Two modes:

- Statisk tak‑side (preferred):
  `<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_ID&thank_you=/tak&match_mode=exact" async></script>`
- Dynamisk (ingen tak‑side):
  `<script src="https://www.dinelportal.dk/api/tracking/universal.js?partner_id=YOUR_ID&auto_conversion=false&url_contains=[\"status=success\"]" async></script>`

Test: Partner Platform → “Åbn test‑URL” → gennemfør flow → “Tjek Live Status”.

Complete reference: `docs/tracking/REFERENCE.md`.

## Analytics & Ads

- GA4: client‑side `partner_click` (imported to Google Ads).  
- GA4: server‑side `partner_conversion` via Measurement Protocol (analytics).

Details: `docs/tracking/GA4-ADS.md`.

## Security Decisions

- Domain whitelist enforced on both `/api/tracking/log` and `/api/tracking/pixel` (referer).
- Rate limiting per partner/IP. Server dedupe for conversions by `click_id`.
- No PII; 90‑day attribution window.

See `docs/SECURITY.md`.

## Dev Quick Start

```bash
npm i
npm run dev
```

Required env (production values live in Vercel):

- KV: `KV_REST_API_URL`, `KV_REST_API_TOKEN`
- GA4: `GA4_MEASUREMENT_ID`, `GA4_API_SECRET`
- Admin: `ADMIN_AUTH_TOKEN`
- Sanity (app + tools): `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`
- Sanity (server writes only): `SANITY_API_TOKEN`

## Deploy

Deployed on Vercel (main → production). Updating env vars requires a redeploy.

## Operations

Whitelist or create partner config (admin only):

```bash
curl -X PUT https://www.dinelportal.dk/api/tracking/config/{partner_id} \
  -H "Content-Type: application/json" -H "x-admin-auth: $ADMIN_AUTH_TOKEN" \
  -d '{"domain_whitelist":["example.dk","www.example.dk","*.example.dk"]}'
```

## Scripts (active)

- `scripts/generate-sitemap.ts`
- `scripts/check-navigation-health.ts`
- `scripts/force-navigation-refresh.ts`
- Optional: `scripts/test-api-parity.ts`

More info: `scripts/ACTIVE_SCRIPTS_DOCUMENTATION.md`.

## Documentation Index

- Tracking reference: `docs/tracking/REFERENCE.md`
- GA4 & Ads: `docs/tracking/GA4-ADS.md`
- Security: `docs/SECURITY.md`
- Calculator logic (business): `docs/ELECTRICITY-CALCULATOR-LOGIC.md`

Legacy docs: refer to git history (we removed old/unused guides to keep the repo lean).
