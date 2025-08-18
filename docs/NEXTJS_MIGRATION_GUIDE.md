# 🚀 DinElportal Next.js Migration Guide

Last Updated: August 18, 2025  
Status: Ready for Implementation  
Purpose: Definitive guide for migrating DinElportal from Vite SPA to Next.js SSR/ISR with robust SEO.

---

## 🛡️ BACKUP INFRASTRUCTURE STATUS - MIGRATION SAFE ✅

**Created: August 18, 2025**  
**Migration Branch:** `migration/nextjs-app-router` (Active)  
**Rollback Point:** `backup/pre-nextjs-migration-2024-08-18`

### 📦 Repository Backup Status
- ✅ **Frontend Repo**: Backup tag `backup/pre-nextjs-migration-2024-08-18` created and pushed
- ✅ **Backend Repo**: Backup tag `backup/pre-migration-state-2024-08-18` created and pushed  
- ✅ **Migration Branches**: Working branches created for both projects
  - Frontend: `migration/nextjs-app-router`
  - Backend: `migration/webhook-updates` (minimal changes only)

### 💾 Data Backup Status  
- ✅ **Sanity Dataset**: Complete export with assets (48.3MB) → `backups/pre-migration/sanity-backup-20250818-160439.tar.gz`
- ✅ **Environment Variables**: All `.env*` files backed up for both projects
- ✅ **Vercel Configuration**: Environment variables exported to `vercel-env-backup-20250818.txt`
- ✅ **Asset Backup**: All critical files preserved in Git repositories

### 🚨 Emergency Rollback Ready
- ✅ **Rollback Script**: `scripts/emergency-rollback.sh` - Execute for immediate rollback to Vite SPA
- ✅ **Validation Script**: `scripts/validate-migration-state.sh` - Verify backup integrity
- ✅ **Blue-Green Ready**: Vercel aliases prepared for instant traffic switching

### 🔄 Instant Rollback Procedure
```bash
# Emergency rollback (restores Vite SPA)
./scripts/emergency-rollback.sh

# Then switch Vercel traffic
vercel alias set spa-backup.elportal.dk elportal.dk
vercel alias set spa-backup.elportal.dk www.elportal.dk

# Restore Sanity if needed
cd /Users/kaancatalkaya/Desktop/projects/sanityelpriscms  
npx @sanity/cli dataset import backups/pre-migration/sanity-backup-*.tar.gz production --replace
```

**🎯 MIGRATION IS NOW SAFEGUARDED - PROCEED WITH CONFIDENCE**

---

## 📋 Table of Contents

1. Executive Summary
2. Authoritative Step‑By‑Step Migration Plan
3. Edge Cases & Guardrails (Authoritative)
4. Architecture (Current → Target)
5. Sanity Integration Map
6. SEO Migration
7. Routing & Data Fetching
8. Component Compatibility
9. API Layer Migration
10. Revalidation & Caching
11. Performance & Accessibility
12. Security & Environment
13. Vercel & Deployment
14. Testing Strategy
15. Risks & Mitigations
16. Rollback Plan
17. Implementation Checklist

---

## 🎯 Executive Summary

Current SPA uses client-side meta injection; crawlers receive empty HTML, causing poor indexation. Next.js SSR with the Metadata API fixes this while preserving functionality. Sanity schemas confirm flat SEO fields and `contentBlocks`. Most components are SSR-safe or can be client-marked. API logic ports 1:1 with wrappers.

Key Points
- Components: ~95% compatible; charts require client-only.
- API: KV caching, dedupe, retries unchanged; wrap with NextResponse.
- Sanity: Pages use `contentBlocks`, `seoMetaTitle`, `seoMetaDescription`, `seoKeywords`, optional `ogImage`, `noIndex`, homepage via `isHomepage`.
- SEO: Use `generateMetadata`, canonical via `metadataBase`, structured data at SSR.

---

## ✅ Authoritative Step‑By‑Step Migration Plan

This plan is derived from all detailed sections below. Each phase lists concrete deliverables and a verification gate before proceeding.

Phase 0 — Safety Preflight (Day 0)
- Deliverables: Backup tags (FE/BE), Sanity dataset export (+assets), env backups, Vercel alias setup (blue/green), health monitoring scripts installed.
- Verify: Run emergency rollback script dry-run; confirm SPA backup alias resolves; validate Sanity export integrity.

Phase 1 — Foundation & Config (Day 1)
- Deliverables: `app/` scaffold (`layout.tsx`, `page.tsx`, `[slug]/page.tsx`, error/not-found), `next.config.js` with `images.remotePatterns`, `next/font` configured, env mapping (`VITE_*` → `NEXT_PUBLIC_*`), `SITE_URL` + `metadataBase`.
- Verify: Dev server boots; images render from Sanity/Unsplash; fonts load without CLS.

Phase 2 — Sanity SSR Baseline (Day 1–2)
- Deliverables: Server GROQ queries for homepage (`isHomepage`), slug pages, and `siteSettings`; tag queries (`page`, `siteSettings`, `provider`); render Navigation/Footer and static content blocks server‑side.
- Verify: With JS disabled, homepage and a slug page show headings/nav/footer/server content.

Phase 3 — SEO & Metadata (Day 2)
- Deliverables: `generateMetadata` for homepage/slug routes mapping SEO fields; JSON‑LD (Organization, Breadcrumbs, FAQ/Article as applicable); `app/robots.ts`, `app/sitemap.ts` excluding `noIndex`; canonical normalization via `metadataBase`.
- Verify: View page source to confirm title/description/OG/Twitter/canonical/JSON‑LD; robots and sitemap endpoints respond correctly.

Phase 4 — API Routes Port (Day 2–3)
- Deliverables: Port all `/api/*` to `app/api/**/route.ts` with `NextResponse.json`, preserve KV/in‑memory cache/dedupe/headers; set `maxDuration`; ensure Node runtime where KV/Node APIs used.
- Verify: Parity tests for representative endpoints (prices, forecast, CO2, monthly/declaration, consumption, eloverblik, tracking/admin/auth, sanity create/update); headers show `s-maxage`; KV markers present.

Phase 5 — Client‑Only Components (Day 3)
- Deliverables: Mark Recharts/interactive components `'use client'` or `dynamic(...,{ ssr:false })`; keep SSR shells/text for SEO; maintain skeletons.
- Verify: No hydration errors; charts load after interaction/idle; SSR HTML still indexable.

Phase 6 — Revalidation & Webhooks (Day 3)
- Deliverables: `/api/revalidate` with HMAC validation; call `revalidateTag`/`revalidatePath` for `page`, `siteSettings`, `provider`; update Studio webhooks.
- Verify: Editing a page/settings/provider in Studio revalidates the correct route and tags.

Phase 7 — Analytics & Consent (Day 3–4)
- Deliverables: Move Cookiebot, GA4, FB Pixel to `app/layout.tsx` via `next/script` honoring consent; re‑init on consent change if needed.
- Verify: Tags fire only after consent; no layout shift from script injections.

Phase 8 — Performance Pass (Day 4)
- Deliverables: Dynamic imports for heavy modules, confirm `next/font` usage, image formats (AVIF/WebP), maintain loading skeletons.
- Verify: Lighthouse: LCP < 2.5s, CLS < 0.1, INP < 200ms on key pages (staging).

Phase 9 — Tests & Quality Gates (Day 4–5)
- Deliverables: Playwright SSR checks (HTML + metadata), API tests for headers/caching, E2E basic nav, optional vitals harness.
- Verify: Test suite passes locally and on CI; staging smoke checks green.

Phase 10 — Deploy & Monitor (Day 5)
- Deliverables: Deploy to staging alias; run health monitoring; if green, flip production alias; keep SPA fallback alias hot.
- Verify: Post‑deploy checks green (SSR, metadata, APIs, vitals); rollback runbook validated.

See also: Risks & Mitigations, Rollback Plan, Revalidation & Caching, API Layer Migration, Testing Strategy below.

---

## 🧭 Edge Cases & Guardrails (Authoritative)

- Charts SSR: All Recharts visualizations are client‑only or `dynamic({ ssr:false })`; keep SSR shells for indexability.
- Homepage uniqueness: If multiple `isHomepage`, log warning, select first; optional Studio validation to block >1.
- Canonical/trailing slash: Normalize via `metadataBase`; add redirects to avoid duplicates.
- Image domains: `images.remotePatterns` must include `cdn.sanity.io` and `images.unsplash.com` before prod.
- KV/runtime: Use Node runtime for routes touching KV or Node APIs; avoid Edge unless verified compatible.
- Webhooks: Validate HMAC; revalidate by tag + path; include retry/error logging.
- Auth/Eloverblik: Keep secrets server‑only; confirm CORS/CSRF; never expose tokens to client/RSC.
- Rate limits: Preserve retry backoff, dedupe queues, and `s-maxage` headers for API stability.
- 404 behavior: Use `notFound()` on missing slugs to avoid empty SSR pages.
- Hardcoded domains: Remove; use `SITE_URL` + `metadataBase` for canonical and OG.
- Sitemap: Exclude `noIndex`; assign sensible priorities; ensure updatedAt mapping.

---

## 🏗️ Architecture (Current → Target)

Current (Vite SPA)
```
Client SPA (React Router) → Vercel Functions → Sanity CMS
           │                    │
           ▼                    ▼
       Empty HTML           Vercel KV
```

Target (Next.js App Router)
```
RSC + Client Islands → Next.js API Routes → Sanity CMS
         │                         │
         ▼                         ▼
   Pre-rendered HTML            Vercel KV
```

File Layout Migration
- From: `src/pages`, `src/components`, `src/services`, `api/*.ts`
- To: `app/`, `app/(routes)/`, `app/api/**/route.ts`, `components/`, `lib/`, `hooks/`, `types/`.

---

## 🔌 Sanity Integration Map

Schemas (verified in Studio):
- `page`: `title`, `slug`, `isHomepage`, `showReadingProgress`, SEO fields, `contentBlocks` (hero, heroWithCalculator, pageSection, providerList, charts, calculators, faqGroup, callToActionSection, energyTipsSection, consumptionMap, infoCards, dailyPriceTimeline, forbrugTracker, etc.).
- `siteSettings`: `headerLinks[]` (`link` or `megaMenu`), footer settings with link groups; images for logo and favicon.
- `link`: `linkType` ('internal' ref to page or external URL), resolved via GROQ `internalLink-> {"slug": slug.current, _type }`.
- `provider`: detailed pricing fields (markup/fees in øre/kWh, monthly subscription, flags like `isVindstoedProduct`, regional variations), metadata and legacy fields hidden.

SSR Queries
- Homepage: first page where `isHomepage == true`.
- Dynamic pages: by `slug.current`.
- Site settings: singleton by fixed id `siteSettings`.
- Providers: list for comparison blocks.

---

## 🔎 SEO Migration

Metadata (Next.js `generateMetadata`)
- Title/Description: from `seoMetaTitle`, `seoMetaDescription` with sensible fallbacks.
- Keywords: `seoKeywords`.
- Robots: set `index/follow` based on `noIndex`.
- Open Graph/Twitter: derive from `ogImage` via Sanity CDN (include width/height/alt).
- Canonical: use `metadataBase` + `alternates.canonical` computed from slug/homepage (normalize trailing slash, https).

Structured Data (SSR)
- Organization on all pages.
- BreadcrumbList for non-root pages (derive from URL segments or explicit breadcrumbs).
- FAQ schema if `faqGroup` present; Article for blog posts.

Robots & Sitemap
- `app/robots.ts` (or static fallback) mirroring current `public/robots.txt`.
- `app/sitemap.ts` replicates `generateSitemapData` behavior, excludes `noIndex`, sets priorities for key slugs.

Analytics & Consent
- Move Cookiebot, GA4, Facebook Pixel into `app/layout.tsx` with `next/script` strategies, honoring consent attributes.

Fonts & Images
- Use `next/font` (Inter/Geist) to minimize CLS.
- Configure `images.remotePatterns` for Sanity and Unsplash.

---

## 🧭 Routing & Data Fetching

Pages
- `app/page.tsx`: SSR homepage (by `isHomepage`).
- `app/[slug]/page.tsx`: SSR dynamic pages; `notFound()` for missing content.
- Static routes (e.g., `/energispareraad`, `/privatlivspolitik`, `/admin/dashboard`) as directories under `app/`.
- Error boundaries: `app/error.tsx`, `app/not-found.tsx`.

