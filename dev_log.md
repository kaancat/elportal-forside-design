# Dev Log

## [2025-10-13] – Blog Hero Section: Magazine-Style Redesign + CMS Integration
Goal: Restructure blog hero section to eliminate awkward gaps and create a more cohesive, magazine-style layout. Integrate title/subtitle with Sanity CMS.

### What Changed - Final Design (Reverted to Single Featured Card)
- ✅ **Layout Flip**: Featured blog card moved from left to right for better visual hierarchy
- ✅ **Vertical Flow**: Title, subtitle, search, and popular topics now stack vertically on the left column
- ✅ **Perfect Alignment**: Added `max-w-xl` constraint to left column with `w-full` on all child sections - title, search field, and popular topics all align perfectly on the right edge
- ✅ **Equal Spacing**: Set `gap-6` between all three sections (title, search, popular topics) for consistent vertical rhythm
- ✅ **Larger Title**: Increased from `text-3xl md:text-4xl lg:text-5xl` to `text-4xl md:text-5xl lg:text-6xl` for better prominence
- ✅ **Consistent Headings**: Both "Filtrer indlæg" and "Populære emner" now use `text-lg font-bold` for visual harmony
- ✅ **Compact Featured Card**: 
  - Grid ratio: **1.2fr : 1fr** (content-emphasis layout with smaller card)
  - Grid alignment: `items-start` for top alignment with title
  - Max width: `max-w-md` (constrains card size)
  - Image aspect ratio: **16:9** (compact, widescreen format)
  - Image optimization: `w=900 q=80`
  - Card title: `text-base lg:text-lg` (compact sizing)
  - Description: `text-sm` with `line-clamp-2`
  - Padding: `p-4 lg:p-5` (reduced for compact feel)
  - Gap: `gap-2.5` (tighter spacing)
  - Button: `size="sm"` with `h-4 w-4` arrow icon
  - **Carousel Arrows**: Positioned on the card itself (`left-3`, `right-3`) instead of outside container
  - **Carousel with arrows & dots** for navigating featured posts
- ✅ **Mobile Optimization**: Carousel hidden on mobile, search & popular topics below
- ✅ **Animation Update**: Changed card animation from `slide-in-from-left-4` to `slide-in-from-right-4` to match new position

### Why This Improves UX
1. **Natural Reading Flow**: Left-to-right reading pattern now flows from title → search → featured content
2. **Eliminates Dead Space**: Compact vertical stacking removes awkward gaps between title and search
3. **Better Visual Hierarchy**: Larger featured card draws attention while maintaining balance
4. **Magazine Aesthetic**: More editorial, professional feel compared to previous layout
5. **Mobile-First**: Ensures search functionality is accessible on all screen sizes

### CMS Integration (Final Update)
- ✅ **Editable Hero Title**: `blogSettings.heroTitle` - first word automatically styled green
- ✅ **Editable Hero Subtitle**: `blogSettings.heroSubtitle` - full control over supporting text
- ✅ **Dynamic Popular Topics**: Re-enabled automatic topic extraction from blog post titles (removed hardcoded dummy data)
- ✅ **Carousel Arrows**: Repositioned onto the card itself (`left-3`, `right-3`) for classic carousel feel
- ✅ **Fallback Values**: Default title/subtitle if not set in CMS

### Files Modified
- `app/blogs/BlogHeroSearch.tsx` - Complete hero section restructure + CMS integration

### Deployment Status
- ✅ **Frontend**: Pushed to GitHub (main branch) - commit `4b72434`
- ✅ **Sanity Studio**: Deployed to https://dinelportal.sanity.studio/
- ✅ **Live URL**: Changes will be visible at https://dinelportal.dk/blogs after Vercel redeploys

---

## [2025-10-13] – Blog Integration: Connect Frontend to Sanity CMS
Goal: Replace hardcoded blog content with dynamic data from Sanity CMS while maintaining exact same design

### TypeScript Type Safety Fixes (Latest Update)
- ✅ FIXED: Resolved TypeScript errors in production build due to `SanityImage.asset` union type
  - Updated `src/hooks/useSiteMetadata.ts` to use type guards when accessing favicon asset
  - Updated `src/lib/sanityAsset.ts` to use type guards for image reference validation
  - Updated `src/lib/backgroundStyles.ts` to use type guards in both `getBackgroundStyle` and `getTextColorClass` functions
  - All instances of `image.asset?._ref` replaced with `(image.asset && '_ref' in image.asset && image.asset._ref)`
  - All instances checking for expanded URLs now use `(image.asset && 'url' in image.asset && image.asset.url)`
  - Production build now succeeds on Vercel

