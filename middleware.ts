import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Phase 2 Migration Middleware
 * 
 * This middleware controls which routes are handled by Next.js SSR/ISR
 * versus the legacy React Router SPA. As we migrate pages, we add them
 * to the nextjsRoutes array.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Avoid rewrite loops: never process the fallback route itself
  if (pathname === '/spa-fallback' || pathname.startsWith('/spa-fallback/')) {
    return NextResponse.next()
  }
  
  // Only process GET and HEAD requests
  if (!['GET', 'HEAD'].includes(request.method)) {
    return NextResponse.next()
  }
  
  // Feature flag for gradual rollout
  const phase2Enabled = process.env.NEXT_PUBLIC_PHASE2_SSR === 'true'
  
  // Routes that have been migrated to Next.js SSR/ISR
  // Start with homepage, add more routes as we migrate them
  const nextjsRoutes: string[] = [
    // Homepage is the first to migrate
    '/',
    // High-traffic pages to migrate next
    // '/elpriser',
    // '/sammenlign', 
    // '/groen-energi',
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
  
  if (isMigratedRoute) {
    // Let Next.js handle this route with SSR/ISR
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] SSR route: ${pathname}`)
    }
    return NextResponse.next()
  }
  
  // For SPA routes or unmigrated routes, rewrite to catch-all
  // This preserves React Router functionality
  if (isSpaRoute || !isMigratedRoute) {
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