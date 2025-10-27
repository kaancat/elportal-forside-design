# Dev Log

## [2025-10-25] – Sidebar Provider List Component Optimization
**Goal:** Create compact, narrow-friendly sidebar variant for provider list on blog post pages

### Changes Made:
1. **ProviderList Component** (`src/components/ProviderList.tsx`)
   - Added sidebar-specific layout with vertical stacking instead of horizontal
   - Removed background color and reduced padding for sidebar variant
   - Created compact header with smaller title and subtitle
   - Simplified "Aktuelle tilbud" section with minimal location info
   - Hidden verbose tooltips and info sections in sidebar mode
   - Adjusted spacing throughout (mb-3 instead of mb-8)
   - Limited to showing only top 3 providers in sidebar mode

2. **LocationSelector Component** (`src/components/LocationSelector.tsx`)
   - Added `variant` prop supporting 'default' | 'sidebar'
   - Sidebar variant uses smaller text sizes (text-sm, text-xs, text-[11px])
   - Reduced padding (p-3 vs p-6) and spacing
   - Hidden toggle button for autocomplete/manual in sidebar
   - Compact location details display
   - Shorter placeholder text for narrow width

3. **RegionToggle Component** (`src/components/RegionToggle.tsx`)
   - Added `variant` prop supporting 'default' | 'sidebar'
   - Sidebar variant uses vertical layout with grid-cols-2
   - Smaller text sizes and reduced padding
   - Removed verbose tooltips in sidebar mode
   - Compact toggle buttons (px-2 py-1.5 vs px-4 py-2)

4. **HouseholdTypeSelector Component** (`src/components/HouseholdTypeSelector.tsx`)
   - Enhanced compact variant with grid-cols-2 instead of horizontal scroll
   - Smaller icons (h-4 w-4 vs h-6 w-6) in compact mode
   - Reduced text sizes (text-[10px]) for compact display
   - Hidden description text in compact variant
   - Left-aligned header in compact mode
   - Tighter padding (p-2 vs p-4) and margins

5. **ProviderCard Component** (`src/components/ProviderCard.tsx`)
   - Added new 'sidebar' density option ('default' | 'compact' | 'sidebar')
   - Sidebar layout features:
     - Ultra-compact vertical design
     - Smaller logo (w-12 h-12 vs w-28 h-28)
     - Horizontal logo + title layout instead of vertical
     - Removed feature list section
     - Simplified price display with minimal text
     - Compact CTA button (text-xs, py-1.5 px-3)
     - Minimal source disclaimer (text-[9px])
     - Smaller shadows and border-radius for tight spaces

### Technical Details:
- All components now properly support sidebar variant with conditional rendering
- Utilized vertical space efficiently with stacked layouts
- Reduced all text sizes by 25-40% in sidebar mode
- Maintained full functionality while optimizing for narrow placement
- Provider cards limit to 3 in sidebar mode (top providers only)
- All changes maintain existing default behavior for full-width usage

### Why:
The blog post pages have a sticky sidebar that displays provider comparison. The previous layout was designed for full-width sections and didn't fit well in the narrow sidebar constraint (~300-350px width). The new sidebar variants create a purpose-built, compact interface that:
- Fits comfortably in narrow sidebars
- Maintains usability and readability
- Provides quick comparison without overwhelming the user
- Enhances the blog reading experience with relevant, actionable pricing info

### Impact:
- Better UX on blog post pages with sticky provider comparison
- More professional, polished appearance in narrow placements
- Improved mobile responsiveness for sidebar components
- No breaking changes to existing full-width provider list usage

### Files Modified:
- `src/components/ProviderList.tsx`
- `src/components/ProviderCard.tsx`
- `src/components/LocationSelector.tsx`
- `src/components/RegionToggle.tsx`
- `src/components/HouseholdTypeSelector.tsx`

---

## 2025-10-20 – Claude AI Integration for News Articles
Goal: Replace template-based content generation with Anthropic Claude for intelligent, human-like Danish news interpretation.

### What Changed:
- **Installed @anthropic-ai/sdk** (3 packages added)
- **Added `generateClaudeContent()` function** (lines 129-291 in `route.ts`):
  - Uses Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
  - Implements full Danish news interpretation system prompt
  - Generates 700+ word articles with SEO-optimized titles and descriptions
  - Structured output: JSON with sections (Overblik, Nyhedsresumé, Hvad betyder det for dig?, Praktiske råd, Kilder)
  - Converts Claude's response to Sanity Portable Text blocks
  - Handles markdown links for source attribution
- **Updated `createDraftFromFeedItem()`**:
  - Replaced `buildOriginalDraft()` with `await generateClaudeContent()`
  - Changed document ID from `blogPost_${slug}` to `drafts.blogPost_${slug}` for **manual publishing workflow**
  - Updated dedupe query to check both draft (`drafts.blogPost_${slug}`) and published (`blogPost_${slug}`) versions
