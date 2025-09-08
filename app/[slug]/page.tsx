/**
 * Root-level Dynamic Page Route for App Router
 * Handles direct navigation to content pages like /elpriser, /sammenlign, etc.
 * Uses the same logic as the nested __ssr route but at root level
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { getPageBySlug } from '@/server/sanity'
import { urlFor, getSiteSettings } from '@/server/sanity'
import { SITE_URL, SITE_NAME, canonicalUrl, getRobotsDirective } from '@/lib/url-helpers'
import UnifiedContentBlocks from '@/components/UnifiedContentBlocks'
import ClientLayout from '../(marketing)/ClientLayout'

// Use per-slug cache key by creating the cached function at call-site
const getCachedPageBySlug = async (slug: string) =>
  await unstable_cache(
    async () => getPageBySlug(slug),
    ['page-by-slug', slug],
    {
      revalidate: 3600, // 1 hour
      tags: ['page'],
    }
  )()

// Generate metadata for dynamic pages
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = await getCachedPageBySlug(slug)
  
  if (!page) return {}
  
  const canonical = canonicalUrl(`/${slug}`)
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

// Pre-generate high-traffic pages
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

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [page, siteSettings] = await Promise.all([
    getCachedPageBySlug(slug),
    getSiteSettings(),
  ])
  
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
  
  // Check for FAQ content blocks
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
  
  return (
    <>
      {/* JSON-LD in head */}
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
      
      <div className="min-h-screen bg-white">
        <ClientLayout showReadingProgress={page.showReadingProgress} initialSiteSettings={siteSettings ?? null}>
          <main>
            <UnifiedContentBlocks 
              page={page}
              enableBreadcrumbs={true}
            />
          </main>
        </ClientLayout>
      </div>
    </>
  )
}