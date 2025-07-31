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

async function fixLeverandoerIconValidation() {
  console.log('🔧 Fixing icon validation errors for leverandoer page...\n')
  
  try {
    const pageId = 'dPOYkdZ6jQJpSdo6MLX9d3'
    
    // Fetch the page
    const page = await client.fetch(`*[_id == "${pageId}"][0]`)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('📄 Found page:', page.title)
    
    // Find valueProposition block
    const vpBlockIndex = page.contentBlocks.findIndex((b: any) => b._type === 'valueProposition')
    
    if (vpBlockIndex === -1) {
      console.error('❌ No valueProposition block found!')
      return
    }
    
    const vpBlock = page.contentBlocks[vpBlockIndex]
    const updatedContentBlocks = [...page.contentBlocks]
    
    // Fix icons by removing the problematic metadata fields
    if (vpBlock.valueItems) {
      vpBlock.valueItems = vpBlock.valueItems.map((item: any) => {
        if (item.icon) {
          console.log(`\n🔧 Fixing icon for: ${item.heading}`)
          
          // Remove the problematic metadata fields that are causing validation errors
          const { author, license, version, ...cleanMetadata } = item.icon.metadata || {}
          
          // Keep only the fields that icon.manager actually needs
          const fixedIcon = {
            _type: 'icon.manager',
            icon: item.icon.icon,
            metadata: {
              ...cleanMetadata,
              // Remove authorInfo and licenseInfo completely if they exist
              authorInfo: undefined,
              licenseInfo: undefined
            }
          }
          
          // Remove undefined fields
          Object.keys(fixedIcon.metadata).forEach(key => {
            if (fixedIcon.metadata[key] === undefined) {
              delete fixedIcon.metadata[key]
            }
          })
          
          console.log('Fixed icon:', JSON.stringify(fixedIcon, null, 2))
          
          return {
            ...item,
            icon: fixedIcon
          }
        }
        return item
      })
      
      updatedContentBlocks[vpBlockIndex] = vpBlock
    }
    
    console.log('\n📊 Updating icons to fix validation errors...')
    
    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('\n✅ Icon validation errors fixed!')
    console.log(`📄 Document revision: ${result._rev}`)
    console.log('\n💡 The validation errors about authorInfo and licenseInfo should now be resolved.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the fix
fixLeverandoerIconValidation()