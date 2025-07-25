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

interface ImageUpdate {
  blockIndex: number
  imageUrl: string
  altText: string
  blockType: string
  title?: string
}

async function uploadImageFromUrl(url: string, filename: string) {
  console.log(`📸 Fetching image from: ${url}`)
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }
  
  const imageBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(imageBuffer)
  
  console.log(`📤 Uploading ${filename} to Sanity...`)
  
  const asset = await client.assets.upload('image', buffer, {
    filename: filename,
    contentType: 'image/jpeg'
  })
  
  console.log(`✅ Image uploaded! Asset ID: ${asset._id}`)
  return asset
}

async function addImagesToLadeboks() {
  try {
    console.log('🚀 Starting to add images to Ladeboks page...\n')
    
    // Get the ladeboks page
    const pageId = 'Ldbn1aqxfi6rpqe9dn'
    const page = await client.getDocument(pageId)
    
    if (!page) {
      console.error('❌ Ladeboks page not found with ID:', pageId)
      return
    }
    
    console.log('✅ Found page:', page.title)
    console.log(`📦 Total content blocks: ${page.contentBlocks?.length || 0}\n`)
    
    // Define images to add
    const imagesToAdd: ImageUpdate[] = []
    
    // Find blocks and prepare image updates
    page.contentBlocks?.forEach((block: any, index: number) => {
      if (block._type === 'hero') {
        imagesToAdd.push({
          blockIndex: index,
          imageUrl: 'https://images.unsplash.com/photo-1600490819528-42405785433a',
          altText: 'Elbil oplades hjemme med moderne ladeboks',
          blockType: 'hero',
          title: block.headline
        })
      }
      
      // Add images to specific pageSections
      if (block._type === 'pageSection') {
        if (block.title === 'Hvorfor er en Ladeboks en God Investering?') {
          imagesToAdd.push({
            blockIndex: index,
            imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
            altText: 'Moderne hjem med elbil og ladeboks installeret i garagen',
            blockType: 'pageSection',
            title: block.title
          })
        }
        
        if (block.title === 'Installation af din Ladeboks: Trin for Trin') {
          imagesToAdd.push({
            blockIndex: index,
            imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
            altText: 'Professionel elektriker installerer ladeboks på husvæg',
            blockType: 'pageSection',
            title: block.title
          })
        }
      }
    })
    
    console.log(`📋 Found ${imagesToAdd.length} blocks to update with images\n`)
    
    // Upload all images
    const uploadedAssets: any = {}
    for (const imageUpdate of imagesToAdd) {
      const filename = `ladeboks-${imageUpdate.blockType}-${imageUpdate.blockIndex}.jpg`
      const asset = await uploadImageFromUrl(imageUpdate.imageUrl, filename)
      uploadedAssets[imageUpdate.blockIndex] = asset
    }
    
    console.log('\n📝 Updating page with image references...')
    
    // Update content blocks with image references
    const updatedContentBlocks = [...page.contentBlocks]
    
    for (const imageUpdate of imagesToAdd) {
      const asset = uploadedAssets[imageUpdate.blockIndex]
      
      if (imageUpdate.blockType === 'hero') {
        updatedContentBlocks[imageUpdate.blockIndex] = {
          ...updatedContentBlocks[imageUpdate.blockIndex],
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id
            },
            alt: imageUpdate.altText
          }
        }
      }
      
      if (imageUpdate.blockType === 'pageSection') {
        updatedContentBlocks[imageUpdate.blockIndex] = {
          ...updatedContentBlocks[imageUpdate.blockIndex],
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id
            },
            alt: imageUpdate.altText
          },
          imagePosition: 'right' // Default to right position for better layout
        }
      }
      
      console.log(`✅ Updated ${imageUpdate.blockType} block: "${imageUpdate.title?.substring(0, 50)}..."`)
    }
    
    // Update the page in Sanity
    const result = await client
      .patch(pageId)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('\n✅ All images added successfully!')
    
    console.log('\n🎯 Summary:')
    console.log('- Hero section: Electric car charging at home')
    console.log('- Investment section: Modern home with EV and charging box')
    console.log('- Installation section: Professional electrician at work')
    
    console.log('\n🔗 View in Sanity Studio:')
    console.log(`https://dinelportal.sanity.studio/structure/page;${pageId}`)
    
    console.log('\n💡 Next steps:')
    console.log('1. Review the images in Sanity Studio')
    console.log('2. Adjust image positions if needed (left/right for pageSections)')
    console.log('3. Add hotspot focus areas for optimal cropping')
    console.log('4. Publish the changes')
    
  } catch (error) {
    console.error('❌ Error adding images:', error)
    if (error.response) {
      console.error('Response details:', error.response.body)
    }
  }
}

// Check if SANITY_API_TOKEN is set
if (!process.env.SANITY_API_TOKEN) {
  console.error('❌ SANITY_API_TOKEN is not set in .env file')
  console.error('Please add your Sanity API token to the .env file')
  console.error('Get it from: https://www.sanity.io/manage/personal/project/yxesi03x/api#tokens')
  process.exit(1)
}

addImagesToLadeboks()