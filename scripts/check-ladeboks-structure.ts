import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function checkLadeboksStructure() {
  try {
    console.log('🔍 Checking Ladeboks page structure...\n')
    
    const pageId = 'Ldbn1aqxfi6rpqe9dn'
    const page = await client.getDocument(pageId)
    
    if (!page) {
      console.error('❌ Page not found')
      return
    }
    
    console.log('📄 Page Title:', page.title)
    console.log('🆔 Page ID:', page._id)
    console.log('\n📦 Content Blocks:\n')
    
    page.contentBlocks?.forEach((block: any, index: number) => {
      console.log(`${index + 1}. Type: ${block._type}`)
      
      if (block._type === 'hero') {
        console.log(`   - Headline: ${block.headline?.substring(0, 50)}...`)
        console.log(`   - Has Image: ${block.image ? 'Yes' : 'No'}`)
      }
      
      if (block._type === 'pageSection') {
        console.log(`   - Title: ${block.title || 'No title'}`)
        console.log(`   - Has Image: ${block.image ? 'Yes' : 'No'}`)
        console.log(`   - Content Length: ${block.content?.length || 0} blocks`)
      }
      
      if (block._type === 'valueProposition') {
        console.log(`   - Title: ${block.title}`)
        console.log(`   - Items: ${block.items?.length || 0}`)
      }
      
      if (block._type === 'chargingBoxShowcase') {
        console.log(`   - Heading: ${block.heading}`)
        console.log(`   - Products: ${block.products?.length || 0}`)
      }
      
      console.log('')
    })
    
    // Check which pageSections could benefit from images
    console.log('\n🖼️ PageSections that could use images:\n')
    
    const pageSectionSuggestions = [
      {
        title: 'Hvorfor er en Ladeboks en God Investering?',
        suggestion: 'Modern home with electric car charging',
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64'
      },
      {
        title: 'Installation af din Ladeboks: Trin for Trin',
        suggestion: 'Electrician installing charging box',
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e'
      }
    ]
    
    page.contentBlocks?.forEach((block: any, index: number) => {
      if (block._type === 'pageSection' && block.title) {
        const suggestion = pageSectionSuggestions.find(s => s.title === block.title)
        if (suggestion) {
          console.log(`Block ${index + 1}: "${block.title}"`)
          console.log(`   Suggested image: ${suggestion.suggestion}`)
          console.log(`   URL: ${suggestion.url}`)
          console.log('')
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Check if SANITY_API_TOKEN is set
if (!process.env.SANITY_API_TOKEN) {
  console.error('❌ SANITY_API_TOKEN is not set in .env file')
  process.exit(1)
}

checkLadeboksStructure()