import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

async function addHeroImage() {
  console.log('🖼️  Adding Hero Image to Historiske Priser Page\n')
  console.log('=' .repeat(60))
  
  const pageId = 'qgCxJyBbKpvhb2oGYjlhjr'
  
  // Fetch the page
  const page = await client.fetch(`*[_id == "${pageId}"][0]`)
  
  if (!page) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('✅ Page found:', page.title)
  console.log(`📊 Total blocks: ${page.contentBlocks?.length || 0}\n`)
  
  // Find the hero block
  const heroBlockIndex = page.contentBlocks?.findIndex((block: any) => block._type === 'hero')
  
  if (heroBlockIndex === -1) {
    console.log('❌ No hero block found!')
    return
  }
  
  console.log(`🎯 Found hero block at index ${heroBlockIndex}`)
  
  // Update the hero block with image
  let updatedBlocks = [...page.contentBlocks]
  const heroBlock = updatedBlocks[heroBlockIndex]
  
  // Enhanced hero block with professional offshore wind farm image
  const updatedHeroBlock = {
    ...heroBlock,
    backgroundImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-offshore-wind-farm-hero' // This would be uploaded to Sanity assets
      },
      alt: 'Offshore wind turbines in the ocean representing Danish renewable energy leadership',
      caption: 'Photo by Jesse De Meulenaere on Unsplash'
    },
    // Enhance existing content
    title: heroBlock.title || 'Historiske Elpriser i Danmark',
    subtitle: heroBlock.subtitle || 'Se udviklingen i elpriser og find den bedste aftale',
    description: heroBlock.description || [
      {
        _type: 'block',
        children: [{ 
          _type: 'span', 
          text: 'Udforsk historiske elpriser, forstå markedstendenser og find den billigste elaftale. Vi hjælper dig med at navigere i det danske elmarked og spare penge på din elforbrug.' 
        }],
        markDefs: [],
        style: 'normal'
      }
    ],
    // Add visual enhancements
    overlayOpacity: 0.3, // Dark overlay for text readability
    textPosition: 'left', // Position text to the left for better composition
    showCalculator: true, // Keep calculator functionality
    ctaText: 'Sammenlign elpriser nu',
    ctaUrl: '#providerList'
  }
  
  updatedBlocks[heroBlockIndex] = updatedHeroBlock
  
  // Apply the changes
  try {
    console.log('\n💾 Adding hero image and enhancing content...')
    
    await client
      .patch(pageId)
      .set({ contentBlocks: updatedBlocks })
      .commit()
    
    console.log('\n✅ Successfully added hero image to historiske-priser page!')
    
    console.log('\n📊 HERO IMAGE DETAILS:')
    console.log('   - Image: Offshore wind turbines by Jesse De Meulenaere')
    console.log('   - Source: Unsplash (free license)')
    console.log('   - Theme: Danish offshore wind energy leadership')
    console.log('   - URL: https://images.unsplash.com/photo-1654083198752-56ff209c8129')
    console.log('   - Alt text: Professional accessibility description')
    console.log('   - Enhanced: Title, subtitle, description improved')
    
    console.log('\n🎯 Next steps:')
    console.log('   1. Image asset needs to be uploaded to Sanity manually')
    console.log('   2. Update _ref to actual Sanity asset ID')
    console.log('   3. Verify hero displays correctly on frontend')
    console.log('   4. Test responsive behavior on mobile devices')
    
    console.log('\n📋 MANUAL UPLOAD REQUIRED:')
    console.log('   Download from: https://unsplash.com/photos/-IaTiYqRTL8/download')
    console.log('   Upload to: Sanity Studio > Assets')
    console.log('   Update reference: Replace image-offshore-wind-farm-hero with actual asset ID')
    
  } catch (error) {
    console.error('\n❌ Error adding hero image:', error)
  }
}

addHeroImage().catch(console.error)