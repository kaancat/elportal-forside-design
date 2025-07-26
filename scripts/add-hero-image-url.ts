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

async function addHeroImageUrl() {
  console.log('🖼️  Adding Hero Image URL to Historiske Priser Page\n')
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
  console.log('Current hero block fields:', Object.keys(page.contentBlocks[heroBlockIndex]))
  
  // Update the hero block with image URL and enhanced content
  let updatedBlocks = [...page.contentBlocks]
  const heroBlock = updatedBlocks[heroBlockIndex]
  
  // Enhanced hero block with offshore wind farm image
  const updatedHeroBlock = {
    ...heroBlock,
    // Add image URL directly (temporary solution)
    backgroundImageUrl: 'https://images.unsplash.com/photo-1654083198752-56ff209c8129?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
    imageCredit: 'Photo by Jesse De Meulenaere on Unsplash',
    imageAlt: 'Offshore wind turbines in the ocean representing Danish renewable energy leadership',
    
    // Enhance content if not already good
    title: heroBlock.title || 'Historiske Elpriser i Danmark',
    subtitle: heroBlock.subtitle || 'Se udviklingen & find den bedste aftale',
    
    // Ensure description exists and is comprehensive
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
    ]
  }
  
  updatedBlocks[heroBlockIndex] = updatedHeroBlock
  
  // Apply the changes
  try {
    console.log('\n💾 Adding hero image URL and enhancing content...')
    
    await client
      .patch(pageId)
      .set({ contentBlocks: updatedBlocks })
      .commit()
    
    console.log('\n✅ Successfully added hero image URL to historiske-priser page!')
    
    console.log('\n📊 HERO IMAGE DETAILS:')
    console.log('   - Image: Offshore wind turbines by Jesse De Meulenaere')
    console.log('   - Source: Unsplash (free license)')
    console.log('   - URL: https://images.unsplash.com/photo-1654083198752-56ff209c8129')
    console.log('   - Theme: Danish offshore wind energy leadership')
    console.log('   - Resolution: 2000px wide, optimized for web')
    
    console.log('\n🎯 Next steps:')
    console.log('   1. Update HeroComponent to use backgroundImageUrl field')
    console.log('   2. Add proper image rendering with overlay')
    console.log('   3. Ensure responsive image behavior')
    console.log('   4. Test image loading and fallbacks')
    
  } catch (error) {
    console.error('\n❌ Error adding hero image URL:', error)
  }
}

addHeroImageUrl().catch(console.error)