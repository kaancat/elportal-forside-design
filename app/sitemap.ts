import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/url-helpers'
import { SanityService } from '@/services/sanityService'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL
  const items: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  ]

  try {
    const pages = await SanityService.getAllPages()
    for (const p of pages) {
      if (!p?.slug || p.noIndex) continue
      items.push({
        url: `${base}/${p.slug}`,
        lastModified: p._updatedAt ? new Date(p._updatedAt) : undefined,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }

    items.push({ url: `${base}/nyheder`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 })

    const posts = await SanityService.getAllBlogPostSlugs()
    for (const post of posts) {
      if (!post?.slug) continue
      items.push({
        url: `${base}/nyheder/${post.slug}`,
        lastModified: post.publishedDate ? new Date(post.publishedDate) : (post._updatedAt ? new Date(post._updatedAt) : undefined),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch {}

  return items
}
