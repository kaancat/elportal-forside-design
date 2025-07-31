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

async function fixLeverandoerIconMetadata() {
  console.log('🔧 Fixing icon metadata for leverandoer page...\n')
  
  try {
    const pageId = 'dPOYkdZ6jQJpSdo6MLX9d3'
    
    // Fetch the page
    const page = await client.fetch(`*[_id == "${pageId}"][0]`)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('📄 Found page:', page.title)
    
    // Find valueProposition block and check icon structure
    const vpBlockIndex = page.contentBlocks.findIndex((b: any) => b._type === 'valueProposition')
    
    if (vpBlockIndex === -1) {
      console.error('❌ No valueProposition block found!')
      return
    }
    
    const vpBlock = page.contentBlocks[vpBlockIndex]
    console.log('\n🔍 Checking icon structure...')
    
    // Check what fields the icons currently have
    if (vpBlock.valueItems && vpBlock.valueItems[0]?.icon) {
      console.log('First icon structure:', JSON.stringify(vpBlock.valueItems[0].icon, null, 2))
    }
    
    // Fix icons in valueItems
    let fixedCount = 0
    const updatedContentBlocks = [...page.contentBlocks]
    
    if (vpBlock.valueItems) {
      vpBlock.valueItems = vpBlock.valueItems.map((item: any) => {
        if (item.icon) {
          console.log(`\n🔧 Fixing icon for: ${item.heading}`)
          console.log('Current icon:', JSON.stringify(item.icon, null, 2))
          
          // Create proper icon structure for icon.manager
          const fixedIcon = {
            _type: 'icon.manager',
            icon: item.icon.name || item.icon.icon,
            metadata: {
              ...item.icon.metadata,
              collectionId: item.icon.manager || 'lucide',
              collectionName: 'Lucide',
              iconName: item.icon.name || item.icon.icon,
              icon: item.icon.name || item.icon.icon,
              size: {
                width: 24,
                height: 24
              },
              url: `https://api.iconify.design/lucide:${item.icon.name || item.icon.icon}.svg?color=%2384db41`,
              inlineSvg: null
            }
          }
          
          fixedCount++
          return {
            ...item,
            icon: fixedIcon
          }
        }
        return item
      })
      
      updatedContentBlocks[vpBlockIndex] = vpBlock
    }
    
    if (fixedCount === 0) {
      console.log('\n✅ No icons needed fixing')
      return
    }
    
    console.log(`\n📊 Updating ${fixedCount} icons...`)
    
    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('\n✅ Icon metadata fixed successfully!')
    console.log(`📄 Document revision: ${result._rev}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the fix
fixLeverandoerIconMetadata()