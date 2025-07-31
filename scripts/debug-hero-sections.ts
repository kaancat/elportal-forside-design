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

async function debugHeroSections() {
  try {
    console.log('🔍 Debugging Hero Sections...\n')
    
    // Fetch the homepage with full hero data
    const homepage = await client.fetch(`*[_type == "homePage"][0]{
      _id,
      title,
      contentBlocks[_type == "heroWithCalculator"]{
        _key,
        _type,
        headline,
        subheadline,
        content,
        calculatorTitle,
        showLivePrice,
        showProviderComparison,
        stats[]{
          value,
          label
        },
        // Check for deprecated fields
        title,
        subtitle
      }
    }`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    console.log(`Homepage: ${homepage.title}`)
    console.log(`Found ${homepage.contentBlocks?.length || 0} hero sections\n`)
    
    // Analyze each hero section
    homepage.contentBlocks?.forEach((hero: any, index: number) => {
      console.log(`\n=== Hero Section ${index + 1} ===`)
      console.log(`Key: ${hero._key}`)
      console.log(`Type: ${hero._type}`)
      console.log(`\nText Content:`)
      console.log(`- Headline: ${hero.headline || 'MISSING'}`)
      console.log(`- Subheadline: ${hero.subheadline || 'MISSING'}`)
      console.log(`- Calculator Title: ${hero.calculatorTitle || 'MISSING'}`)
      
      // Check deprecated fields
      if (hero.title || hero.subtitle) {
        console.log(`\n⚠️  Deprecated fields found:`)
        if (hero.title) console.log(`- title: ${hero.title}`)
        if (hero.subtitle) console.log(`- subtitle: ${hero.subtitle}`)
      }
      
      console.log(`\nRich Content:`)
      console.log(`- Has content array: ${hero.content ? 'YES' : 'NO'}`)
      if (hero.content && hero.content.length > 0) {
        hero.content.forEach((block: any, i: number) => {
          if (block._type === 'block' && block.children) {
            const text = block.children.map((child: any) => child.text).join('')
            console.log(`  ${i + 1}. ${text}`)
          }
        })
      }
      
      console.log(`\nSettings:`)
      console.log(`- Show Live Price: ${hero.showLivePrice ?? 'undefined (defaults to true)'}`)
      console.log(`- Show Provider Comparison: ${hero.showProviderComparison ?? 'undefined (defaults to true)'}`)
      
      console.log(`\nStats:`)
      if (hero.stats && hero.stats.length > 0) {
        hero.stats.forEach((stat: any) => {
          console.log(`- ${stat.value}: ${stat.label}`)
        })
      } else {
        console.log('- No stats defined (will use defaults)')
      }
    })
    
    // Also check how it looks when fetched through the service
    console.log('\n\n=== Fetching through SanityService ===')
    const serviceQuery = `*[_type == "homePage"][0]{
      contentBlocks[_type == "heroWithCalculator"]{
        _key,
        _type,
        headline,
        subheadline,
        content,
        calculatorTitle,
        showLivePrice,
        showProviderComparison,
        stats[]{
          value,
          label
        }
      }
    }`
    
    const serviceData = await client.fetch(serviceQuery)
    console.log('\nService query result:')
    console.log(JSON.stringify(serviceData, null, 2))
    
  } catch (error) {
    console.error('❌ Error debugging hero sections:', error)
  }
}

// Run the script
debugHeroSections()