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
  
  // Never rewrite internal SSR routes
  if (pathname.startsWith('/__ssr/')) {
    return NextResponse.next()
  }
  
  // Only process GET and HEAD requests
  if (!['GET', 'HEAD'].includes(request.method)) {
    return NextResponse.next()
  }
  
  // Feature flags for gradual rollout
  const phase2Enabled = process.env.NEXT_PUBLIC_PHASE2_SSR === 'true'
  const phase3Enabled = process.env.PHASE3_DYNAMIC_ENABLED === 'true' // Server-only flag per Codex
  
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
  
  // Phase 3: Dynamic pages with route isolation
  if (phase3Enabled && !isSpaRoute && !isMigratedRoute) {
    const dynamicPages = [
      '/elpriser',
      '/sammenlign',
      '/groen-energi',
      '/vindstod',
      '/spar-penge',
    ]
    
    const isDynamicPage = dynamicPages.some(page => 
      pathname === page || pathname.startsWith(`${page}/`)
    )
    
    if (isDynamicPage) {
      // Rewrite to isolated SSR route (never expose __ssr in canonicals)
      const url = request.nextUrl.clone()
      url.pathname = `/__ssr${pathname}`
      
      // Add X-Robots-Tag for staging per Codex
      if (process.env.SITE_URL !== 'https://dinelportal.dk') {
        const response = NextResponse.rewrite(url)
        response.headers.set('X-Robots-Tag', 'noindex, nofollow')
        return response
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Middleware] Phase 3 SSR route: ${pathname} -> /__ssr${pathname}`)
      }
      
      return NextResponse.rewrite(url)
    }
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
  
  // For unknown routes, try SSR if Phase 3 is enabled, otherwise fallback to SPA
  if (!isMigratedRoute && phase3Enabled) {
    // Try SSR for unknown content pages
    const url = request.nextUrl.clone()
    url.pathname = `/__ssr${pathname}`
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] Trying SSR for unknown route: ${pathname} -> /__ssr${pathname}`)
    }
    
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