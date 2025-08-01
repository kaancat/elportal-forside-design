import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function removeVideoSection() {
  try {
    console.log('Fetching homepage...')
    
    const homepage = await client.fetch(`*[_type == "page" && isHomepage == true][0]`)
    
    if (!homepage) {
      console.error('Homepage not found!')
      return
    }

    // Find video section without URL
    const videoSectionIndex = homepage.contentBlocks?.findIndex((block: any) => 
      block._type === 'videoSection' && !block.videoUrl
    )

    if (videoSectionIndex === -1) {
      console.log('No video section without URL found')
      return
    }

    console.log(`Found video section without URL at index ${videoSectionIndex}`)
    
    // Remove the video section
    const result = await client
      .patch(homepage._id)
      .unset([`contentBlocks[${videoSectionIndex}]`])
      .commit()

    console.log('✅ Successfully removed video section without URL')
    console.log('Document revision:', result._rev)
    
  } catch (error) {
    console.error('Error removing video section:', error)
  }
}

// Run the removal
removeVideoSection()