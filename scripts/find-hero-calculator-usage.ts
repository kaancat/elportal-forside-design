import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function findHeroCalculatorUsage() {
  try {
    console.log('🔍 Finding all pages using heroWithCalculator component...\n')
    
    // Query all pages that have heroWithCalculator in their content blocks
    const pages = await client.fetch(`*[_type == "page" && contentBlocks[_type == "heroWithCalculator"]] {
      _id,
      title,
      slug,
      "heroBlocks": contentBlocks[_type == "heroWithCalculator"] {
        _key,
        headline,
        subheadline,
        highlightWords,
        calculatorTitle,
        showLivePrice,
        showProviderComparison,
        stats,
        content,
        title,
        subtitle
      }
    }`)
    
    console.log(`Found ${pages.length} pages using heroWithCalculator:\n`)
    
    pages.forEach((page: any) => {
      console.log(`\n=== Page: ${page.title} ===`)
      console.log(`Slug: /${page.slug.current}`)
      console.log(`ID: ${page._id}`)
      
      page.heroBlocks.forEach((hero: any, index: number) => {
        console.log(`\nHero Block ${index + 1}:`)
        console.log(`- Key: ${hero._key}`)
        console.log(`- Headline: ${hero.headline || hero.title || 'MISSING'}`)
        console.log(`- Subheadline: ${hero.subheadline || hero.subtitle || 'MISSING'}`)
        console.log(`- Highlight Words: ${hero.highlightWords ? hero.highlightWords.join(', ') : 'NONE'}`)
        console.log(`- Calculator Title: ${hero.calculatorTitle || 'DEFAULT'}`)
        
        // Check for deprecated fields
        if (hero.title || hero.subtitle) {
          console.log(`\n⚠️  DEPRECATED FIELDS FOUND:`)
          if (hero.title) console.log(`  - title: "${hero.title}"`)
          if (hero.subtitle) console.log(`  - subtitle: "${hero.subtitle}"`)
        }
        
        // Check stats
        if (hero.stats) {
          console.log(`\nStats:`)
          hero.stats.forEach((stat: any, i: number) => {
            const hasKey = stat._key ? '✓' : '✗'
            console.log(`  ${i + 1}. [${hasKey}] ${stat.value}: ${stat.label}`)
          })
        } else {
          console.log(`\nStats: NONE (using defaults)`)
        }
        
        // Suggest highlight words based on headline
        if (!hero.highlightWords || hero.highlightWords.length === 0) {
          const headline = hero.headline || hero.title || ''
          const suggestedWords: string[] = []
          
          // Common words to highlight
          const commonHighlights = ['elpriser', 'sammenlign', 'spar', 'billigste', 'grøn', 'vindmøller', 'ladeboks']
          commonHighlights.forEach(word => {
            if (headline.toLowerCase().includes(word)) {
              suggestedWords.push(word)
            }
          })
          
          if (suggestedWords.length > 0) {
            console.log(`\n💡 Suggested highlight words: ${suggestedWords.join(', ')}`)
          }
        }
      })
    })
    
    // Also check homepage
    console.log('\n\n=== Checking Homepage ===')
    const homepage = await client.fetch(`*[_type == "homePage"][0]{
      title,
      "heroBlocks": contentBlocks[_type == "heroWithCalculator"] {
        _key,
        headline,
        subheadline,
        highlightWords,
        stats
      }
    }`)
    
    if (homepage?.heroBlocks?.length > 0) {
      console.log(`Homepage has ${homepage.heroBlocks.length} heroWithCalculator block(s)`)
      homepage.heroBlocks.forEach((hero: any) => {
        console.log(`- Headline: ${hero.headline}`)
        console.log(`- Highlight Words: ${hero.highlightWords ? hero.highlightWords.join(', ') : 'NONE'}`)
        console.log(`- Stats: ${hero.stats ? `${hero.stats.length} items` : 'NONE'}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error finding hero calculator usage:', error)
  }
}

// Run the script
findHeroCalculatorUsage()