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

// Hero image recommendation: Luke Chesser's analytics dashboard
// URL: https://unsplash.com/photos/JKUTrJ4vK00
// Direct image URL: https://images.unsplash.com/photo-1551288049-bebda4e38f71

async function uploadImageFromUrl(imageUrl: string, filename: string) {
  try {
    console.log('Fetching image from URL...')
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    
    const buffer = await response.arrayBuffer()
    const asset = await client.assets.upload('image', Buffer.from(buffer), {
      filename: filename
    })
    
    console.log('Image uploaded successfully:', asset._id)
    return asset
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

async function updateHeroImage() {
  try {
    // First, fetch the current page to get the hero block key
    const page = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYjlhjr"][0]`)
    if (!page) {
      console.error('Page not found')
      return
    }

    // Find the hero block
    const heroBlock = page.contentBlocks?.find((block: any) => block._type === 'hero')
    if (!heroBlock) {
      console.error('Hero block not found in page')
      return
    }

    console.log('Found hero block with key:', heroBlock._key)

    // Upload the image
    const imageAsset = await uploadImageFromUrl(
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'luke-chesser-analytics-dashboard.jpg'
    )

    // Update the hero block with the new image
    const updatedHeroBlock = {
      ...heroBlock,
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id
        },
        alt: 'Analytics dashboard showing performance graphs and data visualizations for electricity market analysis'
      }
    }

    // Update the contentBlocks array
    const updatedContentBlocks = page.contentBlocks.map((block: any) => 
      block._key === heroBlock._key ? updatedHeroBlock : block
    )

    // Update the page with the new hero image
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('Page updated successfully!')
    console.log('Hero image added to historiske-priser page')
    console.log('Image credit: Luke Chesser on Unsplash')
    console.log('View the page at: https://elportal-forside-design.vercel.app/historiske-priser')
  } catch (error) {
    console.error('Error updating hero image:', error)
  }
}

// Run the update
updateHeroImage()