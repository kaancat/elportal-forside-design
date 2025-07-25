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

async function addImageToLadeboksHero() {
  try {
    console.log('🚀 Starting to add image to Ladeboks page hero section...\n')
    
    // Get the ladeboks page
    const pageId = 'Ldbn1aqxfi6rpqe9dn'
    const page = await client.getDocument(pageId)
    
    if (!page) {
      console.error('❌ Ladeboks page not found with ID:', pageId)
      return
    }
    
    console.log('✅ Found page:', page.title)
    
    // Find the hero block
    const heroBlockIndex = page.contentBlocks?.findIndex((block: any) => block._type === 'hero')
    
    if (heroBlockIndex === -1 || heroBlockIndex === undefined) {
      console.error('❌ No hero block found in the page')
      return
    }
    
    console.log('✅ Found hero block at index:', heroBlockIndex)
    
    // First, we need to upload the image from the URL
    const imageUrl = 'https://images.unsplash.com/photo-1600490819528-42405785433a'
    console.log('📸 Fetching image from:', imageUrl)
    
    // Fetch the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    
    const imageBuffer = await response.arrayBuffer()
    const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' })
    
    console.log('📤 Uploading image to Sanity...')
    
    // Upload to Sanity
    const asset = await client.assets.upload('image', imageBlob, {
      filename: 'elbil-oplades-hjemme-med-moderne-ladeboks.jpg'
    })
    
    console.log('✅ Image uploaded successfully!')
    console.log('Asset ID:', asset._id)
    
    // Update the hero block with the image reference
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[heroBlockIndex] = {
      ...updatedContentBlocks[heroBlockIndex],
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: asset._id
        },
        alt: 'Elbil oplades hjemme med moderne ladeboks'
      }
    }
    
    // Update the page
    console.log('📝 Updating page with image reference...')
    
    const result = await client
      .patch(pageId)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Page updated successfully!')
    console.log('🖼️ Image added to hero section with alt text:', 'Elbil oplades hjemme med moderne ladeboks')
    
    console.log('\n🎯 Summary:')
    console.log('- Image uploaded to Sanity assets')
    console.log('- Hero block updated with image reference')
    console.log('- Alt text added for accessibility')
    console.log('\n🔗 View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;Ldbn1aqxfi6rpqe9dn')
    
  } catch (error) {
    console.error('❌ Error adding image:', error)
    if (error.response) {
      console.error('Response details:', error.response.body)
    }
  }
}

// Check if SANITY_API_TOKEN is set
if (!process.env.SANITY_API_TOKEN) {
  console.error('❌ SANITY_API_TOKEN is not set in .env file')
  console.error('Please add your Sanity API token to the .env file')
  process.exit(1)
}

addImageToLadeboksHero()