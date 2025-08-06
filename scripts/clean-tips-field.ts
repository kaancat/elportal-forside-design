import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function cleanTipsField() {
  try {
    console.log('Fetching the Energibesparende Tips page...')
    
    // Find the page document
    const query = `*[_type == "page" && slug.current == "energibesparende-tips-2025"][0]`
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('Page not found!')
      return
    }
    
    console.log('Found page:', page._id)
    
    // Find and clean the energyTipsSection block
    const updatedBlocks = page.contentBlocks.map((block: any) => {
      if (block._type === 'energyTipsSection') {
        console.log('Found energyTipsSection, removing tips field...')
        // Remove the tips field that's causing the unknown field error
        const { tips, ...cleanBlock } = block
        return cleanBlock
      }
      return block
    })
    
    // Update the document
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedBlocks })
      .commit()
    
    console.log('✅ Successfully removed tips field from energyTipsSection')
    console.log('The component will now use the hardcoded tips in the frontend')
    console.log('View at: https://dinelportal.sanity.studio/structure/page;' + result._id)
    
  } catch (error) {
    console.error('❌ Error updating page:', error)
    process.exit(1)
  }
}

cleanTipsField()