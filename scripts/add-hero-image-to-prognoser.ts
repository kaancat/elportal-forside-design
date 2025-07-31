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

// Replace this with the actual image asset ID from Sanity
const IMAGE_ASSET_ID = 'image-XXXXX-1920x1080-jpg' // <-- UPDATE THIS!

async function addHeroImageToPrognoser() {
  console.log('Adding hero image to prognoser page...')

  try {
    // Fetch the current page
    const currentPage = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYkdQx3"][0]`)
    
    if (!currentPage) {
      console.error('Prognoser page not found!')
      return
    }

    // Find the hero block
    const heroIndex = currentPage.contentBlocks.findIndex((block: any) => block._type === 'hero')
    
    if (heroIndex === -1) {
      console.error('Hero block not found in page!')
      return
    }

    // Update the hero block with the image
    const updatedContentBlocks = [...currentPage.contentBlocks]
    updatedContentBlocks[heroIndex] = {
      ...updatedContentBlocks[heroIndex],
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: IMAGE_ASSET_ID
        },
        alt: 'Elprognose og forecasting dashboard - præcise prognoser for elpriser'
      }
    }

    // Update the page
    console.log('Updating page with hero image...')
    
    const result = await client.patch('qgCxJyBbKpvhb2oGYkdQx3')
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('✅ Successfully added hero image to prognoser page!')
    console.log('Page ID:', result._id)

  } catch (error) {
    console.error('Error adding hero image:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
  }
}

// Check if IMAGE_ASSET_ID has been updated
if (IMAGE_ASSET_ID === 'image-XXXXX-1920x1080-jpg') {
  console.error('⚠️  ERROR: You must update IMAGE_ASSET_ID with an actual Sanity asset ID!')
  console.log('\nTo get an asset ID:')
  console.log('1. Go to https://dinelportal.sanity.studio')
  console.log('2. Navigate to Media/Assets')
  console.log('3. Upload an image (energy dashboard, forecast visualization, etc.)')
  console.log('4. Click on the uploaded image')
  console.log('5. Copy the asset ID (format: image-abc123-1920x1080-jpg)')
  console.log('6. Update IMAGE_ASSET_ID in this script')
  console.log('7. Run the script again')
} else {
  // Run the update
  addHeroImageToPrognoser()
}