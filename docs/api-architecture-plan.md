# ElPortal API Architecture & Implementation Plan

## Executive Summary

This document provides both immediate fixes for the 429 rate limiting errors AND a comprehensive long-term API architecture plan. The immediate fixes can be deployed TODAY with 2-4 hours of work, while the full architecture provides a roadmap for scaling to 10,000+ monthly users.

**Critical Issue**: All users share a single Eloverblik API token, causing system-wide 429 errors when rate limits are hit.

**Immediate Solution**: Enhanced caching and request deduplication (50-70% error reduction today)

**Long-term Solution**: Distributed caching with Vercel KV and eventual OAuth migration (99.9% uptime)

---

## Part 1: IMMEDIATE FIXES (Deploy Today)

### Phase 0: Quick Wins (2-4 hours work)

#### 1. Enhanced In-Memory Caching in `/api/eloverblik.ts`

**Current Problem**: Cache TTLs are too short (2-5 minutes), causing unnecessary API calls.

```typescript
// CHANGE THESE VALUES IN /api/eloverblik.ts

// FROM (current):
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const CONSUMPTION_TTL = 2 * 60 * 1000 // 2 minutes  
const METERING_POINT_TTL = 15 * 60 * 1000 // 15 minutes

// TO (recommended):
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes
const CONSUMPTION_TTL = 10 * 60 * 1000 // 10 minutes
const METERING_POINT_TTL = 30 * 60 * 1000 // 30 minutes
```

**Impact**: 50-70% reduction in API calls for users who stay on the page

#### 2. Add Global Request Queue (Prevents Duplicates)

Add this to the top of `/api/eloverblik.ts`:

```typescript
// Global request deduplication queue
const requestQueue = new Map<string, Promise<any>>()

async function queuedFetch(key: string, fetcher: () => Promise<any>) {
  // If request already in flight, return the same promise
  if (requestQueue.has(key)) {
    console.log(`Request already in flight for ${key}, waiting...`)
    return requestQueue.get(key)
  }
  
  // Create new request
  const promise = fetcher().finally(() => {
    // Clean up after 100ms to handle rapid retries
    setTimeout(() => requestQueue.delete(key), 100)
  })
  
  requestQueue.set(key, promise)
  return promise
}
```

Then update `handleThirdPartyConsumption` to use it:

```typescript
// Line ~410 in handleThirdPartyConsumption
const accessToken = await queuedFetch(
  'token_refresh',
  () => getThirdPartyAccessToken(refreshToken)
)

// Line ~520 in the consumption fetch loop
const consumptionData = await queuedFetch(
  `consumption_${identifier}_${safeFrom}_${safeTo}`,
  async () => {
    // Existing fetch logic here
    const response = await fetch(consumptionUrl, {...})
    // etc...
  }
)
```

#### 3. Fix Component Double-Loading

In `/src/components/forbrugTracker/ForbrugTracker.tsx`, add fetch state tracking:

```typescript
// Add after line 56
const fetchStateRef = useRef<'idle' | 'fetching' | 'complete'>('idle')

// Update fetchConsumptionData function (line 132)
const fetchConsumptionData = async (params: {...}) => {
  // Prevent double-fetching
  if (fetchStateRef.current === 'fetching') {
    console.log('Already fetching consumption data, skipping...')
    return
  }
  
  fetchStateRef.current = 'fetching'
  
  try {
    // Existing fetch logic...
  } finally {
    fetchStateRef.current = 'complete'
    setIsRequestInFlight(false)
  }
}
```

#### 4. Add Client-Side Caching

Add to `ForbrugTracker.tsx` (after imports):

```typescript
// Client-side cache helpers
const STORAGE_KEY = 'elportal_consumption_cache'
const STORAGE_TTL = 5 * 60 * 1000 // 5 minutes

const getCachedData = (key: string) => {
  try {
    const cached = sessionStorage.getItem(`${STORAGE_KEY}_${key}`)
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > STORAGE_TTL) {
      sessionStorage.removeItem(`${STORAGE_KEY}_${key}`)
      return null
    }
    
    return data
  } catch {
    return null
  }
}

const setCachedData = (key: string, data: any) => {
  try {
    sessionStorage.setItem(
      `${STORAGE_KEY}_${key}`,
      JSON.stringify({ data, timestamp: Date.now() })
    )
  } catch (e) {
    // Storage full, clear old entries
    Object.keys(sessionStorage)
      .filter(k => k.startsWith(STORAGE_KEY))
      .forEach(k => sessionStorage.removeItem(k))
  }
}
```

Use in `fetchConsumptionData`:

