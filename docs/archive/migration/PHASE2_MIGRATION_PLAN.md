# Phase 2 Migration Plan - DinElportal

## Status: Ready to Begin
**Date**: February 18, 2025  
**Phase 1 Status**: ✅ Complete and Stable  
**Codex Assessment**: "Ready for Phase 2 - Foundation is stable"

## Executive Summary
Phase 2 will progressively migrate pages from React Router to Next.js App Router while maintaining zero downtime. The approach prioritizes high-value pages, performance optimizations, and SEO improvements.

## Phase 2 Objectives
1. **Migrate core pages** to App Router for better performance
2. **Implement Next.js optimizations** (Image, Font, ISR)
3. **Enhance SEO** with proper metadata and sitemap generation
4. **Optimize data fetching** with React Server Components
5. **Maintain zero downtime** throughout migration

## Migration Timeline (8 Weeks)

### Weeks 1-2: Foundation & Homepage
**Goal**: Establish patterns and fully migrate homepage

#### Tasks:
- [ ] Convert homepage from dynamic import to proper App Router page
- [ ] Implement `next/font` for Inter and Geist fonts
- [ ] Replace `<img>` with `next/image` for hero images
- [ ] Create shared layout components
- [ ] Add `generateMetadata` for homepage SEO
- [ ] Set up error boundaries (`error.tsx`)

#### Files to Create:
```
app/
├── (marketing)/
│   ├── layout.tsx         # Marketing pages layout
│   └── page.tsx           # Homepage (migrated)
├── fonts.ts               # Font configuration
└── components/
    └── NextImage.tsx      # Image wrapper component
```

### Weeks 3-4: High-Traffic Pages
**Goal**: Migrate business-critical pages

#### Priority Pages:
1. **Electricity Prices** (`/elpriser`)
   - High traffic, real-time data
   - Implement ISR with 5-minute revalidation
   - Add price comparison metadata

2. **Provider Comparison** (`/sammenlign`)
   - Core conversion page
   - Optimize provider data fetching
   - Implement proper caching

3. **Green Energy** (`/groen-energi`)
   - SEO-important page
   - Static generation with on-demand revalidation

#### Implementation Pattern:
```typescript
// app/(marketing)/elpriser/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aktuelle Elpriser - DinElportal',
  description: 'Se dagens elpriser i Danmark...',
}

export const revalidate = 300 // 5 minutes

export default async function ElectriciPricesPage() {
  const prices = await fetchPrices() // Server-side
  return <PricesDisplay prices={prices} />
}
```

### Weeks 5-6: Data & Performance
**Goal**: Optimize data fetching and caching

#### Tasks:
- [ ] Convert Sanity queries to React Server Components
- [ ] Implement tag-based revalidation for CMS content
- [ ] Add Vercel KV caching at component level
- [ ] Optimize API routes with Edge Runtime where appropriate
- [ ] Implement streaming for large data sets

#### Caching Strategy:
```typescript
// lib/sanity.server.ts
export async function getPageContent(slug: string) {
  return unstable_cache(
    async () => client.fetch(query, { slug }),
    [`page-${slug}`],
    {
      revalidate: 3600,
      tags: [`page:${slug}`, 'pages']
    }
  )()
}
```

### Weeks 7-8: Cleanup & Optimization
**Goal**: Complete migration and remove legacy code

#### Final Tasks:
- [ ] Migrate remaining pages
- [ ] Port API routes from `/api` to `/app/api`
- [ ] Remove React Router dependencies
- [ ] Deprecate Vite build system
- [ ] Update documentation
- [ ] Performance audit and optimization

## Technical Implementation Details

### 1. Route Structure
```
app/
├── (marketing)/          # Public pages
│   ├── layout.tsx
│   ├── page.tsx         # Homepage
│   ├── elpriser/
│   ├── sammenlign/
│   └── groen-energi/
├── (auth)/              # Protected pages
│   ├── layout.tsx
│   └── admin/
├── api/                 # API routes
│   ├── prices/
│   ├── providers/
│   └── revalidate/
└── (legal)/            # Legal pages
    ├── layout.tsx
    ├── privacy/
    └── terms/
```

