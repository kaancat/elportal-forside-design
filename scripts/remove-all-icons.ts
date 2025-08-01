import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function removeAllIcons() {
  try {
    console.log('🗑️ Removing all icons from value proposition box...\n')
    
    // Fetch homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    let iconsRemoved = 0
    
    // Update content blocks - remove all icons
    const updatedContentBlocks = homepage.contentBlocks.map((block: any) => {
      if (block._type === 'valueProposition' && block.valueItems) {
        console.log('Found value proposition box, removing all icons...')
        
        const updatedValueItems = block.valueItems.map((item: any, index: number) => {
          if (item.icon) {
            iconsRemoved++
            console.log(`   Removing icon from: "${item.heading}"`)
          }
          
          // Return item without icon field
          const { icon, ...itemWithoutIcon } = item
          return itemWithoutIcon
        })
        
        return {
          ...block,
          valueItems: updatedValueItems
        }
      }
      return block
    })
    
    if (iconsRemoved > 0) {
      // Update the document
      const result = await client.patch(homepage._id)
        .set({ contentBlocks: updatedContentBlocks })
        .commit()
      
      console.log(`\n✅ Successfully removed ${iconsRemoved} icons!`)
      console.log('\nNext steps:')
      console.log('1. Go to Sanity Studio')
      console.log('2. Navigate to Homepage')
      console.log('3. Find the Value Proposition section')
      console.log('4. Click on each value item')
      console.log('5. Add icons manually using the icon picker')
    } else {
      console.log('\n✅ No icons found to remove')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
removeAllIcons()