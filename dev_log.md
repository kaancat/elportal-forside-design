# Dev Log

## [2025-08-22] – Session Start
Goal: Fix per-slug caching, validate slugs, and consolidate routing to App Router

- Implemented per-slug cache keys for dynamic pages using `unstable_cache` to prevent cross-slug responses.
- Added debug logging in `src/server/sanity.ts#getPageBySlug` to trace slug lookups and missing pages in non-production.
- Validated navigation slugs vs Sanity using `npm run navigation:health`; all links valid, 3 orphaned pages reported.
- Consolidated routing by removing `app/(ssr)/__ssr/[slug]/page.tsx` and simplifying `middleware.ts` so `app/[slug]/page.tsx` handles dynamic pages directly.
- Linted updated files; no new linter issues.
- Type-check run shows pre-existing project-level TS references issues (TS6305/TS6306/TS6310) unrelated to the edits; no new type errors attributable to this session.

TO VERIFY
- Ensure ISR revalidation via existing webhook(s) covers `page` tags after publish in Sanity.
- Monitor logs for missing pages after consolidation; add GROQ broadening if non-`page` types are required.
- Consider removing legacy SPA-only rewrites as we migrate remaining pages.

---

## [2025-08-22] – Update
Goal: Navigation correctness and routing unification

- Action: Fixed cache key bug; removed duplicate `__ssr` route; middleware now defers to `[slug]` for non-SPA paths.
- Impact: Correct content per slug; simpler routing path; navigation links resolve consistently.
- NOTE: Navigation health report shows 3 orphaned pages: `/om-os`, `/energibesparende-tips`, and one item with null slug; clean up in Sanity if unintended.












## [2025-09-04] – Update
Goal: Fix Eloverblik authorization start on `/forbrug-tracker`

- Action: Updated client to read API envelope: `ForbrugTracker` now reads `sessionId` and `authorizationUrl` from `res.data` when present, matching App Router API responses.
- Action: Added development/preview fallback signing key in `src/server/session-helpers.ts#getSigningKey` to prevent 500s when `ELPORTAL_SIGNING_KEY` is missing; logs a warning in non‑prod.
- Impact: Clicking “Forbind med Eloverblik” initializes a session and opens the authorization URL; avoids session init failures in Preview without leaking secrets.
- NOTE: In production, ensure `ELPORTAL_SIGNING_KEY`, `KV_REST_API_URL`, and `KV_REST_API_TOKEN` are configured. The fallback is ignored in production.

TO VERIFY
- Run end‑to‑end on Preview: confirm `/api/auth/session` returns `{ ok: true, data: { sessionId } }` and that redirect is triggered.
- After authorization callback is wired, verify `/api/auth/session?action=verify` returns `authenticated: true` and `hasAuthorization: true`.

## [2025-09-04] – Update
Goal: Restore scrollable (sticky) image behavior for `pageSection` and align data fetching with Vite

- Action: Expanded centralized GROQ `pageProjection` for `_type == "pageSection"` to include `theme->{ background, text, primary }`, full `settings { theme, padding, fullWidth, textAlignment, separator, layoutRatio, verticalAlign, stickyImage }`, and mapped `cta { text, url }`.
- Action: Verified `PageSectionComponent` and `StickyImageSection` already respect `settings.stickyImage` to enable scrollable image behavior; data path now hydrated correctly.
- Impact: Page sections with the Sanity toggle for sticky/scrollable images behave as on the Vite production site; CTA links resolve via `cta.url`.
- NOTE: Keep `pageProjection` as the single source of truth for pages; ensure both `getHomePage` and `getPageBySlug` queries use it (they do).

TO VERIFY
- Smoke test a page with `pageSection.settings.stickyImage = true` and an image present; confirm sticky behavior on desktop and graceful fallback on mobile.
- Confirm `cta.url` navigates correctly for sections that include a CTA.

## [2025-10-07] – Update
Goal: Create Next.js-compliant .env.local and remove Vite prefixes

- Action: Added `env.local` with deduplicated variables using NEXT_PUBLIC_* for client and server-only for secrets; normalized `SITE_URL`, `KV_*`, `ELPORTAL_SIGNING_KEY`, `SANITY_*`, and analytics IDs.
- Action: Mapped legacy Vite vars: `VITE_SANITY_*` → `NEXT_PUBLIC_SANITY_*`; removed Vite prefixes from any sensitive tokens.
- Impact: Next.js reads env at build/runtime without leaking secrets to the client. Local dev now works with `npm run dev` using `env.local`.
- TO VERIFY: Visit `/api/health` and confirm `eloverblikToken` and `kvUrl` flags; load homepage to ensure Sanity reads succeed; test SSR flag by toggling `NEXT_PUBLIC_PHASE2_SSR=false`.
- NOTE: `SMITHERY_API_KEY` is not referenced in the code currently; kept out of env by default. If needed later, add server-side only.

## [2025-10-07] – Update
Goal: Add Blog link and placeholder page

- Action: Injected local "Blog" nav link between "Leverandører" and the mega menu in `src/components/Navigation.tsx`; non-destructive (does not mutate CMS).
- Action: Created empty placeholder page at `app/blogs/page.tsx`.
- Impact: Header now shows "Blog" linking to `/blogs`; page renders an empty container for now.
- TO VERIFY: Start dev server and confirm the new link appears between the specified items and navigates to `/blogs`.

## [2025-10-10] – Update
Goal: Replace blog placeholder images with energy-relevant themes

- Action: Updated all blog post images in `app/blogs/page.tsx` and `app/blogs/[slug]/page.tsx` from forest/nature themes to energy-specific imagery.
- Action: New images showcase: wind turbines, solar panels, EV charging stations, smart home devices, electricity infrastructure, heat pumps, power meters, and energy-related visuals.
- Action: Updated image alt texts to Danish descriptions matching the new energy themes.
- Impact: Blog archive and individual post pages now display contextually relevant imagery that aligns with DinElPortal's electricity/energy focus instead of generic nature photos.
- NOTE: All changes limited to `/blogs` route and subpages only; no modifications to other parts of the application.

