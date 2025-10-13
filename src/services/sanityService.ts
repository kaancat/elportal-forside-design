import { client } from '@/lib/sanity'
import { BlogPost, SiteSettings, SanityPage, ProviderProductBlock, UnifiedPage } from '@/types/sanity'
import { UnifiedPageService } from './unifiedPageService'
import { sanitizeContentBlocks } from '@/lib/sanitizeContentBlocks'
import { validateAndFilterUnifiedPage } from '@/lib/validation'

export class SanityService {

  // Fetch all blog posts
  static async getAllBlogPosts(): Promise<BlogPost[]> {
    const query = `*[_type == "blogPost"] | order(publishedDate desc){
      _id,
      _type,
      title,
      slug,
      type,
      description,
      featuredImage{
        asset->{
          _id,
          url
        },
        alt,
        hotspot,
        crop
      },
      publishedDate,
      featured,
      readTime,
      tags,
      seoMetaTitle,
      seoMetaDescription,
      seoMetaKeywords,
      seoOpenGraphImage
    }`

    try {
      const posts = await client.fetch<BlogPost[]>(query)
      return posts
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }
  }

  // Fetch single blog post by slug (with full content blocks)
  static async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const query = `*[_type == "blogPost" && slug.current == $slug][0]{
      _id,
      _type,
      title,
      slug,
      type,
      description,
      featuredImage{
        asset->{
          _id,
          url
        },
        alt,
        hotspot,
        crop
      },
      contentBlocks[]{
        ...,
        _type == "richTextSection" => {
          ...,
          content
        },
        _type == "hero" => {
          ...,
          backgroundImage{
            asset->{url},
            alt
          }
        },
        _type == "videoSection" => {
          ...,
          videoUrl,
          thumbnailImage{
            asset->{url},
            alt
          }
        },
        _type == "faqGroup" => {
          ...,
          items[]{
            question,
            answer
          }
        }
      },
      publishedDate,
      featured,
      readTime,
      tags,
      seoMetaTitle,
      seoMetaDescription,
      seoMetaKeywords,
      seoOpenGraphImage{
        asset->{url},
        alt
      }
    }`

