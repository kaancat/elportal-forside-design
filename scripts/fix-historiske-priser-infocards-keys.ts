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

async function fixInfoCardsKeys() {
  console.log('🔧 Fixing missing _key fields in infoCardsSection...')
  
  try {
    // Fetch the page
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      _id,
      _rev,
      contentBlocks
    }`
    
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('📄 Found page, looking for infoCardsSection...')
    
    // Find the infoCardsSection
    const infoCardIndex = page.contentBlocks.findIndex((block: any) => 
      block._type === 'infoCardsSection' && 
      block.title === 'Sådan Udnytter Du Historiske Prismønstre'
    )
    
    if (infoCardIndex === -1) {
      console.error('❌ InfoCardsSection not found!')
      return
    }
    
    console.log(`✅ Found infoCardsSection at index ${infoCardIndex}`)
    
    const currentSection = page.contentBlocks[infoCardIndex]
    
    // Add _key fields to each card
    const correctedCards = currentSection.cards.map((card: any, index: number) => ({
      ...card,
      _key: generateKey() // Add missing _key field
    }))
    
    // Also fix the leadingText to have proper _key
    const correctedLeadingText = currentSection.leadingText?.map((block: any) => ({
      ...block,
      _key: generateKey(),
      children: block.children?.map((child: any) => ({
        ...child,
        _key: child._key || generateKey()
      }))
    }))
    
    // Update the contentBlock
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[infoCardIndex] = {
      ...currentSection,
      cards: correctedCards,
      leadingText: correctedLeadingText
    }
    
    console.log('🔄 Updating page with proper _key fields...')
    
    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Page updated successfully!')
    
    // Verify the update
    const updatedPage = await client.fetch(query)
    const updatedSection = updatedPage.contentBlocks[infoCardIndex]
    
    console.log('\n📊 Verification:')
    console.log(`- Cards count: ${updatedSection.cards?.length || 0}`)
    console.log('- Cards have _key fields:', updatedSection.cards?.every((card: any) => !!card._key))
    console.log('- First few card keys:', updatedSection.cards?.slice(0, 2).map((card: any) => card._key))
    
    console.log('\n🎯 Studio should now show populated cards!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

function generateKey() {
  return Math.random().toString(36).substring(2, 9)
}

// Run the fix
fixInfoCardsKeys()