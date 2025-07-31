import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Create Sanity client
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

// Extended query to include all possible content types including infoCardsSection
const pageQuery = `*[_type == "page" && slug.current == $slug][0] {
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
    _type == "infoCardsSection" => {
      _key,
      _type,
      heading,
      cards[]{
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
      // Legacy fields
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
    _type == "hero" => {
      _key,
      _type,
      headline,
      subheadline,
      image
    },
    _type == "heroWithCalculator" => {
      _key,
      _type,
      heading,
      subtitle,
      variant,
      image
    },
    _type == "priceCalculator" => {
      _key,
      _type,
      title
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

async function analyzePageStructure(slug: string) {
  console.log(`\n=== Analyzing page: ${slug} ===\n`)
  
  try {
    const page = await client.fetch(pageQuery, { slug })
    
    if (!page) {
      console.log(`Page '${slug}' not found!`)
      return
    }
    
    console.log(`Title: ${page.title}`)
    console.log(`SEO Title: ${page.seoMetaTitle || 'Not set'}`)
    console.log(`SEO Description: ${page.seoMetaDescription || 'Not set'}`)
    console.log(`\nContent Blocks (${page.contentBlocks?.length || 0} total):\n`)
    
    if (page.contentBlocks) {
      page.contentBlocks.forEach((block: any, index: number) => {
        console.log(`\n--- Block ${index + 1}: ${block._type} ---`)
        console.log(`Key: ${block._key}`)
        
        // Analyze different block types
        switch (block._type) {
          case 'pageSection':
            console.log(`Header Alignment: ${block.headerAlignment || 'Not set'}`)
            console.log(`Title: ${block.title || 'Not set'}`)
            console.log(`Theme: ${block.theme ? JSON.stringify(block.theme, null, 2) : 'No theme'}`)
            if (block.content) {
              console.log(`Content items: ${block.content.length}`)
              block.content.forEach((item: any, i: number) => {
                console.log(`  - ${i + 1}: ${item._type}`)
              })
            }
            break
            
          case 'infoCardsSection':
            console.log(`Heading: ${block.heading || 'Not set'}`)
            console.log(`Cards: ${block.cards?.length || 0}`)
            console.log(`\nRaw block data:`)
            console.log(JSON.stringify(block, null, 2))
            if (block.cards) {
              block.cards.forEach((card: any, i: number) => {
                console.log(`\n  Card ${i + 1}:`)
                console.log(`    Raw card data:`)
                console.log(JSON.stringify(card, null, 4))
                console.log(`    Heading: ${card.heading || 'null/undefined'}`)
                if (card.description) {
                  if (typeof card.description === 'string') {
                    console.log(`    Description: ${card.description.substring(0, 50)}...`)
                  } else if (Array.isArray(card.description)) {
                    console.log(`    Description: [Array with ${card.description.length} items]`)
                  } else {
                    console.log(`    Description: [${typeof card.description}]`)
                  }
                } else {
                  console.log(`    Description: Missing`)
                }
                console.log(`    Icon: ${card.icon ? 'Present' : 'Missing'}`)
                if (card.icon?.metadata) {
                  console.log(`      - Icon name: ${card.icon.metadata.iconName}`)
                  console.log(`      - Has SVG: ${!!card.icon.metadata.inlineSvg}`)
                }
              })
            }
            break
            
          case 'valueProposition':
            console.log(`Heading: ${block.heading || block.title || 'Not set'}`)
            console.log(`Subheading: ${block.subheading || 'Not set'}`)
            console.log(`Content: ${block.content ? 'Present' : 'Not set'}`)
            console.log(`Value Items: ${block.valueItems?.length || 0}`)
            console.log(`Legacy Items: ${block.items?.length || 0}`)
            
            if (block.valueItems) {
              block.valueItems.forEach((item: any, i: number) => {
                console.log(`\n  Value Item ${i + 1}:`)
                console.log(`    Heading: ${item.heading}`)
                console.log(`    Description: ${item.description ? 'Present' : 'Missing'}`)
                console.log(`    Icon: ${item.icon ? 'Present' : 'Missing'}`)
                if (item.icon?.metadata) {
                  console.log(`      - Icon name: ${item.icon.metadata.iconName}`)
                  console.log(`      - Has SVG: ${!!item.icon.metadata.inlineSvg}`)
                }
              })
            }
            break
            
          case 'featureList':
            console.log(`Title: ${block.title || 'Not set'}`)
            console.log(`Features: ${block.features?.length || 0}`)
            if (block.features) {
              block.features.forEach((feature: any, i: number) => {
                console.log(`\n  Feature ${i + 1}:`)
                console.log(`    Title: ${feature.title}`)
                console.log(`    Description: ${feature.description?.substring(0, 50)}...`)
                console.log(`    Icon: ${feature.icon ? 'Present' : 'Missing'}`)
              })
            }
            break
            
          case 'hero':
            console.log(`Headline: ${block.headline}`)
            console.log(`Subheadline: ${block.subheadline}`)
            console.log(`Image: ${block.image ? 'Present' : 'Missing'}`)
            break
            
          case 'heroWithCalculator':
            console.log(`Heading: ${block.heading}`)
            console.log(`Subtitle: ${block.subtitle}`)
            console.log(`Variant: ${block.variant}`)
            console.log(`Image: ${block.image ? 'Present' : 'Missing'}`)
            break
            
          case 'providerList':
            console.log(`Title: ${block.title}`)
            console.log(`Subtitle: ${block.subtitle || 'Not set'}`)
            console.log(`Header Alignment: ${block.headerAlignment || 'Not set'}`)
            console.log(`Providers: ${block.providers?.length || 0}`)
            break
            
          default:
            console.log(`Title/Heading: ${block.title || block.heading || 'Not set'}`)
            console.log(`Other fields: ${Object.keys(block).filter(k => !['_type', '_key'].includes(k)).join(', ')}`)
        }
      })
    }
    
  } catch (error) {
    console.error(`Error analyzing page '${slug}':`, error)
  }
}

// Analyze both pages
async function main() {
  console.log('Starting page structure analysis...\n')
  
  await analyzePageStructure('prognoser')
  console.log('\n' + '='.repeat(60) + '\n')
  await analyzePageStructure('elprisberegner')
  
  console.log('\n\nAnalysis complete!')
}

main().catch(console.error)