Data Fetching
- Server components for text/content-heavy blocks; client components for charts and interactions.
- React Query remains for client-side interactions; for SEO-critical content, fetch server-side and pass as props.
- Configure fetch cache and `revalidate` per route; use tag-based caching for Sanity queries.

---

## 🧩 Component Compatibility

Server-safe (SSR by default)
- ContentBlocks system, PageSection, ProviderList (prefer SSR with ranking), ValueProposition, FeatureList, FAQ/CTA/Video (embed), RichText, Navigation, Layout/Footer.

Client-only (mark `'use client'` or dynamic `ssr:false`)
- Recharts-based: LivePriceGraph, RenewableEnergyForecast, CO2EmissionsChart, MonthlyProductionChart, DeclarationProductionChart, RealPriceComparisonTable, DailyPriceTimeline.
- Interactive: Appliance calculator, ForbrugTracker, components depending on `window`.

Charts Pattern
```
'use client'
// import recharts components
// optional: export default dynamic(() => import('./Chart'), { ssr: false })
```

---

## 🔧 API Layer Migration

General
- Move each `api/*.ts` to `app/api/<name>/route.ts`.
- Wrap responses with `NextResponse.json(...)`.
- Preserve `export const dynamic = 'force-dynamic'` where used and set `export const maxDuration = <seconds>` to mirror `vercel.json`.
- Keep KV usage, in-memory caches, dedupe queues, and `s-maxage` headers.

Endpoints (representative)
- Electricity prices, CO2 emissions, energy forecast, monthly production, consumption map: 1:1 logic.
- Tracking (pixel/log), admin (auth/dashboard/debug), smithery, sanity create/update content, health: same with wrapper updates.

Runtime
- Use Node.js runtime for routes needing KV/Node APIs (avoid Edge when not necessary).

---

## 🔁 Revalidation & Caching

Sanity Webhooks → `/api/revalidate`
- Validate HMAC with `@sanity/webhook`.
- Parse payload: if page with slug, `revalidatePath('/' + slug)` and `revalidateTag('page')`.
- If `siteSettings` or `provider` change, `revalidateTag('siteSettings')` / `revalidateTag('provider')`.

Tag Strategy
- Tag page queries with `['page']`, site settings with `['siteSettings']`, providers with `['provider']` for targeted cache busting.

---

## ⚡ Performance & Accessibility

Streaming & RSC
- Server-render long-form content blocks for fast first contentful paint; hydrate client charts later.

Bundle & Scheduling
- Use dynamic imports for heavy client modules (charts) to reduce TTFB and improve LCP.

CLS/INP
- Switch to `next/font`. Maintain existing skeletons for loading states in client-only blocks.

Accessibility
- Ensure `ogImage` alt text set; propagate `alt` attributes via Sanity fields where used.

---

## 🔐 Security & Environment

Env Mapping
- `VITE_*` → `NEXT_PUBLIC_*` (Cookiebot, GA4, FB Pixel) for client exposure.
- Server-only: `SANITY_API_TOKEN`, `SANITY_WEBHOOK_SECRET` kept server-side.

Sanity Tokens
- Only in server routes for mutations; never in client or RSC.

Base URL
- Centralize `SITE_URL` and set `metadataBase` to avoid hardcoding.

---

## 🚀 Vercel & Deployment

Routing
- Remove SPA rewrites from `vercel.json`; Next handles routing.

Functions
- Use per-route `maxDuration`. Keep Node 18+.

Images
- Configure domains for Sanity and Unsplash in `next.config.js`.

Redirects
- Enforce trailing slash policy (recommend off) and add redirects to avoid duplicate content.

---

## 🧪 Testing Strategy

SSR Content
- Fetch HTML for `/` and key `/:slug` routes with Playwright; assert provider names, headings, hero text are in the HTML without JS.

Metadata
- Assert `<title>`, `<meta name="description">`, OG/Twitter tags, and canonical are present in SSR HTML.

API
- Exercise rate-limit retries; verify KV `X-Cache` markers and `s-maxage` headers.

Visual/Interaction
- Verify charts mount on client and do not throw during hydration.

---

## 🧨 Risks & Mitigations

Recharts SSR errors
- Mitigate with `'use client'` or dynamic `ssr:false` and isolate to client components.

Service Worker
- Icon cache SW not automatically included; integrate via Next PWA or custom registration.

Image Domain Config
- Missing `remotePatterns` causes prod errors; configure before release.

Hardcoded Domain
- Replace `https://elportal.dk` hardcodes with env + `metadataBase`.

Homepage Uniqueness
- Ensure only one `isHomepage`; guard queries and log if multiple found.

---

## 🔁 Rollback Plan

Blue/Green
- Deploy Next.js to a preview, compare SEO fetch results. Keep Vite SPA as fallback on a separate alias.

Quick Revert
- If critical regression, flip DNS/alias back to SPA deployment. No data migration needed; Sanity remains source of truth.

---

## 🔗 API → Component Map (Audit)

This section maps every API route to the components/pages that depend on it, including key params, caching, and migration notes.

- `/api/electricity-prices`
  - Used by: `DailyPriceTimeline`, `LivePriceGraphComponent`, `ProviderList` (spot price per hour)
  - Params: `region=DK1|DK2`, `date=YYYY-MM-DD`, optional `endDate`, alias `area`
  - Caching: In-memory (5m), Vercel KV (5m), `s-maxage=300`
  - Migration: Keep logic, wrap with `NextResponse`. Add `maxDuration`. Consider `revalidateTag('prices')` if needed.
  - SSR: For SEO-critical charts, render surrounding text server-side; keep chart client-only and fetch on mount.

- `/api/energy-forecast`
  - Used by: `RenewableEnergyForecast`
  - Params: `region=Danmark|DK1|DK2`, `date=YYYY-MM-DD`
  - Caching: KV+headers similar pattern
  - Migration: 1:1. Client-only chart fetch.

- `/api/co2-emissions`
  - Used by: `CO2EmissionsChart`
  - Params: `region=Danmark|DK1|DK2`, `date=YYYY-MM-DD`, `aggregation=hourly`
  - Caching: KV+headers
  - Migration: 1:1. Client-only chart fetch.

- `/api/declaration-production`
  - Used by: `DeclarationProductionChart`
  - Params: `region=Danmark|DK1|DK2`, `view=24h|7d|30d`
  - Caching: KV+headers
  - Migration: 1:1. Client-only chart fetch.

- `/api/declaration-gridmix`
  - Used by: `DeclarationGridmix`
  - Params: typically `region` and a `view` parameter
  - Migration: 1:1. Client-only chart fetch.

- `/api/monthly-production`
  - Used by: `MonthlyProductionChart`
  - Params: `region`, `month` (if applicable)
  - Migration: 1:1. Client-only chart fetch.

- `/api/consumption-map`
  - Used by: `ConsumptionMap`
  - Params: `consumerType=all|private|industry`, `aggregation=latest|...`, `view=24h|7d|30d`
  - Caching: KV+headers
  - Migration: 1:1. Client-only visualization; consider SSR prefetch + pass data as props if SEO for surrounding content is desired.

- `/api/pricelists`
  - Used by: pricing widgets if any; primarily provider data is from Sanity, but this may complement tariffs.
  - Migration: 1:1.

- `/api/eloverblik`
  - Used by: `eloverblik/ConnectEloverblik`, forbrug tracker components.
  - Security: Ensure server-side only secrets; keep Node runtime.
  - Migration: 1:1 with `NextResponse`.

- `/api/tracking/*` (pixel, log, verify, config)
  - Used by: tracking scripts and `public/tracking/*.js`
  - Migration: 1:1. Verify CORS and headers.

- `/api/admin/*`, `/api/auth/*`
  - Used by: `pages/admin/AdminDashboard` and auth flows.
  - Migration: 1:1, keep same semantics, ensure `maxDuration` where needed.

- `/api/sanity/create-page`, `/api/sanity/update-content`
  - Used by: programmatic content creation (AI toolchain).
  - Security: SANITY_API_TOKEN server-only. Maintain HMAC patterns if any.

Audit Notes
- Most chart components fetch on mount; that remains fine. For SSR, render headers/paragraphs server-side for indexing.
- Where React Query is used (e.g., `useNetworkTariff` + EnergiDataService), consider moving initial fetch server-side for SSR pages if you want to expose computed values in HTML (optional).

---

## 🧱 Component Migration Matrix (Detailed)

Pricing & Providers
- `ProviderList`
  - Data: Sanity `providerList.providers[]` (refs → expanded), spot price from `/api/electricity-prices`, network tariffs via `useNetworkTariff` (EnergiDataService direct from client).
  - SSR: Server-render the list shell and text; client computes dynamic prices after fetch, or server-compute if you prefetch APIs (optional; heavier).
  - Client-only: Keep as client for sliders, selectors, animations.
  - Edge cases: Missing provider refs, inactive products, regional overrides. Already sanitized. Preserve sorting: Vindstød first, then lowest monthly cost.

- `PriceCalculatorWidget` / `Calculator*` components
  - Data: Local computation + optional API lookups.
  - SSR: Not required; mark `'use client'` if interacting with browser APIs.
  - Edge cases: Input validation, fee toggles; no special SSR needs.

Electricity Prices & Forecasts (Charts)
- `DailyPriceTimeline`, `LivePriceGraphComponent`
  - Data: `/api/electricity-prices`
  - Client-only: `'use client'` or dynamic `ssr:false`.
  - SSR: Render headings/subtitles server-side for SEO.
  - Edge cases: Dates without data; display friendly messages already implemented.

- `RenewableEnergyForecast`
  - Data: `/api/energy-forecast`
  - Client-only: Yes. Same pattern as above.

CO₂ & Declarations (Charts)
- `CO2EmissionsChart`
  - Data: `/api/co2-emissions`
  - Client-only: Yes. SSR for surrounding content.

- `DeclarationProductionChart`, `DeclarationGridmix`
  - Data: `/api/declaration-production`, `/api/declaration-gridmix`
  - Client-only: Yes. SSR shell.

Production & Monthly (Charts)
- `MonthlyProductionChart`
  - Data: `/api/monthly-production`
  - Client-only: Yes.

Consumption Visualization
- `ConsumptionMap`
  - Data: `/api/consumption-map`
  - Client-only: `react-denmark-map` + D3 color scales; SSR shell only.
  - Edge cases: Municipality code/name mapping; already handled; keep mapping utilities identical.

Forbrug Tracker & Eloverblik
- `forbrugTracker/*`, `eloverblik/*`
  - Data: `/api/eloverblik` and related auth endpoints.
  - Client-only: Yes (OAuth flows, user state).
  - SSR: Provide static copy server-side; hydrate client features.

Static/Structured Blocks
- `ValuePropositionComponent`, `FeatureListComponent`, `InfoCardsSection`, `RichTextSectionComponent`, `CallToActionSectionComponent`, `VideoSectionComponent`, `HeroComponent`, `HeroSection`, `SimplePageSectionComponent`, `PageSectionComponent`, `StickyImageSection`, `PageSectionShowcase`
  - Data: Sanity only.
  - SSR: Yes by default; fully indexable.

Navigation & Layout
- `Navigation`, `MegaMenuContent`, `Footer`, `MobileNav`, `Layout`
  - Data: `siteSettings` (Sanity)
  - SSR: Yes. Resolve references server-side; render HTML for crawlers.
  - Edge cases: Broken internal refs; handle fallback gracefully on server.

SEO & Utilities
- `MetaTags`, `CanonicalUrl`, `StructuredData`
  - Replace with `generateMetadata` and SSR JSON-LD. Do not inject at runtime in Next.

Images & Media
- `OptimizedImage`
  - Replace implementation sites with `next/image` (keep helper if needed as loader adapter). Configure `remotePatterns`.

Address & Location
- `AddressAutocomplete`, `LocationSelector`
  - Client-only (browser geolocation, input events). SSR shell OK.

Error Handling
- `ErrorBoundary`, `ErrorFallbacks`, `ErrorTestComponent`, `withErrorBoundary`
  - Use Next `error.tsx`/`global-error.tsx`; component-level boundaries remain fine for client sections.

---

## 🗺️ One‑Shot Execution Plan (Actionable)

Phase 1 — Scaffold (0.5–1 day)
- Create `app/` structure: `layout.tsx`, `page.tsx`, `[slug]/page.tsx`, static routes, `error.tsx`, `not-found.tsx`.
- Add `next.config.js` with `images.remotePatterns` and trailingSlash policy; set `experimental` flags if needed.
- Configure fonts with `next/font` (Inter, Geist).

