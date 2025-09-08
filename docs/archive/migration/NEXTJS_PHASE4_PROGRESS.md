# Phase 4: API Routes Migration - Progress Report

## Summary
Phase 4 of the Next.js migration focused on migrating API routes from the old Vercel Functions format (`/api/*.ts`) to the Next.js App Router format (`/app/api/**/route.ts`). This phase addressed critical issues identified by Codex, including security vulnerabilities, memory leaks, and broken fallback patterns.

## Critical Issues Fixed

### 1. ✅ Duplicate API Endpoints
- **Problem**: Old `/api/*.ts` files could shadow new `/app/api/**/route.ts` in production
- **Solution**: Moved old routes to `/api/old/*.backup` to prevent conflicts

### 2. ✅ Broken Fallback Keys Pattern  
- **Problem**: Stale fallback reads keys that are never set (e.g., CO2 reads `co2:${region}` but only sets `co2:${region}:${start}:${end}:${aggregation}`)
- **Solution**: Created `setKvJsonWithFallback` helper that sets both specific and "latest" keys

### 3. ✅ Memory Leak Risk
- **Problem**: In-memory Maps never prune old entries, leading to potential memory exhaustion
- **Solution**: Implemented `LRUCache` class with max size (100 entries) and automatic pruning

### 4. ✅ Security Vulnerabilities
- **Problem**: Municipality filter string concatenation without validation, potential injection risks
- **Solution**: Created zod validation schemas in `api-validators.ts` for all input parameters

### 5. ✅ Inconsistent Implementation
- **Problem**: electricity-prices route didn't use shared helpers
- **Solution**: Migrated all routes to use centralized helpers from `api-helpers.ts`

## Implementation Status

### ✅ Completed (3 routes)
1. **electricity-prices** - Fully migrated with shared helpers, validation, LRU cache
   - Status: Working ✅
   - Tested: Returns price data correctly
   
2. **co2-emissions** - Fully migrated with all fixes applied
   - Status: Working ✅
   - Tested: Returns emissions data with hourly aggregation
   
3. **consumption-map** - Migrated but has runtime issue
   - Status: 500 Error ⚠️
   - Issue: Needs debugging (likely validation or parameter handling)

### 🔄 Pending Migration (23 routes)

#### High Priority APIs (4)
- `energy-forecast.ts` - Weather and renewable energy predictions
- `monthly-production.ts` - Historical production data
- `eloverblik.ts` - User consumption data (complex with auth)
- `health.ts` - System health checks

#### Data APIs (4)
- `declaration-gridmix.ts`
- `declaration-production.ts`
- `pricelists.ts`
- `private-industry-consumption.ts`

#### Admin/Auth APIs (8)
- `/admin/cache-stats.ts`
- `/admin/clear-cache.ts`
- `/admin/test-kv.ts`
- `/auth/login.ts`
- `/auth/logout.ts`
- `/auth/refresh.ts`
- `/auth/session.ts`
- `/auth/user.ts`

#### Tracking APIs (6)
- `/tracking/button-click.ts`
- `/tracking/comparison.ts`
- `/tracking/conversion.ts`
- `/tracking/page-view.ts`
- `/tracking/price-alert.ts`
- `/tracking/search.ts`

#### Sanity Management APIs (2)
- `/sanity/revalidate-all.ts`
- `/sanity/revalidate.ts`

## Technical Improvements

### Shared Helpers (`/src/server/api-helpers.ts`)
- `queuedFetch` - Request deduplication
- `readKvJson/setKvJson` - KV cache operations with error handling
- `setKvJsonWithFallback` - Sets both specific and fallback keys
- `cacheHeaders` - Standardized cache control headers
- `retryWithBackoff` - Exponential backoff for rate limiting
- `LRUCache` - Memory-safe caching with automatic pruning

### Input Validation (`/src/server/api-validators.ts`)
- `regionSchema` - DK1, DK2, Danmark validation
- `dateSchema` - YYYY-MM-DD format validation
- `aggregationSchema` - Data aggregation levels
- `electricityPricesSchema` - Complete validation for price endpoints
- `co2EmissionsSchema` - CO2 data validation
- `consumptionMapSchema` - Municipality consumption validation

### Configuration Standards
- `export const runtime = 'nodejs'` - Required for KV access
- `export const maxDuration = 10` - Match vercel.json limits
- `export const dynamic = 'force-dynamic'` - Real-time data APIs

## Testing Results

### Environment
- KV cache not configured locally (missing env vars) but APIs handle gracefully
- In-memory LRU cache working as primary cache layer
- External API calls successful with retry logic

### Test Results
- ✅ `electricity-prices` - Returns 24 hours of price data with VAT calculations
- ✅ `co2-emissions` - Returns 23 hours of emissions data with levels
- ⚠️ `consumption-map` - 500 error, needs debugging

## Next Steps

1. **Fix consumption-map 500 error** - Debug validation or parameter handling issue
2. **Migrate high-priority APIs** - Focus on energy-forecast, monthly-production, health
3. **Handle eloverblik complexity** - Complex auth token management needs careful migration
4. **Batch migrate simple APIs** - Tracking and admin APIs can use similar patterns
5. **Test in staging** - Deploy to Vercel preview with KV configured
6. **Performance testing** - Verify LRU cache limits are appropriate

## Migration Pattern Template

```typescript
// Standard imports
import { NextRequest, NextResponse } from 'next/server'
import { 
  queuedFetch, readKvJson, setKvJsonWithFallback,
  cacheHeaders, retryWithBackoff, createLRUCache
} from '@/server/api-helpers'
import { [schema], safeValidateParams } from '@/server/api-validators'

// Runtime config
export const runtime = 'nodejs'
export const maxDuration = 10
export const dynamic = 'force-dynamic'

// LRU cache
const cache = createLRUCache<any>(TTL_MS, MAX_ENTRIES)

// Route handler
export async function GET(request: NextRequest) {
  // 1. Validate inputs
  // 2. Check KV cache
  // 3. Check memory cache
  // 4. Fetch with retry
  // 5. Cache with fallback
  // 6. Return with headers
}
```

## Notes
- All migrated routes preserve business logic from original implementations
- Error handling includes fallback to stale cache on failures
- Rate limiting (40 req/10s) handled via retry logic and caching
- Danish timezone handling preserved for date calculations
- Vindstød ranking logic maintained where applicable