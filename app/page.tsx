/**
 * Phase 2: Conditional Homepage Router
 * Renders SSR homepage when NEXT_PUBLIC_PHASE2_SSR=true
 * Otherwise renders the SPA wrapper for backward compatibility
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getHomePage } from '@/server/sanity'
import ServerContentBlocks from './(marketing)/ServerContentBlocks'
import ClientContentBlocks from './(marketing)/ClientContentBlocks'
import ClientRouterWrapper from './ClientRouterWrapper'

// Client components for navigation and footer
const ClientNavigation = dynamic(
  () => import('@/components/Navigation'),
  { ssr: false }
)

const ClientFooter = dynamic(
  () => import('@/components/Footer'),
  { ssr: false }
)

const ClientReadingProgress = dynamic(
  () => import('@/components/ReadingProgress'),
  { ssr: false }
)

// SPA App component for backward compatibility
const SPAApp = dynamic(() => import('@/App'), { 
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="mb-4 text-2xl font-bold text-green-600">DinElportal</div>
        <div className="text-gray-600">Indlæser...</div>
      </div>
    </div>
  )
})

// Generate metadata for SEO (only used in SSR mode)
export async function generateMetadata(): Promise<Metadata> {
  // Only generate metadata if SSR is enabled
  if (process.env.NEXT_PUBLIC_PHASE2_SSR !== 'true') {
    return {
      title: 'DinElportal - Sammenlign elpriser og spar penge',
      description: 'Danmarks uafhængige elportal. Sammenlign elpriser, find den bedste eludbyder og spar op til 2.500 kr om året på din elregning.',
    }
  }

  const page = await getHomePage()
  
  if (!page) {
    return {
      title: 'DinElportal - Sammenlign elpriser og spar penge',
      description: 'Danmarks uafhængige elportal. Sammenlign elpriser, find den bedste eludbyder og spar op til 2.500 kr om året på din elregning.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elportal.dk'
  
  return {
    title: page.seoMetaTitle || page.title || 'DinElportal - Sammenlign elpriser',
    description: page.seoMetaDescription || 'Sammenlign elpriser og find den bedste eludbyder. Spar op til 2.500 kr om året.',
    keywords: page.seoKeywords || 'elpriser, strømpriser, eludbyder, sammenlign el, spar penge',
    robots: page.noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title: page.seoMetaTitle || page.title,
      description: page.seoMetaDescription,
      url: baseUrl,
      siteName: 'DinElportal',
      images: page.ogImage ? [
        {
          url: page.ogImage.asset?.url || '',
          width: 1200,
          height: 630,
          alt: page.ogImage.alt || page.title,
        }
      ] : [],
      locale: 'da_DK',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.seoMetaTitle || page.title,
      description: page.seoMetaDescription,
      images: page.ogImage?.asset?.url ? [page.ogImage.asset.url] : [],
    },
    alternates: {
      canonical: baseUrl,
    },
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
  const page = await getHomePage()

  if (!page) {
    // If no homepage found, show 404
    notFound()
  }

  // Separate content blocks into server and client components
  const serverBlocks = ['hero', 'heroWithCalculator', 'pageSection', 'valueProposition', 'faqGroup', 'callToActionSection', 'energyTipsSection', 'infoCards']
  const clientBlocks = ['livePriceGraph', 'co2EmissionsDisplay', 'monthlyProductionChart', 'renewableEnergyForecast', 'priceCalculatorWidget', 'providerList', 'consumptionMap', 'dailyPriceTimeline', 'applianceCalculator', 'forbrugTracker']

  const serverContentBlocks = page.contentBlocks?.filter((block: any) => 
    serverBlocks.includes(block._type)
  ) || []
  
  const clientContentBlocks = page.contentBlocks?.filter((block: any) => 
    clientBlocks.includes(block._type)
  ) || []

  return (
    <ClientRouterWrapper>
      <div className="min-h-screen bg-white">
        {/* Navigation - will be client component for interactivity */}
        <ClientNavigation />
        
        {/* Reading Progress - conditionally rendered */}
        {page.showReadingProgress && <ClientReadingProgress />}
        
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
        
        {/* Footer - will be client component for interactivity */}
        <ClientFooter />
      </div>
    </ClientRouterWrapper>
  )
}