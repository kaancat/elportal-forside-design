import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

async function diagnoseValidationErrors() {
  console.log('🔍 Diagnosing Validation Errors in Historiske Priser Page\n')
  console.log('=' .repeat(60))
  
  const pageId = 'qgCxJyBbKpvhb2oGYjlhjr'
  
  // Fetch the page
  const page = await client.fetch(`*[_id == "${pageId}"][0]`)
  
  if (!page) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('✅ Page found:', page.title)
  console.log(`📊 Total blocks: ${page.contentBlocks?.length || 0}\n`)
  
  let issueCount = 0
  
  // Check each content block for validation issues
  page.contentBlocks?.forEach((block: any, index: number) => {
    console.log(`\n📦 Block ${index}: ${block._type}`)
    console.log(`   Title: ${block.title || 'NO TITLE'}`)
    
    // Check for common field issues
    const blockFields = Object.keys(block)
    
    // Check for "heading" fields that might cause issues
    if (blockFields.includes('heading')) {
      console.log(`   ⚠️  Has 'heading' field: "${block.heading}"`)
      issueCount++
    }
    
    // ValueProposition specific checks
    if (block._type === 'valueProposition') {
      console.log(`   🔍 ValueProposition analysis:`)
      if (block.items) {
        console.log(`      - Items count: ${block.items.length}`)
        block.items.forEach((item: any, itemIdx: number) => {
          console.log(`      - Item ${itemIdx}: ${JSON.stringify(Object.keys(item))}`)
          if (item.heading) {
            console.log(`        ⚠️  Item has 'heading' field: "${item.heading}"`)
            issueCount++
          }
          if (item.icon && typeof item.icon === 'string') {
            console.log(`        ⚠️  Icon is string instead of object: "${item.icon}"`)
            issueCount++
          }
        })
      }
    }
    
    // InfoCardsSection specific checks
    if (block._type === 'infoCardsSection') {
      console.log(`   🔍 InfoCardsSection analysis:`)
      console.log(`      - Cards: ${block.cards?.length || 0}`)
      if (block.cards) {
        block.cards.forEach((card: any, cardIdx: number) => {
          console.log(`      - Card ${cardIdx}: ${JSON.stringify(Object.keys(card))}`)
        })
      } else {
        console.log(`      ⚠️  No cards array found!`)
        issueCount++
      }
    }
    
    // Check for missing required fields
    if (!block._key) {
      console.log(`   ⚠️  Missing _key field`)
      issueCount++
    }
    
    // Check for unknown fields pattern
    const commonFields = ['_type', '_key', 'title', 'subtitle', 'headerAlignment']
    const unknownFields = blockFields.filter(field => 
      !field.startsWith('_') && 
      !commonFields.includes(field) && 
      !field.match(/^(content|items|cards|features|dk1|dk2|leadingText|description)/)
    )
    
    if (unknownFields.length > 0) {
      console.log(`   ⚠️  Potential unknown fields: ${unknownFields.join(', ')}`)
    }
  })
  
  console.log('\n' + '='.repeat(60))
  console.log(`📈 SUMMARY: Found ${issueCount} potential validation issues`)
  
  if (issueCount > 0) {
    console.log('\n🔧 RECOMMENDED FIXES:')
    console.log('1. Replace "heading" fields with "title" or appropriate field names')
    console.log('2. Fix valueProposition items structure')
    console.log('3. Ensure infoCardsSection has proper cards array')
    console.log('4. Add missing _key fields')
  } else {
    console.log('\n✅ No obvious validation issues found!')
  }
}

diagnoseValidationErrors().catch(console.error)