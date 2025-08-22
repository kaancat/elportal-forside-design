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