Phase 2 — Sanity SSR Integration (0.5–1 day)
- Implement server queries for homepage (`isHomepage`), `[slug]`, and `siteSettings` with tags (`page`, `siteSettings`).
- Server-render navigation/footer and content blocks that are purely presentational.

Phase 3 — SEO & Metadata (0.5 day)
- Implement `generateMetadata` for homepage and `[slug]`.
- Add SSR JSON-LD injection for Organization, Breadcrumbs, FAQ/Article when present.
- Add `app/robots.ts` and `app/sitemap.ts` (exclude `noIndex`).

Phase 4 — API Routes (0.5–1 day)
- Port each `/api/*` to `app/api/**/route.ts`, wrap with `NextResponse`, keep KV + headers, set `maxDuration`.
- Ensure Node runtime is used for KV/Node-only modules.

Phase 5 — Client Components (0.5–1 day)
- Mark charts (`recharts` components) and interactive calculators as `'use client'` (or dynamic `ssr:false`).
- Keep server shells around blocks; hydrate client-only parts.

Phase 6 — Revalidation & Webhooks (0.5 day)
- Implement `/api/revalidate` (HMAC verify) → `revalidateTag`/`revalidatePath`.
- Configure Studio webhook for `page`, `siteSettings`, `provider` changes.

Phase 7 — Analytics & Consent (0.5 day)
- Move Cookiebot, GA4, FB Pixel to `layout.tsx` via `next/script` with consent attributes.
- Validate runtime behavior and consent updates.

Phase 8 — Testing & Launch (0.5–1 day)
- Add Playwright checks for SSR HTML and metadata.
- Validate API caching headers and KV flow.
- Preview on Vercel, run Lighthouse; verify LCP/CLS/INP and hydration of charts.
- Roll out with alias switch; keep SPA as fallback.

Owners & Handoffs (example)
- SSR & Metadata: FE Dev A
- API Ports: BE/FE Dev B
- Revalidation/Studio Webhooks: Platform Dev C
- Analytics/Consent: FE Dev A
- QA & Perf: QA D

## ✅ Implementation Checklist (Merged & Actionable)

App Router & Layout
- [ ] Create `app/layout.tsx` with `metadataBase`, `next/font` (Inter, Geist), and analytics/consent scripts via `next/script`.
- [ ] Add `app/page.tsx` (homepage via `isHomepage`) and `app/[slug]/page.tsx` (dynamic pages with `notFound()`).
- [ ] Port static routes (e.g., `/energispareraad`, `/privatlivspolitik`, `/admin/dashboard`).
- [ ] Add `app/error.tsx` and `app/not-found.tsx`.

Sanity Fetch & Caching
- [ ] Implement server-side GROQ queries for homepage, slug pages, site settings, providers.
- [ ] Tag queries: `page`, `siteSettings`, `provider` and set `revalidate` per route.
- [ ] Replace client meta injection with `generateMetadata` for homepage and slug routes.

SEO & Structured Data
- [ ] Map `seoMetaTitle`, `seoMetaDescription`, `seoKeywords`, `ogImage`, `noIndex` to `generateMetadata`.
- [ ] Compute canonical via `metadataBase` and slug; enforce https and no trailing slash.
- [ ] Inject JSON-LD for Organization, BreadcrumbList, FAQ/Article at SSR.
- [ ] Implement `app/robots.ts` and `app/sitemap.ts` (exclude `noIndex`).

Components
- [ ] Mark Recharts blocks and interactive calculators as `'use client'` (or dynamic `ssr:false`).
- [ ] Server-render ProviderList and other text-heavy sections for SEO.
- [ ] Keep existing skeletons for client-only components.

Images & Fonts
- [ ] Configure `next.config.js` `images.remotePatterns` for `cdn.sanity.io` and `images.unsplash.com`.
- [ ] Replace font preload with `next/font` to reduce CLS.

API Routes
- [ ] Port all `/api/*.ts` to `app/api/**/route.ts` and wrap responses with `NextResponse`.
- [ ] Preserve `dynamic`, `maxDuration`, `s-maxage`, KV caches, and dedupe queues.
- [ ] Ensure Node runtime for routes using KV (disable Edge where needed).

Revalidation
- [ ] Implement `/api/revalidate` validating HMAC, calling `revalidateTag`/`revalidatePath`.
- [ ] Configure Sanity Studio webhooks for `page`, `siteSettings`, `provider` (create/update/delete).

Consent & Analytics
- [ ] Move Cookiebot, GA4, Facebook Pixel into `app/layout.tsx` with proper `strategy` and consent integration.
- [ ] Re-init GA/FB on consent changes via a small client component if needed.

Redirects & Canonical Policy
- [ ] Set trailingSlash policy (recommend off) and add redirects for trailing-slash variants.
- [ ] Normalize canonical URLs and include important query params only when content changes (e.g., region).

Environment
- [ ] Map `VITE_*` → `NEXT_PUBLIC_*` and define `SITE_URL` for `metadataBase`.
- [ ] Keep `SANITY_API_TOKEN` and `SANITY_WEBHOOK_SECRET` server-only.

Testing & Release
- [ ] Add Playwright SSR tests for HTML content and metadata.
- [ ] Validate API headers, caching, and KV hit/miss.
- [ ] Run performance checks (LCP/CLS/INP) in preview; verify charts hydrate.
- [ ] Gradual rollout via Vercel preview → production alias switch.

Rollback
- [ ] Keep SPA deployment available for fast DNS/alias revert.

---

This document integrates the prior guide with deeper schema validation, SEO strategy using the Metadata API, concrete routing/data-fetching patterns, API migration specifics, and a merged checklist to drive implementation.

---

## 🔧 Advanced Import Path Migration Strategy

### Current State Analysis
DinElportal uses **393 files** with `@/` import paths that require systematic migration:

```typescript
// Current Vite pattern (393 occurrences)
import { Component } from '@/components/Component'
import { service } from '@/services/service'
import { useHook } from '@/hooks/useHook'
```

### Migration Approach

#### 1. TypeScript Path Mapping Updates
**Next.js Configuration (next.config.js)**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  },
  // Ensure TypeScript path mapping works
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    }
    return config
  }
}
```

**TypeScript Configuration (tsconfig.json)**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./app/*"],
      "@/components/*": ["./src/components/*", "./components/*"],
      "@/lib/*": ["./src/lib/*", "./lib/*"],
      "@/hooks/*": ["./src/hooks/*", "./hooks/*"],
      "@/utils/*": ["./src/utils/*", "./utils/*"]
    }
  }
}
```

#### 2. Automated Migration Script
Create `scripts/migrate-imports.js`:
```javascript
const fs = require('fs');
const path = require('path');

const importMappings = {
  '@/components/': './components/',
  '@/lib/': './lib/',
  '@/hooks/': './hooks/',
  '@/utils/': './utils/',
  '@/types/': './types/',
  '@/services/': './services/',
  '@/': './src/'
};

function migrateFile(filePath, isAppDirectory = false) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  for (const [oldPath, newPath] of Object.entries(importMappings)) {
    const regex = new RegExp(`from '${oldPath.replace('/', '\\/')}'`, 'g');
    const replacement = isAppDirectory ? 
      `from '${newPath}'` : 
      `from '${oldPath}'`; // Keep @/ for src files
    newContent = newContent.replace(regex, replacement);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Migrated: ${filePath}`);
  }
}
```

#### 3. Directory Structure Migration
**Current Structure**
```
src/
├── components/    (113 files with @/ imports)
├── hooks/         (12 files with @/ imports)
├── lib/           (8 files with @/ imports)
├── utils/         (15 files with @/ imports)
├── services/      (8 files with @/ imports)
├── types/         (5 files with @/ imports)
└── pages/         (6 files with @/ imports)
```

**Target Structure**
```
app/                    # New App Router structure
├── layout.tsx         # Root layout
├── page.tsx           # Homepage
├── [slug]/            # Dynamic pages
├── api/               # API routes
└── globals.css        # Global styles

components/             # Shared components (moved from src/)
lib/                   # Utilities and configurations
hooks/                 # Custom hooks
utils/                 # Utility functions
types/                 # TypeScript types
```

---

## 🧭 React Router DOM Migration Patterns

### Current React Router Usage Analysis
Key components using React Router DOM that need migration:

**Navigation.tsx**: Uses `react-router-dom` Link components
**MetaTags.tsx**: Uses `useLocation` hook from `react-router-dom`
**CanonicalUrl.tsx**: Depends on `useLocation` for path detection

### Hook Migration Map

#### 1. useLocation → usePathname + useSearchParams
**Before (React Router)**
```typescript
import { useLocation } from 'react-router-dom';

const MetaTags = () => {
  const location = useLocation();
  // location.pathname, location.search available
  
  useEffect(() => {
    const canonicalUrl = generateCanonicalUrl(location.pathname);
  }, [location.pathname]);
};
```

**After (Next.js App Router)**
```typescript
'use client'
import { usePathname, useSearchParams } from 'next/navigation';

const MetaTags = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const canonicalUrl = generateCanonicalUrl(pathname);
  }, [pathname]);
};
```

#### 2. Link Component Migration
**Before (React Router)**
```typescript
import { Link as RouterLink } from 'react-router-dom';

<RouterLink to="/elpriser" className="nav-link">
  Elpriser
</RouterLink>
```

**After (Next.js)**
```typescript
import Link from 'next/link';

<Link href="/elpriser" className="nav-link">
  Elpriser
</Link>
```

#### 3. Navigation Hook Patterns
**Before**
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/new-path');
```

**After**
```typescript
'use client'
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/new-path');
```

### Component-Specific Migration Patterns

#### Navigation Component Migration
```typescript
// Before: Navigation.tsx with React Router
import { Link as RouterLink } from 'react-router-dom';

// After: Migration to Next.js Link
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname(); // Instead of useLocation
  
  return (
    <nav>
      {settings?.headerLinks?.map((link) => (
        <Link
          key={link._key}
          href={resolveLink(link)}
          className={pathname === resolveLink(link) ? 'active' : ''}
        >
          {link.text}
        </Link>
      ))}
    </nav>
  );
};
```

---

## Appendix: 📱 Service Worker & PWA Migration

### Current Service Worker Analysis
DinElportal uses a custom **icon cache service worker** (`public/icon-cache-sw.js`) with specific patterns:

```javascript
// Current: registerIconCache.ts
export function registerIconCacheServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('/icon-cache-sw.js', { scope: '/' });
  }
}
```

### Migration to Next.js PWA

#### 1. Install Next.js PWA Package
```bash
npm install @ducanh2912/next-pwa workbox-webpack-plugin
```

#### 2. Next.js PWA Configuration
**next.config.js**
```javascript
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Cache Iconify API requests (preserve current icon caching)
    {
      urlPattern: /^https:\/\/api\.iconify\.design\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'iconify-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    // Cache Sanity CDN images
    {
      urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'sanity-images',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Cache API routes
    {
      urlPattern: /^\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
      },
    }
  ],
});

module.exports = withPWA({
  // Your existing Next.js config
});
```

#### 3. PWA Manifest Migration
**public/manifest.json**
```json
{
  "name": "DinElportal - Sammenlign Elpriser",
  "short_name": "DinElportal",
  "description": "Danmarks bedste elpriser sammenligningstool",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#00CD52",
  "theme_color": "#00CD52",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 4. Service Worker Registration Migration
**app/layout.tsx**
```typescript
import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#00CD52',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DinElportal',
  },
};
```

### Icon Caching Strategy Migration
Since the current app uses custom icon caching, preserve this functionality:

**lib/icon-cache.ts**
```typescript
'use client'

export function setupIconCache() {
  if ('serviceWorker' in navigator && 'caches' in window) {
    // Enhanced icon caching with better error handling
    const cacheIconRequest = async (url: string) => {
      try {
        const cache = await caches.open('elportal-icons-v2');
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response.clone());
        }
        return response;
      } catch (error) {
        console.error('Icon cache error:', error);
        return fetch(url); // Fallback to network
      }
    };
    
    return { cacheIconRequest };
  }
  return { cacheIconRequest: (url: string) => fetch(url) };
}
```

---

## Appendix: ⚡ Performance Systems Migration

### Web Vitals Monitoring Migration
DinElportal has sophisticated performance monitoring (`webVitals.ts`, `inpOptimization.ts`) that needs Next.js integration.

#### 1. Next.js Web Vitals Integration
**app/layout.tsx**
```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