### 2. Data Fetching Patterns

#### Server Components (Default)
```typescript
// Fetch data on server, no client-side state needed
async function ServerComponent() {
  const data = await fetchData()
  return <Display data={data} />
}
```

#### Client Components (Interactive)
```typescript
'use client'
// For interactive features requiring hooks/browser APIs
function ClientComponent() {
  const [state, setState] = useState()
  return <Interactive />
}
```

#### Hybrid Approach
```typescript
// Server component fetches data
async function PageWrapper() {
  const initialData = await fetchData()
  return <ClientChart initialData={initialData} />
}
```

### 3. SEO Enhancements

#### Dynamic Metadata
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const page = await getPage(params.slug)
  return {
    title: page.seoTitle,
    description: page.seoDescription,
    openGraph: {
      images: [page.ogImage],
    },
  }
}
```

#### Sitemap Generation
```typescript
// app/sitemap.ts
export default async function sitemap() {
  const pages = await getAllPages()
  return pages.map(page => ({
    url: `https://elportal.dk/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'daily',
    priority: page.priority,
  }))
}
```

### 4. Performance Optimizations

#### Image Optimization
```typescript
import Image from 'next/image'

<Image
  src={urlFor(image).url()}
  alt={image.alt}
  width={1200}
  height={630}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={image.lqip}
/>
```

#### Font Optimization
```typescript
// app/fonts.ts
import { Inter, GeistSans } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
```

## Migration Checklist

### Per-Page Migration Steps
1. [ ] Create new page in `app/(category)/[page]/page.tsx`
2. [ ] Implement `generateMetadata` for SEO
3. [ ] Convert data fetching to server components
4. [ ] Add proper error handling with `error.tsx`
5. [ ] Implement loading states with `loading.tsx`
6. [ ] Add revalidation strategy (ISR/on-demand)
7. [ ] Update internal links to use `next/link`
8. [ ] Test page functionality
9. [ ] Remove old React Router version
10. [ ] Monitor Core Web Vitals

## Success Metrics

### Performance
- [ ] LCP < 2.5s (from current ~3s)
- [ ] INP < 200ms (from current ~250ms)
- [ ] CLS < 0.1 (maintain current)
- [ ] Bundle size reduction > 20%

### SEO
- [ ] All pages have proper metadata
- [ ] Dynamic sitemap generation
- [ ] Structured data on all pages
- [ ] Improved crawl efficiency

### Developer Experience
- [ ] Simplified codebase
- [ ] Type-safe data fetching
- [ ] Better error boundaries
- [ ] Improved build times

## Risk Mitigation

### Rollback Strategy
- Keep Vite build available until Week 8
- Feature flags for new vs old pages
- Gradual rollout with monitoring
- A/B testing on migrated pages

### Monitoring
- Real User Monitoring (RUM) for performance
- Error tracking with Sentry
- Analytics for conversion impact
- SEO ranking monitoring

## Phase 2 Completion Criteria
- [ ] All high-traffic pages migrated
- [ ] Core Web Vitals targets met
- [ ] Zero increase in error rates
- [ ] Positive or neutral conversion impact
- [ ] Vite build system deprecated
- [ ] Documentation updated

## Next Steps
1. Review plan with team
2. Set up monitoring dashboards
3. Begin Week 1 tasks
4. Daily progress updates
5. Weekly performance reviews

---

## Appendix: Codex Recommendations

### Critical Points from Codex Review:
- Foundation is stable and ready for incremental migration
- Dual-build system properly separated
- Environment variables properly handled
- API routes protected from SPA rewrites
- Security headers updated to modern standards

### Specific Codex Suggestions:
1. Start with 2-3 high-value pages
2. Implement next/font and next/image early
3. Use ISR for data-heavy pages
4. Consider CSP nonce approach for security
5. Port API routes gradually to app/api
6. Monitor react-denmark-map compatibility

### Codex Assessment Quote:
> "Overall: Ready. Core is stable, safe, and incremental migration can begin without disrupting current behavior."

---

*Document Version: 1.0*  
*Last Updated: February 18, 2025*  
*Status: Approved for Implementation*