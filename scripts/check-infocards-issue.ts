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

async function checkInfoCardsIssue() {
  console.log('🔍 Diagnosing InfoCardsSection Display Issue\n')
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
  
  // Find InfoCardsSection blocks
  const infoCardsSections = page.contentBlocks?.filter((block: any) => block._type === 'infoCardsSection') || []
  
  console.log(`📦 Found ${infoCardsSections.length} InfoCardsSection blocks`)
  
  infoCardsSections.forEach((block: any, index: number) => {
    console.log(`\n🔍 InfoCardsSection ${index + 1}:`)
    console.log(`   Title: ${block.title || 'NO TITLE'}`)
    console.log(`   Subtitle: ${block.subtitle || 'NO SUBTITLE'}`)
    console.log(`   Header Alignment: ${block.headerAlignment || 'NOT SET'}`)
    console.log(`   Columns: ${block.columns || 'NOT SET'}`)
    console.log(`   Leading Text: ${block.leadingText ? 'YES' : 'NO'}`)
    
    // Check cards array
    if (block.cards && Array.isArray(block.cards)) {
      console.log(`   Cards: ${block.cards.length} items`)
      
      block.cards.forEach((card: any, cardIdx: number) => {
        console.log(`      Card ${cardIdx + 1}:`)
        console.log(`         Title: ${card.title || 'NO TITLE'}`)
        console.log(`         Icon: ${card.icon || 'NO ICON'}`)
        console.log(`         Description: ${card.description ? (Array.isArray(card.description) ? 'PORTABLE_TEXT_ARRAY' : 'STRING') : 'NO DESCRIPTION'}`)
        console.log(`         Icon Color: ${card.iconColor || 'NO COLOR'}`)
        console.log(`         BG Color: ${card.bgColor || 'NO BG COLOR'}`)
        
        if (Array.isArray(card.description)) {
          console.log(`         Description blocks: ${card.description.length}`)
          card.description.forEach((desc: any, descIdx: number) => {
            console.log(`            Block ${descIdx}: ${desc._type} - ${desc.children?.[0]?.text || 'NO TEXT'}`)
          })
        }
      })
    } else {
      console.log(`   ⚠️  Cards: ${typeof block.cards} (${block.cards ? 'exists but not array' : 'missing'})`)
    }
    
    // Check all fields
    console.log(`   All fields: ${Object.keys(block).join(', ')}`)
  })
  
  // Also check if InfoCardsSection is properly registered in ContentBlocks
  console.log('\n' + '='.repeat(60))
  console.log('📋 SUMMARY:')
  
  if (infoCardsSections.length === 0) {
    console.log('❌ No InfoCardsSection blocks found on the page')
    console.log('   - This might mean the component was not added or was removed during validation fixes')
  } else {
    console.log(`✅ Found ${infoCardsSections.length} InfoCardsSection blocks`)
    
    // Check if cards data exists
    const blocksWithCards = infoCardsSections.filter((block: any) => block.cards && Array.isArray(block.cards) && block.cards.length > 0)
    const blocksWithoutCards = infoCardsSections.filter((block: any) => !block.cards || !Array.isArray(block.cards) || block.cards.length === 0)
    
    console.log(`   - Blocks with cards: ${blocksWithCards.length}`)
    console.log(`   - Blocks without cards: ${blocksWithoutCards.length}`)
    
    if (blocksWithoutCards.length > 0) {
      console.log('   ⚠️  Some blocks are missing cards data - these will use fallback data')
    }
  }
  
  console.log('\n🔧 RECOMMENDED ACTIONS:')
  if (infoCardsSections.length === 0) {
    console.log('1. Check if InfoCardsSection was accidentally removed during validation fixes')
    console.log('2. Verify ContentBlocks.tsx includes infoCardsSection routing')
    console.log('3. Check SafeContentBlocks.tsx includes infoCardsSection routing')
  } else {
    console.log('1. Verify InfoCardsSection component is properly imported in ContentBlocks')
    console.log('2. Check that the component renders correctly with the existing data')
    console.log('3. Look for JavaScript console errors on the frontend')
  }
}

checkInfoCardsIssue().catch(console.error)