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

async function checkAllHeroUsage() {
  try {
    // Get detailed info about each page with heroWithCalculator
    const docs = await client.fetch(`*[
      (_type == 'page' && contentBlocks[_type == 'heroWithCalculator']) ||
      (_type == 'homePage' && contentBlocks[_type == 'heroWithCalculator'])
    ]{
      _id,
      _type,
      title,
      'slug': slug.current,
      'heroBlocks': contentBlocks[_type == 'heroWithCalculator']{
        _key,
        headline,
        subheadline,
        highlightWords,
        calculatorTitle,
        stats
      }
    }`)
    
    console.log(`Found ${docs.length} documents with heroWithCalculator:\n`)
    
    docs.forEach((doc: any) => {
      console.log(`${doc._type === 'homePage' ? '🏠 HOMEPAGE' : '📄 PAGE'}: ${doc.title}`)
      if(doc.slug) console.log(`   URL: /${doc.slug}`)
      console.log(`   ID: ${doc._id}`)
      
      doc.heroBlocks.forEach((hero: any, i: number) => {
        console.log(`\n   Hero Block #${i+1}:`)
        console.log(`   - Headline: "${hero.headline}"`)
        console.log(`   - Subheadline: "${hero.subheadline || 'EMPTY'}"`)
        console.log(`   - Highlight Words: ${hero.highlightWords ? '[' + hero.highlightWords.join(', ') + ']' : 'NONE'}`)
        console.log(`   - Calculator Title: "${hero.calculatorTitle || 'DEFAULT'}"`)
        console.log(`   - Stats: ${hero.stats ? `${hero.stats.length} items` : 'NONE'}`)
        
        // Check if stats have keys
        if (hero.stats && hero.stats.length > 0) {
          const hasAllKeys = hero.stats.every((s: any) => s._key)
          if (!hasAllKeys) {
            console.log(`     ⚠️  Stats missing keys!`)
          }
        }
      })
      console.log('\n---\n')
    })
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkAllHeroUsage()