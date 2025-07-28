import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Sanity client configuration
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to generate unique keys
function generateKey(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Upload image to Sanity from URL
async function uploadImageFromUrl(imageUrl: string, fileName: string) {
  try {
    console.log(`📸 Uploading image: ${fileName}`)
    
    // Fetch the image
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error('Failed to fetch image')
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Upload to Sanity
    const asset = await client.assets.upload('image', buffer, {
      filename: fileName,
      contentType: 'image/jpeg'
    })
    
    console.log(`✅ Image uploaded: ${asset._id}`)
    return asset
  } catch (error) {
    console.error(`❌ Error uploading image ${fileName}:`, error)
    return null
  }
}

// Add images to the electricity guide
async function addImagesToElectricityGuide() {
  console.log('🚀 Adding images to electricity guide')
  
  const documentId = 'qgCxJyBbKpvhb2oGYqfgkp'
  
  // Free stock images from Pexels (these are example URLs - in production, use actual free stock photo URLs)
  const images = {
    hero: {
      url: 'https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg',
      alt: 'Vindmøller i Danmark - grøn energi og bæredygtighed',
      filename: 'hero-wind-turbines.jpg'
    },
    market: {
      url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
      alt: 'Det danske elmarked - moderne energiinfrastruktur',
      filename: 'market-infrastructure.jpg'
    },
    greenEnergy: {
      url: 'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg',
      alt: 'Solceller og vindmøller - vedvarende energi i Danmark',
      filename: 'green-energy.jpg'
    },
    consumerTypes: {
      url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
      alt: 'Forskellige danske boligtyper - fra lejlighed til parcelhus',
      filename: 'consumer-types.jpg'
    }
  }
  
  try {
    // Upload images first
    console.log('\n📤 Uploading images to Sanity...')
    const uploadedAssets = {
      hero: await uploadImageFromUrl(images.hero.url, images.hero.filename),
      market: await uploadImageFromUrl(images.market.url, images.market.filename),
      greenEnergy: await uploadImageFromUrl(images.greenEnergy.url, images.greenEnergy.filename),
      consumerTypes: await uploadImageFromUrl(images.consumerTypes.url, images.consumerTypes.filename)
    }
    
    // Fetch the document
    const document = await client.getDocument(documentId)
    console.log(`\n📄 Updating document: ${document.title}`)
    
    // Update content blocks with images
    const enhancedBlocks = document.contentBlocks.map((block: any, index: number) => {
      // Add hero image
      if (block._type === 'hero' && index === 0 && uploadedAssets.hero) {
        console.log('🖼️  Adding hero image')
        return {
          ...block,
          image: {
            _type: 'image',
            _key: generateKey(),
            asset: {
              _type: 'reference',
              _ref: uploadedAssets.hero._id
            },
            alt: images.hero.alt,
            hotspot: {
              x: 0.5,
              y: 0.5,
              height: 0.5,
              width: 0.8
            }
          }
        }
      }
      
      // Add market section image
      if (block._type === 'pageSection' && block.title === 'Forstå markedet for el-leverandører i Danmark' && uploadedAssets.market) {
        console.log('🖼️  Adding market section image')
        return {
          ...block,
          image: {
            _type: 'image',
            _key: generateKey(),
            asset: {
              _type: 'reference',
              _ref: uploadedAssets.market._id
            },
            alt: images.market.alt
          },
          imagePosition: 'right'
        }
      }
      
      // Add green energy section image
      if (block._type === 'pageSection' && block.title === 'Grøn energi og bæredygtighed' && uploadedAssets.greenEnergy) {
        console.log('🖼️  Adding green energy section image')
        return {
          ...block,
          image: {
            _type: 'image',
            _key: generateKey(),
            asset: {
              _type: 'reference',
              _ref: uploadedAssets.greenEnergy._id
            },
            alt: images.greenEnergy.alt
          },
          imagePosition: 'left'
        }
      }
      
      // Add consumer types section image
      if (block._type === 'pageSection' && block.title === 'Særlige overvejelser for forskellige forbrugertyper' && uploadedAssets.consumerTypes) {
        console.log('🖼️  Adding consumer types section image')
        return {
          ...block,
          image: {
            _type: 'image',
            _key: generateKey(),
            asset: {
              _type: 'reference',
              _ref: uploadedAssets.consumerTypes._id
            },
            alt: images.consumerTypes.alt
          },
          imagePosition: 'right'
        }
      }
      
      return block
    })
    
    // Update document
    console.log('\n📝 Updating document with images...')
    await client
      .patch(documentId)
      .set({ contentBlocks: enhancedBlocks })
      .commit()
    
    console.log('\n✅ Images added successfully!')
    console.log('\n📊 Images added to:')
    console.log('- Hero section')
    console.log('- Market understanding section')
    console.log('- Green energy section')
    console.log('- Consumer types section')
    
    console.log(`\n🔗 View enhanced page: https://dinelportal.sanity.studio/structure/page;${documentId}`)
    
  } catch (error) {
    console.error('❌ Error adding images:', error)
    process.exit(1)
  }
}

// Execute
addImagesToElectricityGuide()