```typescript
// Check cache first
const cacheKey = `${params.authorizationId}_${dateFrom}_${dateTo}`
const cached = getCachedData(cacheKey)
if (cached) {
  console.log('Using cached consumption data')
  setConsumptionData(cached)
  return
}

// After successful fetch
if (response.ok) {
  const data = await response.json()
  setCachedData(cacheKey, data) // Cache the response
  setConsumptionData(data)
}
```

#### 5. Better Error Messages

Update error handling in `ForbrugTracker.tsx` (line ~200):

```typescript
if (response.status === 429 || response.status === 503) {
  setError(
    response.status === 429 
      ? 'For mange forespørgsler - systemet er midlertidigt overbelastet. Vent venligst 60 sekunder før du prøver igen.'
      : 'Eloverblik er midlertidigt utilgængelig. Vi viser gemte data hvor muligt. Prøv igen om 2 minutter.'
  )
  
  // Try to show cached data if available
  const cacheKey = `${params.authorizationId}_${dateFrom}_${dateTo}`
  const cached = getCachedData(cacheKey)
  if (cached) {
    console.log('Showing cached data due to API error')
    setConsumptionData(cached)
    setError(error + ' (Viser gemte data)')
  }
}
```

### Testing Checklist

Before deploying:
- [ ] Test with multiple browser tabs open simultaneously
- [ ] Test rapid page refreshes (F5 spam)
- [ ] Verify error messages are in Danish and user-friendly
- [ ] Check console for "Already fetching" messages (good sign)
- [ ] Monitor network tab - should see fewer API calls

### Expected Immediate Impact

- **50-70%** reduction in 429 errors
- **200-300ms** faster response for cached data
- No more duplicate requests from same user
- Better user experience with Danish error messages

---

## Part 2: THIS WEEK - Vercel KV Implementation

### Phase 0.5: Distributed Caching (1 day work)

#### Setup Vercel KV

```bash
# Install package
npm install @vercel/kv

# Update vercel.json
{
  "functions": {
    "api/eloverblik.ts": {
      "maxDuration": 30
    }
  }
}
```

#### Update `/api/eloverblik.ts` with KV

```typescript
import { kv } from '@vercel/kv'

// Enhanced token caching with KV
async function getThirdPartyAccessToken(refreshToken: string): Promise<string> {
  try {
    // Try KV cache first
    const cached = await kv.get('eloverblik_token')
    if (cached) {
      console.log('Using KV cached token')
      return cached as string
    }
  } catch (e) {
    console.log('KV not available, using in-memory cache')
  }
  
  // Check in-memory cache (fallback)
  const now = Date.now()
  if (tokenCache.token && tokenCache.expiresAt > now + 15_000) {
    return tokenCache.token
  }
  
  // Fetch new token
  const tokenUrl = `${ELOVERBLIK_API_BASE}/thirdpartyapi/api/token`
  const tokenResponse = await fetch(tokenUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${refreshToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-version': '1.0',
    },
  })
  
  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    throw new Error(`Token refresh failed (${tokenResponse.status}): ${errorText}`)
  }
  
  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.result || tokenData.access_token || tokenData.token
  
  if (!accessToken) throw new Error('Invalid token response: missing access token')
  
  // Store in both caches
  tokenCache.token = accessToken
  tokenCache.expiresAt = now + 20 * 60 * 1000
  
  try {
    await kv.set('eloverblik_token', accessToken, { ex: 20 * 60 }) // 20 minutes
  } catch (e) {
    console.log('Failed to cache in KV:', e)
  }
  
  return accessToken
}

// Distributed lock for deduplication
async function acquireLock(key: string, ttl: number = 30): Promise<boolean> {
  try {
    const result = await kv.set(
      `lock:${key}`,
      Date.now(),
      { nx: true, px: ttl * 1000 } // Atomic "set if not exists"
    )
    return result === 'OK'
  } catch {
    return false // KV not available, proceed without lock
  }
}

async function releaseLock(key: string) {
  try {
    await kv.del(`lock:${key}`)
  } catch {
    // Ignore errors
  }
}
```

#### Update Consumption Endpoint with KV

