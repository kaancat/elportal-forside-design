#!/usr/bin/env node
import { createClient } from '@sanity/client'
import { useMCPServer } from '../src/lib/smithery/gateway.js'
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
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

async function searchForImages() {
  console.log('🔍 Searching for energy saving images...')
  
  try {
    // Search for energy-saving related images
    const result = await useMCPServer('@unsplash/mcp', 'search', {
      query: 'smart home energy saving LED bulbs efficiency',
      per_page: 8,
      orientation: 'landscape'
    })
    
    console.log('Found images:', result)
    return result
  } catch (error) {
    console.error('Error searching for images:', error)
    
    // Try alternative search terms
    console.log('Trying alternative search...')
    try {
      const result = await useMCPServer('@unsplash/mcp', 'search', {
        query: 'solar panels house energy efficient home',
        per_page: 5,
        orientation: 'landscape'
      })
      return result
    } catch (altError) {
      console.error('Alternative search also failed:', altError)
      return null
    }
  }
}

async function downloadAndUploadImage(imageUrl: string, filename: string) {
  console.log(`📥 Downloading image: ${filename}`)
  
  try {
    // Download the image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }
    
    const buffer = await response.buffer()
    
    // Upload to Sanity
    console.log('📤 Uploading to Sanity...')
    const asset = await client.assets.upload('image', buffer, {
      filename: filename,
      contentType: response.headers.get('content-type') || 'image/jpeg'
    })
    
    console.log('✅ Image uploaded successfully:', asset._id)
    return asset
  } catch (error) {
    console.error('Error downloading/uploading image:', error)
    throw error
  }
}

async function updateHeroWithImage(assetId: string) {
  console.log('🔄 Updating hero section with image...')
  
  try {
    // First, get the current page data
    const page = await client.fetch(`*[_id == "${PAGE_ID}"][0]{
      contentBlocks
    }`)
    
    if (!page) {
      throw new Error('Page not found')
    }
    
    const contentBlocks = page.contentBlocks || []
    const heroBlock = contentBlocks[0]
    
    if (!heroBlock || heroBlock._type !== 'hero') {
      throw new Error('Hero block not found or invalid')
    }
    
    // Update the hero block with the image
    const updatedHeroBlock = {
      ...heroBlock,
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: assetId
        }
      }
    }
    
    // Update the entire contentBlocks array
    const updatedContentBlocks = [updatedHeroBlock, ...contentBlocks.slice(1)]
    
    // Update the page
    const result = await client
      .patch(PAGE_ID)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Hero section updated successfully')
    return result
  } catch (error) {
    console.error('Error updating hero section:', error)
    throw error
  }
}

async function main() {
  try {
    console.log('🚀 Starting energy saving hero image addition process...')
    
    // Search for images
    const searchResult = await searchForImages()
    
    if (!searchResult || !searchResult.content || !searchResult.content[0]) {
      throw new Error('No images found in search results')
    }
    
    // Parse the response to get image data
    let images = []
    const content = searchResult.content[0]
    
    if (content.type === 'text' && content.text) {
      try {
        const parsed = JSON.parse(content.text)
        images = parsed.results || parsed.photos || []
      } catch (parseError) {
        console.error('Error parsing search results:', parseError)
        console.log('Raw content:', content.text)
        return
      }
    }
    
    if (images.length === 0) {
      throw new Error('No images found in parsed results')
    }
    
    console.log(`Found ${images.length} images, selecting the best one...`)
    
    // Select the best image (first one, which should be most relevant)
    const selectedImage = images[0]
    const imageUrl = selectedImage.urls?.regular || selectedImage.urls?.full
    const filename = `energy-saving-hero-${selectedImage.id}.jpg`
    
    if (!imageUrl) {
      throw new Error('No suitable image URL found')
    }
    
    console.log('Selected image:', {
      id: selectedImage.id,
      description: selectedImage.alt_description || selectedImage.description,
      url: imageUrl
    })
    
    // Download and upload the image
    const asset = await downloadAndUploadImage(imageUrl, filename)
    
    // Update the hero section
    await updateHeroWithImage(asset._id)
    
    console.log('🎉 Successfully added image to energy saving tips hero section!')
    console.log('Image description:', selectedImage.alt_description || selectedImage.description)
    console.log('Sanity asset ID:', asset._id)
    
  } catch (error) {
    console.error('❌ Process failed:', error)
    process.exit(1)
  }
}

main()