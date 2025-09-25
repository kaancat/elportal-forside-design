# DinElPortal — Web App & Energy APIs

DinElPortal is the Next.js 15 App Router site that powers https://dinelportal.dk. It renders Sanity-managed marketing content, delivers realtime energy tooling, exposes public APIs, and serves the tracking script partners embed on their sites.

## Overview
- Content for all marketing pages lives in the Sanity Studio (`sanityelpriscms`) and is fetched server-side at render time.
- Energy, tariff, CO₂, and provider data flows in through `/app/api/**` route handlers with strong caching and rate limiting.
- Partner tracking, attribution, and admin tooling now run directly inside the Next.js runtime; the legacy Vite SPA only survives as a fallback rewrite while remaining routes are migrated.

## Architecture at a Glance
- Next.js 15 App Router with SSR/ISR (`app/page.tsx`, `app/[slug]/page.tsx`) governed by feature flags in `middleware.ts`.
- Sanity project `yxesi03x` supplies `page`, `siteSettings`, and block content via `src/server/sanity.ts` projections.
- External data providers: EnergiDataService, Eloverblik, Dataforsyningen, Green Power Denmark, and Google Search Console integrate through dedicated service layers in `src/services/` and `src/server/`.
- Distributed caching, queues, and session storage use Vercel KV with in-memory fallbacks (`src/server/api-helpers.ts`, `src/server/session-helpers.ts`).
- Partner tracking script is compiled in `public/tracking/universal-simple.js` and injected by `app/api/tracking/universal.js/route.ts`.
- Deployed on Vercel; `main` → production, preview deploys mirror the same runtime.

## Core Tech
- Next.js 15, React 18, TypeScript, App Router
- Tailwind CSS + shadcn/ui components (`tailwind.config.ts`, `components.json`)
- TanStack Query for client data hydration (`app/(marketing)/ClientLayout.tsx`)
- Zod validation for API inputs (`src/server/api-validators.ts`)
- Vercel KV / Upstash Redis, jose JWT sessions, Playwright tests, `tsx`-driven scripts

## Key Capabilities
- **Content-driven pages**: Sanity `page` documents feed unified renderers (`src/components/UnifiedContentBlocks.tsx`), including JSON-LD, breadcrumbs, and SSR caching.
- **Energy & grid data APIs**: `/api/electricity-prices`, `/api/energy-forecast`, `/api/co2-emissions`, `/api/pricelists`, `/api/tariffs`, `/api/consumption-map`, `/api/monthly-production` expose enriched datasets with queueing, retries, and KV-backed caching.
- **Eloverblik sessions**: `/api/auth/**` and `/api/eloverblik` manage OAuth, JWT sessions (`src/server/session-helpers.ts`), and secure customer consumption retrieval.
- **Partner tracking & attribution**: `/api/tracking/**` issues scripts, pixels, logging, config management, and GA4 forwarding with CSP-safe headers and domain whitelists.
- **Admin & SEO tooling**: `/api/admin/**`, `/api/seo/**`, `/api/sanity/**`, and `scripts/` support navigation integrity, Search Console ops, sitemap generation, and structured debugging.
- **Operational visibility**: `/api/health` reports dependency status, cache fill, and migration progress; `src/components/PerformanceMonitor.tsx` adds client vitals instrumentation.

## Repository Layout
- `app/` — App Router routes, API handlers, middleware-controlled SSR/SPA split.
- `src/components/`, `src/styles/`, `src/utils/` — UI blocks, shared styling, helpers.
- `src/services/` — External data integrations (price lists, postal codes, Sanity mutations).
- `src/server/` — Server-only helpers (Sanity client, caching, sessions, CSRF, rate limiting).
- `scripts/` — Operational tooling (`generate-sitemap`, `check-navigation-health`, etc.).
- `docs/` — Canonical references for tracking, security, calculator logic.
- `tests/` — Playwright regression/spec files for hydration and summary checks.
- `dev_log.md` — Running changelog of recent migrations and verification tasks.

## Local Development
1. Use Node 18.18+ and npm (lockfile managed with npm 10).
2. Copy `.env.example` (or author a new `.env.local`) with the variables listed below.
3. Install dependencies: `npm install`.
4. Start the dev server: `npm run dev`.
5. Optional health checks:
   - Lint: `npm run lint`
   - Types: `npm run type-check`
   - Navigation sanity: `npm run navigation:health`
   - Playwright (headed): `npx playwright test`

The app defaults to SSR; set `NEXT_PUBLIC_PHASE2_SSR=false` if you need the legacy SPA fallback during troubleshooting.

## Environment Variables
Required for rendering content and sessions:
- `NEXT_PUBLIC_SANITY_PROJECT_ID` — defaults to `yxesi03x`; override for forks.
- `NEXT_PUBLIC_SANITY_DATASET` — usually `production`.
- `NEXT_PUBLIC_SANITY_API_VERSION` — GROQ API date version (e.g. `2025-01-01`).
- `SANITY_API_TOKEN` — server token for Sanity mutations and preview.
- `SITE_URL` — canonical base URL (used in metadata and JSON-LD).
- `ELPORTAL_SIGNING_KEY` — ≥32 byte secret for session JWT signing (base64 or plain text).

Caching & external integrations:
- `KV_REST_API_URL` / `KV_REST_API_TOKEN` — Upstash/Vercel KV endpoint for distributed cache and sessions.
- `ELOVERBLIK_API_TOKEN` & `ELOVERBLIK_THIRDPARTY_REFRESH_TOKEN` — refresh tokens for third-party access.
- `ELOVERBLIK_THIRD_PARTY_ID` — defaults to DinElPortal’s registered ID but override if needed.
- `GOOGLE_SERVICE_ACCOUNT_JSON_B64` — base64-encoded GSC service account for `/api/seo/search-console/**`.
- `GOOGLE_PSI_API_KEY` — optional PageSpeed Insights key for `/api/seo/pagespeed`.
- `SANITY_WEBHOOK_SECRET` — shared secret for `/api/revalidate`; also used by `deploy-webhook.sh`.