#### 2. Enhanced Web Vitals Component
**components/WebVitals.tsx**
```typescript
'use client'

import { useReportWebVitals } from 'next/web-vitals';
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Enhanced reporting with DinElportal's existing patterns
    const data = {
      name: metric.name,
      value: metric.value,
      rating: getRating(metric.name, metric.value),
      url: window.location.href,
      timestamp: Date.now(),
    };

    // Send to existing analytics endpoint if configured
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      navigator.sendBeacon(
        process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
        JSON.stringify(data)
      );
    }
  });

  return null;
}

function getRating(metric: string, value: number) {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    INP: { good: 200, poor: 500 },    // Updated for 2024
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };
  
  const threshold = thresholds[metric as keyof typeof thresholds];
  if (!threshold) return 'needs-improvement';
  
  if (value <= threshold.good) return 'good';
  if (value > threshold.poor) return 'poor';
  return 'needs-improvement';
}
```

#### 3. INP Optimization for App Router
**lib/inp-optimization.ts**
```typescript
'use client'

import { useCallback } from 'react';

// Enhanced for Next.js App Router RSC boundaries
export function useOptimizedInteraction<T extends (...args: any[]) => void>(
  handler: T,
  delay: number = 300
): T {
  return useCallback(
    debounce((...args: Parameters<T>) => {
      // Schedule during idle time to avoid blocking navigation
      if ('scheduler' in globalThis && 'postTask' in globalThis.scheduler) {
        globalThis.scheduler.postTask(() => handler(...args), {
          priority: 'user-blocking'
        });
      } else {
        requestIdleCallback(() => handler(...args), { timeout: delay });
      }
    }, delay) as T,
    [handler, delay]
  );
}

// RSC-compatible performance monitoring
export function monitorAppRouterPerformance() {
  if (typeof window === 'undefined') return;
  
  // Monitor App Router navigation performance
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('route-change')) {
        console.log('Route change performance:', entry.duration);
      }
    }
  });
  
  observer.observe({ type: 'navigation', buffered: true });
  observer.observe({ type: 'measure', buffered: true });
}
```

### Performance Optimization Patterns

#### 1. Component-Level Optimizations
```typescript
// Optimize heavy chart components for App Router
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const LivePriceGraph = dynamic(() => import('./LivePriceGraphComponent'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export default function PricePage() {
  return (
    <div>
      <h1>Elpriser</h1>
      <Suspense fallback={<ChartSkeleton />}>
        <LivePriceGraph />
      </Suspense>
    </div>
  );
}
```

#### 2. Data Fetching Performance
```typescript
// Server component with optimized data fetching
import { unstable_cache } from 'next/cache';

const getCachedPrices = unstable_cache(
  async () => {
    const response = await fetch('https://api.energidataservice.dk/dataset/Elspotprices');
    return response.json();
  },
  ['electricity-prices'],
  { revalidate: 300, tags: ['prices'] }
);

export default async function PricesPage() {
  const prices = await getCachedPrices();
  
  return (
    <div>
      <PriceDisplay prices={prices} />
    </div>
  );
}
```

---

## 🛡️ Error Handling Architecture Migration

### Current Error System Analysis
DinElportal has sophisticated error handling (`errorReporting.ts`, `ErrorBoundary.tsx`) that needs Next.js App Router adaptation.

#### 1. Error Boundaries for App Router
**app/error.tsx** (Route-level error boundary)
```typescript
'use client'

import { useEffect } from 'react';
import { reportError } from '@/lib/error-reporting';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Use existing error reporting system
    reportError(error, {
      component: 'AppRouterError',
      action: 'route-error',
      additionalInfo: { digest: error.digest }
    }, 'high');
  }, [error]);

  return (
    <div className="error-boundary">
      <h2>Noget gik galt</h2>
      <p>Der opstod en fejl ved indlæsning af siden.</p>
      <button onClick={reset}>Prøv igen</button>
    </div>
  );
}
```

**app/global-error.tsx** (Root error boundary)
```typescript
'use client'

import { reportError } from '@/lib/error-reporting';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  reportError(error, {
    component: 'GlobalError',
    action: 'critical-error'
  }, 'critical');

  return (
    <html>
      <body>
        <div className="global-error">
          <h1>Kritisk fejl</h1>
          <p>DinElportal kunne ikke indlæses korrekt.</p>
          <button onClick={reset}>Genstart</button>
        </div>
      </body>
    </html>
  );
}
```

#### 2. Enhanced Error Reporting for SSR
**lib/error-reporting.ts** (Enhanced version)
```typescript
import { ErrorInfo } from 'react';

// Extended for App Router SSR/RSC context
interface AppRouterErrorReport extends ErrorReport {
  renderingContext: 'server' | 'client' | 'rsc';
  routeInfo?: {
    pathname: string;
    params?: Record<string, string>;
    searchParams?: URLSearchParams;
  };
}

export class AppRouterErrorReporting {
  static reportSSRError(
    error: Error,
    context: {
      component?: string;
      pathname?: string;
      params?: any;
    }
  ) {
    const report: AppRouterErrorReport = {
      ...this.baseErrorReport(error),
      renderingContext: 'server',
      routeInfo: {
        pathname: context.pathname || 'unknown',
        params: context.params,
      },
      severity: 'high',
    };

    this.sendToService(report);
  }

  static reportRSCError(error: Error, componentName: string) {
    const report: AppRouterErrorReport = {
      ...this.baseErrorReport(error),
      renderingContext: 'rsc',
      context: { component: componentName },
      severity: 'high',
    };

    this.sendToService(report);
  }

  private static sendToService(report: AppRouterErrorReport) {
    // Send to existing error service or console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 App Router Error [${report.severity.toUpperCase()}]`);
      console.error('Error:', report.error);
      console.log('Context:', report.renderingContext);
      console.log('Route:', report.routeInfo);
      console.groupEnd();
    }
  }
}
```

#### 3. API Route Error Handling
```typescript
// app/api/electricity-prices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AppRouterErrorReporting } from '@/lib/error-reporting';

export async function GET(request: NextRequest) {
  try {
    const data = await fetchElectricityPrices();
    return NextResponse.json(data);
  } catch (error) {
    AppRouterErrorReporting.reportSSRError(
      error as Error,
      {
        component: 'ElectricityPricesAPI',
        pathname: '/api/electricity-prices',
      }
    );

    return NextResponse.json(
      { error: 'Failed to fetch electricity prices' },
      { status: 500 }
    );
  }
}
```

---

## 🔧 Environment Variables Detailed Mapping

### Current VITE_ Variable Analysis
Based on codebase analysis, here's the complete mapping strategy:

#### Environment Variable Migration Map
```bash
# Public variables (browser-exposed)
VITE_SANITY_PROJECT_ID=yxesi03x                 → NEXT_PUBLIC_SANITY_PROJECT_ID=yxesi03x
VITE_SANITY_DATASET=production                  → NEXT_PUBLIC_SANITY_DATASET=production  
VITE_SANITY_API_VERSION=2025-01-01             → NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
VITE_COOKIEBOT_ID=your_cookiebot_id_here       → NEXT_PUBLIC_COOKIEBOT_ID=your_cookiebot_id_here
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX           → NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FB_PIXEL_ID=XXXXXXXXXXXXXXXXX             → NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXXXXXXXXX
VITE_ANALYTICS_ENDPOINT=https://...            → NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://...

# Server-only variables (keep as-is)
SANITY_API_TOKEN=sk_xxx                        → SANITY_API_TOKEN=sk_xxx (unchanged)
SANITY_WEBHOOK_SECRET=xxx                      → SANITY_WEBHOOK_SECRET=xxx (unchanged)
SMITHERY_API_KEY=xxx                           → SMITHERY_API_KEY=xxx (unchanged)
ELOVERBLIK_TOKEN=xxx                           → ELOVERBLIK_TOKEN=xxx (unchanged)
KV_REST_API_URL=xxx                           → KV_REST_API_URL=xxx (unchanged)
KV_REST_API_TOKEN=xxx                         → KV_REST_API_TOKEN=xxx (unchanged)

# New Next.js specific variables
                                               → SITE_URL=https://elportal.dk
                                               → NEXTJS_URL=https://elportal.dk
                                               → VERCEL_URL (automatic in Vercel)
```

#### Update Pattern for Code
**Before (Vite)**
```typescript
// Client-side access
const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;

// Development check
if (import.meta.env.DEV) {
  console.log('Development mode');
}
```

**After (Next.js)**
```typescript
// Client-side access
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;

// Development check
if (process.env.NODE_ENV === 'development') {
  console.log('Development mode');
}
```

#### Automated Environment Migration Script
**scripts/migrate-env.js**
```javascript
const fs = require('fs');

const envMappings = {
  'import.meta.env.VITE_': 'process.env.NEXT_PUBLIC_',
  'import.meta.env.DEV': 'process.env.NODE_ENV === "development"',
  'import.meta.env.PROD': 'process.env.NODE_ENV === "production"',
  'VITE_SANITY_PROJECT_ID': 'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'VITE_SANITY_DATASET': 'NEXT_PUBLIC_SANITY_DATASET',
  'VITE_SANITY_API_VERSION': 'NEXT_PUBLIC_SANITY_API_VERSION',
  'VITE_COOKIEBOT_ID': 'NEXT_PUBLIC_COOKIEBOT_ID',
  'VITE_GA4_MEASUREMENT_ID': 'NEXT_PUBLIC_GA4_MEASUREMENT_ID',
  'VITE_FB_PIXEL_ID': 'NEXT_PUBLIC_FB_PIXEL_ID',
  'VITE_ANALYTICS_ENDPOINT': 'NEXT_PUBLIC_ANALYTICS_ENDPOINT',
};

function migrateEnvironmentVariables(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [oldVar, newVar] of Object.entries(envMappings)) {
    const regex = new RegExp(oldVar, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, newVar);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated environment variables in: ${filePath}`);
  }
}
```

---

## Appendix: 🧪 Testing Strategy Implementation

### Current State: No Tests
Analysis shows **no existing test files** in the codebase, making this migration an opportunity to implement comprehensive testing.

#### 1. Testing Framework Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event jest jest-environment-jsdom
npm install --save-dev @playwright/test
npm install --save-dev @next/jest
```

#### 2. Jest Configuration for Next.js
**jest.config.js**
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
  ],
};

module.exports = createJestConfig(config);
```

#### 3. Component Testing Patterns
**tests/components/Navigation.test.tsx**
```typescript
import { render, screen } from '@testing-library/react';
import { Navigation } from '@/components/Navigation';
import { mockSiteSettings } from '../__mocks__/sanity';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

describe('Navigation Component', () => {
  it('renders navigation links from Sanity', () => {
    render(<Navigation />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Sammenlign Elpriser')).toBeInTheDocument();
  });

  it('highlights active navigation link', () => {
    const mockUsePathname = jest.fn(() => '/elpriser');
    require('next/navigation').usePathname = mockUsePathname;
    
    render(<Navigation />);
    
    const activeLink = screen.getByRole('link', { name: /elpriser/i });
    expect(activeLink).toHaveClass('active');
  });
});
```

#### 4. API Route Testing
**tests/api/electricity-prices.test.ts**
```typescript
import { GET } from '@/app/api/electricity-prices/route';
import { NextRequest } from 'next/server';

// Mock external API
global.fetch = jest.fn();

describe('/api/electricity-prices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns cached electricity prices', async () => {
    const mockPrices = [
      { timestamp: '2024-01-01T00:00:00Z', price: 100 }
    ];
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrices,
    });

    const request = new NextRequest('http://localhost:3000/api/electricity-prices');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toEqual(mockPrices);
    expect(response.headers.get('cache-control')).toContain('s-maxage=300');
  });

  it('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const request = new NextRequest('http://localhost:3000/api/electricity-prices');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});
```

#### 5. SSR Testing Patterns
**tests/pages/homepage.test.tsx**
```typescript
import { render } from '@testing-library/react';
import HomePage from '@/app/page';

// Mock server components
jest.mock('@/components/ContentBlocks', () => {
  return function MockContentBlocks({ blocks }: { blocks: any[] }) {
    return <div data-testid="content-blocks">{blocks.length} blocks</div>;
  };
});

describe('Homepage SSR', () => {
  it('renders server-side content', async () => {
    const { container } = render(await HomePage());
    
    expect(container.querySelector('[data-testid="content-blocks"]')).toBeInTheDocument();
  });
});
```

#### 6. E2E Testing with Playwright
**e2e/navigation.spec.ts**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation E2E Tests', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    // Check homepage loads with SSR content
    await expect(page.locator('h1')).toContainText('Sammenlign Elpriser');
    
    // Navigate to price comparison
    await page.click('text=Sammenlign Elpriser');
    await expect(page.locator('h1')).toContainText('Elpriser');
    
    // Verify URL changed
    expect(page.url()).toContain('/elpriser');
  });

  test('should load price data without JavaScript', async ({ page }) => {
    // Disable JavaScript to test SSR
    await page.setJavaScriptEnabled(false);
    await page.goto('/elpriser');
    
    // Content should still be visible (SSR)
    await expect(page.locator('[data-testid="provider-list"]')).toBeVisible();
  });
});
```

#### 7. Web Vitals Testing
**tests/performance/web-vitals.test.ts**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Web Vitals Performance', () => {
  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    await page.goto('/');
    
    // Wait for LCP
    const lcpPromise = page.waitForFunction(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries.find(entry => entry.entryType === 'largest-contentful-paint');
          if (lcp) resolve(lcp.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
    });
    
    const lcp = await lcpPromise;
    expect(lcp).toBeLessThan(2500); // Good LCP threshold
  });
});
```

