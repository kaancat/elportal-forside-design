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

async function testInfoCardsFetch() {
  console.log('🔍 Testing infoCardsSection data fetch...')
  
  try {
    // Use the same query structure as in sanityService.ts
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      title,
      contentBlocks[] {
        ...,
        _type == "infoCardsSection" => {
          _key,
          _type,
          title,
          subtitle,
          headerAlignment,
          leadingText,
          cards[]{
            title,
            description,
            icon,
            iconColor,
            bgColor
          },
          columns
        }
      }
    }`
    
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('✅ Page found:', page.title)
    
    // Find infoCardsSection
    const infoCardSection = page.contentBlocks.find((block: any) => 
      block._type === 'infoCardsSection'
    )
    
    if (!infoCardSection) {
      console.error('❌ No infoCardsSection found in contentBlocks')
      return
    }
    
    console.log('\n📊 InfoCardsSection data:')
    console.log('- Title:', infoCardSection.title)
    console.log('- Subtitle:', infoCardSection.subtitle)
    console.log('- Header Alignment:', infoCardSection.headerAlignment)
    console.log('- Columns:', infoCardSection.columns)
    console.log('- Cards count:', infoCardSection.cards?.length || 0)
    
    if (infoCardSection.cards && infoCardSection.cards.length > 0) {
      console.log('\n📇 Cards details:')
      infoCardSection.cards.forEach((card: any, index: number) => {
        console.log(`\nCard ${index + 1}:`)
        console.log('  - Title:', card.title)
        console.log('  - Icon:', card.icon)
        console.log('  - Icon Color:', card.iconColor)
        console.log('  - BG Color:', card.bgColor)
        console.log('  - Has description:', !!card.description)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the test
testInfoCardsFetch()