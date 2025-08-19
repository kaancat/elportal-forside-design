/**
 * Cookie Helper Functions for Next.js App Router
 * Provides consistent cookie handling across all API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

/**
 * Cookie options interface extending Next.js ResponseCookie
 */
export interface CookieOptions extends Partial<Omit<ResponseCookie, 'name' | 'value'>> {
  // Additional options can be added here if needed
}

/**
 * Default cookie options for secure cookies
 */
export const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 86400 // 24 hours default
}

/**
 * Set a cookie on a NextResponse object
 * This is the recommended pattern for App Router
 * @param response - NextResponse object to set cookie on
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options (merged with defaults)
 * @returns The same response object for chaining
 */
export function setCookieOnResponse(
  response: NextResponse,
  name: string,
  value: string,
  options: CookieOptions = {}
): NextResponse {
  const mergedOptions = {
    ...DEFAULT_COOKIE_OPTIONS,
    ...options
  }
  
  response.cookies.set(name, value, mergedOptions)
  return response
}

/**
 * Delete a cookie on a NextResponse object
 * @param response - NextResponse object
 * @param name - Cookie name to delete
 * @param options - Path and domain must match the original cookie
 * @returns The same response object for chaining
 */
export function deleteCookieOnResponse(
  response: NextResponse,
  name: string,
  options: Pick<CookieOptions, 'path' | 'domain'> = {}
): NextResponse {
  response.cookies.delete({
    name,
    path: options.path || '/',
    domain: options.domain
  })
  return response
}

/**
 * Get a cookie value from the request
 * @param request - NextRequest object
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookieFromRequest(
  request: NextRequest,
  name: string
): string | null {
  const cookie = request.cookies.get(name)
  return cookie?.value || null
}

/**
 * Session cookie specific options
 * Used for authentication cookies
 */
export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 24 * 60 * 60 // 24 hours
}

/**
 * Cross-site cookie options
 * Used when cookies need to work across different domains
 */
export const CROSS_SITE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true, // Always required for SameSite=None
  sameSite: 'none',
  path: '/',
  maxAge: 24 * 60 * 60
}

/**
 * Helper to determine if cross-site cookies are needed
 * @param request - NextRequest object
 * @returns true if the request origin differs from the app domain
 */
export function needsCrossSiteCookies(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false
  
  const appDomain = process.env.NEXT_PUBLIC_APP_URL || 'https://dinelportal.dk'
  try {
    const originUrl = new URL(origin)
    const appUrl = new URL(appDomain)
    return originUrl.hostname !== appUrl.hostname
  } catch {
    return false
  }
}

/**
 * Create a response with authentication cookies
 * @param data - Response data
 * @param sessionToken - Session token to set
 * @param options - Additional cookie options
 * @returns NextResponse with session cookie set
 */
export function createAuthResponse(
  data: any,
  sessionToken: string,
  options: CookieOptions = {}
): NextResponse {
  const response = NextResponse.json({ ok: true, data })
  
  setCookieOnResponse(response, 'elportal_session', sessionToken, {
    ...SESSION_COOKIE_OPTIONS,
    ...options
  })
  
  return response
}

/**
 * Create a logout response that clears auth cookies
 * @param message - Optional logout message
 * @returns NextResponse with cleared cookies
 */
export function createLogoutResponse(message: string = 'Logged out successfully'): NextResponse {
  const response = NextResponse.json({ 
    ok: true, 
    data: { message } 
  })
  
  deleteCookieOnResponse(response, 'elportal_session')
  deleteCookieOnResponse(response, 'csrf_token')
  
  return response
}

/**
 * Parse cookies from a raw cookie header string
 * Useful for middleware or edge functions
 * @param cookieHeader - Raw cookie header string
 * @returns Object with cookie key-value pairs
 */
export function parseCookieHeader(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  
  cookieHeader.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=')
    if (key && value) {
      cookies[key] = decodeURIComponent(value)
    }
  })
  
  return cookies
}