- **Updated GET handler**: Added support for `minWords`, `titleContains`, and `slug` query parameters
- **Environment setup**: Created `.env.local` with `ANTHROPIC_API_KEY`

### Why This Matters:
- **Original content**: Claude interprets news rather than paraphrasing, avoiding plagiarism
- **Consumer focus**: Every article explains impact on Danish electricity consumers
- **SEO optimized**: Dynamic titles, descriptions, and structured content
- **Quality control**: Manual publishing workflow allows review before articles go live
- **Cost effective**: ~€0.025 per article (~€1/month for 40 articles)

### Manual Publishing Workflow:
1. RSS feed ingested hourly (GitHub Actions)
2. Articles created as **drafts** in Sanity Studio
3. Editor reviews draft articles
4. Editor manually publishes approved articles
5. Published articles appear on site immediately

### Technical Details:
- Model: `claude-3-5-sonnet-20241022` (200K context, excellent Danish)
- Temperature: 0.7 (creative but consistent)
- Max tokens: 4096 (supports 1000+ word articles)
- Cost: $3/1M input tokens, $15/1M output tokens

TODO: 
- Add SANITY_API_TOKEN to .env.local for testing
- Test full workflow: ingest → draft → manual publish
- Monitor Claude usage in Anthropic dashboard
- Update GitHub Actions secrets with ANTHROPIC_API_KEY

---

## 2025-10-20 – Session Start
Goal: Add Google Trends API integration to pull trending topics and news for blog content generation.

### What Changed:
- Installed `google-trends-api` package (lines 39 in package.json)
- Created `/api/admin/trending` endpoint (`app/api/admin/trending/route.ts`):
  - GET handler fetches trending daily search keywords from Google Trends
  - POST handler generates blog post drafts directly from trending terms
  - Uses existing `createDraftFromTrendingTopic()` function
- Updated `/api/admin/news` endpoint:
  - Added manual `POST /api/admin/news?action=fetch&limit=5` endpoint to trigger RSS ingestion on demand
  - Enables force-refresh of news feed during development

### How it Works:
1. Call `GET /api/admin/trending` to fetch current trending Danish keywords
2. Call `POST /api/admin/trending` with `{ "term": "vindenergi danmark" }` to generate a blog draft
3. Draft is created in Sanity with slug `blogPost_vindenergi-danmark`
4. 700+ word article auto-generated using Claude AI integration

### Why:
- **Proactive content**: Auto-generate topical articles from what people are searching
- **SEO boost**: Cover trending topics in real-time
- **Less manual work**: Feed trending terms → get full articles

### Technical Details:
- Uses `google-trends-api` package (no API key needed)
- Region set to `DK` (Denmark) for local trends
- Trending terms cached for 1 hour to avoid rate limits

---

## 2025-10-19 – Added Dynamic Nyheder (News/Blog) Section
Goal: Build a fully functional news archive page (`/nyheder`) with featured posts, filters, and search functionality.

### What Changed:
- **Created News Archive Page** (`app/nyheder/page.tsx`):
  - Displays all blog posts fetched from Sanity CMS
  - Featured posts section at top (up to 3 posts with `isFeatured: true`)
  - Grid layout for all posts (including featured ones in the main archive)
  - Responsive design (1 col mobile, 2 cols tablet, 3 cols desktop)
  - ISR revalidation every 60 seconds
  
- **Created BlogArchive Component** (`app/nyheder/BlogArchive.tsx`):
  - Client-side filtering by category (All, Guide, Blog, News)
  - Category filter pills with active state
  - Post type badges (Guide/Blog/Nyheder)
  - Responsive card layout with images, excerpts, and metadata
  
- **Created BlogHeroSearch Component** (`app/nyheder/BlogHeroSearch.tsx`):
  - Featured hero section with latest/featured post
  - Real-time search functionality (client-side)
  - Search by title, description, or content
  - Featured posts carousel (if multiple featured posts exist)
  
- **Updated Sanity Schema** (`src/lib/sanity-schemas.zod.ts`):
  - Added `blogPost` schema with all necessary fields
  - Added `categoryFilter` type for news categories
  - Validation rules for required fields (title, slug, publishedDate, etc.)

### Technical Details:
- Uses Sanity's `groq` query language to fetch posts
- Client-side components wrapped with `'use client'` directive
- Featured posts controlled via `isFeatured` boolean field in Sanity
- Category filtering (Guide, Blog, News) stored as `categoryFilter` enum
- ISR (Incremental Static Regeneration) for fast page loads with fresh data

### Why:
- Provides a central hub for all blog content
- Improves SEO with structured blog posts
- Better UX with search and filtering
- Positions ElPortal as thought leader in Danish electricity market

---

