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

async function addImageToEnergySavingTipsHero() {
  try {
    console.log('🚀 Starting to add image to Energibesparende Tips page hero section...\n')
    
    // Get the energibesparende-tips page
    const pageId = 'I7aq0qw44tdJ3YglBpsP1G'
    const page = await client.getDocument(pageId)
    
    if (!page) {
      console.error('❌ Energibesparende Tips page not found with ID:', pageId)
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
    console.log('Current hero content:')
    console.log('  Headline:', page.contentBlocks[heroBlockIndex].headline)
    console.log('  Subheadline:', page.contentBlocks[heroBlockIndex].subheadline)
    
    // Using a high-quality Unsplash image of solar panels on a modern house
    // This image represents energy efficiency and sustainable living
    const imageUrl = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64'
    
    console.log('\n📸 Fetching image from Unsplash...')
    console.log('Image theme: Solar panels on modern house roof')
    console.log('URL:', imageUrl)
    
    // Fetch the image with proper params for high quality
    const fullImageUrl = `${imageUrl}?auto=format&fit=crop&w=2000&q=80`
    const response = await fetch(fullImageUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    
    const imageBuffer = await response.arrayBuffer()
    const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' })
    
    console.log('📤 Uploading image to Sanity...')
    
    // Upload to Sanity
    const asset = await client.assets.upload('image', imageBlob, {
      filename: 'energibesparende-solceller-moderne-hus.jpg',
      description: 'Solar panels on modern house roof representing energy efficiency and sustainable living',
      creditLine: 'Photo by Vivint Solar on Unsplash'
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
        alt: 'Solceller på moderne hus - symboliserer energibesparelser og bæredygtig livsstil',
        caption: 'Foto: Vivint Solar via Unsplash'
      }
    }
    
    // Update the page
    console.log('\n📝 Updating page with image reference...')
    
    const result = await client
      .patch(pageId)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Page updated successfully!')
    console.log('\n🖼️ Image Details:')
    console.log('  - Theme: Solar panels on modern house')
    console.log('  - Alt text (Danish): Solceller på moderne hus - symboliserer energibesparelser og bæredygtig livsstil')
    console.log('  - Credit: Vivint Solar via Unsplash')
    console.log('  - Perfect for: Energy saving tips page showing sustainable living')
    
    console.log('\n🎯 Summary:')
    console.log('- High-quality image uploaded to Sanity assets')
    console.log('- Hero block updated with image reference')
    console.log('- Danish alt text added for accessibility')
    console.log('- Image credit included')
    
    console.log('\n🔗 View in Sanity Studio:')
    console.log(`https://dinelportal.sanity.studio/structure/page;${pageId}`)
    
    console.log('\n✨ Alternative image suggestions for future use:')
    console.log('1. Smart home dashboard: https://images.unsplash.com/photo-1558002038-1055907df827')
    console.log('2. Wind turbines Denmark: https://images.unsplash.com/photo-1532601224476-15c79f2f7a51')
    console.log('3. LED bulbs energy saving: https://images.unsplash.com/photo-1565636397844-3b0a2d78d517')
    console.log('4. Green energy home: https://images.unsplash.com/photo-1625246333195-78d9c38ad449')
    
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

addImageToEnergySavingTipsHero()