```typescript
async function handleThirdPartyConsumption(req: VercelRequest, res: VercelResponse) {
  // ... existing parameter extraction ...
  
  const lockKey = `consumption_${identifier}_${safeFrom}_${safeTo}`
  const cacheKey = `cache:${lockKey}`
  
  // Try cache first
  try {
    const cached = await kv.get(cacheKey)
    if (cached) {
      console.log('Returning KV cached consumption data')
      return res.status(200).json(cached)
    }
  } catch {
    // KV not available, continue
  }
  
  // Try to acquire lock
  const hasLock = await acquireLock(lockKey)
  
  if (!hasLock) {
    // Another request is handling this
    console.log('Another request is fetching this data, waiting...')
    await new Promise(r => setTimeout(r, 1000))
    
    // Check cache again
    try {
      const cached = await kv.get(cacheKey)
      if (cached) return res.status(200).json(cached)
    } catch {}
    
    // Still no data, proceed anyway
  }
  
  try {
    // ... existing fetch logic ...
    
    // Cache successful response
    if (consumptionData) {
      try {
        await kv.set(cacheKey, payload, { ex: 600 }) // 10 min cache
      } catch (e) {
        console.log('Failed to cache in KV:', e)
      }
    }
    
    return res.status(200).json(payload)
  } finally {
    if (hasLock) await releaseLock(lockKey)
  }
}
```

#### Add Health Monitoring

Create `/api/health.ts`:

```typescript
import { VercelRequest, VercelResponse } from '@vercel/node'
import { kv } from '@vercel/kv'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const metrics: any = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {}
  }
  
  // Check KV availability
  try {
    await kv.ping()
    metrics.checks.kv = { status: 'up', latency: 'low' }
  } catch (e) {
    metrics.checks.kv = { status: 'down', error: e.message }
    metrics.status = 'degraded'
  }
  
  // Check token cache
  try {
    const tokenCached = await kv.exists('eloverblik_token')
    metrics.checks.tokenCache = { cached: tokenCached === 1 }
  } catch {
    metrics.checks.tokenCache = { cached: false }
  }
  
  // Check active locks
  try {
    const locks = await kv.keys('lock:*')
    metrics.checks.activeLocks = locks.length
  } catch {
    metrics.checks.activeLocks = 'unknown'
  }
  
  res.status(metrics.status === 'healthy' ? 200 : 503).json(metrics)
}
```

### Expected Impact This Week

With Vercel KV implemented:
- **80-90%** reduction in 429 errors
- **<100ms** response for cached data
- Shared cache across ALL serverless instances
- Automatic request deduplication
- ~$2-5/month additional cost

---

## Part 3: COMPLETE ARCHITECTURE PLAN

### Current State Analysis

#### API Dependencies & Issues

| API Service | Purpose | Rate Limits | Current Issues |
|------------|---------|-------------|----------------|
| **EnergiDataService** | Electricity prices, forecasts | 40 req/10s per IP | Shared across all users |
| **Eloverblik** | User consumption data | Strict, undocumented | Single token for ALL users |
| **DAWA** | Address autocomplete | 1000/min | No caching |
| **Green Power Denmark** | Supplier lookup | Unknown | No error handling |
| **Sanity CMS** | Content management | Generous | Inefficient queries |

#### Critical Problems

1. **Shared Rate Limits**: All users share the same Eloverblik API token
2. **Serverless Memory**: Each Vercel function has isolated memory (in-memory caching ineffective)
3. **No Circuit Breakers**: When APIs fail, entire service degrades
4. **16+ Components**: Making direct, uncoordinated API calls
5. **Cost Unpredictability**: No control over API usage patterns

### Proposed Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│ Edge Gateway │────▶│  External   │
│  (Browser)  │◀────│   (Global)   │◀────│    APIs     │
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  Vercel KV   │
                    │ (Distributed │
                    │    Cache)    │
                    └──────────────┘
```

### Implementation Roadmap

#### Week 1: Foundation
- [x] Enhanced in-memory caching (Phase 0)
- [x] Request deduplication (Phase 0)
- [ ] Set up Vercel KV
- [ ] Implement basic edge gateway
- [ ] Deploy monitoring dashboard

#### Week 2: Resilience  
- [ ] Implement circuit breakers
- [ ] Add fallback strategies
- [ ] Set up request batching
- [ ] Add progressive loading

#### Week 3: Optimization
- [ ] Fine-tune cache TTLs
- [ ] Implement smart invalidation
- [ ] Add cost tracking
- [ ] Optimize bundle sizes

#### Month 2: Scale
- [ ] Begin OAuth implementation
- [ ] Add user-specific caching
- [ ] Implement advanced analytics
- [ ] Set up A/B testing

### Layer 1: Edge Gateway Implementation

```typescript
// api/_gateway/config.ts
export const API_CONFIG = {
  energiDataService: {
    baseUrl: 'https://api.energidataservice.dk',
    cacheTTL: 300, // 5 minutes
    rateLimit: { 
      requests: 100, 
      window: 60,
      strategy: 'sliding_window'
    },
    fallback: 'RETURN_CACHED',
    retries: 3,
    timeout: 5000
  },
  eloverblik: {
    baseUrl: 'https://api.eloverblik.dk',
    cacheTTL: 900, // 15 minutes
    rateLimit: { 
      requests: 10, 
      window: 60,
      strategy: 'token_bucket'
    },
    fallback: 'RETURN_STALE',
    retries: 2,
    timeout: 10000
  }
}
```

### Layer 2: Circuit Breaker Pattern

```typescript
// lib/circuit-breaker.ts
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  
  constructor(
    private threshold = 5,
    private timeout = 60000,
    private resetTimeout = 30000
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }
    
    try {
      const result = await fn()
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED'
        this.failures = 0
      }
      return result
    } catch (error) {
      this.failures++
      this.lastFailureTime = Date.now()
      
      if (this.failures >= this.threshold) {
        this.state = 'OPEN'
      }
      
      throw error
    }
  }
}
```

### Layer 3: Request Batching

```typescript
// lib/request-batcher.ts
export class RequestBatcher<T> {
  private queue: Array<{
    key: string
    resolve: (value: T) => void
    reject: (error: any) => void
  }> = []
  private timer: NodeJS.Timeout | null = null
  
