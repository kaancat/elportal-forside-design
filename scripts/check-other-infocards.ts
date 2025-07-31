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

async function checkOtherInfoCards() {
  console.log('🔍 Checking other pages with infoCardsSection for comparison...')
  
  try {
    // Find all pages with infoCardsSection
    const query = `*[_type == "page" && contentBlocks[_type == "infoCardsSection"]][0...3]{
      slug,
      title,
      contentBlocks[_type == "infoCardsSection"][0]{
        title,
        subtitle,
        cards[0]{
          _key,
          _type,
          title,
          description,
          icon
        }
      }
    }`
    
    const pages = await client.fetch(query)
    
    console.log(`📄 Found ${pages.length} pages with infoCardsSection`)
    
    pages.forEach((page: any, index: number) => {
      console.log(`\n📄 Page ${index + 1}: ${page.slug?.current || 'no-slug'}`)
      console.log(`   Title: ${page.title}`)
      
      const infoSection = page.contentBlocks
      if (infoSection) {
        console.log(`   InfoCards Title: ${infoSection.title}`)
        console.log(`   InfoCards Subtitle: ${infoSection.subtitle}`)
        
        if (infoSection.cards && infoSection.cards.length > 0) {
          const firstCard = infoSection.cards
          console.log(`   First Card Structure:`)
          console.log(`     - Has _key: ${!!firstCard._key}`)
          console.log(`     - Has _type: ${!!firstCard._type}`)
          console.log(`     - Title: ${firstCard.title}`)
          console.log(`     - Icon: ${firstCard.icon}`)
          console.log(`     - Description type: ${Array.isArray(firstCard.description) ? 'array' : typeof firstCard.description}`)
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the check
checkOtherInfoCards()