---

## Appendix: 🎨 Metadata & SEO Migration Deep Dive

### Current SEO System Analysis
DinElportal has sophisticated SEO management (`MetaTags.tsx`, `CanonicalUrl.tsx`) that needs complete migration to Next.js Metadata API.

#### 1. Metadata API Migration Pattern
**Before: Client-Side Meta Injection**
```typescript
// MetaTags.tsx - Current pattern
const MetaTags = ({ title, description, ogImage }) => {
  const location = useLocation();
  
  useEffect(() => {
    injectMetaTags({
      title,
      description,
      canonical: generateCanonicalUrl(location.pathname),
      ogImage,
    });
  }, [location.pathname]);
  
  return null;
};
```

**After: Server-Side Metadata Generation**
```typescript
// app/[slug]/page.tsx
import type { Metadata } from 'next';
import { getPageBySlug } from '@/lib/sanity';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);
  
  if (!page) {
    return {
      title: 'Side ikke fundet | DinElportal',
    };
  }

  const baseUrl = process.env.SITE_URL || 'https://elportal.dk';
  const canonicalUrl = `${baseUrl}/${params.slug}`;
  
  return {
    title: page.seoMetaTitle || page.title,
    description: page.seoMetaDescription,
    keywords: page.seoKeywords?.join(', '),
    robots: page.noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.seoMetaTitle || page.title,
      description: page.seoMetaDescription,
      url: canonicalUrl,
      siteName: 'DinElportal',
      locale: 'da_DK',
      type: 'website',
      images: page.ogImage ? [
        {
          url: getSanityImageUrl(page.ogImage.asset._ref, { width: 1200, height: 630 }),
          width: 1200,
          height: 630,
          alt: page.ogImage.alt || page.title,
        },
      ] : [
        {
          url: `${baseUrl}/opengraph-elportal.jpg`,
          width: 1200,
          height: 630,
          alt: 'DinElportal - Sammenlign elpriser',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seoMetaTitle || page.title,
      description: page.seoMetaDescription,
      images: page.ogImage ? 
        getSanityImageUrl(page.ogImage.asset._ref, { width: 1200, height: 630 }) :
        `${baseUrl}/opengraph-elportal.jpg`,
    },
  };
}
```

#### 2. Dynamic Metadata for API-Driven Pages
```typescript
// app/elpriser/[region]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: { region: string };
}): Promise<Metadata> {
  const regionName = params.region === 'dk1' ? 'Vestdanmark' : 'Østdanmark';
  const prices = await getCurrentPrices(params.region);
  const currentPrice = prices[0]?.totalPrice || 'N/A';
  
  return {
    title: `Elpriser ${regionName} - Aktuel Pris: ${currentPrice} kr/kWh | DinElportal`,
    description: `Se aktuelle elpriser for ${regionName}. Nuværende pris: ${currentPrice} kr/kWh. Sammenlign priser og find den billigste elaftale.`,
    keywords: `elpriser ${regionName}, ${params.region}, aktuelle priser, strømpriser`,
    openGraph: {
      title: `Elpriser ${regionName}`,
      description: `Aktuel elpris: ${currentPrice} kr/kWh`,
      images: [`/api/og/elpriser?region=${params.region}&price=${currentPrice}`],
    },
  };
}
```

#### 3. Structured Data Implementation
**lib/structured-data.ts**
```typescript
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DinElportal',
    url: 'https://elportal.dk',
    logo: 'https://elportal.dk/dinelportal-logo.png',
    description: 'Danmarks bedste sammenligningstool for elpriser',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Danish',
    },
  };
}

export function generateFAQSchema(faqItems: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
```

#### 4. Root Layout Metadata
**app/layout.tsx**
```typescript
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00CD52',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://elportal.dk'),
  title: {
    template: '%s | DinElportal',
    default: 'DinElportal - Sammenlign Elpriser og Find Billigste Elaftale',
  },
  description: 'Spar penge på din elregning! Sammenlign aktuelle elpriser og find den bedste elaftale for dig. Gratis sammenligning af danske eludbydere.',
  keywords: 'elpriser, sammenlign el, billig el, elselskaber, elaftale, vindstød, grøn energi',
  authors: [{ name: 'DinElportal' }],
  creator: 'DinElportal',
  publisher: 'DinElportal',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'DinElportal',
    locale: 'da_DK',
    title: 'Sammenlign Elpriser - Find Billigste Elaftale',
    description: 'Spar penge på din elregning! Sammenlign aktuelle elpriser og find den bedste elaftale.',
    images: [
      {
        url: '/opengraph-elportal.jpg',
        width: 1200,
        height: 630,
        alt: 'DinElportal - Sammenlign elpriser og find den bedste elaftale',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elportal',
    creator: '@elportal',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};
```

#### 5. Robots.txt & Sitemap Migration
**app/robots.ts**
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL || 'https://elportal.dk';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/test-*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

**app/sitemap.ts**
```typescript
import { MetadataRoute } from 'next';
import { getAllPages, getAllProviders } from '@/lib/sanity';

export default async function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || 'https://elportal.dk';
  
  // Get all pages from Sanity
  const pages = await getAllPages();
  const providers = await getAllProviders();
  
  const pageUrls: MetadataRoute.Sitemap = pages
    .filter(page => !page.noIndex)
    .map(page => ({
      url: page.isHomepage ? baseUrl : `${baseUrl}/${page.slug.current}`,
      lastModified: new Date(page._updatedAt),
      changeFrequency: 'weekly',
      priority: page.isHomepage ? 1.0 : 0.8,
    }));

  const providerUrls: MetadataRoute.Sitemap = providers.map(provider => ({
    url: `${baseUrl}/elselskaber/${provider.slug.current}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...pageUrls,
    ...providerUrls,
  ];
}
```

---

## Appendix: 🔨 Build Optimization Migration

### Current Vite Build Analysis
DinElportal uses sophisticated Vite chunking strategies that need Next.js equivalents:

```javascript
// Current vite.config.ts optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-*'],
          'chart-vendor': ['recharts', 'd3-scale', 'd3-scale-chromatic'],
          'sanity-vendor': ['@sanity/client', '@sanity/image-url'],
        },
      },
    },
  },
});
```

#### 1. Next.js Bundle Analysis Setup
```bash
npm install --save-dev @next/bundle-analyzer
```

**next.config.js**
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog', 
      '@radix-ui/react-dropdown-menu',
      'lucide-react',
      'recharts',
    ],
  },
  
  // Advanced optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  
  // Font optimization
  optimizeFonts: true,
  
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Bundle splitting similar to Vite
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          react: {
            name: 'react-vendor',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            priority: 10,
          },
          ui: {
            name: 'ui-vendor', 
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            priority: 9,
          },
          charts: {
            name: 'chart-vendor',
            test: /[\\/]node_modules[\\/](recharts|d3-scale|d3-scale-chromatic)[\\/]/,
            priority: 8,
          },
          sanity: {
            name: 'sanity-vendor',
            test: /[\\/]node_modules[\\/]@sanity[\\/]/,
            priority: 7,
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
```

#### 2. Dynamic Imports for Heavy Components
```typescript
// Dynamic import patterns for chart components
import dynamic from 'next/dynamic';

const LivePriceGraph = dynamic(() => import('@/components/LivePriceGraphComponent'), {
  ssr: false,
  loading: () => <div className="chart-skeleton">Indlæser graf...</div>,
});

const CO2EmissionsChart = dynamic(() => import('@/components/CO2EmissionsChart'), {
  ssr: false,
});

// Conditional loading for admin features
const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'), {
  ssr: false,
});

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<ChartSkeleton />}>
        <LivePriceGraph />
        <CO2EmissionsChart />
      </Suspense>
    </div>
  );
}
```

#### 3. Font Optimization Migration
**app/layout.tsx**
```typescript
import { Inter, Geist } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da" className={`${inter.variable} ${geist.variable}`}>
      <body className="font-inter">
        {children}
      </body>
    </html>
  );
}
```

**globals.css updates**
```css
:root {
  --font-inter: 'Inter Variable', sans-serif;
  --font-geist: 'Geist Variable', sans-serif;
}

body {
  font-family: var(--font-inter);
  font-feature-settings: 'rlig' 1, 'calt' 1;
}
```

---

## Appendix: ⚙️ Development Workflow Integration

### Preserving Development Tools
DinElportal has sophisticated development tools that must be preserved:

#### 1. MCP Server Integration
```json
// package.json scripts preservation
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "mcp:search": "tsx scripts/mcp-search.ts",
    "mcp:use": "tsx scripts/mcp-use.ts",
    "mcp:browserbase": "tsx scripts/mcp-browserbase.ts",
    "navigation:health": "tsx scripts/check-navigation-health.ts",
    "generate:sitemap": "next build && tsx scripts/generate-sitemap.ts"
  }
}
```

#### 2. Admin Dashboard Integration
**app/admin/dashboard/page.tsx**
```typescript
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: 'noindex, nofollow',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
```

#### 3. Development Environment Detection
```typescript
// lib/development.ts
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isPreview = process.env.VERCEL_ENV === 'preview';

// Enhanced development helpers
export function devLog(message: string, data?: any) {
  if (isDevelopment) {
    console.log(`[DinElportal Dev] ${message}`, data || '');
  }
}

export function devError(message: string, error?: Error) {
  if (isDevelopment) {
    console.error(`[DinElportal Error] ${message}`, error || '');
  }
}
```

---

## 📊 Implementation Timeline & Resource Estimation

### Phase-by-Phase Implementation

#### Phase 1: Foundation Setup (Week 1-2)
- **Duration**: 10-12 days
- **Resources**: 1 Senior Developer
- **Tasks**:
  - Next.js project setup and configuration
  - Basic routing structure (`app/layout.tsx`, `app/page.tsx`)
  - Environment variables migration
  - Import path configuration

#### Phase 2: Core Component Migration (Week 3-4)
- **Duration**: 10-14 days  
- **Resources**: 2 Developers (1 Senior, 1 Mid-level)
- **Tasks**:
  - Server Components identification and migration
  - Client Components marking (`'use client'`)
  - Navigation and routing hooks migration
  - Error boundary implementation

#### Phase 3: API & Data Layer (Week 5-6)
- **Duration**: 10-12 days
- **Resources**: 1 Senior Developer + 1 DevOps
- **Tasks**:
  - API routes migration (`app/api/**/route.ts`)
  - Data fetching pattern updates
  - Caching strategy implementation
  - KV integration preservation

#### Phase 4: SEO & Performance (Week 7-8)
- **Duration**: 8-10 days
- **Resources**: 1 Senior Developer
- **Tasks**:
  - Metadata API implementation
  - Sitemap and robots.txt generation
  - Performance monitoring migration
  - PWA setup and service worker migration

#### Phase 5: Testing & Quality Assurance (Week 9-10)
- **Duration**: 10-12 days
- **Resources**: 2 Developers + 1 QA
- **Tasks**:
  - Test suite implementation
  - E2E testing with Playwright
  - Performance testing
  - Cross-browser compatibility

#### Phase 6: Deployment & Monitoring (Week 11-12)
- **Duration**: 8-10 days
- **Resources**: 1 DevOps + 1 Developer
- **Tasks**:
  - Production deployment setup
  - Monitoring and analytics integration
  - Performance optimization
  - Rollback procedures

### Risk Mitigation Strategies

#### High-Risk Areas
1. **Import Path Migration (393 files)**: Use automated scripts + manual verification
2. **Service Worker Functionality**: Thorough testing of icon caching and offline features  
3. **Performance Regression**: Continuous monitoring and optimization
4. **SEO Impact**: Gradual rollout with monitoring