  constructor(
    private batchProcessor: (keys: string[]) => Promise<Map<string, T>>,
    private maxBatchSize = 10,
    private maxWaitTime = 50
  ) {}
  
  async get(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject })
      
      if (this.queue.length >= this.maxBatchSize) {
        this.flush()
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.maxWaitTime)
      }
    })
  }
  
  private async flush() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    
    const batch = this.queue.splice(0, this.maxBatchSize)
    if (batch.length === 0) return
    
    const keys = batch.map(item => item.key)
    
    try {
      const results = await this.batchProcessor(keys)
      batch.forEach(({ key, resolve, reject }) => {
        const result = results.get(key)
        if (result !== undefined) {
          resolve(result)
        } else {
          reject(new Error(`No result for key: ${key}`))
        }
      })
    } catch (error) {
      batch.forEach(({ reject }) => reject(error))
    }
  }
}
```

### Rate Limiting Strategies

```typescript
// lib/rate-limiter.ts
export class RateLimiter {
  constructor(private kv: any) {}
  
  async checkLimit(
    apiName: string, 
    identifier: string,
    config: { requests: number; window: number; strategy: string }
  ): Promise<boolean> {
    const key = `ratelimit:${apiName}:${identifier}`
    
    if (config.strategy === 'sliding_window') {
      return this.slidingWindow(key, config.requests, config.window)
    } else if (config.strategy === 'token_bucket') {
      return this.tokenBucket(key, config.requests, config.window)
    }
    
    return true
  }
  
  private async slidingWindow(
    key: string, 
    limit: number, 
    window: number
  ): Promise<boolean> {
    const now = Date.now()
    const windowStart = now - (window * 1000)
    
    // Remove old entries
    await this.kv.zremrangebyscore(key, 0, windowStart)
    
    // Count recent requests
    const count = await this.kv.zcard(key)
    
    if (count >= limit) {
      return false
    }
    
    // Add current request
    await this.kv.zadd(key, now, `${now}-${Math.random()}`)
    await this.kv.expire(key, window + 1)
    
    return true
  }
  
