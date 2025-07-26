import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function alignEverythingLeft() {
  console.log('🎯 Aligning all prognoser page content to the left...\n')
  
  try {
    // Fetch current page
    const currentPage = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYkdQx3"][0]`)
    
    if (!currentPage) {
      console.error('❌ Prognoser page not found!')
      return
    }
    
    console.log('📋 Found page with', currentPage.contentBlocks?.length || 0, 'content blocks')
    
    // Update all blocks to have left alignment
    const leftAlignedBlocks = currentPage.contentBlocks.map((block, index) => {
      console.log(`[${index}] Processing ${block._type}`)
      
      // For blocks that have headerAlignment property
      if ('headerAlignment' in block || block.headerAlignment !== undefined) {
        return {
          ...block,
          headerAlignment: 'left'
        }
      }
      
      // For hero blocks, ensure left alignment
      if (block._type === 'hero') {
        return {
          ...block,
          variant: 'left' // Heroes use variant property for alignment
        }
      }
      
      // For CTA sections
      if (block._type === 'callToActionSection') {
        return {
          ...block,
          variant: 'left' // CTA sections also use variant
        }
      }
      
      // Return unchanged if no alignment property
      return block
    })
    
    // Update the page
    console.log('\n📝 Updating page with left-aligned content...')
    const result = await client
      .patch(currentPage._id)
      .set({ contentBlocks: leftAlignedBlocks })
      .commit()
    
    console.log('\n✅ Success! All content is now left-aligned')
    console.log('🔗 View at: https://elportal-forside-design.vercel.app/prognoser')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the alignment update
alignEverythingLeft()
  .then(() => {
    console.log('\n🎉 Left alignment completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })