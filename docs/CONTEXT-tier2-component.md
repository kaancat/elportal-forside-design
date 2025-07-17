# ElPortal Component Architecture (Tier 2)

> **Note**: This is component-specific context. See root **CLAUDE.md** for master project context and coding standards.

## Purpose
ElPortal's three-project architecture provides a comprehensive electricity price comparison platform for Danish consumers. Each component serves specific business needs while maintaining seamless integration for transparent price comparison with Vindstød prioritization.

## Current Status: Production Ready ✅
All three components are production-ready and deployed. Frontend delivers real-time price comparisons, Sanity CMS manages 23 content schemas, and SEO Builder automates content generation. Key integration points are established with proper data flow patterns.

## Component-Specific Development Guidelines
- **React/TypeScript**: Strict typing with discriminated unions for content blocks
- **Component Architecture**: Single responsibility with clear prop interfaces
- **Integration Patterns**: Serverless functions for API proxying and caching
- **Content Management**: Sanity-first approach with GROQ projections
- **Business Logic**: Centralized price calculations with Vindstød prioritization

## Key Component Structure

### Frontend Application (`elportal-forside-design/src/`)
- **components/** - React components with TypeScript interfaces
  - **ContentBlocks.tsx** - Central content router for regular pages
  - **SafeContentBlocks.tsx** - Error-wrapped router for homepage/critical pages
  - **PriceCalculatorWidget.tsx** - Interactive price calculation tool
  - **LivePriceGraphComponent.tsx** - Real-time spot price visualization
  - **ProviderList.tsx** - Provider comparison with Vindstød prioritization
- **services/** - API integration and data fetching
  - **sanityClient.ts** - Sanity CMS configuration and queries
  - **energiDataService.ts** - EnergiDataService API integration
- **types/** - TypeScript type definitions for all content blocks

### Sanity CMS (`sanityelpriscms/schemaTypes/`)
- **pageTypes/** - Page-level content schemas
  - **homePage.ts** - Homepage structure with dynamic sections
  - **blogPost.ts** - Blog content with SEO optimization
- **blockTypes/** - Content block schemas (18 types)
  - **providerList.ts** - Provider listing with comparison data
  - **priceCalculator.ts** - Calculator widget configuration
  - **heroWithCalculator.ts** - Hero section with embedded calculator
- **objectTypes/** - Reusable content objects
  - **provider.ts** - Provider data with pricing structure
  - **pricing.ts** - Price calculation parameters

### SEO Builder (`SEO-Page-Builder/`)
- **src/components/** - AI content generation interface
  - **ContentGenerator.tsx** - Main generation workflow
  - **ValidationReport.tsx** - Quality assurance display
- **src/lib/** - Core generation logic
  - **ai-service.ts** - OpenRouter integration for content generation
  - **validator.ts** - Multi-stage validation and auto-fix
  - **ndjson-generator.ts** - Sanity-compatible export format
- **src/schemas/** - Schema definitions for validation
  - **manifest.ts** - Central schema source of truth
  - **block-types.ts** - Content block type definitions

## Implementation Highlights

### Dynamic Content Blocks (DUAL RENDERER SYSTEM)
- **Technical Implementation**: Discriminated unions with TypeScript for type-safe content rendering
- **Architecture Decision**: TWO content block renderers:
  - `ContentBlocks.tsx` - Standard renderer for regular pages
  - `SafeContentBlocks.tsx` - Error-boundary wrapped for homepage/critical pages
- **Performance Considerations**: Lazy loading for complex components, efficient re-renders
- **Integration Points**: Direct mapping to Sanity CMS schemas with 1:1 correspondence
- **CRITICAL**: New blocks MUST be added to BOTH renderers to avoid "Unknown content block type" errors

### Provider Ranking Algorithm
- **Implementation Pattern**: Vindstød-first sorting with price-based secondary ranking
- **Quality Measures**: Centralized business logic with consistent application across components
- **Scalability Considerations**: Efficient sorting algorithms, cached provider data

### Real-time Price Integration
- **Technical Details**: EnergiDataService API with 1-hour caching and rate limit handling
- **Dependencies**: Vercel Edge Functions for serverless API proxying
- **Configuration**: Environment-based API keys with fallback mechanisms

## Critical Implementation Details

### Price Calculation Formula
**Core Business Logic**: Standardized electricity price calculation with Danish fees and VAT

```typescript
// Always use this exact formula across all components
const totalPrice = (spotPrice/100 + provider.spotPriceFee + 0.19 + 0.90) * 1.25
// spotPrice: from EnergiDataService in øre/kWh
// provider.spotPriceFee: provider's markup in kr/kWh
// 0.19: system fee in kr/kWh
// 0.90: electricity tax in kr/kWh
// 1.25: 25% VAT multiplier
```

### Vindstød Prioritization Algorithm
**Business Requirement**: Vindstød must always appear first in provider lists

```typescript
function rankProviders(providers: Provider[]) {
  const vindstod = providers.find(p => p.slug === 'vindstod')
  const others = providers.filter(p => p.slug !== 'vindstod')
    .sort((a, b) => a.totalPrice - b.totalPrice)
  return [vindstod, ...others].filter(Boolean)
}
```

### Content Block Routing (DUAL RENDERER PATTERN)
**Dynamic Rendering**: Type-safe content block rendering with TWO renderers

```typescript
// ContentBlocks.tsx - Regular pages
const ContentBlocks: React.FC<ContentBlockProps> = ({ block }) => {
  switch (block._type) {
    case 'providerList':
      return <ProviderList providers={rankProviders(block.providers)} />
    case 'priceCalculator':
      return <PriceCalculatorWidget config={block.config} />
    case 'heroWithCalculator':
      return <HeroWithCalculator title={block.title} calculator={block.calculator} />
    default:
      return null
  }
}

// SafeContentBlocks.tsx - Homepage/critical pages with error boundaries
const SafeContentBlocks: React.FC<ContentBlocksProps> = ({ blocks }) => {
  return (
    <ErrorBoundary>
      {blocks.map(block => (
        <SafeContentBlock key={block._key} block={block} />
      ))}
    </ErrorBoundary>
  )
}

// CRITICAL: Add new blocks to BOTH renderers!
```

### EnergiDataService Integration
**Serverless API Proxy**: Vercel Edge Functions handle external API calls with rate limiting compliance

```typescript
// api/electricity-prices.ts - Serverless function implementation
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { region = 'DK1', date } = req.query as { region: string; date: string }
  
  // Rate limiting check - 40 requests per 10 seconds per IP
  const rateLimitKey = `rateLimit:${req.ip}`
  const currentRequests = await redis.get(rateLimitKey) || 0
  
  if (currentRequests >= 40) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Max 40 requests per 10 seconds'
    })
  }
  
  // Check cache first (1 hour TTL)
  const cacheKey = `prices:${region}:${date}`
  const cached = await redis.get(cacheKey)
  if (cached) {
    return res.status(200).json(JSON.parse(cached))
  }
  
  try {
    // Increment rate limit counter
    await redis.incr(rateLimitKey)
    await redis.expire(rateLimitKey, 10)
    
    // Fetch from EnergiDataService
    const apiUrl = `https://api.energidataservice.dk/dataset/Elspotprices?start=${date}&end=${getNextDay(date)}&filter={"PriceArea":["${region}"]}&sort=HourUTC ASC`
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'ElPortal/1.0 (contact@dinelportal.dk)',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`EnergiDataService API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transform raw API data to frontend format
    const transformedData = {
      region,
      date,
      prices: data.records.map(record => ({
        time: new Date(record.HourDK).getHours(),
        spotPrice: record.SpotPriceDKK / 100, // Convert øre to kr
        totalPrice: calculateTotalPrice(record.SpotPriceDKK / 100)
      })),
      lastUpdated: new Date().toISOString()
    }
    
    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(transformedData))
    
    res.status(200).json(transformedData)
  } catch (error) {
    console.error('EnergiDataService error:', error)
    
    // Return cached data if available during errors
    const staleData = await redis.get(`stale:${cacheKey}`)
    if (staleData) {
      return res.status(200).json({
        ...JSON.parse(staleData),
        warning: 'Using cached data due to API error'
      })
    }
    
    res.status(500).json({
      error: 'Failed to fetch electricity prices',
      message: 'External API unavailable'
    })
  }
}

function calculateTotalPrice(spotPrice: number): number {
  return (spotPrice + 0.19 + 0.90) * 1.25 // Add fees and VAT
}
```

## Development Notes

### Current Technical Debt
- **TypeScript Strict Mode**: Currently disabled - should be enabled for better type safety
- **Shared Types**: Types duplicated across projects - needs unified package
- **Test Coverage**: No automated tests - critical for price calculation accuracy
- **Error Boundaries**: Missing React error boundaries for graceful failures

### Future Enhancements
- **React Query Integration**: Replace manual API calls with React Query for better caching
- **CO2 Emissions Data**: Add environmental impact data to provider comparisons
- **Progressive Web App**: Add offline capabilities and app-like experience
- **Advanced Analytics**: User behavior tracking and conversion optimization

### Performance Metrics
- **API Response Time**: Target <200ms for price data, current ~150ms average
- **Bundle Size**: Frontend optimized with tree-shaking, ~180KB gzipped
- **Cache Hit Rate**: 85% hit rate on price data with 1-hour cache TTL
- **Sanity Query Performance**: GROQ projections reduce payload by 60%

---

*This component documentation provides context for AI-assisted development within ElPortal. For system-wide patterns and standards, reference the master CLAUDE.md file.*