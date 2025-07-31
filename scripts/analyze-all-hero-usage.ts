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

async function analyzeAllHeroUsage() {
  try {
    console.log('🔍 Analyzing all heroWithCalculator usage across the site...\n')
    
    // Get ALL documents that might contain heroWithCalculator
    const query = `*[contentBlocks[_type == "heroWithCalculator"]] {
      _id,
      _type,
      title,
      "slug": slug.current,
      "heroBlocks": contentBlocks[_type == "heroWithCalculator"] {
        _key,
        _type,
        headline,
        subheadline,
        highlightWords,
        calculatorTitle,
        showLivePrice,
        showProviderComparison,
        stats,
        content,
        // Check deprecated fields
        title,
        subtitle
      }
    }`
    
    const documents = await client.fetch(query)
    
    console.log(`Found ${documents.length} documents with heroWithCalculator blocks:\n`)
    
    // Group by document type
    const byType: any = {}
    documents.forEach((doc: any) => {
      if (!byType[doc._type]) byType[doc._type] = []
      byType[doc._type].push(doc)
    })
    
    // Analyze each type
    Object.entries(byType).forEach(([type, docs]: [string, any]) => {
      console.log(`\n====== ${type.toUpperCase()} (${docs.length} documents) ======`)
      
      docs.forEach((doc: any) => {
        console.log(`\n📄 ${doc.title || 'Untitled'}`)
        console.log(`   ID: ${doc._id}`)
        if (doc.slug) console.log(`   Slug: /${doc.slug}`)
        
        doc.heroBlocks.forEach((hero: any, index: number) => {
          console.log(`\n   Hero Block #${index + 1}:`)
          console.log(`   - Headline: "${hero.headline || hero.title || 'MISSING'}"`)
          console.log(`   - Subheadline: "${hero.subheadline || hero.subtitle || 'MISSING'}"`)
          
          // Highlight status
          if (hero.highlightWords && hero.highlightWords.length > 0) {
            console.log(`   - ✅ Highlight Words: [${hero.highlightWords.join(', ')}]`)
          } else {
            console.log(`   - ❌ Highlight Words: NONE`)
            
            // Suggest words based on headline
            const headline = (hero.headline || hero.title || '').toLowerCase()
            const suggestions = []
            if (headline.includes('elpriser')) suggestions.push('elpriser')
            if (headline.includes('sammenlign')) suggestions.push('sammenlign')
            if (headline.includes('billigste')) suggestions.push('billigste')
            if (headline.includes('spar')) suggestions.push('spar')
            if (headline.includes('grøn')) suggestions.push('grøn')
            
            if (suggestions.length > 0) {
              console.log(`      💡 Suggested: [${suggestions.join(', ')}]`)
            }
          }
          
          // Stats status
          if (hero.stats && hero.stats.length > 0) {
            const hasKeys = hero.stats.every((s: any) => s._key)
            if (hasKeys) {
              console.log(`   - ✅ Stats: ${hero.stats.length} items (all have keys)`)
            } else {
              console.log(`   - ❌ Stats: ${hero.stats.length} items (MISSING KEYS)`)
            }
          } else {
            console.log(`   - ℹ️  Stats: Using defaults`)
          }
          
          // Calculator settings
          console.log(`   - Calculator Title: "${hero.calculatorTitle || 'Using default'}"`)
          console.log(`   - Show Live Price: ${hero.showLivePrice ?? 'default (true)'}`)
          console.log(`   - Show Provider Comparison: ${hero.showProviderComparison ?? 'default (true)'}`)
          
          // Deprecated fields warning
          if (hero.title || hero.subtitle) {
            console.log(`   - ⚠️  DEPRECATED FIELDS PRESENT`)
          }
        })
      })
    })
    
    // Summary
    console.log('\n\n========== SUMMARY ==========')
    const totalHeroBlocks = documents.reduce((sum: number, doc: any) => sum + doc.heroBlocks.length, 0)
    const needsHighlightWords = documents.filter((doc: any) => 
      doc.heroBlocks.some((h: any) => !h.highlightWords || h.highlightWords.length === 0)
    )
    const needsStatsKeys = documents.filter((doc: any) => 
      doc.heroBlocks.some((h: any) => h.stats && !h.stats.every((s: any) => s._key))
    )
    
    console.log(`Total heroWithCalculator blocks: ${totalHeroBlocks}`)
    console.log(`Documents needing highlight words: ${needsHighlightWords.length}`)
    console.log(`Documents needing stats keys: ${needsStatsKeys.length}`)
    
    if (needsHighlightWords.length > 0) {
      console.log('\nDocuments missing highlight words:')
      needsHighlightWords.forEach((doc: any) => {
        console.log(`- ${doc.title} (${doc._type})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error analyzing hero usage:', error)
  }
}

// Run the script
analyzeAllHeroUsage()