/**
 * Dynamic Page Route with SSR/ISR
 * Isolated under __ssr to prevent routing conflicts
 * Handles all CMS-managed pages with proper SEO metadata
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { unstable_cache } from 'next/cache'
import { getPageBySlug } from '@/server/sanity'
import { urlFor } from '@/server/sanity'
import { SITE_URL, SITE_NAME, canonicalUrl, isProduction, getRobotsDirective } from '@/lib/url-helpers'
import ServerContentBlocks from '../../../(marketing)/ServerContentBlocks'
import ClientContentBlocks from '../../../(marketing)/ClientContentBlocks'
import ClientRouterWrapper from '../../../ClientRouterWrapper'

// Use unstable_cache for better revalidation per Codex recommendation
const getCachedPageBySlug = unstable_cache(
  async (slug: string) => getPageBySlug(slug),
  ['page-by-slug'],
  {
    revalidate: 3600, // 1 hour
    tags: ['page'],
  }
)

// Client components
const ClientNavigation = dynamic(
  () => import('@/components/Navigation')
)

const ClientFooter = dynamic(
  () => import('@/components/Footer')
)

const ClientReadingProgress = dynamic(
  () => import('@/components/ReadingProgress')
)

// Generate metadata for dynamic pages
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params
  const page = await getCachedPageBySlug(slug)
  
  if (!page) return {}
  
  const canonical = canonicalUrl(`/${slug}`)
  
  // Staging safety check per Codex
  const robotsDirective = getRobotsDirective(page.noIndex)
  
  return {
    title: page.seoMetaTitle || `${page.title} | ${SITE_NAME}`,
    description: page.seoMetaDescription,
    keywords: page.seoKeywords,
    alternates: { canonical },
    openGraph: {
      title: page.seoMetaTitle || page.title,
      description: page.seoMetaDescription,
      url: canonical,
      type: 'article',
      locale: 'da_DK',
      siteName: SITE_NAME,
      publishedTime: page._createdAt,
      modifiedTime: page._updatedAt,
      images: page.ogImage ? [{
        url: urlFor(page.ogImage).url(),
        width: 1200,
        height: 630,
        alt: page.title,
      }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@dinelportal',
      creator: '@dinelportal',
      title: page.seoMetaTitle || page.title,
      description: page.seoMetaDescription,
      images: page.ogImage ? [urlFor(page.ogImage).url()] : undefined,
    },
    robots: robotsDirective,
  }
}

// Pre-render high-value pages per Codex recommendation
export async function generateStaticParams() {
  return [
    { slug: 'elpriser' },
    { slug: 'sammenlign' },
    { slug: 'groen-energi' },
    { slug: 'vindstod' },
    { slug: 'spar-penge' },
  ]
}

// Revalidate every hour for dynamic pages
export const revalidate = 3600

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  
  // Use server-only flag per Codex security recommendation
  if (process.env.PHASE3_DYNAMIC_ENABLED !== 'true') {
    notFound()
  }
  
  const page = await getCachedPageBySlug(slug)
  if (!page) notFound()
  
  // Generate Breadcrumb JSON-LD
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Hjem',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.title,
        item: canonicalUrl(`/${slug}`),
      },
    ],
  }
  
  // Check for FAQ content blocks - cap at 20 questions per Codex performance note
  const faqBlocks = page.contentBlocks?.filter((b: any) => b._type === 'faqGroup')
  const faqItems = faqBlocks?.flatMap((b: any) => b.faqItems || []).slice(0, 20)
  const jsonLdFAQ = faqItems?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item: any) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } : null
  
  // Article schema for content pages
  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.seoMetaDescription,
    url: canonicalUrl(`/${slug}`),
    datePublished: page._createdAt,
    dateModified: page._updatedAt,
    author: { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl(`/${slug}`),
    },
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
      {/* JSON-LD in head per Codex recommendation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      {jsonLdFAQ && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
        />
      )}
      
      <ClientRouterWrapper>
        <div className="min-h-screen bg-white">
          <ClientNavigation />
          
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
          
          <ClientFooter />
        </div>
      </ClientRouterWrapper>
    </>
  )
}