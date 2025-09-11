/**
 * Dynamic sitemap generation
 * Fetches all pages from Sanity and generates XML sitemap
 * Excludes noIndex pages automatically
 */

import type { MetadataRoute } from 'next'
import { getAllPageSlugs } from '@/server/sanity'
import { SITE_URL, canonicalUrl } from '@/lib/url-helpers'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all page data from Sanity (includes slug and lastModified)
  const pagesData = await getAllPageSlugs()
  
  const pages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]
  
  // Add dynamic pages with appropriate metadata
  for (const pageData of pagesData) {
    const slug = typeof pageData === 'string' ? pageData : pageData.slug
    const lastModified = typeof pageData === 'object' && pageData.lastModified 
      ? new Date(pageData.lastModified) 
      : new Date()
    
    // Never expose __ssr paths per Codex
    if (slug.includes('__ssr') || slug.startsWith('_')) continue
    
    // Skip test and admin pages
    if (slug.includes('test') || slug.includes('admin')) continue
    
    pages.push({
      url: canonicalUrl(`/${slug}`),
      lastModified, // Now using actual _updatedAt from Sanity
      changeFrequency: getChangeFrequency(slug),
      priority: getPriority(slug),
    })
  }
  
  // Add static important routes that might not be in CMS
  const staticRoutes = [
    // '/sammenlign' was 404; redirecting to the correct page slug
    { path: '/leverandoer-sammenligning', changeFreq: 'daily' as const, priority: 0.9 },
    { path: '/elpriser', changeFreq: 'daily' as const, priority: 0.9 },
    { path: '/historiske-priser', changeFreq: 'weekly' as const, priority: 0.7 },
    { path: '/elselskaber', changeFreq: 'monthly' as const, priority: 0.6 },
  ]
  
  for (const route of staticRoutes) {
    // Check if not already added from CMS
    if (!pages.some(p => p.url === canonicalUrl(route.path))) {
      pages.push({
        url: canonicalUrl(route.path),
        lastModified: new Date(),
        changeFrequency: route.changeFreq,
        priority: route.priority,
      })
    }
  }
  
  return pages
}

function getChangeFrequency(slug: string): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
  // High-frequency updates for price-related pages
  if (['elpriser', 'sammenlign'].includes(slug)) return 'daily'
  
  // Weekly updates for informational pages
  if (['groen-energi', 'vindstod', 'spar-penge'].includes(slug)) return 'weekly'
  
  // Monthly for most other content
  return 'monthly'
}

function getPriority(slug: string): number {
  // Highest priority for conversion pages
  if (['elpriser', 'sammenlign', 'vindstod'].includes(slug)) return 0.9
  
  // High priority for informational pages
  if (['groen-energi', 'spar-penge', 'elmarked'].includes(slug)) return 0.7
  
  // Medium priority for support/help pages
  if (slug.includes('hjaelp') || slug.includes('guide')) return 0.5
  
  // Default priority
  return 0.6
}
