/**
 * Shared API Helpers for Next.js App Router
 * Centralized utilities for caching, request deduplication, and error handling
 */

import { kv } from '@vercel/kv'

/**
 * Request deduplication queue to prevent duplicate simultaneous requests
 */
const requestQueue = new Map<string, Promise<any>>()

/**
 * Queued fetch to prevent duplicate simultaneous requests for the same data
 * @param key - Unique identifier for the request
 * @param fetcher - Async function that performs the actual fetch
 * @returns Promise resolving to the fetched data
 */
export async function queuedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // If request already in flight, return the same promise
  if (requestQueue.has(key)) {
    console.log(`[QueuedFetch] Request already in flight for ${key}, waiting...`)
    return requestQueue.get(key) as Promise<T>
  }
  
  // Create new request
  const promise = fetcher().finally(() => {
    // Clean up after 100ms to handle rapid retries
    setTimeout(() => requestQueue.delete(key), 100)
  })
  
  requestQueue.set(key, promise)
  return promise
}

/**
 * Read JSON data from KV cache with error handling
 * @param key - Cache key
 * @returns Cached data or null if not found/error
 */
export async function readKvJson<T = any>(key: string): Promise<T | null> {
  try {
    const data = await kv.get<T>(key)
    if (data) {
      console.log(`[KV] Cache hit for ${key}`)
    }
    return data
  } catch (error) {
    console.error(`[KV] Error reading ${key}:`, error)
    return null
  }
}

/**
 * Set JSON data in KV cache with TTL
 * @param key - Cache key
 * @param value - Data to cache
 * @param ttl - Time to live in seconds
 */
export async function setKvJson(
  key: string,
  value: any,
  ttl: number
): Promise<void> {
  try {
    await kv.set(key, value, { ex: ttl })
    console.log(`[KV] Cached ${key} with TTL ${ttl}s`)
  } catch (error) {
    console.error(`[KV] Error setting ${key}:`, error)
    // Non-critical - continue without caching
  }
}

/**
 * Set both specific and fallback "latest" keys in KV cache
 * This ensures we have a stale fallback available on errors
 * @param specificKey - Specific cache key with all parameters
 * @param latestKey - Fallback "latest" key for error scenarios
 * @param value - Data to cache
 * @param specificTtl - TTL for specific key (shorter)
 * @param latestTtl - TTL for latest key (longer for fallback)
 */
export async function setKvJsonWithFallback(
  specificKey: string,
  latestKey: string,
  value: any,
  specificTtl: number,
  latestTtl: number = 3600
): Promise<void> {
  // Set the specific key with shorter TTL
  await setKvJson(specificKey, value, specificTtl)
  
  // Also set the fallback "latest" key with longer TTL
  // This ensures we have something to fall back to on errors
  await setKvJson(latestKey, value, latestTtl)
}

/**
 * Generate standardized cache headers
 * @param options - Cache configuration
 * @returns Headers object for cache control
 */
export function cacheHeaders(options: {
  sMaxage: number
  swr?: number
  public?: boolean
}): Record<string, string> {
  const { sMaxage, swr, public: isPublic = true } = options
  
  const directives = [
    isPublic ? 'public' : 'private',
    `s-maxage=${sMaxage}`,
    swr ? `stale-while-revalidate=${swr}` : null
  ].filter(Boolean).join(', ')
  
  return {
    'Cache-Control': directives,
    'CDN-Cache-Control': `max-age=${sMaxage}`
  }
}

/**
 * Retry function with exponential backoff
 * @param fn - Async function to retry
 * @param maxAttempts - Maximum number of attempts (default: 3)
 * @param initialDelay - Initial delay in ms (default: 1000)
 * @returns Result of the function or throws after max attempts
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on client errors (4xx except 429)
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error
      }
      
      // Check if we should retry
      if (attempt < maxAttempts) {
        const delay = initialDelay * Math.pow(2, attempt - 1)
        console.log(`[Retry] Attempt ${attempt} failed, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  console.error(`[Retry] All ${maxAttempts} attempts failed`)
  throw lastError
}

/**
 * Delay helper for rate limiting
 * @param ms - Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Parse date parameter with default to today
 * @param dateParam - Date string in YYYY-MM-DD format or null
 * @returns Date object
 */
export function parseDate(dateParam: string | null): Date {
  if (dateParam) {
    return new Date(dateParam + 'T00:00:00Z')
  }
  return new Date()
}

/**
 * Format date range for API queries
 * @param date - Base date
 * @returns Object with start and end date strings
 */
export function getDateRange(date: Date): { start: string; end: string } {
  const start = date.toISOString().split('T')[0] + 'T00:00'
  const tomorrow = new Date(date)
  tomorrow.setUTCDate(date.getUTCDate() + 1)
  const end = tomorrow.toISOString().split('T')[0] + 'T00:00'
  
  return { start, end }
}

/**
 * Build API URL with query parameters
 * @param baseUrl - Base API URL
 * @param params - Query parameters object
 * @returns Complete URL string
 */
export function buildApiUrl(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(baseUrl)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value))
    }
  })
  
  return url.toString()
}

/**
 * Get cache status based on various cache checks
 * @param kvHit - Whether KV cache was hit
 * @param memoryHit - Whether memory cache was hit
 * @param stale - Whether data is stale
 * @returns Cache status string for X-Cache header
 */
export function getCacheStatus(
  kvHit: boolean,
  memoryHit: boolean = false,
  stale: boolean = false
): string {
  if (stale) return 'HIT-STALE'
  if (kvHit) return 'HIT-KV'
  if (memoryHit) return 'HIT-MEMORY'
  return 'MISS'
}

/**
 * LRU Cache implementation with TTL and max size
 * Prevents memory leaks by limiting cache size and pruning old entries
 */
export class LRUCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>()
  private maxSize: number
  private ttl: number
  
  constructor(ttl: number, maxSize: number = 100) {
    this.ttl = ttl
    this.maxSize = maxSize
  }
  
  /**
   * Set a value in the cache
   * Prunes oldest entry if cache is at max size
   */
  set(key: string, data: T): void {
    // Delete the key if it exists (to re-insert at the end)
    this.cache.delete(key)
    
    // Prune if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
        console.log(`[LRU] Pruned oldest entry: ${firstKey}`)
      }
    }
    
    this.cache.set(key, { data, timestamp: Date.now() })
  }
  
  /**
   * Get a value from the cache
   * Returns null if not found or expired
   */
  get(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, cached)
    
    return cached.data
  }
  
  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear()
  }
  
  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size
  }
}

/**
 * Create an LRU cache instance with specified TTL
 * @param ttl - Time to live in milliseconds
 * @param maxSize - Maximum number of entries (default 100)
 */
export function createLRUCache<T>(ttl: number, maxSize: number = 100): LRUCache<T> {
  return new LRUCache<T>(ttl, maxSize)
}