### Runtime Error Fixes (Null Safety & URL Handling)
- ✅ FIXED: Resolved runtime errors during static page generation for blog pages
  - Added null safety checks for `asset.url` in all image URL extractions
  - Changed from `'url' in asset` to `('url' in asset && asset.url)` to handle cases where URL exists but is null
  - Fixed in `app/blogs/page.tsx` (transformBlogPost function and heroBackgroundImage)
  - Fixed in `app/blogs/[slug]/page.tsx` (imageUrl extraction)
  - Fixed query parameter appending to handle URLs with existing query strings
  - `BlogArchive.tsx` and `BlogHeroSearch.tsx` now use conditional `?` vs `&` based on `imageUrl.includes('?')`
  - Prevents malformed URLs like `image.jpg&auto=format` (should be `image.jpg?auto=format`)

### Comprehensive Null Safety Fixes for SanityImage References
- ✅ FIXED: Resolved "Cannot read properties of null (reading 'replace')" errors across entire codebase
  - **Root Cause**: Sanity can return `{asset: {_ref: null}}` - the `_ref` key exists but value is null
  - **Pattern**: Changed all `'_ref' in asset` checks to `'_ref' in asset && asset._ref`
  - **Files Fixed**:
    - `src/components/Footer.tsx` - Fixed footerLogo null _ref access
    - `src/components/Navigation.tsx` - Fixed logo _ref access (2 locations: desktop + mobile nav)
    - `src/components/MetaTags.tsx` - Fixed SEO image _ref access (2 locations)
    - `src/components/OptimizedImage.tsx` - Fixed image optimization _ref access
  - **Impact**: All Sanity image references now safely handle null _ref values with proper fallbacks

### Changes Made:
- ✅ COMPLETED: Updated TypeScript types for blog integration
  - Extended `BlogPost` interface with new schema fields: `type`, `description`, `featuredImage`, `contentBlocks`, `publishedDate`, `featured`, `readTime`, `tags`
  - Added `BlogPageSettings` interface for blog landing page configuration
  - Updated `SanityImage` interface to support expanded asset URLs from GROQ queries
- ✅ COMPLETED: Enhanced `SanityService` with blog-specific queries
  - Updated `getAllBlogPosts()` to fetch from new schema with proper field mappings
  - Updated `getBlogPostBySlug()` to include full content blocks for individual posts
  - Added `getBlogPageSettings()` to fetch hero section and featured posts configuration
  - All queries use `asset->{url}` expansion for immediate image URL access
- ✅ COMPLETED: Transformed `app/blogs/page.tsx` to use Sanity data
  - Created `transformBlogPost()` helper to convert Sanity data to component format
  - Replaced 20+ hardcoded blog posts with dynamic fetch from CMS
  - Implemented fallback logic: uses CMS featured posts if set, otherwise auto-selects latest 3
  - Added default post for graceful handling when no posts exist yet
  - Kept legacy hardcoded data as comments for reference
  - Added ISR revalidation (60 seconds)
- ✅ COMPLETED: Transformed `app/blogs/[slug]/page.tsx` to use Sanity data
  - Added `generateStaticParams()` for static site generation of all blog post pages
  - Replaced hardcoded post lookup with `SanityService.getBlogPostBySlug()`
  - Implemented Danish date formatting for proper locale display
  - Uses CMS `readTime` field or defaults to 5 minutes
  - Added ISR revalidation (60 seconds)
  - Kept legacy data as comments for reference

### Impact:
- **Dynamic Content**: Blog pages now fetch real-time data from Sanity CMS
- **CMS-Managed**: Content editors can create, edit, and manage blog posts entirely through Sanity Studio
- **Design Preservation**: Exact same UI/UX - no visual changes, only data source changed
- **Performance**: ISR with 60-second revalidation ensures fast page loads while staying up-to-date
- **Static Generation**: All blog post pages are pre-generated at build time for optimal performance
- **Graceful Fallbacks**: Handles edge cases like missing images, no posts, or missing settings

### Frontend Architecture:
```
/blogs → Fetches blogPageSettings + all posts → Displays archive + hero
/blogs/[slug] → Fetches individual post by slug → Displays full article
```

### Next Steps (Future Implementation):
- Render `contentBlocks` array in individual blog posts (currently showing placeholder content)
- Use existing content block renderer from regular pages
- Add metadata/SEO tags from blog post and page settings
- Consider adding blog post tags/filtering if needed

### Files Modified:
- `src/types/sanity.ts` - Updated BlogPost & SanityImage interfaces, added BlogPageSettings
- `src/services/sanityService.ts` - Enhanced blog queries with proper GROQ projections
- `app/blogs/page.tsx` - Transformed to fetch from Sanity with fallbacks
- `app/blogs/[slug]/page.tsx` - Transformed to fetch individual posts with SSG

---

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

