import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import https from 'https'
import fs from 'fs'
import path from 'path'

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

// Best image from search - Danish house with solar panels
const SELECTED_IMAGE = {
  id: 'nZPep_gHfwg',
  description: 'Solar voltaic cell on a traditional house in Denmark',
  photographer: 'Unknown', // Will need to fetch from Unsplash
  url: 'https://images.unsplash.com/photo-1711224116673-fd729b3db180?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3ODI5NDZ8MHwxfHNlYXJjaHw1fHxzb2xhciUyMHBhbmVscyUyMGhvbWUlMjBlbmVyZ3klMjBlZmZpY2llbnR8ZW58MHwwfHx8MTc1MzcwMTg5M3ww&ixlib=rb-4.1.0&q=85',
  width: 4271,
  height: 1925
}

async function downloadImage(url: string, filename: string): Promise<string> {
  const filepath = path.join('/tmp', filename)
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    
    https.get(url, (response) => {
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        resolve(filepath)
      })
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}) // Delete the file on error
      reject(err)
    })
  })
}

async function updateHeroImage() {
  console.log('🖼️  Updating hero image from Unsplash')
  console.log('=' .repeat(80))
  
  try {
    // Step 1: Download the image
    console.log('📥 Downloading image from Unsplash...')
    console.log(`   Image: ${SELECTED_IMAGE.description}`)
    console.log(`   Dimensions: ${SELECTED_IMAGE.width}x${SELECTED_IMAGE.height}`)
    
    const filename = `energibesparende-tips-hero-${Date.now()}.jpg`
    const filepath = await downloadImage(SELECTED_IMAGE.url, filename)
    console.log('✅ Image downloaded successfully')
    
    // Step 2: Upload to Sanity
    console.log('\n📤 Uploading image to Sanity...')
    const imageAsset = await client.assets.upload('image', fs.createReadStream(filepath), {
      filename: filename,
      source: {
        name: 'unsplash',
        id: SELECTED_IMAGE.id,
        url: `https://unsplash.com/photos/${SELECTED_IMAGE.id}`
      },
      description: SELECTED_IMAGE.description,
      creditLine: 'Photo from Unsplash'
    })
    
    console.log('✅ Image uploaded to Sanity')
    console.log(`   Asset ID: ${imageAsset._id}`)
    
    // Step 3: Clean up temp file
    fs.unlinkSync(filepath)
    
    // Step 4: Update the page
    console.log('\n📝 Updating hero section...')
    const page = await client.getDocument(PAGE_ID)
    
    if (!page) {
      throw new Error('Page not found!')
    }
    
    const heroBlock = page.contentBlocks[0]
    if (heroBlock._type !== 'hero') {
      throw new Error('First block is not a hero block!')
    }
    
    // Update the hero block with the new image
    const updatedHeroBlock = {
      ...heroBlock,
      image: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id
        },
        alt: 'Solceller på dansk hus - symboliserer energibesparelser og bæredygtig livsstil'
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
    
    console.log('✅ Hero section updated successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Image: ${SELECTED_IMAGE.description}`)
    console.log(`   - Size: ${SELECTED_IMAGE.width}x${SELECTED_IMAGE.height}`)
    console.log(`   - Alt text: "Solceller på dansk hus - symboliserer energibesparelser og bæredygtig livsstil"`)
    console.log()
    console.log('🔗 View at: https://dinelportal.sanity.studio/structure/page;' + PAGE_ID)
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

// Run the script
updateHeroImage().catch(console.error)