    try {
      const post = await client.fetch<BlogPost>(query, { slug })
      return post
    } catch (error) {
      console.error('Error fetching blog post:', error)
      return null
    }
  }

  // Fetch blog page settings
  static async getBlogPageSettings() {
    const query = `*[_type == "blogPageSettings" && _id == "blogPageSettings"][0]{
      _id,
      _type,
      heroTitle,
      heroSubtitle,
      heroBackgroundImage{
        asset->{
          _id,
          url
        },
        alt,
        hotspot,
        crop
      },
      "featuredPosts": featuredPosts[]->{
        _id,
        _type,
        title,
        slug,
        type,
        description,
        featuredImage{
          asset->{
            _id,
            url
          },
          alt,
          hotspot,
          crop
        },
        publishedDate,
        featured,
        readTime,
        tags
      },
      seoMetaTitle,
      seoMetaDescription,
      seoMetaKeywords,
      seoOpenGraphImage{
        asset->{url},
        alt
      }
    }`

    try {
      const settings = await client.fetch(query)
      return settings
    } catch (error) {
      console.error('Error fetching blog page settings:', error)
      return null
    }
  }

  // Fetch site settings including navigation data
  static async getSiteSettings(): Promise<SiteSettings | null> {
    try {
      const response = await fetch('/api/site-settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API response not ok: ${response.status}`)
      }

      const settings = await response.json()
      return settings
    } catch (error) {
      console.error('Error fetching site settings from API:', error)
      return null
    }
  }

  // Fetch page by slug
  static async getPageBySlug(slug: string): Promise<SanityPage | null> {
    const query = `*[_type == "page" && slug.current == $slug][0] {
      _id,
      _type,
      title,
      slug,
      seoMetaTitle,
      seoMetaDescription,
      contentBlocks[] {
        ...,
        _type == "pageSection" => {
          ...,
          theme->{ 
            "background": background.hex,
            "text": text.hex,
            "primary": primary.hex
          },
          settings,
          content[]{ 
            ...,
            _type == "livePriceGraph" => {
              _key,
              _type,
              title,
              subtitle,
              apiRegion,
              headerAlignment
            },
            _type == "renewableEnergyForecast" => {
              _key,
              _type,
              title,
              leadingText,
              headerAlignment
            },
            _type == "priceCalculator" => {
              _key,
              _type,
              title
            }
          }
        },
        _type == "faqItem" => {
          question,
          answer
        },
        _type == "faqGroup" => {
          title,
          faqItems[]{
            _key,
            question,
            answer
          }
        },
        _type == "videoSection" => {
          title,
          videoUrl,
          customThumbnail{
            asset,
            alt,
            hotspot,
            crop
          }
        },
        _type == "richTextSection" => {
          content
        },
        _type == "callToActionSection" => {
          title,
          buttonText,
          buttonUrl
        },
        _type == "infoCardsSection" => {
          _key,
          _type,
          title,
          subtitle,
          headerAlignment,
          leadingText,
          cards[]{
            title,
            description,
            icon,
            iconColor,
            bgColor
          },
          columns
        },
        _type == "livePriceGraph" => {
          title,
          subtitle,
          apiRegion,
          headerAlignment
        },
        _type == "realPriceComparisonTable" => {
          _key,
          _type,
          title,
          leadingText
        },
        _type == "providerList" => {
          _key,
          _type,
          title,
          subtitle,
          headerAlignment,
          priceSourceDate,
          'providers': providers[]->{ 
            "id": _id,
            providerName,
            productName,
            "logoUrl": logo.asset->url,
            // New detailed pricing fields
            spotPriceMarkup,
            greenCertificateFee,
            tradingCosts,
            monthlySubscription,
            signupFee,
            yearlySubscription,
            // Product features
            isVindstoedProduct,
            isVariablePrice,
            bindingPeriod,
            isGreenEnergy,
            benefits,
            signupLink,
            // Metadata
            lastPriceUpdate,
            priceUpdateFrequency,
            notes,
            isActive,
            // Legacy fields for backward compatibility
            displayPrice_kWh,
            displayMonthlyFee
          }
        },
        _type == "featureList" => {
          _key,
          _type,
          title,
          features[]{
            _key,
            _type,
            title,
            description,
            icon {
              ...,
              metadata {
                inlineSvg,
                iconName,
                url,
                color
              }
            }
          }
        },
        _type == "valueProposition" => {
          _key,
          _type,
          heading,
          subheading,
          content,
          valueItems[]{
            _key,
            heading,
            description,
            icon {
              ...,
              metadata {
                inlineSvg,
                iconName,
                url,
                color
              }
            }
          },
          // Legacy fields for backward compatibility
          title,
          propositions,
          items[]{
            _key,
            text,
            heading,
            description,
            icon {
              ...,
              metadata {
                inlineSvg,
                iconName,
                url,
                color
              }
            }
          }
        },
        _type == "monthlyProductionChart" => {
          _key,
          _type,
          title,
          leadingText,
          description,
          headerAlignment
        },
        _type == "renewableEnergyForecast" => {
          _key,
          _type,
          title,
          leadingText,
          headerAlignment
        },
        _type == "co2EmissionsChart" => {
          _key,
          _type,
          title,
          subtitle,
          leadingText,
          headerAlignment,
          showGauge
        },
        _type == "declarationProduction" => {
          _key,
          _type,
          title,
          subtitle,
          leadingText,
          headerAlignment,
          showProductionBreakdown,
          showCO2Intensity,
          showRenewableShare,
          defaultView
        },
        _type == "consumptionMap" => {
          _key,
          _type,
          title,
          subtitle,
          leadingText,
          headerAlignment,
          dataSource,
          consumerType,
          colorScheme,
          showLegend,
          showTooltips,
          enableInteraction,
          updateInterval,
          defaultView,
          showStatistics,
          mobileLayout
        },
        _type == "declarationGridmix" => {
          _key,
          _type,
          title,
          subtitle,
          leadingText,
          headerAlignment,
          showSummary,
          view
        },
        _type == "applianceCalculator" => {
          _key,
          _type,
          title,
          subtitle,
          showCategories,
          showSavingsCallToAction,
          defaultElectricityPrice
        },
        _type == "energyTipsSection" => {
          _key,
          _type,
          title,
          subtitle,
          showCategories,
          displayMode,
          headerAlignment,
          showDifficultyBadges,
          showSavingsPotential,
          showSavingsCalculator,
          maxTipsPerCategory,
          defaultCategory,
          tips[]-> | order(priority desc, _updatedAt desc) {
            _id,
            title,
            slug,
            category,
            shortDescription,
            savingsPotential,
            difficulty,
            icon,
            estimatedSavings,
            implementationTime,
            priority
          }
        },
        _type == "chargingBoxShowcase" => {
          _key,
          _type,
          heading,
          headerAlignment,
          description,
          products[]->{ 
            _id,
            name,
            description,
            originalPrice,
            currentPrice,
            badge,
            features,
            productImage,
            ctaLink,
            ctaText
          }
        },
        _type == "heroWithCalculator" => {
          _key,
          _type,
          headline,
          subheadline,
          highlightWords,
          content,
          calculatorTitle,
          showLivePrice,
          showProviderComparison,
          stats[]{
            _key,
            value,
            label
          },
          image{
            ...,
            asset->{
              _id,
              url,
              metadata {
                dimensions {
                  width,
                  height
                }
              }
            }
          },
          backgroundStyle,
          textColor,
          overlayOpacity,
          padding,
          alignment
        }
      }
    }`

    try {
      const page = await client.fetch<SanityPage>(query, { slug })
      // Sanitize and validate
      if (page && page.contentBlocks) {
        page.contentBlocks = sanitizeContentBlocks(page.contentBlocks)
      }
      if (page) {
        const { page: validated, valid, errors } = validateAndFilterUnifiedPage(page)
        if (!valid && errors.length > 0) {
          console.warn('[SanityService] Unified page schema mismatches:', errors)
        }
        return validated as SanityPage
      }
      return page
    } catch (error) {
      console.error('Error fetching page by slug:', error)
      return null
    }
  }

  // Fetch all providers - single query to avoid N+1 problem
  static async getAllProviders(): Promise<ProviderProductBlock[]> {
    try {
      // Always fetch via Next API to avoid browser CORS to Sanity
      const res = await fetch('/api/providers', { cache: 'no-store' })
      if (!res.ok) throw new Error(`API responded ${res.status}`)
      const data = await res.json()
      return Array.isArray(data?.providers) ? data.providers : []
    } catch (error) {
      console.error('Error fetching providers via API:', error)
      return []
    }
  }

  // ===== UNIFIED PAGE METHODS =====
  // Primary methods for fetching pages using the unified schema

  /**
   * Fetch homepage using unified page schema
   * @returns UnifiedPage or null
   */
  static async getUnifiedHomePage(): Promise<UnifiedPage | null> {
    try {
      // Fetch homepage using unified schema
      const page = await client.fetch<UnifiedPage | null>(
        `*[_type == "page" && isHomepage == true][0]{
          ${this.getUnifiedPageQueryFragment()}
        }`
      )

      // Sanitize and validate
      if (page && page.contentBlocks) {
        page.contentBlocks = sanitizeContentBlocks(page.contentBlocks)
      }
      if (page) {
        const { page: validated, valid, errors } = validateAndFilterUnifiedPage(page)
        if (!valid && errors.length > 0) {
          console.warn('[SanityService] Unified page schema mismatches:', errors)
        }
        return validated as UnifiedPage
      }
      return page
    } catch (error) {
      console.error('Error fetching unified homepage:', error)
      return null
    }
  }

  /**
   * Fetch any page (homepage or regular) using unified schema
   * @param slug - Optional slug for regular pages, null/undefined for homepage
   * @returns UnifiedPage or null
   */
  static async getUnifiedPage(slug?: string): Promise<UnifiedPage | null> {
    try {
      if (!slug) {
        return this.getUnifiedHomePage()
      }

      // Fetch page using unified schema
      const page = await client.fetch<UnifiedPage | null>(
        `*[_type == "page" && slug.current == $slug][0]{
          ${this.getUnifiedPageQueryFragment()}
        }`,
        { slug }
      )

      // Sanitize content blocks to ensure all have keys
      if (page && page.contentBlocks) {
        page.contentBlocks = sanitizeContentBlocks(page.contentBlocks)
      }

      return page
    } catch (error) {
      console.error('Error fetching unified page:', error)
      return null
    }
  }

  /**
   * Get the GROQ query fragment for unified pages
   * Handles all content blocks and references
   */
  private static getUnifiedPageQueryFragment(): string {
    return `
      _id,
      _type,
      title,
      slug,
      parent->{
        _id,
        title,
        slug
      },
      isHomepage,
      showReadingProgress,
      seoMetaTitle,
      seoMetaDescription,
      seoKeywords,
      ogImage{
        _type,
        asset->{
          _ref,
          _type
        },
        alt
      },
      noIndex,
      contentBlocks[]{
        _type,
        _key,
        _type == "pageSection" => {
          ...,
          theme->{
            "background": background.hex,
            "text": text.hex,
            "primary": primary.hex
          },
          settings,
          content[]{
            ...,
            _type == "livePriceGraph" => {
              _key,
              _type,
              title,
              subtitle,
              apiRegion,
              headerAlignment
            },
            _type == "renewableEnergyForecast" => {
              _key,
              _type,
              title,
              leadingText,
              headerAlignment
            },
            _type == "priceCalculator" => {
              _key,
              _type,
              title
            }
          }
        },
        _type == "hero" => {
          ...,
          cta,
          image{
            ...,
            asset->{
              _id,
              url,
              metadata {
                dimensions {
                  width,
                  height
                }
              }
            }
          },
          images[]{
            ...,
            asset->{
              _id,
              url,
              metadata {
                dimensions {
                  width,
                  height
                }
              }
            }
          },
          backgroundStyle,
          textColor,
          overlayOpacity,
          padding,
          alignment
        },
        _type == "heroWithCalculator" => {
          _key,
          _type,
          headline,
          subheadline,
          highlightWords,
          content,
          calculatorTitle,
          showLivePrice,
          showProviderComparison,
          stats[]{
            _key,
            value,
            label
          },
          image{
            ...,
            asset->{
              _id,
              url,
              metadata {
                dimensions {
                  width,
                  height
                }
              }
            }
          },
          backgroundStyle,
          textColor,
          overlayOpacity,
          padding,
          alignment
        },
        _type == "realPriceComparisonTable" => {
          _key,
          _type,
          title,
          leadingText
        },
        _type == "faqGroup" => {
          title,
          faqItems[]{
            _key,
            question,
            answer
          }
        },
        _type == "callToActionSection" => {
          title,
          buttonText,
          buttonUrl
        },
        _type == "livePriceGraph" => {
          title,
          subtitle,
          apiRegion,
          headerAlignment
        },
        _type == "renewableEnergyForecast" => {
          _key,
          _type,
          title,
          leadingText,
          headerAlignment
        },
        _type == "monthlyProductionChart" => {
          _key,
          _type,
          title,
          leadingText,
          description,
          headerAlignment
        },
        _type == "co2EmissionsChart" => {
          _key,
          _type,
          title,
          subtitle,
          leadingText,
          headerAlignment,
          showGauge
        },
        _type == "declarationProduction" => {
          _key,
          _type,
          title,
          subtitle,
          leadingText,
          headerAlignment,
          showProductionBreakdown,
          showCO2Intensity,
          showRenewableShare,
          defaultView
        },
        _type == "declarationGridmix" => {
          _key,
          _type,
          title,
          subtitle,
          leadingText,
          headerAlignment,
          showSummary,
          view
        },
        _type == "consumptionMap" => {
          _key,
          _type,
          title,
          subtitle,
          leadingText,
          headerAlignment,
          dataSource,
          consumerType,
          colorScheme,
          showLegend,
          showTooltips,
          enableInteraction,
          updateInterval,
          defaultView,
          showStatistics,
          mobileLayout
        },
        _type == "priceCalculator" => {
          _key,
          _type,
          title
        },
        _type == "providerList" => {
          _key,
          _type,
          title,
          subtitle,
          headerAlignment,
          'providers': providers[]->{ 
            "id": _id,
            providerName,
            productName,
            "logoUrl": logo.asset->url,
            // New detailed pricing fields
            spotPriceMarkup,
            greenCertificateFee,
            tradingCosts,
            monthlySubscription,
            signupFee,
            yearlySubscription,
            // Product features
            isVindstoedProduct,
            isVariablePrice,
            bindingPeriod,
            isGreenEnergy,
            benefits,
            signupLink,
            // Metadata
            lastPriceUpdate,
            priceUpdateFrequency,
            notes,
            isActive,
            // Legacy fields for backward compatibility
            displayPrice_kWh,
            displayMonthlyFee
          }
        },
        _type == "featureList" => {
          _key,
          _type,
          title,
          features[]{
            _key,
            _type,
            title,
            description,
            icon {
              ...,
              metadata {
                inlineSvg,
                iconName,
                url,
                color
              }
            }
          }
        },
        _type == "valueProposition" => {
          _key,
          _type,
          heading,
          subheading,
          content,
          valueItems[]{
            _key,
            heading,
            description,
            icon {
              ...,
              metadata {
                inlineSvg,
                iconName,
                url,
                color
              }
            }
          },
          // Legacy fields for backward compatibility
          title,
          propositions,
          items[]{
            _key,
            text,
            heading,
            description,
            icon {
              ...,
              metadata {
                inlineSvg,
                iconName,
                url,
                color
              }
            }
          }
        },
        _type == "videoSection" => {
          ...,
          customThumbnail{
            ...,
            asset->{
              _id,
              url
            }
          }
        },
        _type == "applianceCalculator" => {
          _key,
          _type,
          title,
          subtitle,
          showCategories,
          showSavingsCallToAction,
          defaultElectricityPrice
        },
        _type == "energyTipsSection" => {
          _key,
          _type,
          title,
          subtitle,
          showCategories,
          displayMode,
          headerAlignment,
          showDifficultyBadges,
          showSavingsPotential,
          showSavingsCalculator,
          maxTipsPerCategory,
          defaultCategory,
          tips[]-> {
            _id,
            title,
            slug,
            category,
            shortDescription,
            savingsPotential,
            difficulty,
            icon,
            estimatedSavings,
            implementationTime,
            priority
          }
        },
        _type == "chargingBoxShowcase" => {
          ...,
          products[]->{
            _id,
            name,
            description,
            originalPrice,
            currentPrice,
            badge,
            features,
            productImage,
            ctaLink,
            ctaText
          }
        },
        _type == "regionalComparison" => {
          ...
        },
        _type == "pricingComparison" => {
          ...
        },
        _type == "dailyPriceTimeline" => {
          ...
        },
        _type == "infoCardsSection" => {
          _key,
          _type,
          title,
          subtitle,
          headerAlignment,
          leadingText,
          cards[]{
            title,
            description,
            icon,
            iconColor,
            bgColor
          },
          columns
        }
      }
    `
  }

  // Fetch all pages for sitemap generation
  static async getAllPages(): Promise<Array<{
    _id: string;
    _type: string;
    slug: string;
    title?: string;
    seoMetaTitle?: string;
    seoMetaDescription?: string;
    noIndex?: boolean;
    _createdAt?: string;
    _updatedAt?: string;
  }>> {
    const query = `*[_type == "page"]{
      _id,
      _type,
      "slug": slug.current,
      title,
      seoMetaTitle,
      seoMetaDescription,
      noIndex,
      _createdAt,
      _updatedAt
    }`

    try {
      const pages = await client.fetch(query)
      return pages || []
    } catch (error) {
      console.error('Error fetching all pages:', error)
      return []
    }
  }
}