#### Mitigation Approaches
- **Incremental Migration**: Route-by-route migration capability
- **Feature Flags**: Ability to enable/disable new features
- **A/B Testing**: Compare performance between old and new implementations
- **Rollback Plan**: Quick revert to SPA if critical issues arise

### Success Metrics

#### Performance Targets
- **LCP**: < 2.5s (currently varies)
- **INP**: < 200ms (new metric for 2024)
- **CLS**: < 0.1
- **Build Time**: < 3 minutes (from current ~1 minute)

#### SEO Targets  
- **Core Web Vitals**: All "Good" ratings
- **Search Console**: No indexing issues
- **Lighthouse**: 95+ Performance, 100 SEO, Accessibility, Best Practices

#### Development Experience
- **Hot Reload**: < 200ms
- **Type Safety**: 100% TypeScript coverage
- **Test Coverage**: 80%+ for critical paths

---

This comprehensive enhancement to the migration guide provides detailed, actionable guidance for migrating DinElportal's sophisticated React/Vite SPA to Next.js App Router while preserving all existing functionality and improving performance, SEO, and developer experience.

---

## Appendix: 🎯 Official Next.js Vite Migration Patterns

Based on the official Next.js documentation at `/docs/app/guides/migrating/from-vite`, here are additional migration patterns specific to Vite applications:

### Initial Migration Strategy (SPA Mode)
The official recommendation is to start with **SPA mode** for minimal changes, then incrementally adopt Next.js features.

#### 1. Next.js Configuration for Vite Migration
**next.config.mjs** (Initial SPA setup)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Outputs a Single-Page Application (SPA)
  distDir: './dist', // Changes build output directory to match Vite
  trailingSlash: true, // Optional: matches Vite's static hosting behavior
  images: {
    unoptimized: true, // Required for static export mode
  },
}

export default nextConfig
```

#### 2. TypeScript Configuration Adjustments
**tsconfig.json** (Vite-specific updates)
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false, // Can enable incrementally
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

#### 3. Root Layout Migration (from index.html)
**Before: Vite index.html**
```html
<!DOCTYPE html>
<html lang="da">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DinElportal</title>
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**After: Next.js app/layout.tsx**
```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DinElportal',
  description: 'Sammenlign elpriser og find den bedste elaftale',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="da">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
```

#### 4. Catch-All Dynamic Route Pattern
**app/[[...slug]]/page.tsx** (Initial SPA compatibility)
```typescript
'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import your existing App component
const App = dynamic(() => import('../../src/App'), { ssr: false })

export default function Page() {
  useEffect(() => {
    // Any initialization logic
  }, [])

  return <App />
}

// Generate static params for known routes
export async function generateStaticParams() {
  return [
    { slug: [] }, // Homepage
    { slug: ['elpriser'] },
    { slug: ['sammenlign'] },
    { slug: ['groen-energi'] },
    { slug: ['admin', 'dashboard'] },
    // Add other known routes
  ]
}
```

### Asset Migration Patterns

#### 1. Image Import Updates
**Before: Vite absolute imports**
```typescript
import heroImage from '/src/assets/hero.jpg'
import logo from '/public/logo.png'

// Usage
<img src={heroImage} alt="Hero" />
<img src={logo} alt="Logo" />
```

**After: Next.js relative imports**
```typescript
import heroImage from '../assets/hero.jpg'
import logo from '/logo.png' // Public assets stay absolute

// Usage
<img src={heroImage.src || heroImage} alt="Hero" />
<img src={logo} alt="Logo" />
```

#### 2. Progressive Image Optimization
**Optional migration to next/image**
```typescript
import Image from 'next/image'
import heroImage from '../assets/hero.jpg'

// Before
<img src={heroImage} alt="Hero" className="w-full h-auto" />

// After (with optimization)
<Image
  src={heroImage}
  alt="Hero" 
  className="w-full h-auto"
  width={1200}
  height={600}
  priority // For above-the-fold images
/>
```

### Environment Variable Migration

#### 1. Variable Renaming Strategy
**Before: Vite patterns**
```typescript
// Client-side
const apiKey = import.meta.env.VITE_API_KEY
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

// Build-time
const buildMode = import.meta.env.MODE
```

**After: Next.js patterns**
```typescript
// Client-side
const apiKey = process.env.NEXT_PUBLIC_API_KEY
const isDev = process.env.NODE_ENV === 'development'
const isProd = process.env.NODE_ENV === 'production'

// Build-time (server-side)
const buildMode = process.env.NODE_ENV
```

#### 2. Environment File Migration
**.env.local** (Updated from Vite format)
```bash
# Before (Vite)
VITE_SANITY_PROJECT_ID=yxesi03x
VITE_SANITY_DATASET=production
VITE_API_URL=https://api.dinelportal.dk

# After (Next.js)
NEXT_PUBLIC_SANITY_PROJECT_ID=yxesi03x
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_API_URL=https://api.dinelportal.dk

# Server-only variables (no prefix needed)
SANITY_API_TOKEN=sk_xxx
DATABASE_URL=postgres://...
```

### Build Process Migration

#### 1. Package Scripts Update
**Before: Vite scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "build:dev": "vite build --mode development"
  }
}
```

**After: Next.js scripts**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "build:analyze": "ANALYZE=true next build",
    "export": "next build && next export"
  }
}
```

#### 2. Build Output Comparison
```bash
# Vite output structure
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [asset-files]
├── index.html
└── favicon.ico

# Next.js SPA export output
out/
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   └── css/
├── index.html
├── 404.html
└── [static-assets]
```

### Incremental Feature Adoption

#### 1. Step-by-Step Migration Path
```typescript
// Phase 1: Basic SPA migration (current)
export default function Page() {
  return <ViteApp />
}

// Phase 2: Add loading states
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ViteApp />
    </Suspense>
  )
}

// Phase 3: Split into Server + Client Components
export default async function Page() {
  const data = await fetchServerData() // Server Component
  
  return (
    <div>
      <ServerContent data={data} />
      <ClientInteractiveSection />
    </div>
  )
}
```

#### 2. Router Migration Strategy
**Gradual migration from React Router**
```typescript
// app/[[...slug]]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page() {
  const params = useParams()
  const slug = params.slug as string[] || []
  const [Component, setComponent] = useState(null)

  useEffect(() => {
    // Route mapping logic
    const route = '/' + slug.join('/')
    
    switch (route) {
      case '/':
        import('../../src/pages/Index').then(setComponent)
        break
      case '/elpriser':
        import('../../src/pages/ElpriserPage').then(setComponent)
        break
      // Add other routes...
      default:
        import('../../src/pages/GenericPage').then(setComponent)
    }
  }, [slug])

  return Component ? <Component /> : <div>Loading...</div>
}
```

### Performance Optimization During Migration

#### 1. Code Splitting Preservation
**Vite manual chunks → Next.js dynamic imports**
```typescript
// Before: Vite config manual chunks
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['recharts', 'd3-scale']
        }
      }
    }
  }
})

// After: Next.js dynamic imports
const ChartsModule = dynamic(() => import('./charts'), {
  loading: () => <p>Loading charts...</p>,
})

const VendorHeavyComponent = dynamic(() => import('./vendor-component'), {
  ssr: false,
})
```

#### 2. Bundle Analysis Migration
```bash
# Vite bundle analysis
npm run build -- --analyze

# Next.js bundle analysis  
npm install --save-dev @next/bundle-analyzer
ANALYZE=true npm run build
```

### Migration Validation

#### 1. Feature Parity Checklist
- [ ] All routes render correctly
- [ ] Environment variables work
- [ ] Image assets load properly
- [ ] Build output size is comparable
- [ ] Development hot reload works
- [ ] Production builds successfully

#### 2. Performance Comparison
```bash
# Compare build sizes
# Vite: Check dist/ folder size
# Next.js: Check .next/ or out/ folder size

# Compare build times
time npm run build

# Compare runtime performance
# Use Lighthouse on both versions
```

---

## 🔄 Migration Decision Tree

### When to Use Each Migration Approach

#### Choose **SPA Export Mode** When:
- Need minimal changes initially
- Static hosting requirements
- Existing deployment pipeline works with static files
- Want to preserve exact current behavior

#### Choose **Full App Router Migration** When:
- Ready for comprehensive modernization
- Want Server Components benefits immediately
- SEO is critical (current meta tag injection issues)
- Performance improvements are priority

#### Hybrid Approach (Recommended for DinElportal):
1. **Week 1-2**: Start with SPA export mode
2. **Week 3-4**: Migrate critical pages to App Router
3. **Week 5-8**: Implement Server Components for data-heavy pages
4. **Week 9-12**: Full optimization and testing

This official Next.js Vite migration pattern provides a proven path for large, complex applications like DinElportal to migrate incrementally while maintaining functionality throughout the process.

---

## 🏗️ Two-Project Architecture Integration

### sanityelpriscms Backend Compatibility

The **sanityelpriscms** project (Sanity Studio v3 backend) will remain **completely functional** during and after the Next.js migration. Here's what you need to know:

#### ✅ **What Stays the Same**

1. **Sanity Studio Access**: `https://dinelportal.sanity.studio` continues working unchanged
2. **Content Management**: All 23 custom schemas remain fully functional
3. **API Endpoints**: All Sanity GROQ queries work identically
4. **Content Creation**: AI-powered page generation via Sanity API continues working
5. **Webhooks**: Existing webhook configurations remain valid

#### 🔧 **Integration Points During Migration**

##### 1. Environment Variables Coordination
**Frontend (.env.local)**
```bash
# Client-side (browser-exposed)
NEXT_PUBLIC_SANITY_PROJECT_ID=yxesi03x
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01

# Server-side only (for mutations/webhooks)
SANITY_API_TOKEN=sk_xxx_your_token_here
SANITY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Backend (sanityelpriscms/.env)**
```bash
# Sanity Studio environment (unchanged)
SANITY_STUDIO_PROJECT_ID=yxesi03x
SANITY_STUDIO_DATASET=production

# For API operations
SANITY_API_TOKEN=sk_xxx_your_token_here
```

##### 2. Sanity Client Configuration Migration
**Before: Vite Frontend**
```typescript
// src/lib/sanity.ts
import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2025-01-01',
  useCdn: true,
});
```

**After: Next.js Frontend**
```typescript
// lib/sanity.ts
import { createClient } from '@sanity/client';

// Read-only client (Server + Client Components)
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01',
  useCdn: true,
});

