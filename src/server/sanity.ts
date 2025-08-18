/**
 * Server-side Sanity client for Next.js SSR/ISR
 * This file should only be imported in server components and API routes
 */

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { env } from '@/lib/env'

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

// GROQ Queries with proper reference expansion
const pageProjection = `{
  _id,
  _type,
  title,
  "slug": slug.current,
  isHomepage,
  showReadingProgress,
  seoMetaTitle,
  seoMetaDescription,
  seoKeywords,
  noIndex,
  ogImage,
  contentBlocks[] {
    _type == "hero" => {
      _type,
      _key,
      headline,
      subheadline,
      image,
      imageAlt,
      ctaButtonText,
      ctaButtonLink,
      backgroundImage,
      backgroundImageAlt,
      variant,
      height
    },
    _type == "heroWithCalculator" => {
      _type,
      _key,
      headline,
      subheadline,
      ctaButtonText,
      backgroundImage,
      backgroundImageAlt,
      showLivePrices
    },
    _type == "pageSection" => {
      _type,
      _key,
      title,
      headerAlignment,
      content,
      image,
      imagePosition,
      imageAlt,
      cta {
        text,
        link,
        variant
      },
      settings {
        backgroundColor,
        textColor,
        paddingTop,
        paddingBottom
      }
    },
    _type == "providerList" => {
      _type,
      _key,
      title,
      subtitle,
      description,
      showDetailedPricing,
      showEnvironmentalInfo,
      displayMode
    },
    _type == "faqGroup" => {
      _type,
      _key,
      title,
      subtitle,
      faqItems[] {
        _key,
        question,
        answer
      }
    },
    _type == "valueProposition" => {
      _type,
      _key,
      heading,
      subheading,
      valueItems[] {
        _key,
        title,
        description,
        icon {
          provider,
          name
        }
      }
    },
    _type == "callToActionSection" => {
      _type,
      _key,
      headline,
      subheadline,
      ctaButtons[] {
        _key,
        text,
        link,
        variant
      },
      backgroundImage,
      backgroundColor
    },
    _type == "livePriceGraph" => {
      _type,
      _key,
      title,
      description,
      region,
      timeRange,
      showComparison,
      height
    },
    _type == "co2EmissionsDisplay" => {
      _type,
      _key,
      title,
      description,
      displayMode,
      showHistorical,
      showForecast,
      region
    },
    _type == "monthlyProductionChart" => {
      _type,
      _key,
      title,
      description,
      year,
      showComparison,
      chartType
    },
    _type == "renewableEnergyForecast" => {
      _type,
      _key,
      title,
      description,
      region,
      showDetails,
      forecastDays
    },
    _type == "priceCalculatorWidget" => {
      _type,
      _key,
      title,
      description,
      showAdvancedOptions,
      defaultConsumption,
      variant
    },
    _type == "energyTipsSection" => {
      _type,
      _key,
      title,
      tips[] {
        _key,
        title,
        description,
        icon,
        savings
      }
    },
    _type == "consumptionMap" => {
      _type,
      _key,
      title,
      description,
      dataType,
      showLegend,
      enableInteraction
    },
    _type == "infoCards" => {
      _type,
      _key,
      title,
      cards[] {
        _key,
        title,
        content,
        icon,
        backgroundColor
      },
      columns
    },
    _type == "dailyPriceTimeline" => {
      _type,
      _key,
      title,
      description,
      region,
      showPeakIndicators,
      showAveragePrice
    },
    _type == "applianceCalculator" => {
      _type,
      _key,
      title,
      description,
      defaultAppliances,
      showSavingsTips
    },
    _type == "forbrugTracker" => {
      _type,
      _key,
      title,
      description,
      enableHistoricalView,
      showCostProjection
    },
    _type => {
      _type,
      _key,
      ...
    }
  }
}`

// Server-side data fetching functions
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
    const page = await sanityClient.fetch(
      query,
      { slug },
      {
        next: {
          revalidate: 3600, // Revalidate every hour
          tags: ['page', `page:${slug}`],
        },
      }
    )
    
    return page
  } catch (error) {
    console.error(`[Server] Failed to fetch page ${slug}:`, error)
    return null
  }
}

export async function getAllPageSlugs() {
  const query = `*[_type == "page" && !isHomepage && !noIndex] {
    "slug": slug.current
  }`
  
  try {
    const pages = await sanityClient.fetch(
      query,
      {},
      {
        next: {
          revalidate: 3600,
          tags: ['pages'],
        },
      }
    )
    
    return pages.map((p: { slug: string }) => p.slug).filter(Boolean)
  } catch (error) {
    console.error('[Server] Failed to fetch page slugs:', error)
    return []
  }
}

export async function getSiteSettings() {
  const query = `*[_type == "siteSettings"][0] {
    _id,
    _type,
    headerLinks[] {
      _type == "link" => {
        _type,
        _key,
        label,
        linkType,
        externalUrl,
        internalLink-> {
          "slug": slug.current,
          _type
        }
      },
      _type == "megaMenu" => {
        _type,
        _key,
        label,
        columns[] {
          _key,
          title,
          links[] {
            _key,
            label,
            linkType,
            externalUrl,
            internalLink-> {
              "slug": slug.current,
              _type
            }
          }
        }
      }
    },
    footerSettings {
      logo,
      logoAlt,
      description,
      linkGroups[] {
        _key,
        title,
        links[] {
          _key,
          label,
          linkType,
          externalUrl,
          internalLink-> {
            "slug": slug.current,
            _type
          }
        }
      },
      socialLinks[] {
        _key,
        platform,
        url,
        icon
      },
      bottomText,
      copyrightText
    }
  }`
  
  try {
    const settings = await sanityClient.fetch(
      query,
      {},
      {
        next: {
          revalidate: 3600,
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
    name,
    slug,
    logo,
    description,
    website,
    isVindstoedProduct,
    spotPriceAddition,
    spotPriceAdditionVAT,
    monthlySubscription,
    monthlySubscriptionVAT,
    yearlyPriceEstimate,
    bindingPeriod,
    priceGuarantee,
    greenEnergyPercentage,
    customerRating,
    trustpilotRating,
    supportEmail,
    supportPhone,
    features,
    additionalBenefits,
    regionSpecific
  }`
  
  try {
    const providers = await sanityClient.fetch(
      query,
      {},
      {
        next: {
          revalidate: 3600,
          tags: ['providers'],
        },
      }
    )
    
    return providers
  } catch (error) {
    console.error('[Server] Failed to fetch providers:', error)
    return []
  }
}