  private async tokenBucket(
    key: string,
    capacity: number,
    refillRate: number
  ): Promise<boolean> {
    const now = Date.now()
    const bucketKey = `${key}:bucket`
    const timestampKey = `${key}:timestamp`
    
    // Get current tokens and last refill time
    const [tokens, lastRefill] = await Promise.all([
      this.kv.get(bucketKey),
      this.kv.get(timestampKey)
    ])
    
    const currentTokens = tokens || capacity
    const lastRefillTime = lastRefill || now
    
    // Calculate tokens to add
    const timePassed = (now - lastRefillTime) / 1000
    const tokensToAdd = Math.floor(timePassed * refillRate)
    const newTokens = Math.min(capacity, currentTokens + tokensToAdd)
    
    if (newTokens < 1) {
      return false
    }
    
    // Consume a token
    await Promise.all([
      this.kv.set(bucketKey, newTokens - 1),
      this.kv.set(timestampKey, now)
    ])
    
    return true
  }
}
```

### Failure Scenarios & Mitigations

| Scenario | Impact | Mitigation | Recovery |
|----------|--------|------------|----------|
| **Eloverblik API Down** | No consumption data | Return cached data up to 24h old | Auto-retry with exponential backoff |
| **KV Store Unavailable** | Degraded caching | Fall back to in-memory cache | Alert ops team, auto-reconnect |
| **Rate Limit Hit** | 429 errors | Queue requests, return cached | Implement token bucket algorithm |
| **Token Expiry** | Auth failures | Proactive refresh 5 min before expiry | Retry with new token |
| **Network Timeout** | Slow responses | Circuit breaker opens after 5 failures | Half-open state after 30s |
| **Malformed Data** | Parsing errors | Schema validation, return last known good | Log for debugging |
| **Cost Spike** | Budget overrun | Hard limits on API calls per day | Alert at 80% threshold |
| **DDoS Attack** | Service degradation | Cloudflare protection, rate limiting | Auto-scale, blacklist IPs |

### Cost Analysis

#### Current (Unoptimized)
- Unpredictable API costs
- Risk of rate limit penalties
- Poor user experience during peaks

#### With Full Implementation

| Component | Monthly Cost | Notes |
|-----------|-------------|--------|
| Vercel KV | $5 | 250MB storage, 10k commands/day |
| Edge Functions | $5 | Additional compute for gateway |
| Monitoring | $5 | Basic Sentry plan |
| **Total** | **$15** | For 10k monthly users |

### Performance Metrics

| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| **Availability** | ~95% | 99.9% | Circuit breakers + fallbacks |
| **Response Time (P50)** | ~500ms | <100ms | Edge caching |
| **Response Time (P99)** | ~3000ms | <500ms | Request dedup |
| **Error Rate** | ~2% | <0.1% | Better error handling |
| **Cache Hit Rate** | ~20% | >80% | Distributed cache |

### Future Enhancements

#### OAuth 2.0 Implementation (Month 2+)
- Each user authenticates directly with Eloverblik
- Eliminates shared rate limit problem
- GDPR compliant
- Scales infinitely

#### GraphQL Federation
- Combine multiple APIs into single endpoint
- Better type safety
- Automatic query optimization

#### WebSocket Subscriptions
- Real-time price updates
- Push notifications
- Reduced polling

### Testing Strategy

```typescript
// Load test configuration
export const LOAD_TEST_SCENARIOS = {
  normal: {
    users: 100,
    duration: '5m',
    rampUp: '30s'
  },
  peak: {
    users: 500,
    duration: '10m',
    rampUp: '1m'
  },
  stress: {
    users: 1000,
    duration: '15m',
    rampUp: '2m'
  }
}
```

### Environment Variables

```env
# Vercel KV (Phase 0.5)
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."

# External APIs
ELOVERBLIK_API_TOKEN="..." # Current refresh token
ENERGI_DATA_SERVICE_KEY="..." # If required

# Monitoring (Week 2+)
SENTRY_DSN="..."

# Feature Flags
ENABLE_EDGE_GATEWAY="false" # Set true in Week 1
ENABLE_REQUEST_BATCHING="false" # Set true in Week 2
ENABLE_CIRCUIT_BREAKERS="false" # Set true in Week 2
```

### Error Codes

| Code | Description | User Message | Action |
|------|-------------|--------------|--------|
| `E001` | Rate limit exceeded | "Tjenesten er travl, prøv igen om lidt" | Wait and retry |
| `E002` | API unavailable | "Data midlertidigt utilgængelig" | Use cached data |
| `E003` | Invalid request | "Ugyldig forespørgsel" | Check parameters |
| `E004` | Authentication failed | "Godkendelse fejlede" | Re-authenticate |
| `E005` | Timeout | "Forespørgsel tog for lang tid" | Retry with backoff |

---

## Rollback Plan

If any phase causes issues:

1. **Immediate**: Revert git commit and redeploy via Vercel
2. **Clear caches**: 
   - In-memory: Restart functions
   - KV: `await kv.flushdb()`
3. **Disable features**: Use environment variables
4. **Communicate**: Show status banner to users

---

## Success Criteria

### Phase 0 (Today)
- [ ] 429 errors reduced by >50%
- [ ] No duplicate requests in logs
- [ ] Danish error messages displayed

### Phase 0.5 (This Week)
- [ ] Vercel KV operational
- [ ] 429 errors reduced by >80%
- [ ] Health endpoint returning metrics

### Full Implementation (4 Weeks)
- [ ] 99.9% uptime achieved
- [ ] P50 latency <100ms
- [ ] Cost predictable at ~$15/month
- [ ] OAuth migration planned

---

## Document Version

- **Version**: 2.0.0 (Consolidated)
- **Date**: February 2025
- **Status**: Ready for Implementation
- **Priority**: Phase 0 - IMMEDIATE

---

**Next Action**: Start with Phase 0 changes in `/api/eloverblik.ts` and `/src/components/forbrugTracker/ForbrugTracker.tsx`. These can be deployed within 2-4 hours and will immediately improve user experience.