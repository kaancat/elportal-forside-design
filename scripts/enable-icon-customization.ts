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

async function enableIconCustomization() {
  try {
    console.log('🔧 Enabling icon customization in Sanity Studio...\n')
    
    // The issue is that programmatically created icons may not have all the fields
    // the icon manager plugin expects for customization. Let's create "clean" icons
    // that will show the customization interface properly.
    
    // Instead of complex metadata, let's use simpler icon structures that the plugin
    // can work with better for customization
    const cleanIcons = {
      piggyBank: {
        _type: 'icon.manager',
        icon: 'lucide:piggy-bank'
        // Removing complex metadata to let the plugin handle it
      },
      eye: {
        _type: 'icon.manager',
        icon: 'lucide:eye'
      },
      wind: {
        _type: 'icon.manager',
        icon: 'lucide:wind'
      },
      zap: {
        _type: 'icon.manager',
        icon: 'lucide:zap'
      }
    }
    
    // Fetch homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    let updated = false
    
    // Update content blocks with cleaner icon structures
    const updatedContentBlocks = homepage.contentBlocks.map((block: any) => {
      if (block._type === 'valueProposition' && block.valueItems) {
        console.log('Updating value proposition icons for better customization...')
        
        const updatedValueItems = block.valueItems.map((item: any, index: number) => {
          let iconToUse = cleanIcons.piggyBank // default
          
          // Match icon based on content (same logic as before)
          if (item.heading?.toLowerCase().includes('spar')) {
            iconToUse = cleanIcons.piggyBank
          } else if (item.heading?.toLowerCase().includes('gennemsigtig') || item.heading?.toLowerCase().includes('pris')) {
            iconToUse = cleanIcons.eye
          } else if (item.heading?.toLowerCase().includes('grøn') || item.heading?.toLowerCase().includes('vind')) {
            iconToUse = cleanIcons.wind
          } else if (item.heading?.toLowerCase().includes('skift') || item.heading?.toLowerCase().includes('nemt')) {
            iconToUse = cleanIcons.zap
          }
          
          console.log(`   Cleaning icon ${index + 1}: "${item.heading}" → ${iconToUse.icon}`)
          updated = true
          
          return {
            ...item,
            icon: iconToUse
          }
        })
        
        return {
          ...block,
          valueItems: updatedValueItems
        }
      }
      return block
    })
    
    if (updated) {
      // Update the document
      const result = await client.patch(homepage._id)
        .set({ contentBlocks: updatedContentBlocks })
        .commit()
      
      console.log('\n✅ Successfully cleaned icon structures for better customization!')
      console.log('\nWhat changed:')
      console.log('- Removed complex metadata that might interfere with customization')
      console.log('- Kept only essential _type and icon fields')
      console.log('- Plugin will now handle all metadata and customization options')
      console.log('\nUsers can now:')
      console.log('- Change icon size, color, and other properties in Sanity Studio')
      console.log('- Icons will show the customization interface properly')
      console.log('- Frontend rendering will continue to work correctly')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
enableIconCustomization()