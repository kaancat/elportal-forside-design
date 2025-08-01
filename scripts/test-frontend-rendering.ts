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

async function testFrontendRendering() {
  try {
    console.log('🧪 Testing Frontend Rendering Data...\n')
    
    // Get homepage data exactly as the frontend would
    const homepageData = await client.fetch(`
      *[_type == "homePage"][0]{
        _id,
        contentBlocks[]{
          ...,
          _type == "valueProposition" => {
            _key,
            _type,
            heading,
            subheading,
            valueItems[]{
              _key,
              heading,
              description,
              icon
            }
          }
        }
      }
    `)
    
    // Find the value proposition block
    const valuePropositionBlock = homepageData?.contentBlocks?.find(
      (block: any) => block._type === 'valueProposition'
    )
    
    if (!valuePropositionBlock) {
      console.log('❌ No value proposition block found')
      return
    }
    
    console.log('✅ Value proposition block found')
    console.log('Heading:', valuePropositionBlock.heading)
    console.log('Value items count:', valuePropositionBlock.valueItems?.length || 0)
    
    // Test each icon data structure
    console.log('\n=== ICON RENDERING TEST ===')
    valuePropositionBlock.valueItems?.forEach((item: any, index: number) => {
      console.log(`\nItem ${index + 1}: ${item.heading}`)
      
      if (!item.icon) {
        console.log('  ❌ No icon data')
        return
      }
      
      console.log('  Icon data structure:')
      console.log('  - _type:', item.icon._type)
      console.log('  - icon string:', item.icon.icon)
      
      // Test different rendering paths
      if (item.icon.svg) {
        console.log('  ✅ Has SVG - will render via SVG path')
      } else if (item.icon.icon && !item.icon.metadata?.url) {
        console.log('  ✅ Has icon string - will render via generated URL path')
        const generatedUrl = `https://api.iconify.design/${item.icon.icon}.svg?color=%2384db41`
        console.log('  Generated URL:', generatedUrl)
      } else if (item.icon.metadata?.url) {
        console.log('  ✅ Has metadata URL - will render via URL path')
        console.log('  URL:', item.icon.metadata.url)
      } else if (item.icon.metadata?.inlineSvg) {
        console.log('  ✅ Has inline SVG - will render via inline SVG path')
      } else {
        console.log('  ❌ No valid rendering path found')
        console.log('  Available data:', Object.keys(item.icon))
        if (item.icon.metadata) {
          console.log('  Metadata keys:', Object.keys(item.icon.metadata))
        }
      }
    })
    
    // Test if the component would render
    console.log('\n=== COMPONENT RENDERING TEST ===')
    const shouldRender = valuePropositionBlock && 
                        valuePropositionBlock.valueItems && 
                        valuePropositionBlock.valueItems.length > 0
    
    console.log('Component should render:', shouldRender ? '✅ Yes' : '❌ No')
    
    if (shouldRender) {
      console.log('All items have valid structure:', 
        valuePropositionBlock.valueItems.every((item: any) => 
          item._key && item.heading && item.description
        ) ? '✅ Yes' : '❌ No'
      )
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
testFrontendRendering()