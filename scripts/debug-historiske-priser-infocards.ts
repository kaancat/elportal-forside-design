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

async function debugInfoCardsData() {
  console.log('🔍 Debugging historiske-priser infoCardsSection data...')
  
  try {
    // Fetch with raw data to see exact structure
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      _id,
      _rev,
      title,
      contentBlocks
    }`
    
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('📄 Page ID:', page._id)
    console.log('📄 Page Rev:', page._rev)
    console.log('📄 Title:', page.title)
    console.log('📄 Total contentBlocks:', page.contentBlocks?.length || 0)
    
    // Find all infoCardsSection blocks
    const infoCardsSections = page.contentBlocks?.filter((block: any, index: number) => {
      if (block._type === 'infoCardsSection') {
        console.log(`\n🎴 Found infoCardsSection at index ${index}:`)
        console.log('   - Title:', block.title)
        console.log('   - Subtitle:', block.subtitle)
        console.log('   - HeaderAlignment:', block.headerAlignment)
        console.log('   - Columns:', block.columns)
        console.log('   - Cards array exists:', !!block.cards)
        console.log('   - Cards count:', block.cards?.length || 0)
        console.log('   - LeadingText exists:', !!block.leadingText)
        
        if (block.cards && block.cards.length > 0) {
          console.log('\n   📇 Cards data:')
          block.cards.forEach((card: any, cardIndex: number) => {
            console.log(`   Card ${cardIndex + 1}:`)
            console.log(`     - Title: ${card.title}`)
            console.log(`     - Icon: ${card.icon}`)
            console.log(`     - Description type: ${Array.isArray(card.description) ? 'array' : typeof card.description}`)
            console.log(`     - Description length: ${card.description?.length || 0}`)
            if (card.description && Array.isArray(card.description)) {
              card.description.forEach((block: any, blockIndex: number) => {
                console.log(`       Block ${blockIndex}: ${block._type} - "${block.children?.[0]?.text || 'no text'}"`)
              })
            }
          })
        }
        return true
      }
      return false
    }) || []
    
    console.log(`\n📊 Summary: Found ${infoCardsSections.length} infoCardsSection(s)`)
    
    // Also check the raw JSON structure for the specific section
    const infoCardsSection = page.contentBlocks?.find((block: any) => 
      block._type === 'infoCardsSection' && block.title === 'Sådan Udnytter Du Historiske Prismønstre'
    )
    
    if (infoCardsSection) {
      console.log('\n🔧 Raw JSON for target section:')
      console.log(JSON.stringify(infoCardsSection, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the debug
debugInfoCardsData()