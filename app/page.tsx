/**
 * Phase 2: Conditional Homepage Router
 * Renders SSR homepage when NEXT_PUBLIC_PHASE2_SSR=true
 * Otherwise renders the SPA wrapper for backward compatibility
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
// Note: avoid module-level unstable_cache for homepage to prevent stale negative caching
import { getHomePage } from '@/server/sanity'
import { urlFor } from '@/server/sanity'
import { SITE_URL, SITE_NAME, canonicalUrl } from '@/lib/url-helpers'
import { envBool } from '@/lib/env'
import UnifiedContentBlocks from '@/components/UnifiedContentBlocks'
import ClientLayout from './(marketing)/ClientLayout'
import { getSiteSettings } from '@/server/sanity'
import { headers } from 'next/headers'

// SPA App component removed - using App Router only
const SPAApp = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-2xl font-bold text-green-600">DinElPortal</div>
        <div className="text-gray-600">App Router aktiveret</div>
      </div>
    </div>
  );
}

// Fetch directly; sanityClient.fetch in getHomePage already sets Next caching via revalidate + tags
const getCachedHomePage = async () => getHomePage()

// Generate metadata for SEO (only used in SSR mode)
export async function generateMetadata(): Promise<Metadata> {
  // Enable SSR by default in preview/production. Allow explicit opt-out with NEXT_PUBLIC_PHASE2_SSR=false
  const ssrEnabled = envBool('NEXT_PUBLIC_PHASE2_SSR', true)
  if (!ssrEnabled) {
    return {
      title: 'DinElPortal - Sammenlign elpriser og spar penge',
      description: 'Danmarks uafhængige elportal. Sammenlign elpriser, find den bedste eludbyder og spar op til 2.500 kr om året på din elregning.',
    }
  }

  const page = await getCachedHomePage()
  const canonical = canonicalUrl('/')
  
  return {
    title: page?.seoMetaTitle || 'Sammenlign Elpriser - Find Billigste Elaftale | DinElPortal',
    description: page?.seoMetaDescription || 'Spar penge på din elregning! Sammenlign aktuelle elpriser og find den bedste elaftale for dig. Gratis sammenligning af danske eludbydere.',
    keywords: page?.seoKeywords,
    alternates: { canonical }, // Per-route canonical as Codex suggested
    openGraph: {
      title: page?.seoMetaTitle || 'Sammenlign Elpriser | DinElPortal',
      description: page?.seoMetaDescription,
      url: canonical,
      type: 'website',
      locale: 'da_DK',
      siteName: SITE_NAME,
      images: page?.ogImage ? [{
        url: urlFor(page.ogImage).url(),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Sammenlign elpriser og find den bedste elaftale`,
      }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@dinelportal',
      creator: '@dinelportal',
      title: page?.seoMetaTitle || 'Sammenlign Elpriser | DinElPortal',
      description: page?.seoMetaDescription,
      images: page?.ogImage ? [urlFor(page.ogImage).url()] : undefined,
    },
    robots: page?.noIndex ? { index: false, follow: false } : undefined,
  }
}

// Revalidate every 5 minutes (only in SSR mode)
export const revalidate = 60

export default async function HomePage() {
  // Check if Phase 2 SSR is enabled (explicit opt-in only)
  // Prevent local 404s when homepage isn't published by defaulting to SPA unless flag is true
  const isSSREnabled = envBool('NEXT_PUBLIC_PHASE2_SSR', true)

  if (!isSSREnabled) {
    // Return SPA wrapper for backward compatibility when explicitly disabled
    return <SPAApp />
  }

  // Phase 2: SSR Homepage
  // Fetch homepage data server-side
  const [page, siteSettings] = await Promise.all([
    getCachedHomePage(),
    getSiteSettings()
  ])
  // If no homepage exists in the current dataset, render 404 (do not redirect)
  if (!page) return notFound()

  // Generate WebSite JSON-LD (Organization already in layout)
  const jsonLdWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: 'Sammenlign elpriser og find den bedste elaftale',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/sammenlign?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
  
  // If homepage includes a provider list block, emit ItemList JSON-LD
  const providerBlock: any = Array.isArray((page as any)?.contentBlocks)
    ? (page as any).contentBlocks.find((b: any) => b?._type === 'providerList' && Array.isArray(b.providers) && b.providers.length > 0)
    : null
  const jsonLdProviderList = providerBlock ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: providerBlock.title || 'Udbydere',
    numberOfItems: providerBlock.providers.length,
    itemListElement: providerBlock.providers.slice(0, 10).map((p: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        // Use Organization instead of Product to avoid Product rich result requirements
        '@type': 'Organization',
        name: `${p.providerName || ''} ${p.productName || ''}`.trim() || p.providerName || p.productName || 'Ukendt',
        brand: p.providerName || undefined
      }
    }))
  } : null

  if (!page) {
    // In non-production, keep SPA fallback to aid local development
    if (process.env.NODE_ENV !== 'production') {
      return <SPAApp />
    }
    notFound()
  }

  const nonce = (await headers()).get('x-csp-nonce') || undefined
  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce as any}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
      />
      {jsonLdProviderList && (
        <script
          type="application/ld+json"
          nonce={nonce as any}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProviderList) }}
        />
      )}
      <div className="min-h-screen bg-white">
        <ClientLayout showReadingProgress={page.showReadingProgress} initialSiteSettings={siteSettings ?? null}>
          <main>
            <UnifiedContentBlocks 
              page={page}
              enableBreadcrumbs={false}
            />
          </main>
        </ClientLayout>
      </div>
    </>
  )
}
