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

// Generate a unique key
function generateKey(): string {
  return Math.random().toString(36).substring(2, 9)
}

async function fixMissingKeys() {
  console.log('🔧 Fixing missing _key properties in InfoCardsSection\n')
  console.log('=' .repeat(60))
  
  const pageId = 'f7ecf92783e749828f7281a6e5829d52'
  
  // Fetch the page
  const page = await client.fetch(`*[_id == "${pageId}"][0]`)
  
  if (!page) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('✅ Page found:', page.title)
  console.log(`📊 Total blocks: ${page.contentBlocks?.length || 0}\n`)
  
  // Check if contentBlocks exists
  if (!page.contentBlocks || !Array.isArray(page.contentBlocks)) {
    console.log('❌ No contentBlocks found on the page')
    return
  }
  
  let updateNeeded = false
  const updatedBlocks = page.contentBlocks.map((block: any) => {
    // Skip non-infoCardsSection blocks
    if (block._type !== 'infoCardsSection') {
      return block
    }
    
    console.log(`\n🔍 Found InfoCardsSection:`)
    console.log(`   Title: ${block.title || 'NO TITLE'}`)
    console.log(`   Has cards: ${block.cards && Array.isArray(block.cards) ? 'YES' : 'NO'}`)
    
    // Check if cards exist and is an array
    if (!block.cards || !Array.isArray(block.cards)) {
      console.log('   ⚠️  No cards array found, skipping...')
      return block
    }
    
    console.log(`   Number of cards: ${block.cards.length}`)
    
    // Check and fix missing _key properties
    const updatedCards = block.cards.map((card: any, index: number) => {
      if (!card._key) {
        updateNeeded = true
        const newKey = generateKey()
        console.log(`   ❌ Card ${index + 1} missing _key - adding: ${newKey}`)
        return {
          ...card,
          _key: newKey
        }
      } else {
        console.log(`   ✅ Card ${index + 1} has _key: ${card._key}`)
        return card
      }
    })
    
    // Return updated block with fixed cards
    return {
      ...block,
      cards: updatedCards
    }
  })
  
  if (!updateNeeded) {
    console.log('\n✅ All cards already have _key properties! No update needed.')
    return
  }
  
  console.log('\n📝 Updating page with fixed _key properties...')
  
  try {
    const result = await client
      .patch(pageId)
      .set({ contentBlocks: updatedBlocks })
      .commit()
    
    console.log('\n✅ Successfully updated page!')
    console.log(`   Revision: ${result._rev}`)
    
    // Verify the fix
    console.log('\n🔍 Verifying fix...')
    const verifyPage = await client.fetch(`*[_id == "${pageId}"][0]`)
    const verifyInfoCards = verifyPage.contentBlocks?.filter((b: any) => b._type === 'infoCardsSection') || []
    
    let allFixed = true
    verifyInfoCards.forEach((block: any) => {
      if (block.cards && Array.isArray(block.cards)) {
        block.cards.forEach((card: any, index: number) => {
          if (!card._key) {
            console.log(`   ❌ Card ${index + 1} still missing _key!`)
            allFixed = false
          }
        })
      }
    })
    
    if (allFixed) {
      console.log('   ✅ All cards now have _key properties!')
    } else {
      console.log('   ⚠️  Some cards still missing _key properties')
    }
    
  } catch (error) {
    console.error('\n❌ Error updating page:', error)
  }
}

// Run the fix
fixMissingKeys().catch(console.error)