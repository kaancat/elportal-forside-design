/**
 * Phase 2: Conditional Homepage Router
 * Renders SSR homepage when NEXT_PUBLIC_PHASE2_SSR=true
 * Otherwise renders the SPA wrapper for backward compatibility
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { unstable_cache } from 'next/cache'
import { getHomePage } from '@/server/sanity'
import { urlFor } from '@/server/sanity'
import { SITE_URL, SITE_NAME, canonicalUrl } from '@/lib/url-helpers'
import ServerContentBlocks from './(marketing)/ServerContentBlocks'
import ClientContentBlocks from './(marketing)/ClientContentBlocks'
import ClientRouterWrapper from './ClientRouterWrapper'
import ClientLayout from './(marketing)/ClientLayout'

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

// Use unstable_cache for better revalidation per Codex recommendation
const getCachedHomePage = unstable_cache(
  async () => getHomePage(),
  ['homepage'],
  {
    revalidate: 300, // 5 minutes
    tags: ['page', 'homepage'],
  }
)

// Generate metadata for SEO (only used in SSR mode)
export async function generateMetadata(): Promise<Metadata> {
  // Only generate metadata if SSR is enabled
  if (process.env.NEXT_PUBLIC_PHASE2_SSR !== 'true') {
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
export const revalidate = 300

export default async function HomePage() {
  // Check if Phase 2 SSR is enabled
  const isSSREnabled = process.env.NEXT_PUBLIC_PHASE2_SSR === 'true'
  
  if (!isSSREnabled) {
    // Return SPA wrapper for backward compatibility
    return <SPAApp />
  }

  // Phase 2: SSR Homepage
  // Fetch homepage data server-side
  const page = await getCachedHomePage()

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

  if (!page) {
    // If no homepage found, show 404
    notFound()
  }

  // Separate content blocks into server and client components
  const serverBlocks = ['hero', 'heroWithCalculator', 'pageSection', 'valueProposition', 'faqGroup', 'callToActionSection', 'infoCards']
  const clientBlocks = ['livePriceGraph', 'co2EmissionsDisplay', 'monthlyProductionChart', 'renewableEnergyForecast', 'priceCalculatorWidget', 'providerList', 'consumptionMap', 'dailyPriceTimeline', 'applianceCalculator', 'forbrugTracker', 'declarationProduction', 'declarationGridmix', 'regionalComparison', 'energyTipsSection', 'videoSection', 'realPriceComparisonTable', 'locationSelector']

  const serverContentBlocks = page.contentBlocks?.filter((block: any) => 
    serverBlocks.includes(block._type)
  ) || []
  
  const clientContentBlocks = page.contentBlocks?.filter((block: any) => 
    clientBlocks.includes(block._type)
  ) || []

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
      />
      <ClientRouterWrapper>
        <div className="min-h-screen bg-white">
          <ClientLayout showReadingProgress={page.showReadingProgress}>
            <main>
              {/* Server-rendered content for SEO */}
              <ServerContentBlocks 
                blocks={serverContentBlocks}
                showReadingProgress={page.showReadingProgress}
              />
              
              {/* Client-rendered interactive components */}
              <ClientContentBlocks 
                blocks={clientContentBlocks}
              />
            </main>
          </ClientLayout>
        </div>
      </ClientRouterWrapper>
    </>
  )
}