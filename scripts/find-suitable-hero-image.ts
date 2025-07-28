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

async function findAndAddHeroImage() {
  console.log('🔍 Finding suitable hero image from existing Sanity assets')
  console.log('=' .repeat(80))
  
  try {
    // First, search for existing images that might be suitable
    const query = `*[_type == "sanity.imageAsset"] | order(_createdAt desc) {
      _id,
      originalFilename,
      url,
      metadata {
        dimensions {
          width,
          height,
          aspectRatio
        }
      }
    }`
    
    const images = await client.fetch(query)
    console.log(`Found ${images.length} images in asset library`)
    
    // Look for images that might be suitable for energy/electricity theme
    const suitableImages = images.filter((img: any) => {
      const filename = img.originalFilename?.toLowerCase() || ''
      const isLandscape = img.metadata?.dimensions?.aspectRatio > 1.2
      const isLargeEnough = img.metadata?.dimensions?.width > 800
      
      const energyKeywords = [
        'energy', 'solar', 'wind', 'green', 'led', 'bulb', 'electric', 
        'home', 'house', 'smart', 'efficient', 'power', 'renewable'
      ]
      
      const hasEnergyKeyword = energyKeywords.some(keyword => 
        filename.includes(keyword)
      )
      
      return hasEnergyKeyword && isLandscape && isLargeEnough
    })
    
    console.log(`Found ${suitableImages.length} potentially suitable images:`)
    suitableImages.slice(0, 10).forEach((img: any, index: number) => {
      console.log(`   ${index + 1}. ${img.originalFilename} (${img.metadata?.dimensions?.width}x${img.metadata?.dimensions?.height})`)
    })
    
    let selectedImage = null
    
    if (suitableImages.length > 0) {
      // Use the first suitable image
      selectedImage = suitableImages[0]
      console.log(`\n✅ Selected image: ${selectedImage.originalFilename}`)
    } else {
      // If no suitable images found, look for any landscape image
      const landscapeImages = images.filter((img: any) => {
        const isLandscape = img.metadata?.dimensions?.aspectRatio > 1.2
        const isLargeEnough = img.metadata?.dimensions?.width > 800
        return isLandscape && isLargeEnough
      })
      
      if (landscapeImages.length > 0) {
        selectedImage = landscapeImages[0]
        console.log(`\n⚠️  No energy-themed images found. Using first suitable landscape image: ${selectedImage.originalFilename}`)
      } else {
        console.log(`\n❌ No suitable images found in asset library`)
        console.log(`   Recommendation: Upload an energy-saving themed image manually to Sanity Studio`)
        return
      }
    }
    
    // Now update the hero section with the selected image
    console.log(`\n📝 Updating hero section with selected image...`)
    
    const page = await client.getDocument(PAGE_ID)
    if (!page) {
      throw new Error('Page not found!')
    }
    
    const heroBlock = page.contentBlocks[0]
    if (heroBlock._type !== 'hero') {
      throw new Error('First block is not a hero block!')
    }
    
    // Update the hero block with the image
    const updatedHeroBlock = {
      ...heroBlock,
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: selectedImage._id
        },
        alt: 'Energibesparende tips - spar penge på din elregning'
      }
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
    
    console.log('✅ Successfully updated hero section with image!')
    console.log(`   Image: ${selectedImage.originalFilename}`)
    console.log(`   Dimensions: ${selectedImage.metadata?.dimensions?.width}x${selectedImage.metadata?.dimensions?.height}`)
    console.log()
    console.log('🔗 View at: https://dinelportal.sanity.studio/structure/page;' + PAGE_ID)
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

// Run the script
findAndAddHeroImage().catch(console.error)