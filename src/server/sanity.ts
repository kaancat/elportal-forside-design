/**
 * Server-side Sanity client for Next.js SSR/ISR
 * This file should only be imported in server components and API routes
 */

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { env } from '@/lib/env'
import { pageProjection } from '@/lib/sanityProjections'

// Server-side Sanity client with different configuration
export const sanityClient = createClient({
  projectId: env.SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET,
  apiVersion: env.SANITY_API_VERSION,
  useCdn: true, // Enable CDN for server-side requests
  perspective: 'published', // Only fetch published content
  stega: {
    enabled: false, // Disable visual editing for production
  },
})

// Image URL builder
const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// Server-side data fetching functions use the centralized projection

export async function getHomePage() {
  const query = `*[_type == "page" && isHomepage == true][0] ${pageProjection}`
  
  try {
    const page = await sanityClient.fetch(
      query,
      {},
      {
        next: {
          revalidate: 300, // Revalidate every 5 minutes
          tags: ['homepage', 'page'],
        },
      }
    )
    
    return page
  } catch (error) {
    console.error('[Server] Failed to fetch homepage:', error)
    return null
  }
}

export async function getPageBySlug(slug: string) {
  const query = `*[_type == "page" && slug.current == $slug][0] ${pageProjection}`
  
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Sanity] getPageBySlug called`, { slug })
    }
    const page = await sanityClient.fetch(
      query,
      { slug },
      {
        next: {
          revalidate: 3600, // Revalidate every hour
          tags: ['page'],
        },
      }
    )
    
    if (!page && process.env.NODE_ENV !== 'production') {
      console.warn(`[Sanity] No page found for slug`, { slug })
    }
    return page
  } catch (error) {
    console.error(`[Server] Failed to fetch page ${slug}:`, error)
    return null
  }
}

export async function getAllPageSlugs() {
  const query = `*[_type == "page" && !isHomepage && !noIndex] {
    "slug": slug.current,
    _updatedAt
  }`
  
  try {
    const pages = await sanityClient.fetch(
      query,
      {},
      {
        next: {
          revalidate: 3600, // Revalidate every hour
          tags: ['page'],
        },
      }
    )
    
    return pages.map((p: any) => ({
      slug: p.slug,
      lastModified: new Date(p._updatedAt).toISOString(),
    })).filter(p => p.slug)
  } catch (error) {
    console.error('[Server] Failed to fetch page slugs:', error)
    return []
  }
}

export async function getSiteSettings() {
  const query = `*[_type == "siteSettings"][0] {
    _id,
    _type,
    title,
    headerLinks[] {
      _type == "link" => {
        _key,
        _type,
        title,
        linkType,
        internalLink->{ "slug": slug.current, _type },
        externalUrl,
        isButton
      },
      _type == "megaMenu" => {
        _key,
        _type,
        title,
        content[] {
          _key,
          title,
          items[] {
            _key,
            title,
            description,
            icon,
            link {
              _type,
              linkType,
              internalLink->{ "slug": slug.current, _type },
              externalUrl
            }
          }
        }
      }
    },
    footer {
      footerLogo {
        asset-> {
          _id,
          _ref,
          url
        },
        alt
      },
      footerDescription,
      copyrightText,
      secondaryCopyrightText,
      linkGroups[] {
        _key,
        title,
        links[] {
          _key,
          title,
          linkType,
          internalLink->{ "slug": slug.current, _type },
          externalUrl
        }
      }
    },
    logo {
      asset-> {
        _id,
        _ref,
        url
      },
      alt
    }
  }`

  try {
    const settings = await sanityClient.fetch(
      query,
      {},
      {
        next: {
          revalidate: 3600, // Revalidate every hour
          tags: ['siteSettings'],
        },
      }
    )
    
    return settings
  } catch (error) {
    console.error('[Server] Failed to fetch site settings:', error)
    return null
  }
}

export async function getProviders() {
  const query = `*[_type == "provider" && !(_id in path("drafts.**"))] | order(name asc) {
    _id,
    _type,
    providerName,
    productName,
    logo {
      asset-> {
        _id,
        url
      },
      alt
    },
    spotPriceMarkup,
    greenCertificateFee,
    tradingCosts,
    monthlySubscription,
    signupFee,
    yearlySubscription,
    isVindstoedProduct,
    isVariablePrice,
    bindingPeriod,
    isGreenEnergy,
    benefits,
    signupLink,
    lastPriceUpdate,
    priceUpdateFrequency,
    notes,
    isActive,
    displayPrice_kWh,
    displayMonthlyFee,
    regionalPricing[] {
      region,
      spotPriceMarkup,
      monthlySubscription
    }
  }`

  try {
    const providers = await sanityClient.fetch(
      query,
      {},
      {
        next: {
          revalidate: 3600, // Revalidate every hour  
          tags: ['provider'],
        },
      }
    )
    
    return providers
  } catch (error) {
    console.error('[Server] Failed to fetch providers:', error)
    return []
  }
}