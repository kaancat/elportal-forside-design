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

async function restoreSubtitle() {
  try {
    // Fetch the elselskaber page
    const query = `*[_type == "page" && slug.current == "elselskaber"][0]`
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('Elselskaber page not found')
      return
    }

    console.log('Current page ID:', page._id)
    
    // Find and update the featureList block
    const updatedContentBlocks = page.contentBlocks.map((block: any) => {
      if (block._type === 'featureList') {
        console.log('Found featureList block, restoring subtitle')
        return {
          ...block,
          subtitle: 'Vi gør det nemt at finde det bedste elselskab til netop dine behov'
        }
      }
      return block
    })

    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('Successfully restored subtitle to featureList')
    console.log('Updated page:', result._id)
    
  } catch (error) {
    console.error('Error restoring subtitle:', error)
  }
}

// Run the restoration
console.log('Restoring featureList subtitle...')
restoreSubtitle()