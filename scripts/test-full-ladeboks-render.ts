import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function testFullLadeboxsRender() {
  try {
    console.log('Testing full Ladeboks page render chain...\n')
    
    // 1. Test the exact query from sanityService.ts
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
          title,
          propositions,
          items[]{
            _key,
            text,
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
          title,
          subtitle,
          description,
          products[]->{ 
            _id,
            name,
            category,
            power,
            features,
            price,
            image,
            description,
            specifications
          }
        }
      }
    }`
    
    console.log('🔍 1. Testing GROQ query...')
    const page = await client.fetch(query, { slug: 'ladeboks' })
    
    if (!page) {
      console.log('❌ Page not found with GROQ query!')
      return
    }
    
    console.log('✅ Page found successfully')
    console.log(`  - ID: ${page._id}`)
    console.log(`  - Title: ${page.title}`)
    console.log(`  - Content blocks: ${page.contentBlocks?.length || 0}`)
    
    // 2. Check each content block type
    console.log('\n🧩 2. Content block analysis:')
    const blockCounts: Record<string, number> = {}
    let hasChargingBoxShowcase = false
    
    page.contentBlocks?.forEach((block: any, index: number) => {
      blockCounts[block._type] = (blockCounts[block._type] || 0) + 1
      if (block._type === 'chargingBoxShowcase') {
        hasChargingBoxShowcase = true
        console.log(`  ✅ ChargingBoxShowcase found at index ${index}:`)
        console.log(`     - Title: ${block.title || 'null'}`)
        console.log(`     - Subtitle: ${block.subtitle || 'null'}`)
        console.log(`     - Description: ${block.description || 'null'}`)
        console.log(`     - Products: ${block.products?.length || 0}`)
        if (block.products?.length > 0) {
          block.products.forEach((product: any, pIndex: number) => {
            console.log(`       ${pIndex + 1}. ${product.name} (${product.category})`)
          })
        }
      }
    })
    
    console.log('\n📊 Block type summary:')
    Object.entries(blockCounts).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`)
    })
    
    // 3. Check if all required components are present
    console.log('\n🏗️ 3. Component validation:')
    const requiredComponents = ['hero', 'chargingBoxShowcase', 'valueProposition']
    const missingComponents = requiredComponents.filter(comp => !blockCounts[comp])
    
    if (missingComponents.length > 0) {
      console.log('❌ Missing required components:', missingComponents)
    } else {
      console.log('✅ All required components present')
    }
    
    // 4. Final assessment
    console.log('\n🎯 4. Final assessment:')
    if (hasChargingBoxShowcase) {
      console.log('✅ ChargingBoxShowcase component is properly fetched')
      console.log('✅ GROQ query is working correctly')
      console.log('✅ Component should render in ContentBlocks.tsx')
      console.log('\n💡 If the page still doesn\'t work, try:')
      console.log('   1. Hard refresh the browser (Ctrl+Shift+R / Cmd+Shift+R)')
      console.log('   2. Clear browser cache')
      console.log('   3. Try incognito/private browsing mode')
      console.log('   4. Check browser developer console for JavaScript errors')
    } else {
      console.log('❌ ChargingBoxShowcase component not found in page data')
    }

  } catch (error) {
    console.error('❌ Error testing page render:', error)
  }
}

testFullLadeboxsRender()