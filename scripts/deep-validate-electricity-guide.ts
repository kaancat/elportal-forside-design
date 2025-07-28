import { createClient, SanityClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client: SanityClient = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function deepValidatePage(pageId: string) {
  console.log(`\n🔍 Deep Schema Validation for page: ${pageId}\n`)

  try {
    // Fetch the complete page with all nested data
    const page = await client.fetch(`
      *[_id == $id][0] {
        _id,
        _type,
        title,
        slug,
        parent,
        seoMetaTitle,
        seoMetaDescription,
        seoKeywords,
        ogImage,
        noIndex,
        contentBlocks[] {
          _type,
          _key,
          ...,
          // Expand nested arrays
          items[] {
            ...,
            icon {
              ...,
              metadata {
                ...
              }
            }
          },
          features[] {
            ...,
            icon {
              ...,
              metadata {
                ...
              }
            }
          },
          tips[] {
            ...,
            icon {
              ...,
              metadata {
                ...
              }
            }
          },
          cards[] {
            ...,
            icon {
              ...,
              metadata {
                ...
              }
            }
          },
          content[] {
            ...,
            markDefs[] {
              ...,
              href
            }
          }
        }
      }
    `, { id: pageId })

    if (!page) {
      console.error('❌ Page not found!')
      return
    }

    console.log('📄 PAGE METADATA')
    console.log('================')
    console.log(`Title: ${page.title}`)
    console.log(`Slug: ${page.slug?.current}`)
    console.log(`SEO Title: ${page.seoMetaTitle || 'Not set'}`)
    console.log(`SEO Description: ${page.seoMetaDescription || 'Not set'}`)
    console.log(`SEO Keywords: ${page.seoKeywords?.join(', ') || 'Not set'}`)

    console.log('\n\n📦 CONTENT BLOCKS DEEP VALIDATION')
    console.log('==================================\n')

    // Validate each content block in detail
    for (let i = 0; i < page.contentBlocks.length; i++) {
      const block = page.contentBlocks[i]
      console.log(`\n📌 Block ${i + 1}/${page.contentBlocks.length}: ${block._type}`)
      console.log('─'.repeat(50))
      
      await validateBlockSchema(block)
    }

    // Check for common issues
    console.log('\n\n🔎 COMMON ISSUES CHECK')
    console.log('=====================\n')
    
    const issues = []
    
    // Check for missing _keys
    const blocksWithoutKeys = page.contentBlocks.filter((b: any) => !b._key)
    if (blocksWithoutKeys.length > 0) {
      issues.push(`❌ ${blocksWithoutKeys.length} blocks missing _key`)
    }

    // Check for invalid _types
    const validBlockTypes = [
      'hero', 'heroWithCalculator', 'pageSection', 'priceExampleTable',
      'realPriceComparisonTable', 'renewableEnergyForecast', 'monthlyProductionChart',
      'priceCalculator', 'priceCalculatorWidget', 'providerList', 'featureList',
      'valueProposition', 'videoSection', 'faqGroup', 'callToActionSection',
      'livePriceGraph', 'co2EmissionsChart', 'declarationProduction',
      'declarationGridmix', 'consumptionMap', 'applianceCalculator',
      'energyTipsSection', 'chargingBoxShowcase', 'regionalComparison',
      'pricingComparison', 'dailyPriceTimeline', 'infoCardsSection'
    ]
    
    const invalidBlocks = page.contentBlocks.filter((b: any) => !validBlockTypes.includes(b._type))
    if (invalidBlocks.length > 0) {
      issues.push(`❌ ${invalidBlocks.length} blocks with invalid _type: ${invalidBlocks.map((b: any) => b._type).join(', ')}`)
    }

    // Check for missing required fields in specific block types
    page.contentBlocks.forEach((block: any, index: number) => {
      if (block._type === 'hero' && !block.headline) {
        issues.push(`❌ Hero block ${index + 1} missing required headline`)
      }
      if (block._type === 'featureList' && (!block.items || block.items.length === 0)) {
        issues.push(`❌ FeatureList block ${index + 1} has no items`)
      }
      if (block._type === 'providerList' && !block.headerAlignment) {
        issues.push(`⚠️ ProviderList block ${index + 1} missing headerAlignment`)
      }
    })

    if (issues.length === 0) {
      console.log('✅ No common issues found!')
    } else {
      issues.forEach(issue => console.log(issue))
    }

  } catch (error) {
    console.error('❌ Deep validation error:', error)
  }
}

async function validateBlockSchema(block: any) {
  switch (block._type) {
    case 'hero':
      console.log(`✓ headline: ${block.headline ? '✅' : '❌ MISSING'} ${block.headline || ''}`)
      console.log(`✓ subheadline: ${block.subheadline ? '✅' : '⚪ (optional)'} ${block.subheadline || ''}`)
      console.log(`✓ variant: ${block.variant || 'default'}`)
      console.log(`✓ image: ${block.image ? '✅' : '⚪ (optional)'}`)
      break

    case 'pageSection':
      console.log(`✓ content blocks: ${block.content?.length || 0}`)
      console.log(`✓ headerAlignment: ${block.headerAlignment || 'not set'}`)
      if (block.content && block.content[0]) {
        console.log(`✓ first block type: ${block.content[0]._type}`)
      }
      break

    case 'featureList':
      console.log(`✓ title: ${block.title || 'not set'}`)
      console.log(`✓ subtitle: ${block.subtitle || 'not set'}`)
      console.log(`✓ items: ${block.items?.length || 0} (expected field name)`)
      console.log(`✓ features: ${block.features?.length || 0} (legacy field name)`)
      if (block.items?.length > 0) {
        console.log(`✓ First item:`)
        console.log(`  - title: ${block.items[0].title || 'not set'}`)
        console.log(`  - icon: ${block.items[0].icon ? '✅' : '❌ MISSING'}`)
      }
      break

    case 'providerList':
      console.log(`✓ title: ${block.title || 'not set'}`)
      console.log(`✓ subtitle: ${block.subtitle || 'not set'}`)
      console.log(`✓ headerAlignment: ${block.headerAlignment || 'not set'}`)
      break

    case 'valueProposition':
      console.log(`✓ title: ${block.title || 'not set'}`)
      console.log(`✓ items: ${block.items?.length || 0}`)
      if (block.items?.length > 0) {
        console.log(`✓ First item:`)
        console.log(`  - heading: ${block.items[0].heading || 'not set'}`)
        console.log(`  - icon: ${block.items[0].icon ? '✅' : '❌ MISSING'}`)
      }
      break

    case 'infoCardsSection':
      console.log(`✓ title: ${block.title || 'not set'}`)
      console.log(`✓ subtitle: ${block.subtitle || 'not set'}`)
      console.log(`✓ cards: ${block.cards?.length || 0}`)
      console.log(`✓ headerAlignment: ${block.headerAlignment || 'not set'}`)
      if (block.cards?.length > 0) {
        console.log(`✓ First card:`)
        console.log(`  - title: ${block.cards[0].title || 'not set'}`)
        console.log(`  - icon: ${block.cards[0].icon ? '✅' : '❌ MISSING'}`)
      }
      break

    case 'faqGroup':
      console.log(`✓ title: ${block.title || 'not set'}`)
      console.log(`✓ items: ${block.items?.length || 0}`)
      if (block.items?.length > 0) {
        console.log(`✓ First FAQ:`)
        console.log(`  - question: ${block.items[0].question || 'not set'}`)
        console.log(`  - answer: ${block.items[0].answer ? '✅' : '❌ MISSING'}`)
      }
      break

    case 'callToActionSection':
      console.log(`✓ heading: ${block.heading || 'not set'}`)
      console.log(`✓ subheading: ${block.subheading || 'not set'}`)
      console.log(`✓ primaryCta: ${block.primaryCta ? '✅' : '❌ MISSING'}`)
      if (block.primaryCta) {
        console.log(`  - text: ${block.primaryCta.text || 'not set'}`)
        console.log(`  - link: ${block.primaryCta.link?.href || 'not set'}`)
      }
      break

    case 'priceCalculatorWidget':
      console.log(`✓ variant: ${block.variant || 'standalone'}`)
      break

    default:
      console.log(`✓ Block type: ${block._type}`)
      console.log(`✓ Has _key: ${block._key ? '✅' : '❌'}`)
  }
}

// Run deep validation
deepValidatePage('qgCxJyBbKpvhb2oGYqfgkp')