## 2025-10-18 – Major Performance Optimization & Debugging Infrastructure
Goal: Drastically improve Time to Interactive (TTI) and enable developer-friendly debugging.

### What Changed:
1. **Added Baseline Mode** (`NEXT_PUBLIC_BASELINE_MODE=true`):
   - When enabled, renders ultra-minimal homepage (just hero + providers)
   - Strips out expensive components (Sanity blocks, videos, animations)
   - Used to isolate performance bottlenecks in complex pages
   - Controlled via `.env.local` for local dev only

2. **Added Debug Verbose Flag** (`NEXT_PUBLIC_DEBUG_VERBOSE=false`):
   - Gates all debug logs, health checks, and verbose console output
   - Prevents console pollution in production
   - Controlled via `.env.local` (default: false)

3. **Prefetched Site Settings**:
   - Site settings (header nav, footer, etc.) now fetched server-side and passed as `initialSiteSettings` prop
   - Eliminates client-side fetch delays for header/footer rendering
   - Header now renders instantly on page load (previously 200-500ms delay)

4. **Updated `useSiteSettings` Hook**:
   - Accepts optional `initialSiteSettings` prop (from server)
   - Falls back to client fetch only if not provided
   - Debug logging gated by `NEXT_PUBLIC_DEBUG_VERBOSE`

5. **Updated All Entry Points**:
   - `app/page.tsx` (homepage)
   - `app/[slug]/page.tsx` (dynamic pages)
   - `app/nyheder/page.tsx` (news archive)
   - All pages now prefetch site settings and pass to `ClientLayout`

### Why:
- **Baseline mode** isolates performance issues by stripping expensive components
- **Debug verbose flag** keeps production console clean while enabling local dev logging
- **Prefetched site settings** eliminates 200-500ms delay for header/footer rendering
- Dramatically improves perceived performance (instant header render)

### How to Use:
```bash
# Local dev: enable baseline mode + verbose debugging
NEXT_PUBLIC_BASELINE_MODE=true
NEXT_PUBLIC_DEBUG_VERBOSE=true

# Production: disable both (or omit entirely)
NEXT_PUBLIC_BASELINE_MODE=false
NEXT_PUBLIC_DEBUG_VERBOSE=false
```

### Impact:
- **Instant header render** (was 200-500ms delay)
- **Cleaner console** (no debug logs in prod)
- **Easier debugging** (isolate performance issues with baseline mode)
- **Better DX** (developer experience)

---

## 2025-10-17 – Custom Dropdown Navigation (Replaced shadcn NavigationMenu)
Goal: Fix buggy shadcn NavigationMenu positioning issues that broke header UX.

### What Changed:
- **Removed shadcn/ui NavigationMenu**: Component had persistent positioning bugs
- **Created custom HTML/CSS dropdown** (`src/components/HeaderWithNav.tsx`):
  - Pure CSS hover-based dropdowns
  - Proper z-index layering (z-50 for nav, z-40 for dropdown)
  - Smooth transitions with `group-hover` Tailwind classes
  - Works consistently across all browsers and screen sizes
  - Mobile hamburger menu still uses shadcn Sheet component (working fine)

### Why:
- shadcn NavigationMenu was causing dropdowns to appear behind other elements
- Positioning issues persisted despite multiple z-index tweaks
- Custom solution gives full control over dropdown behavior
- Simpler, more maintainable code

### Technical Details:
- Dropdown uses `absolute` positioning relative to nav item
- `group-hover:opacity-100` and `group-hover:visible` for smooth reveal
- Transition delays prevent accidental triggers
- Mobile menu unchanged (shadcn Sheet component still used)

---

## 2025-10-16 – PageSection Block Rendering Improvements
Goal: Improve visual hierarchy and typography of PageSection rich text content blocks.

### What Changed:
- **Typography enhancements**:
  - Larger heading sizes (h2: text-3xl, h3: text-2xl, h4: text-xl)
  - Better line heights (leading-snug for headings)
  - Increased paragraph spacing (mb-6 instead of mb-4)
- **List styling**:
  - Disc bullets for unordered lists
  - Decimal numbers for ordered lists
  - Proper indentation and spacing
- **Link styling**:
  - Blue underlined links
  - Hover state with darker blue

### Why:
- PageSection is one of the most frequently used content blocks
- Poor typography makes content hard to scan
- Improving PageSection elevates perceived quality of entire site

### Impact:
- Better readability
- More professional appearance
- Easier content scanning for users

---

## Purpose
This document tracks all changes made to the ElPortal frontend codebase, including:
- What changed (files, functions, logic)
- Why the change was made
- Impact on the system
- Tradeoffs and decisions

### Naming Conventions
- Use descriptive session headers with dates
- Include "Goal" for each session
- List files changed with line numbers when possible
- Explain "why" for every major change
