/**
 * Rate Limiting Helpers for Next.js App Router
 * Provides rate limiting with KV storage and Vercel-aware IP detection
 */

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  interval: number // Time window in seconds
  limit: number // Max requests per interval
  keyPrefix?: string // Optional prefix for KV keys
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number // Unix timestamp when limit resets
  retryAfter?: number // Seconds until retry (if blocked)
}

/**
 * Get client IP from request headers
 * Prioritizes Vercel headers, falls back to standard headers
 * @param request - NextRequest object
 * @returns IP address string
 */
export function getClientIP(request: NextRequest): string {
  // Vercel-specific header (most reliable)
  const vercelIP = request.headers.get('x-vercel-forwarded-for')
  if (vercelIP) {
    return vercelIP.split(',')[0].trim()
  }
  
  // Standard forwarded header
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  // Direct IP header
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback to a default (shouldn't happen in production)
  return '127.0.0.1'
}

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (e.g., IP, user ID, API key)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { interval, limit, keyPrefix = 'rate-limit' } = config
  const key = `${keyPrefix}:${identifier}`
  const now = Math.floor(Date.now() / 1000)
  const windowStart = Math.floor(now / interval) * interval
  const windowKey = `${key}:${windowStart}`
  
  try {
    // Increment counter for current window
    const count = await kv.incr(windowKey)
    
    // Set expiry on first request in window
    if (count === 1) {
      await kv.expire(windowKey, interval + 1) // +1 for safety
    }
    
    const remaining = Math.max(0, limit - count)
    const reset = windowStart + interval
    
    if (count > limit) {
      return {
        allowed: false,
        remaining: 0,
        reset,
        retryAfter: reset - now
      }
    }
    
    return {
      allowed: true,
      remaining,
      reset
    }
  } catch (error) {
    // If KV is unavailable, fail open (allow request)
    console.error('[RateLimit] KV error:', error)
    return {
      allowed: true,
      remaining: limit,
      reset: windowStart + interval
    }
  }
}

/**
 * Rate limit middleware for routes
 * @param config - Rate limit configuration
 * @returns Middleware function
 */
export function withRateLimit(config: RateLimitConfig) {
  return async function rateLimitMiddleware(
    handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      const ip = getClientIP(request)
      const result = await checkRateLimit(ip, config)
      
      // Add rate limit headers to response
      const response = await handler(request)
      
      response.headers.set('X-RateLimit-Limit', config.limit.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.reset.toString())
      
      if (!result.allowed) {
        response.headers.set('Retry-After', result.retryAfter!.toString())
        
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests, please try again later',
              retryAfter: result.retryAfter
            }
          },
          {
            status: 429,
            headers: response.headers
          }
        )
      }
      
      return response
    }
  }
}

/**
 * Create rate limit headers for response
 * @param result - Rate limit result
 * @param limit - Request limit
 * @returns Headers object
 */
export function createRateLimitHeaders(
  result: RateLimitResult,
  limit: number
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString()
  }
  
  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString()
  }
  
  return headers
}

/**
 * Rate limit by API key instead of IP
 * @param request - NextRequest object
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkAPIKeyRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const apiKey = request.headers.get('X-API-Key') || 
                 request.headers.get('Authorization')?.replace('Bearer ', '')
  
  if (!apiKey) {
    return {
      allowed: false,
      remaining: 0,
      reset: Math.floor(Date.now() / 1000) + config.interval,
      retryAfter: config.interval
    }
  }
  
  return checkRateLimit(`api-key:${apiKey}`, config)
}

/**
 * Rate limit by user session
 * @param request - NextRequest object
 * @param sessionId - Session ID
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkSessionRateLimit(
  sessionId: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  return checkRateLimit(`session:${sessionId}`, config)
}

/**
 * Sliding window rate limiter (more accurate but more complex)
 * @param identifier - Unique identifier
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkSlidingWindowRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { interval, limit, keyPrefix = 'sliding-rate-limit' } = config
  const key = `${keyPrefix}:${identifier}`
  const now = Date.now()
  const windowStart = now - (interval * 1000)
  
  try {
    // Get all timestamps in current window
    const timestamps = await kv.zrange(
      key,
      windowStart,
      now,
      { byScore: true }
    )
    
    // Remove old entries
    await kv.zremrangebyscore(key, 0, windowStart)
    
    if (timestamps.length >= limit) {
      const oldestTimestamp = timestamps[0] as number
      const resetTime = oldestTimestamp + (interval * 1000)
      
      return {
        allowed: false,
        remaining: 0,
        reset: Math.floor(resetTime / 1000),
        retryAfter: Math.ceil((resetTime - now) / 1000)
      }
    }
    
    // Add current request
    await kv.zadd(key, { score: now, member: now })
    await kv.expire(key, interval + 1)
    
    return {
      allowed: true,
      remaining: limit - timestamps.length - 1,
      reset: Math.floor((now + interval * 1000) / 1000)
    }
  } catch (error) {
    console.error('[SlidingRateLimit] KV error:', error)
    return {
      allowed: true,
      remaining: limit,
      reset: Math.floor((now + interval * 1000) / 1000)
    }
  }
}

/**
 * Rate limit error response
 * @param retryAfter - Seconds until retry
 * @returns NextResponse with rate limit error
 */
export function rateLimitErrorResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Please retry after ${retryAfter} seconds`,
        retryAfter
      }
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + retryAfter).toString()
      }
    }
  )
}

/**
 * Common rate limit configurations
 */
export const RateLimits = {
  // Public API endpoints
  PUBLIC_API: { interval: 60, limit: 60 }, // 60 req/min
  
  // Auth endpoints
  AUTH_LOGIN: { interval: 300, limit: 5 }, // 5 attempts per 5 min
  AUTH_REGISTER: { interval: 3600, limit: 10 }, // 10 per hour
  
  // Admin endpoints
  ADMIN_API: { interval: 60, limit: 100 }, // 100 req/min
  
  // Tracking endpoints
  TRACKING: { interval: 60, limit: 1000 }, // 1000 events/min
  
  // Heavy operations
  HEAVY_OPERATION: { interval: 60, limit: 10 }, // 10 req/min
  
  // Eloverblik (respecting their limits)
  ELOVERBLIK: { interval: 10, limit: 40 } // 40 req/10s
}