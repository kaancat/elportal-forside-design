import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

// Create Sanity client
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

const PAGE_ID = 'I7aq0qw44tdJ3YglBpsP1G'

async function addPlaceholderHeroImage() {
  console.log('🖼️  Adding placeholder hero image to energibesparende-tips page')
  console.log('=' .repeat(80))
  
  try {
    // Fetch the current page
    const page = await client.getDocument(PAGE_ID)
    
    if (!page) {
      throw new Error('Page not found!')
    }
    
    console.log('✅ Page found:', page.title)
    console.log('   Current content blocks:', page.contentBlocks?.length || 0)
    
    // Check current hero block
    const heroBlock = page.contentBlocks[0]
    if (heroBlock._type !== 'hero') {
      throw new Error('First block is not a hero block!')
    }
    
    console.log('📋 Current hero block:')
    console.log('   Headline:', heroBlock.headline)
    console.log('   Subheadline:', heroBlock.subheadline)
    console.log('   Has image:', !!heroBlock.image)
    
    if (heroBlock.image) {
      console.log('⚠️  Hero already has an image. Skipping update.')
      return
    }
    
    // For now, we'll create a simple text note that an image should be added
    // This is a placeholder until we can get the Unsplash integration working
    console.log('📝 Adding note about missing image...')
    
    // Update the hero block with a note about the missing image
    const updatedHeroBlock = {
      ...heroBlock,
      // Add a note in the subheadline that we need an image
      subheadline: heroBlock.subheadline + ' [BILLEDE MANGLER: Energibesparende LED-pærer eller solpaneler]'
    }
    
    const updatedContentBlocks = [
      updatedHeroBlock,
      ...page.contentBlocks.slice(1)
    ]
    
    // Update the page
    await client
      .patch(PAGE_ID)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Added placeholder note to hero section')
    console.log('📌 TODO: Replace with actual image from Unsplash when MCP is working')
    console.log()
    console.log('🔗 View at: https://dinelportal.sanity.studio/structure/page;' + PAGE_ID)
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

// Run the script
addPlaceholderHeroImage().catch(console.error)