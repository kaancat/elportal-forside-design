#!/usr/bin/env tsx

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function testHistoriskePriserFix() {
  console.log('🔍 Testing historiske-priser page after fix...\n')

  try {
    // Fetch the page with full content
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      title,
      "blockCount": count(contentBlocks),
      contentBlocks[]{
        _type,
        _key,
        _type == "pageSection" => {
          title,
          headerAlignment,
          "contentPreview": content[0].children[0].text
        },
        _type == "hero" => {
          headline,
          subheadline
        },
        _type == "monthlyProductionChart" => {
          title,
          leadingText,
          headerAlignment
        },
        _type == "priceExampleTable" => {
          title,
          headerAlignment,
          leadingText
        },
        _type == "infoCardsSection" => {
          title,
          "cardCount": count(cards),
          cards[]{
            icon,
            title,
            description
          }
        },
        _type == "faqGroup" => {
          title,
          "faqCount": count(faqItems)
        },
        _type == "callToActionSection" => {
          title,
          buttonText,
          buttonUrl
        }
      }
    }`

    const page = await client.fetch(query)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }

    console.log('📄 Page:', page.title)
    console.log('📊 Total blocks:', page.blockCount)
    console.log('\n🔧 Content structure:\n')

    page.contentBlocks.forEach((block, index) => {
      console.log(`${index + 1}. ${block._type}`)
      
      switch (block._type) {
        case 'hero':
          console.log(`   - Headline: "${block.headline}"`)
          console.log(`   - Subheadline: "${block.subheadline}"`)
          break
          
        case 'pageSection':
          console.log(`   - Title: "${block.title}"`)
          console.log(`   - Alignment: ${block.headerAlignment || 'default'}`)
          if (block.contentPreview) {
            console.log(`   - Content preview: "${block.contentPreview.substring(0, 50)}..."`)
          }
          break
          
        case 'monthlyProductionChart':
          console.log(`   - Title: "${block.title}"`)
          console.log(`   - Alignment: ${block.headerAlignment || 'default'}`)
          break
          
        case 'priceExampleTable':
          console.log(`   - Title: "${block.title}"`)
          console.log(`   - Alignment: ${block.headerAlignment || 'default'}`)
          break
          
        case 'infoCardsSection':
          console.log(`   - Title: "${block.title}"`)
          console.log(`   - Cards: ${block.cardCount}`)
          block.cards?.forEach((card, i) => {
            console.log(`     ${i + 1}. ${card.icon} - ${card.title}`)
          })
          break
          
        case 'faqGroup':
          console.log(`   - Title: "${block.title}"`)
          console.log(`   - FAQ items: ${block.faqCount}`)
          break
          
        case 'callToActionSection':
          console.log(`   - Title: "${block.title}"`)
          console.log(`   - Button: "${block.buttonText}" → ${block.buttonUrl}`)
          break
      }
      console.log('')
    })

    // Check specific requirements
    console.log('\n✅ Verification checklist:')
    
    // 1. Check for 2025 price trend
    const priceTrendSection = page.contentBlocks.find(b => 
      b._type === 'pageSection' && b.title?.includes('2025')
    )
    console.log(`1. Dynamic 2025 price trend: ${priceTrendSection ? '✓ Found' : '✗ Missing'}`)
    
    // 2. Check alignments
    const alignmentCheck = {
      'CO₂-udledning': 'left',
      'Valget mellem fast og variabel': 'left',
      'Hvad Påvirker': 'left',
      'Historiske elpriser giver': 'left',
      'Fast vs Variabel Pris': 'center'
    }
    
    console.log('\n2. Section alignments:')
    Object.entries(alignmentCheck).forEach(([title, expected]) => {
      const section = page.contentBlocks.find(b => 
        b.title?.includes(title)
      )
      const actual = section?.headerAlignment || 'default'
      const correct = actual === expected
      console.log(`   - "${title}": ${actual} ${correct ? '✓' : `✗ (expected ${expected})`}`)
    })
    
    // 3. Check InfoCards section
    const infoCardsSection = page.contentBlocks.find(b => 
      b._type === 'infoCardsSection' && b.title?.includes('Sådan Udnytter')
    )
    console.log(`\n3. InfoCards section: ${infoCardsSection ? `✓ Found with ${infoCardsSection.cardCount} cards` : '✗ Missing'}`)
    
    // 4. Check conclusion is complete
    const conclusionSection = page.contentBlocks.find(b => 
      b._type === 'pageSection' && b.title === 'Konklusion'
    )
    console.log(`\n4. Conclusion section: ${conclusionSection ? '✓ Found' : '✗ Missing'}`)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the test
testHistoriskePriserFix()