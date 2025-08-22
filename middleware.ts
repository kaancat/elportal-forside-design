import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Phase 2 & 3 Migration Middleware
 * 
 * This middleware controls which routes are handled by Next.js SSR/ISR
 * versus the legacy React Router SPA. As we migrate pages, we add them
 * to the appropriate arrays.
 * 
 * Phase 2: Homepage SSR
 * Phase 3: Dynamic pages with route isolation
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Avoid rewrite loops: never process the fallback route itself
  if (pathname === '/spa-fallback' || pathname.startsWith('/spa-fallback/')) {
    return NextResponse.next()
  }
  
  // Route consolidation: no internal __ssr routes anymore
  
  // Only process GET and HEAD requests
  if (!['GET', 'HEAD'].includes(request.method)) {
    return NextResponse.next()
  }
  
  // Feature flags for gradual rollout
  const phase2Enabled = process.env.NEXT_PUBLIC_PHASE2_SSR === 'true'
  const phase3Enabled = process.env.PHASE3_DYNAMIC_ENABLED === 'true'
  
  // Routes that have been migrated to Next.js SSR/ISR
  // Start with homepage, add more routes as we migrate them
  const nextjsRoutes: string[] = [
    // Homepage is the first to migrate
    '/',
    // High-traffic pages now migrated with root-level [slug] route
    '/elpriser',
    '/sammenlign', 
    '/groen-energi',
    '/vindstod',
    '/spar-penge',
  ]
  
  // Routes that should always use React Router SPA
  // These are lower priority or complex interactive pages
  const spaOnlyRoutes = [
    '/energy-tips',
    '/test-eloverblik',
    '/icon-test',
    '/admin',
    '/privacy-policy',
  ]
  
  // Check if this is a migrated Next.js route
  const isMigratedRoute = phase2Enabled && nextjsRoutes.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname === route || pathname.startsWith(`${route}/`)
  })
  
  // Check if this is explicitly a SPA route
  const isSpaRoute = spaOnlyRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  // Phase 3: Dynamic pages are handled by root-level [slug] route directly
  // Let Next.js handle any non-SPA routes without rewrite when enabled
  if (phase3Enabled && !isSpaRoute) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Phase 3 enabled, delegating to App Router for: ${pathname}`)
    }
    return NextResponse.next()
  }
  
  if (isMigratedRoute) {
    // Let Next.js handle this route with SSR/ISR
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Phase 2 SSR route: ${pathname}`)
    }
    return NextResponse.next()
  }
  
  // For SPA routes, rewrite to catch-all only if they're explicitly SPA routes
  if (isSpaRoute) {
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] SPA route: ${pathname}`)
    }
    // Rewrite to the catch-all route that mounts React Router
    // Clone URL to preserve query strings
    const url = request.nextUrl.clone()
    url.pathname = `/spa-fallback${pathname}`
    return NextResponse.rewrite(url)
  }
  
  // For unknown routes, default to Next.js handling (no rewrite)
  
  // Default: let Next.js handle it
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/ (all Next.js internals including HMR)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Public static files with extensions
     * - spa-fallback (to prevent rewrite loops)
     */
    '/((?!api|_next/|favicon.ico|sitemap.xml|robots.txt|.*\\..*|assets|static|spa-fallback).*)',
  ],
}