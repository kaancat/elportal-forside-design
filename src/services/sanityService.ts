import { client } from '@/lib/sanity'
import { HomePage, BlogPost, SiteSettings, SanityPage, ProviderProductBlock } from '@/types/sanity'

export class SanityService {
  // Fetch homepage content
  static async getHomePage(): Promise<HomePage | null> {
    const query = `*[_type == "homePage"][0]{
      _id,
      _type,
      title,
      seoMetaTitle,
      seoMetaDescription,
      contentBlocks[]{
        _type,
        _key,
        _type == "pageSection" => {
          ..., // Get all fields from pageSection
          theme->{ // Follow the reference to the colorTheme
            "background": background.hex,
            "text": text.hex,
            "primary": primary.hex
          },
          settings,
          content[]{ // Expand content array to include embedded blocks
            ..., // Get all fields for standard blocks (text, etc.)
            // Add expansions for each custom block type
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
        _type == "priceExampleTable" => {
          title,
          leadingText,
          example1_title,
          example1_kwh_price,
          example1_subscription,
          example2_title,
          example2_kwh_price,
          example2_subscription
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
        _type == "renewableEnergyForecast" => {
          _key,
          _type,
          title,
          leadingText,
          headerAlignment
        },
        _type == "livePriceGraph" => {
          title,
          subtitle,
          apiRegion,
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
        _type == "providerList" => {
          _key,
          _type,
          title,
          subtitle,
          headerAlignment,
          'providers': providers[]->{ // The key is 'providers': and the operator is ->
            "id": _id,
            providerName,
            productName,
            "logoUrl": logo.asset->url,
            displayPrice_kWh,
            displayMonthlyFee,
            signupLink,
            isVindstoedProduct,
            benefits
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
          }
        },
        _type == "realPriceComparisonTable" => {
          _key,
          _type,
          title,
          leadingText
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
          showDifficultyBadges,
          showSavingsPotential,
          maxTipsPerCategory
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
        }
      }
    }`
    
    try {
      const homePage = await client.fetch<HomePage>(query)
      return homePage
    } catch (error) {
      console.error('Error fetching homepage:', error)
      return null
    }
  }

  // Fetch all blog posts
  static async getAllBlogPosts(): Promise<BlogPost[]> {
    const query = `*[_type == "blogPost"] | order(publishedAt desc){
      _id,
      _type,
      title,
      slug,
      mainImage{
        asset,
        alt,
        hotspot,
        crop
      },
      body,
      publishedAt,
      seoMetaTitle,
      seoMetaDescription
    }`
    
    try {
      const posts = await client.fetch<BlogPost[]>(query)
      return posts
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }
  }

  // Fetch single blog post by slug
  static async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const query = `*[_type == "blogPost" && slug.current == $slug][0]{
      _id,
      _type,
      title,
      slug,
      mainImage{
        asset,
        alt,
        hotspot,
        crop
      },
      body,
      publishedAt,
      seoMetaTitle,
      seoMetaDescription
    }`
    
    try {
      const post = await client.fetch<BlogPost>(query, { slug })
      return post
    } catch (error) {
      console.error('Error fetching blog post:', error)
      return null
    }
  }

  // Fetch site settings including navigation data
  static async getSiteSettings(): Promise<SiteSettings | null> {
    const query = `*[_type == "siteSettings"][0] {
      ...,
      headerLinks[] {
        ...,
        _type == 'link' => {
          ...,
          internalLink->{ "slug": slug.current, _type }
        },
        _type == 'megaMenu' => {
          ...,
          content[] {
            ...,
            _type == 'megaMenuColumn' => {
              ...,
              items[] {
                ...,
                icon {
                  ...,
                  metadata {
                    inlineSvg,
                    iconName,
                    url,
                    color
                  }
                },
                link {
                  ...,
                  internalLink->{ "slug": slug.current, _type }
                }
              }
            }
          }
        }
      },
      footer {
        ...,
        footerLogo,
        footerDescription,
        copyrightText,
        secondaryCopyrightText,
        linkGroups[] {
          ...,
          links[] {
            ...,
            internalLink->{ "slug": slug.current, _type }
          }
        }
      }
    }`
    
    try {
      const settings = await client.fetch<SiteSettings>(query)
      return settings
    } catch (error) {
      console.error('Error fetching site settings:', error)
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
        _type == "priceExampleTable" => {
          title,
          leadingText,
          example1_title,
          example1_kwh_price,
          example1_subscription,
          example2_title,
          example2_kwh_price,
          example2_subscription
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
          'providers': providers[]->{ 
            "id": _id,
            providerName,
            productName,
            "logoUrl": logo.asset->url,
            displayPrice_kWh,
            displayMonthlyFee,
            signupLink,
            isVindstoedProduct,
            benefits
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
          showDifficultyBadges,
          showSavingsPotential,
          maxTipsPerCategory
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
          }
        }
      }
    }`
    
    try {
      const page = await client.fetch<SanityPage>(query, { slug })
      return page
    } catch (error) {
      console.error('Error fetching page by slug:', error)
      return null
    }
  }

  // Fetch all providers - single query to avoid N+1 problem
  static async getAllProviders(): Promise<ProviderProductBlock[]> {
    const query = `*[_type == "provider"]{
      "id": _id,
      providerName,
      productName,
      "logoUrl": logo.asset->url,
      displayPrice_kWh,
      displayMonthlyFee,
      signupLink,
      isVindstoedProduct,
      benefits
    }`
    
    try {
      const providers = await client.fetch<ProviderProductBlock[]>(query)
      return providers || []
    } catch (error) {
      console.error('Error fetching providers:', error)
      return []
    }
  }
}
