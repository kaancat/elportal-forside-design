/**
 * ETag Helper Functions for Next.js App Router
 * Provides ETag generation and 304 Not Modified handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

/**
 * Generate an ETag from content
 * @param content - Content to hash (string or buffer)
 * @param weak - Whether to generate a weak ETag (default: false)
 * @returns ETag string with quotes
 */
export function generateETag(
  content: string | Buffer,
  weak: boolean = false
): string {
  const hash = createHash('md5').update(content).digest('hex')
  return weak ? `W/"${hash}"` : `"${hash}"`
}

/**
 * Check if request has matching ETag and return 304 if matched
 * @param request - NextRequest object
 * @param content - Content to check against
 * @param weak - Whether to use weak comparison
 * @returns 304 Response if matched, null otherwise
 */
export function checkETag(
  request: NextRequest,
  content: string | Buffer,
  weak: boolean = false
): Response | null {
  const etag = generateETag(content, weak)
  const ifNoneMatch = request.headers.get('if-none-match')
  
  if (ifNoneMatch && etagMatches(ifNoneMatch, etag)) {
    return new Response(null, {
      status: 304,
      headers: {
        'ETag': etag,
        'Cache-Control': 'public, max-age=0, must-revalidate'
      }
    })
  }
  
  return null
}

/**
 * Compare ETags considering weak comparison rules
 * @param ifNoneMatch - If-None-Match header value (can be comma-separated)
 * @param etag - ETag to compare against
 * @returns true if any ETag matches
 */
function etagMatches(ifNoneMatch: string, etag: string): boolean {
  // Handle wildcard
  if (ifNoneMatch === '*') {
    return true
  }
  
  // Split comma-separated ETags
  const etags = ifNoneMatch.split(',').map(e => e.trim())
  
  // Check each ETag
  for (const candidate of etags) {
    if (weakMatch(candidate, etag)) {
      return true
    }
  }
  
  return false
}

/**
 * Weak ETag comparison (ignores W/ prefix)
 * @param etag1 - First ETag
 * @param etag2 - Second ETag
 * @returns true if ETags match (weak comparison)
 */
function weakMatch(etag1: string, etag2: string): boolean {
  // Remove W/ prefix for weak comparison
  const normalize = (etag: string) => {
    return etag.replace(/^W\//, '')
  }
  
  return normalize(etag1) === normalize(etag2)
}

/**
 * Create a response with ETag headers
 * @param content - Response content
 * @param options - Response options
 * @returns NextResponse with ETag headers
 */
export function createETagResponse(
  content: string | Buffer,
  options: {
    contentType?: string
    maxAge?: number
    immutable?: boolean
    weak?: boolean
    headers?: Record<string, string>
  } = {}
): Response {
  const {
    contentType = 'text/plain',
    maxAge = 3600,
    immutable = false,
    weak = false,
    headers = {}
  } = options
  
  const etag = generateETag(content, weak)
  
  // Build cache control
  const cacheControl = immutable
    ? `public, max-age=${maxAge}, immutable`
    : `public, max-age=${maxAge}, must-revalidate`
  
  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'ETag': etag,
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
      ...headers
    }
  })
}

/**
 * Middleware to add ETag support to a handler
 * @param handler - Route handler that returns content
 * @param options - ETag options
 * @returns Wrapped handler with ETag support
 */
export function withETag(
  handler: (request: NextRequest) => Promise<{ content: string | Buffer; contentType?: string }>,
  options: {
    maxAge?: number
    immutable?: boolean
    weak?: boolean
  } = {}
) {
  return async (request: NextRequest): Promise<Response> => {
    // Get content from handler
    const { content, contentType } = await handler(request)
    
    // Check for 304
    const notModified = checkETag(request, content, options.weak)
    if (notModified) {
      return notModified
    }
    
    // Return full response with ETag
    return createETagResponse(content, {
      contentType,
      ...options
    })
  }
}

/**
 * Generate ETag from file stats (for static files)
 * @param size - File size in bytes
 * @param mtime - Last modified time
 * @returns ETag string
 */
export function generateFileETag(size: number, mtime: Date): string {
  const hash = createHash('md5')
    .update(`${size}-${mtime.getTime()}`)
    .digest('hex')
  return `"${hash}"`
}

/**
 * Parse If-Modified-Since header
 * @param ifModifiedSince - Header value
 * @returns Date object or null if invalid
 */
export function parseIfModifiedSince(ifModifiedSince: string | null): Date | null {
  if (!ifModifiedSince) return null
  
  try {
    const date = new Date(ifModifiedSince)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

/**
 * Check if content has been modified since a given date
 * @param request - NextRequest object
 * @param lastModified - Last modified date of content
 * @returns 304 Response if not modified, null otherwise
 */
export function checkLastModified(
  request: NextRequest,
  lastModified: Date
): Response | null {
  const ifModifiedSince = parseIfModifiedSince(
    request.headers.get('if-modified-since')
  )
  
  if (ifModifiedSince && lastModified <= ifModifiedSince) {
    return new Response(null, {
      status: 304,
      headers: {
        'Last-Modified': lastModified.toUTCString(),
        'Cache-Control': 'public, max-age=0, must-revalidate'
      }
    })
  }
  
  return null
}

/**
 * Add cache validation headers to response
 * @param response - Response to add headers to
 * @param etag - Optional ETag value
 * @param lastModified - Optional last modified date
 * @returns Same response with headers added
 */
export function addCacheValidation(
  response: Response,
  etag?: string,
  lastModified?: Date
): Response {
  if (etag) {
    response.headers.set('ETag', etag)
  }
  
  if (lastModified) {
    response.headers.set('Last-Modified', lastModified.toUTCString())
  }
  
  return response
}