import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function analyzeElprisberegnerPage() {
  console.log('Analyzing successful elprisberegner page implementation...\n')

  try {
    // Fetch the elprisberegner page
    const elprisberegnerPage = await client.fetch(`*[_id == "page.elprisberegner"][0]`)
    
    if (!elprisberegnerPage) {
      console.error('Elprisberegner page not found!')
      return
    }

    console.log('=== SUCCESSFUL IMPLEMENTATION PATTERNS ===\n')

    // Analyze Info Cards Section
    const infoCardsBlock = elprisberegnerPage.contentBlocks?.find((block: any) => block._type === 'infoCardsSection')
    
    if (infoCardsBlock) {
      console.log('1. INFO CARDS SECTION (Working Implementation):')
      console.log('   - Uses simple string icons: "clock", "trending-up", "zap", "shield"')
      console.log('   - Has background and text color settings populated')
      console.log('   - Example card structure:')
      console.log(JSON.stringify(infoCardsBlock.cards[0], null, 2))
      console.log('\n')
    }

    // Analyze Hero Section
    const heroBlock = elprisberegnerPage.contentBlocks?.find((block: any) => block._type === 'hero')
    
    if (heroBlock) {
      console.log('2. HERO SECTION:')
      console.log('   - Has image with asset reference')
      console.log('   - Image structure:')
      console.log(JSON.stringify(heroBlock.image, null, 2))
      console.log('\n')
    }

    // Analyze Page Section with Live Price Graph
    const pageSections = elprisberegnerPage.contentBlocks?.filter((block: any) => block._type === 'pageSection')
    
    pageSections?.forEach((section: any, index: number) => {
      const livePriceGraph = section.content?.find((item: any) => item._type === 'livePriceGraph')
      if (livePriceGraph) {
        console.log(`3. LIVE PRICE GRAPH in PageSection ${index + 1}:`)
        console.log('   - Structure:')
        console.log(JSON.stringify(livePriceGraph, null, 2))
        console.log('\n')
      }
    })

    // Extract icon patterns
    console.log('=== ICON USAGE PATTERNS ===\n')
    
    // Check all content blocks for icon usage
    elprisberegnerPage.contentBlocks?.forEach((block: any) => {
      if (block._type === 'infoCardsSection') {
        console.log('InfoCardsSection icons (strings):')
        block.cards?.forEach((card: any, i: number) => {
          console.log(`   Card ${i + 1}: "${card.icon}"`)
        })
      }
      
      if (block._type === 'featureList') {
        console.log('\nFeatureList icons (icon.manager objects):')
        block.features?.forEach((feature: any, i: number) => {
          if (feature.icon) {
            console.log(`   Feature ${i + 1}: ${feature.icon.name} (${feature.icon.provider})`)
          }
        })
      }
      
      if (block._type === 'valueProposition') {
        console.log('\nValueProposition icons:')
        block.items?.forEach((item: any, i: number) => {
          console.log(`   Item ${i + 1}: ${item.icon ? 'Has icon' : 'No icon'}`)
        })
      }
    })

    console.log('\n=== KEY TAKEAWAYS ===')
    console.log('1. InfoCardsSection uses simple string icons')
    console.log('2. FeatureList uses icon.manager objects with full metadata')
    console.log('3. Hero images need proper asset references')
    console.log('4. Live Price Graph can work without priceArea (uses default)')
    console.log('5. Background colors should be set for visual sections')

  } catch (error) {
    console.error('Error analyzing page:', error)
  }
}

// Run the analysis
analyzeElprisberegnerPage()