Admin & security:
- `ADMIN_AUTH_TOKEN` — shared secret for `/api/tracking/config` and admin UI auth.
- `ADMIN_SECRET` — required header for admin+SEO endpoints (GSC audit, debug panels).
- `CONVERSION_WEBHOOK_SECRET` — optional; validates inbound conversion pings.

Analytics & consent:
- `GA4_MEASUREMENT_ID` and `GA4_API_SECRET` — server-side event forwarding for conversions.
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID` — client analytics instrumentation.
- `NEXT_PUBLIC_COOKIEBOT_ID` — Cookiebot script injection (omit to disable locally).
- `NEXT_PUBLIC_FB_PIXEL_ID` — optional Facebook pixel integration.

Feature flags & diagnostics:
- `NEXT_PUBLIC_PHASE2_SSR` — defaults to `true`; toggles SSR homepage + migrated pages.
- `PHASE3_DYNAMIC_ENABLED` — enables middleware rewrites for not-yet-listed slugs.
- `NEXT_PUBLIC_BASELINE_MODE` — strips heavy blocks for performance comparisons in dev.

Missing KV keys fall back to in-memory caches during local development; production requires KV to avoid rate limits.

## Sanity Studio (`sanityelpriscms`)
- Located at `../sanityelpriscms`; run `npm install && npm run dev` to open the Studio.
- Environment:
  - `SANITY_STUDIO_PROJECT_ID=yxesi03x`
  - `SANITY_STUDIO_DATASET=production`
  - `SANITY_API_TOKEN` for server-side scripts and document actions.
- Key schemas: `page`, `siteSettings`, `provider`, `providerList`, `priceCalculator`, multiple chart/visualization blocks.
- Custom desk structure locks the singleton `siteSettings`; protected delete prevents removing linked pages.

## API Surface
- Energy & grid data: `/api/electricity-prices`, `/api/energy-forecast`, `/api/monthly-production`, `/api/declaration-production`, `/api/co2-emissions`, `/api/consumption-map`, `/api/tariffs`, `/api/pricelists`, `/api/private-industry-consumption`.
- Auth & sessions: `/api/auth/session`, `/api/auth/authorize`, `/api/auth/callback`, `/api/auth/session-secure`, `/api/eloverblik`.
- Content helpers: `/api/site-settings`, `/api/sanity/create-page`, `/api/sanity/update-content`, `/api/revalidate`.
- Tracking & partner ops: `/api/tracking/universal.js`, `/api/tracking/log`, `/api/tracking/pixel`, `/api/tracking/config/{partnerId}`, `/api/tracking/verify`, `/api/tracking/create-test-partner`.
- SEO & admin: `/api/seo/search-console/**`, `/api/seo/pagespeed`, `/api/admin/auth`, `/api/admin/debug`, `/api/health`.

All route handlers live under `app/api/**` and share helpers from `src/server/api-helpers.ts`, `src/server/api-validators.ts`, and `src/server/rate-limit-helpers.ts`.

## Partner Tracking
- Embed the universal script served by `/api/tracking/universal.js` (backed by `public/tracking/universal-simple.js`).
- Mode selection via query params (`partner_id`, `match_mode`, `conversionPatterns`, `auto_conversion=false`, etc.).
- Logging and pixel endpoints enforce domain whitelists, rate limits, CSRF tokens, and GA4 forwarding.
- Full reference: `docs/tracking/REFERENCE.md` and `docs/tracking/GA4-ADS.md`.

## Tooling & Scripts
- `scripts/generate-sitemap.ts` — regenerates `public/sitemap.xml`.
- `scripts/check-navigation-health.ts` — validates Sanity navigation consistency (used by `npm run navigation:health`).
- `scripts/force-navigation-refresh.ts` — clears KV caches for nav/site settings.
- `scripts/test-api-parity.ts` — compares Sanity vs API responses for regression detection.
- Additional migration helpers recorded in `dev_log.md`; obsolete scripts are documented in `scripts/ACTIVE_SCRIPTS_DOCUMENTATION.md`.

## Testing
- Playwright specs live in `tests/` (`phase5-hydration.spec.ts`, `phase5-summary.spec.ts`).
- Run headless: `npx playwright test --project=chromium`.
- Update snapshots/captures per spec instructions before committing UI changes.

## Deployment & Operations
- Hosted on Vercel; main branch deploys to production. Preview environments inherit the same runtime but may rely on fallback keys (see `dev_log.md` for caveats).
- Use `deploy-webhook.sh` to sync `SANITY_WEBHOOK_SECRET` across Vercel environments.
- `/api/health` aggregates dependency status (KV, caches, locks) and migration progress—monitor this endpoint for uptime checks.
- CSP, referrer policy, and permissions are enforced via `vercel.json`; update headers there when introducing new third-party resources.

## Additional Documentation
- `docs/SECURITY.md` — threat model, env expectations, rate limits, CSP guidance.
- `docs/tracking/REFERENCE.md` — partner integration guide.
- `docs/ELECTRICITY-CALCULATOR-LOGIC.md` — pricing formulas and fee breakdowns.
- `dev_log.md` — recent migrations, verification tasks, and pending follow-ups.

Keep this README as the source of truth; update it alongside significant architectural or operational changes.
