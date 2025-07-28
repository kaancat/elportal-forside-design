#!/usr/bin/env node
import { createClient } from '@sanity/client'
import { useMCPServer } from '../src/lib/smithery/gateway.js'
import * as dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

const PAGE_ID = 'I7aq0qw44tdJ3YglBpsP1G'

interface UnsplashImage {
  id: string
  alt_description?: string
  description?: string
  width: number
  height: number
  urls: {
    regular: string
    full: string
    small: string
  }
  user: {
    name: string
  }
}

async function searchEnergyImages(): Promise<UnsplashImage[]> {
  console.log('🔍 Searching for energy saving images on Unsplash...')
  
  // Try multiple search queries to find the best images
  const searchQueries = [
    'energy efficient home LED bulbs smart home',
    'solar panels residential house energy saving',
    'smart home energy efficiency modern house',
    'LED light bulbs energy saving technology',
    'energy efficient house modern sustainable'
  ]
  
  for (const query of searchQueries) {
    try {
      console.log(`Trying search query: "${query}"`)
      
      const result = await useMCPServer('@unsplash/mcp', 'search', {
        query: query,
        per_page: 5,
        orientation: 'landscape'
      })
      
      if (result?.content?.[0]?.type === 'text') {
        const responseText = result.content[0].text
        console.log('Raw response:', responseText.substring(0, 200) + '...')
        
        try {
          const parsed = JSON.parse(responseText)
          
          if (parsed.results && parsed.results.length > 0) {
            console.log(`✅ Found ${parsed.results.length} images with query: "${query}"`)
            return parsed.results
          }
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError)
        }
      }
    } catch (error) {
      console.error(`Search query "${query}" failed:`, error)
      continue
    }
  }
  
  throw new Error('All search queries failed to find suitable images')
}

async function downloadAndUploadImage(image: UnsplashImage): Promise<string> {
  console.log(`📥 Downloading image: ${image.id}`)
  console.log(`Description: ${image.alt_description || image.description || 'No description'}`)
  
  try {
    // Use the regular size for better quality but manageable file size
    const imageUrl = image.urls.regular
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }
    
    const buffer = await response.buffer()
    const filename = `energy-tips-hero-${image.id}.jpg`
    
    console.log('📤 Uploading to Sanity...')
    const asset = await client.assets.upload('image', buffer, {
      filename: filename,
      contentType: 'image/jpeg',
      // Add metadata
      description: image.alt_description || image.description || 'Energy saving tips hero image',
      creditLine: `Photo by ${image.user.name} on Unsplash`
    })
    
    console.log('✅ Image uploaded successfully:', asset._id)
    return asset._id
  } catch (error) {
    console.error('Error downloading/uploading image:', error)
    throw error
  }
}

async function updateHeroWithImage(assetId: string): Promise<void> {
  console.log('🔄 Updating hero section with image...')
  
  try {
    // Get current page structure
    const page = await client.fetch(`*[_id == "${PAGE_ID}"][0]{
      contentBlocks
    }`)
    
    if (!page) {
      throw new Error('Page not found')
    }
    
    const contentBlocks = [...(page.contentBlocks || [])]
    
    if (contentBlocks.length === 0 || contentBlocks[0]._type !== 'hero') {
      throw new Error('Hero block not found or invalid')
    }
    
    // Update the hero block with the image
    contentBlocks[0] = {
      ...contentBlocks[0],
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: assetId
        }
      }
    }
    
    // Update the page
    await client
      .patch(PAGE_ID)
      .set({ contentBlocks })
      .commit()
    
    console.log('✅ Hero section updated successfully!')
    
    // Verify the update
    const updatedPage = await client.fetch(`*[_id == "${PAGE_ID}"][0]{
      "heroImage": contentBlocks[0].image
    }`)
    
    if (updatedPage?.heroImage?.asset?._ref) {
      console.log('✅ Verification successful - image is now in hero section')
      console.log('Asset reference:', updatedPage.heroImage.asset._ref)
    } else {
      throw new Error('Verification failed - image not found in hero section')
    }
    
  } catch (error) {
    console.error('Error updating hero section:', error)
    throw error
  }
}

async function main() {
  try {
    console.log('🚀 Starting the complete hero image addition process...')
    console.log('Target page ID:', PAGE_ID)
    
    // Step 1: Search for images
    const images = await searchEnergyImages()
    
    if (images.length === 0) {
      throw new Error('No suitable images found')
    }
    
    // Step 2: Select the best image (first one is usually most relevant)
    const selectedImage = images[0]
    console.log('\n📸 Selected image:')
    console.log('- ID:', selectedImage.id)
    console.log('- Description:', selectedImage.alt_description || selectedImage.description || 'No description')
    console.log('- Dimensions:', `${selectedImage.width}x${selectedImage.height}`)
    console.log('- Photographer:', selectedImage.user.name)
    
    // Step 3: Download and upload to Sanity
    const assetId = await downloadAndUploadImage(selectedImage)
    
    // Step 4: Update the hero section
    await updateHeroWithImage(assetId)
    
    console.log('\n🎉 Process completed successfully!')
    console.log('The energibesparende-tips page now has a hero image.')
    console.log('Sanity Studio URL: https://dinelportal.sanity.studio/structure/page;' + PAGE_ID)
    
  } catch (error) {
    console.error('\n❌ Process failed:', error)
    console.error('Please check the error above and try again.')
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}