// Write client (Server-side only)
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Server-side only!
});
```

##### 3. Webhook Integration Updates
**Current: Vite API Route**
```typescript
// api/revalidate.ts (Vercel Functions)
export default async function handler(req: Request) {
  // Webhook handling logic
}
```

**After: Next.js API Route**
```typescript
// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Validate webhook signature (unchanged logic)
    const body = await request.json();
    
    // Revalidate based on document type
    if (body._type === 'page') {
      revalidatePath(`/${body.slug?.current}`);
      revalidateTag('page');
    } else if (body._type === 'siteSettings') {
      revalidateTag('siteSettings');
    } else if (body._type === 'provider') {
      revalidateTag('provider');
    }

    return NextResponse.json({ revalidated: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
```

#### 🔄 **Data Fetching Migration**

##### Server Components (New in Next.js)
```typescript
// app/[slug]/page.tsx
import { getPageBySlug } from '@/lib/sanity-queries';

export default async function Page({ params }: { params: { slug: string } }) {
  // Fetch directly in Server Component
  const page = await getPageBySlug(params.slug);
  
  return (
    <div>
      <h1>{page.title}</h1>
      <ContentBlocks blocks={page.contentBlocks} />
    </div>
  );
}
```

##### Client Components (Existing Pattern)
```typescript
// components/ProviderList.tsx
'use client'

import { useQuery } from '@tanstack/react-query';
import { getProviders } from '@/lib/sanity-queries';

export function ProviderList() {
  const { data: providers } = useQuery({
    queryKey: ['providers'],
    queryFn: getProviders,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div>
      {providers?.map(provider => (
        <ProviderCard key={provider._id} provider={provider} />
      ))}
    </div>
  );
}
```

#### 📦 **Sanity Schema Compatibility**

All 23 existing schemas remain **100% compatible**:

```typescript
// sanityelpriscms/schemaTypes/page.ts (unchanged)
export default {
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'array',
      of: [
        { type: 'hero' },
        { type: 'pageSection' },
        { type: 'providerList' },
        // All existing content types work unchanged
      ],
    },
    // SEO fields remain the same
    {
      name: 'seoMetaTitle',
      title: 'SEO Meta Title',
      type: 'string',
    },
    {
      name: 'seoMetaDescription', 
      title: 'SEO Meta Description',
      type: 'text',
    },
    {
      name: 'seoKeywords',
      title: 'SEO Keywords',
      type: 'array',
      of: [{ type: 'string' }],
    },
  ],
};
```

#### 🚀 **Development Workflow**

##### Development Commands (Both Projects)
```json
// Frontend (Next.js)
{
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}

// Backend (Sanity Studio) - UNCHANGED
{
  "scripts": {
    "dev": "sanity dev",
    "build": "sanity build", 
    "deploy": "sanity deploy"
  }
}
```

##### Local Development Workflow
```bash
# Terminal 1: Frontend (Next.js)
cd /path/to/elportal-forside-design
npm run dev  # Runs on localhost:3000

# Terminal 2: Backend (Sanity Studio) - UNCHANGED
cd /path/to/sanityelpriscms  
npm run dev  # Runs on localhost:3333
```

##### Production Deployment
```bash
# Frontend: Vercel (Next.js)
vercel deploy

# Backend: Sanity Studio - UNCHANGED
cd ../sanityelpriscms
npm run deploy
```

#### 🔍 **Content Creation & AI Integration**

The AI-powered content creation system continues working unchanged:

**Sanity API Integration (Enhanced for Next.js)**
```typescript
// app/api/sanity/create-page/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity';

export async function POST(request: NextRequest) {
  try {
    const pageData = await request.json();
    
    // Create page using existing AI generation logic
    const result = await writeClient.create({
      _type: 'page',
      ...pageData,
    });

    // Revalidate the new page immediately
    revalidatePath(`/${pageData.slug.current}`);
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
```

#### ⚠️ **Migration Considerations**

##### High Priority
1. **API Token Security**: Ensure `SANITY_API_TOKEN` is server-side only in Next.js
2. **Webhook URLs**: Update webhook endpoints from `/api/revalidate` to new Next.js format
3. **Environment Sync**: Keep both projects' environment variables synchronized

##### Medium Priority  
1. **CORS Configuration**: Verify Sanity CORS settings include Next.js URLs
2. **Preview Mode**: Update preview functionality for Next.js patterns
3. **Image Optimization**: Consider migrating to `next/image` for Sanity images

##### Low Priority
1. **Build Optimization**: Bundle Sanity client appropriately
2. **Type Safety**: Ensure schema types work with Next.js Server Components

#### 🧪 **Testing the Integration**

##### Validation Checklist
- [ ] Sanity Studio accessible at `https://dinelportal.sanity.studio`
- [ ] All 23 schemas load correctly in Studio
- [ ] GROQ queries return data in Next.js Server Components
- [ ] React Query works for client-side data fetching
- [ ] Webhooks trigger Next.js revalidation
- [ ] AI content creation APIs function correctly
- [ ] Image assets load from Sanity CDN
- [ ] Environment variables properly separated

##### Integration Test Script
```typescript
// scripts/test-sanity-integration.ts
import { client, writeClient } from '@/lib/sanity';

async function testSanityIntegration() {
  try {
    // Test read access
    const pages = await client.fetch('*[_type == "page"][0...3]');
    console.log('✅ Read access working:', pages.length, 'pages found');
    
    // Test write access (server-side only)
    if (process.env.SANITY_API_TOKEN) {
      const testDoc = await writeClient.create({
        _type: 'page',
        title: 'Integration Test Page',
        slug: { current: 'integration-test' },
      });
      
      // Clean up
      await writeClient.delete(testDoc._id);
      console.log('✅ Write access working');
    }
    
    console.log('✅ Sanity integration fully functional');
  } catch (error) {
    console.error('❌ Sanity integration error:', error);
  }
}
```

### Summary

The **sanityelpriscms** backend requires **zero changes** and will work seamlessly with the Next.js migration. The integration points are well-defined, environment variables are properly separated, and all existing functionality (content management, AI generation, webhooks) continues working as expected.

The two-project architecture actually becomes **stronger** with Next.js Server Components, as you can now fetch Sanity data directly in server components without client-side API calls, improving performance and SEO.

---

## 🛡️ Migration Safety & Backup Strategy

### Pre-Migration Safety Checklist

#### 🎯 **Branch Strategy for Two-Project Architecture**

##### Frontend Repository (elportal-forside-design)
```bash
# Create migration branch from current main
git checkout main
git pull origin main
git checkout -b migration/nextjs-app-router

# Create backup tag of current production state
git tag -a backup/pre-nextjs-migration -m "Production backup before Next.js migration"
git push origin backup/pre-nextjs-migration

# Create feature branches for major phases
git checkout -b migration/phase-1-foundation
git checkout -b migration/phase-2-components  
git checkout -b migration/phase-3-api-layer
git checkout -b migration/phase-4-seo-performance
```

##### Backend Repository (sanityelpriscms)
```bash
# Navigate to backend project
cd ../sanityelpriscms

# Create monitoring/backup branch (low-risk changes only)
git checkout main
git pull origin main
git tag -a backup/pre-migration-monitoring -m "Backend state before frontend migration"
git push origin backup/pre-migration-monitoring

# Optional: Create branch for webhook updates
git checkout -b migration/webhook-updates
```

#### 📦 **Complete Backup Strategy**

##### 1. Sanity Content Export (Critical)
```bash
# Export complete dataset
npx @sanity/cli dataset export production backup-$(date +%Y%m%d).tar.gz

# Export with assets (larger file)
npx @sanity/cli dataset export production backup-with-assets-$(date +%Y%m%d).tar.gz --assets

# Store exports securely
mv backup-*.tar.gz ./backups/pre-migration/
```

##### 2. Environment Variables Backup
```bash
# Frontend environment backup
cp .env .env.backup.$(date +%Y%m%d)
cp .env.local .env.local.backup.$(date +%Y%m%d)

# Backend environment backup  
cd ../sanityelpriscms
cp .env .env.backup.$(date +%Y%m%d)

# Vercel environment variables backup
vercel env ls > vercel-env-backup-$(date +%Y%m%d).txt
```

##### 3. Asset Backup Strategy
```bash
# Frontend assets
tar -czf public-assets-backup-$(date +%Y%m%d).tar.gz public/
tar -czf src-assets-backup-$(date +%Y%m%d).tar.gz src/

# Important: Backup build artifacts for quick recovery
cp -r dist/ dist-backup-$(date +%Y%m%d)/
```

##### 4. Database State Documentation
```typescript
// scripts/backup-sanity-state.ts
import { client } from '@/lib/sanity';
import fs from 'fs';

async function backupSanityState() {
  const timestamp = new Date().toISOString().split('T')[0];
  
  try {
    // Document current data structure
    const pages = await client.fetch('*[_type == "page"]');
    const providers = await client.fetch('*[_type == "provider"]');
    const siteSettings = await client.fetch('*[_type == "siteSettings"][0]');
    
    const backupData = {
      timestamp,
      counts: {
        pages: pages.length,
        providers: providers.length,
        siteSettings: siteSettings ? 1 : 0,
      },
      sampleData: {
        firstPage: pages[0],
        firstProvider: providers[0],
        siteSettings: siteSettings,
      },
    };
    
    fs.writeFileSync(
      `./backups/sanity-state-${timestamp}.json`,
      JSON.stringify(backupData, null, 2)
    );
    
    console.log('✅ Sanity state documented for rollback validation');
  } catch (error) {
    console.error('❌ Failed to backup Sanity state:', error);
  }
}

backupSanityState();
```

### 🚀 **Blue-Green Deployment Strategy**

#### Setup Parallel Environments
```bash
# Production (Current): elportal.dk (Vite SPA)
# Staging (Migration): nextjs.elportal.dk (Next.js App Router)
# Backup: spa-backup.elportal.dk (Vite SPA copy)
```

#### Vercel Deployment Configuration
```json
// vercel.json (Production)
{
  "projects": {
    "production": {
      "alias": ["elportal.dk", "www.elportal.dk"],
      "framework": "vite"
    },
    "nextjs-migration": {
      "alias": ["nextjs.elportal.dk"],
      "framework": "nextjs"
    },
    "spa-backup": {
      "alias": ["spa-backup.elportal.dk"],
      "framework": "vite"
    }
  }
}
```

### 🔄 **Phase-by-Phase Safety Protocol**

#### Phase 0: Pre-Migration Safety Setup (Week 0)
```bash
# 1. Complete backup execution
./scripts/create-complete-backup.sh

# 2. Create migration branches
./scripts/setup-migration-branches.sh

# 3. Deploy backup environments  
vercel deploy --target staging  # Test environment
vercel deploy --alias spa-backup.elportal.dk  # Backup SPA

# 4. Health check systems
npm run health:setup  # Install monitoring
```

#### Checkpoint System Per Phase
```typescript
// scripts/migration-checkpoint.ts
interface MigrationCheckpoint {
  phase: string;
  date: string;
  gitCommit: string;
  vercelDeployment: string;
  sanityBackup: string;
  healthChecks: Record<string, boolean>;
  rollbackInstructions: string[];
}

async function createCheckpoint(phase: string) {
  const checkpoint: MigrationCheckpoint = {
    phase,
    date: new Date().toISOString(),
    gitCommit: await getCurrentGitCommit(),
    vercelDeployment: await getVercelDeploymentId(),
    sanityBackup: await createSanityBackup(),
    healthChecks: await runHealthChecks(),
    rollbackInstructions: getPhaseRollbackInstructions(phase),
  };
  
  // Save checkpoint data
  fs.writeFileSync(
    `./checkpoints/${phase}-checkpoint.json`,
    JSON.stringify(checkpoint, null, 2)
  );
  
  // Create git tag
  await exec(`git tag -a checkpoint/${phase} -m "Migration checkpoint: ${phase}"`);
  await exec(`git push origin checkpoint/${phase}`);
  
  console.log(`✅ Checkpoint created for ${phase}`);
  return checkpoint;
}
```

### 🔍 **Continuous Health Monitoring**

#### Health Check System
```typescript
// lib/health-monitoring.ts
export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: Date;
  details?: any;
}

export async function runMigrationHealthChecks(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];
  
  // Frontend health
  checks.push(await checkFrontendHealth());
  
  // Sanity CMS health
  checks.push(await checkSanityHealth());
  
  // API endpoints health
  checks.push(await checkApiEndpointsHealth());
  
  // Performance metrics
  checks.push(await checkWebVitalsHealth());
  
  // External integrations
  checks.push(await checkExternalIntegrationsHealth());
  
  return checks;
}

async function checkSanityHealth(): Promise<HealthCheck> {
  try {
    const start = Date.now();
    const testQuery = await client.fetch('*[_type == "siteSettings"][0]');
    const responseTime = Date.now() - start;
    
    return {
      service: 'Sanity CMS',
      status: testQuery ? 'healthy' : 'degraded',
      responseTime,
      lastCheck: new Date(),
      details: { hasSettings: !!testQuery },
    };
  } catch (error) {
    return {
      service: 'Sanity CMS',
      status: 'unhealthy',
      lastCheck: new Date(),
      details: { error: error.message },
    };
  }
}
```

#### Automated Monitoring During Migration
```typescript
// scripts/migration-monitor.ts
import { runMigrationHealthChecks } from '@/lib/health-monitoring';

export async function startMigrationMonitoring() {
  const monitoring = setInterval(async () => {
    const healthChecks = await runMigrationHealthChecks();
    const unhealthy = healthChecks.filter(check => check.status === 'unhealthy');
    
    if (unhealthy.length > 0) {
      console.error('🚨 HEALTH CHECK FAILURE:', unhealthy);
      
      // Send alerts (implement your notification system)
      await sendSlackAlert(`Migration health check failed: ${unhealthy.map(c => c.service).join(', ')}`);
      
      // Auto-pause migration if critical systems fail
      if (unhealthy.some(c => ['Sanity CMS', 'Frontend'].includes(c.service))) {
        console.error('🛑 CRITICAL SYSTEM FAILURE - CONSIDER ROLLBACK');
      }
    } else {
      console.log('✅ All systems healthy');
    }
  }, 30000); // Check every 30 seconds during migration
  
  return monitoring;
}
```

### 🔙 **Instant Rollback Procedures**

#### 1. Frontend Rollback (DNS Switch)
```bash
# Emergency rollback script
#!/bin/bash
# scripts/emergency-rollback.sh

echo "🚨 EMERGENCY ROLLBACK INITIATED"

# 1. Switch Vercel alias back to SPA
vercel alias set spa-backup.elportal.dk elportal.dk
vercel alias set spa-backup.elportal.dk www.elportal.dk

# 2. Verify rollback
curl -I https://elportal.dk | grep "x-vercel-id"

# 3. Health check
npm run health:check

echo "✅ Rollback complete - SPA restored"
```

#### 2. Backend Rollback (If Needed)
```bash
# scripts/sanity-rollback.sh
#!/bin/bash

# Restore from backup (if content was modified)
npx @sanity/cli dataset import backup-$(date +%Y%m%d).tar.gz production --replace

# Restart studio
cd ../sanityelpriscms
npm run deploy

echo "✅ Sanity content restored from backup"
```

#### 3. Environment Variable Rollback
```bash
# scripts/env-rollback.sh
#!/bin/bash

# Restore environment variables
cp .env.backup.$(date +%Y%m%d) .env
cp .env.local.backup.$(date +%Y%m%d) .env.local

# Update Vercel environment
vercel env pull .env.vercel.backup

echo "✅ Environment variables restored"
```

### 📊 **Migration Validation Framework**

#### Automated Validation Script
```typescript
// scripts/validate-migration-phase.ts
interface ValidationResult {
  phase: string;
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    details?: any;
  }[];
}

export async function validateMigrationPhase(phase: string): Promise<ValidationResult> {
  const checks = [];
  
  // Phase-specific validations
  switch (phase) {
    case 'foundation':
      checks.push(await validateNextJsSetup());
      checks.push(await validateEnvironmentVariables());
      checks.push(await validateTypeScriptConfig());
      break;
      
    case 'components':
      checks.push(await validateComponentMigration());
      checks.push(await validateRoutingMigration());
      checks.push(await validateErrorBoundaries());
      break;
      
    case 'api-layer':
      checks.push(await validateApiRoutes());
      checks.push(await validateCaching());
      checks.push(await validateKvIntegration());
      break;
      
    case 'seo-performance':
      checks.push(await validateMetadataApi());
      checks.push(await validateSitemapGeneration());
      checks.push(await validateWebVitals());
      break;
  }
  
  const allPassed = checks.every(check => check.passed);
  
  return {
    phase,
    passed: allPassed,
    checks,
  };
}

async function validateSanityIntegration() {
  try {
    // Test both frontend projects can access Sanity
    const frontendTest = await client.fetch('*[_type == "siteSettings"][0]');
    const backendAccess = process.env.SANITY_API_TOKEN ? true : false;
    
    return {
      name: 'Sanity Integration',
      passed: !!frontendTest && backendAccess,
      details: {
        frontendAccess: !!frontendTest,
        backendAccess,
        studioUrl: 'https://dinelportal.sanity.studio',
      },
    };
  } catch (error) {
    return {
      name: 'Sanity Integration',
      passed: false,
      details: { error: error.message },
    };
  }
}
```

### 🎛️ **Feature Flag System for Safe Migration**

#### Implementation
```typescript
// lib/feature-flags.ts
interface FeatureFlag {
  enabled: boolean;
  rolloutPercentage?: number;
  conditions?: {
    environment?: 'development' | 'staging' | 'production';
    userAgent?: string[];
    ipAddresses?: string[];
  };
}

export const migrationFeatureFlags = {
  // App Router features
  useAppRouter: {
    enabled: process.env.FEATURE_APP_ROUTER === 'true',
    rolloutPercentage: parseInt(process.env.APP_ROUTER_ROLLOUT || '0'),
  },
  
  // Server Components
  useServerComponents: {
    enabled: process.env.FEATURE_SERVER_COMPONENTS === 'true',
    conditions: {
      environment: process.env.NODE_ENV as any,
    },
  },
  
  // New metadata system
  useMetadataApi: {
    enabled: process.env.FEATURE_METADATA_API === 'true',
  },
  
  // Performance monitoring
  enhancedWebVitals: {
    enabled: process.env.FEATURE_ENHANCED_WEB_VITALS === 'true',
  },
} as const;

export function isFeatureEnabled(flag: keyof typeof migrationFeatureFlags): boolean {
  const feature = migrationFeatureFlags[flag];
  
  if (!feature.enabled) return false;
  
  // Check rollout percentage
  if (feature.rolloutPercentage !== undefined) {
    const userHash = Math.abs(hashCode(getUserId() || 'anonymous'));
    const bucket = userHash % 100;
    if (bucket >= feature.rolloutPercentage) return false;
  }
  
  // Check conditions
  if (feature.conditions) {
    if (feature.conditions.environment && 
        feature.conditions.environment !== process.env.NODE_ENV) {
      return false;
    }
  }
  
  return true;
}
```

#### Feature Flag Usage
```typescript
// components/ConditionalServerComponent.tsx
import { isFeatureEnabled } from '@/lib/feature-flags';

export default function ConditionalServerComponent() {
  // Use new Server Component if flag enabled, fallback to client component
  if (isFeatureEnabled('useServerComponents')) {
    return <ServerProviderList />;
  }
  
  return <ClientProviderList />;
}
```

### 📈 **Migration Progress Tracking**

#### Progress Dashboard
```typescript
// scripts/migration-dashboard.ts
interface MigrationProgress {
  phase: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'failed';
  startDate?: string;
  completedDate?: string;
  blockers: string[];
  healthScore: number; // 0-100
  risksIdentified: string[];
}

export const migrationPhases: MigrationProgress[] = [
  {
    phase: 'Phase 0: Safety Setup',
    status: 'not-started',
    blockers: [],
    healthScore: 100,
    risksIdentified: [],
  },
  {
    phase: 'Phase 1: Foundation',
    status: 'not-started', 
    blockers: [],
    healthScore: 100,
    risksIdentified: ['Import path conflicts', 'TypeScript configuration'],
  },
  // ... other phases
];

export function updateMigrationProgress(phase: string, updates: Partial<MigrationProgress>) {
  const phaseIndex = migrationPhases.findIndex(p => p.phase.includes(phase));
  if (phaseIndex >= 0) {
    migrationPhases[phaseIndex] = { ...migrationPhases[phaseIndex], ...updates };
    
    // Save to file for persistence
    fs.writeFileSync(
      './migration-progress.json',
      JSON.stringify(migrationPhases, null, 2)
    );
  }
}
```

### 🚨 **Emergency Procedures**

#### 1. Critical System Failure Response
```typescript
// scripts/emergency-response.ts
interface EmergencyResponse {
  trigger: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions: string[];
  contacts: string[];
  rollbackRequired: boolean;
}

export const emergencyProcedures: Record<string, EmergencyResponse> = {
  'sanity-connection-failed': {
    trigger: 'Sanity CMS unreachable for >5 minutes',
    severity: 'critical',
    actions: [
      'Check Sanity status page',
      'Verify API tokens',
      'Test backup Sanity endpoint',
      'Initiate rollback if needed'
    ],
    contacts: ['dev-team@elportal.dk'],
    rollbackRequired: true,
  },
  
  'frontend-build-failed': {
    trigger: 'Next.js build fails consistently',
    severity: 'high',
    actions: [
      'Check build logs',
      'Verify dependencies',
      'Test on clean environment',
      'Rollback to last working commit'
    ],
    contacts: ['dev-team@elportal.dk'],
    rollbackRequired: false,
  },
  
  'performance-degradation': {
    trigger: 'Web Vitals scores drop >50%',
    severity: 'medium',
    actions: [
      'Run Lighthouse audit',
      'Check bundle size',
      'Review component performance',
      'Consider staged rollback'
    ],
    contacts: ['dev-team@elportal.dk'],
    rollbackRequired: false,
  },
};
```

#### 2. Automated Emergency Detection
```typescript
// lib/emergency-detection.ts
export class EmergencyDetectionSystem {
  private monitoring = true;
  
  async startMonitoring() {
    while (this.monitoring) {
      const healthChecks = await runMigrationHealthChecks();
      
      // Check for emergency conditions
      await this.checkSanityConnectivity(healthChecks);
      await this.checkFrontendHealth(healthChecks);
      await this.checkPerformanceMetrics(healthChecks);
      
      await sleep(30000); // Check every 30 seconds
    }
  }
  
  private async checkSanityConnectivity(checks: HealthCheck[]) {
    const sanityCheck = checks.find(c => c.service === 'Sanity CMS');
    
    if (sanityCheck?.status === 'unhealthy') {
      await this.triggerEmergencyResponse('sanity-connection-failed');
    }
  }
  
  private async triggerEmergencyResponse(trigger: string) {
    const procedure = emergencyProcedures[trigger];
    if (!procedure) return;
    
    console.error(`🚨 EMERGENCY: ${trigger}`);
    console.error(`Severity: ${procedure.severity}`);
    console.error(`Actions: ${procedure.actions.join(', ')}`);
    
    if (procedure.rollbackRequired && procedure.severity === 'critical') {
      console.error('🛑 INITIATING AUTOMATIC ROLLBACK');
      await this.executeAutomaticRollback();
    }
  }
  
  private async executeAutomaticRollback() {
    try {
      // Switch back to SPA immediately
      await exec('vercel alias set spa-backup.elportal.dk elportal.dk');
      
      // Notify team
      await sendSlackAlert('🚨 AUTOMATIC ROLLBACK EXECUTED - Migration halted due to critical failure');
      
    } catch (error) {
      console.error('❌ ROLLBACK FAILED:', error);
      await sendSlackAlert('🚨🚨 ROLLBACK FAILURE - MANUAL INTERVENTION REQUIRED IMMEDIATELY');
    }
  }
}
```

### 📋 **Pre-Migration Safety Checklist**

#### Repository Safety
- [ ] **Backup branches created** for both projects
- [ ] **Git tags created** for current production state
- [ ] **Remote backups pushed** to origin repositories
- [ ] **Backup verification** - can restore from backups

#### Data Safety
- [ ] **Sanity dataset exported** with assets
- [ ] **Environment variables backed up** for both projects  
- [ ] **Vercel configuration exported** and documented
- [ ] **API keys documented** and backed up securely

#### Infrastructure Safety
- [ ] **Blue-green environments** set up on Vercel
- [ ] **DNS backup plan** documented
- [ ] **CDN configuration** preserved and documented
- [ ] **Monitoring systems** deployed and tested

#### Team Safety
- [ ] **Migration plan communicated** to all stakeholders
- [ ] **Emergency contacts** identified and informed
- [ ] **Rollback procedures** tested and validated
- [ ] **Communication channels** established for migration updates

#### Testing Safety
- [ ] **Staging environment** identical to production
- [ ] **Health check systems** installed and operational
- [ ] **Performance baselines** established
- [ ] **Automated validation** scripts ready

### 🎯 **Risk Assessment Matrix**

| Risk Level | Component | Impact | Mitigation |
|------------|-----------|---------|------------|
| 🔴 Critical | Sanity CMS Connection | Total content loss | Automated backup + monitoring |
| 🔴 Critical | DNS/Domain Issues | Site unreachable | Blue-green deployment |
| 🟡 High | Import Path Migration | Build failures | Automated scripts + validation |
| 🟡 High | Performance Regression | User experience | Web Vitals monitoring |
| 🟢 Medium | Service Worker | Offline functionality | PWA migration plan |
| 🟢 Low | Development Tools | Developer experience | Tool preservation strategy |

### 📞 **Communication Protocol**

#### Stakeholder Updates
```typescript
// scripts/stakeholder-updates.ts
interface StakeholderUpdate {
  phase: string;
  status: 'started' | 'in-progress' | 'completed' | 'blocked';
  completionPercentage: number;
  risksIdentified: string[];
  nextSteps: string[];
  estimatedCompletion: string;
}

export async function sendStakeholderUpdate(update: StakeholderUpdate) {
  const message = `
🚀 **DinElportal Next.js Migration Update**

**Phase**: ${update.phase}
**Status**: ${update.status}
**Progress**: ${update.completionPercentage}%

**Risks**: ${update.risksIdentified.join(', ') || 'None identified'}
**Next Steps**: ${update.nextSteps.join(', ')}
**ETA**: ${update.estimatedCompletion}

**Health Dashboard**: https://elportal.dk/admin/migration-dashboard
  `;
  
  // Send via your preferred communication method
  await sendSlackUpdate(message);
  await updateJiraTicket(update);
}
```

This comprehensive safety strategy ensures that your migration is bulletproof with multiple layers of protection, instant rollback capabilities, and continuous monitoring to catch issues before they impact users.
