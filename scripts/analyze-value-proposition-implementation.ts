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

async function analyzeValuePropositionImplementation() {
  try {
    console.log('🔍 Analyzing Value Proposition Implementation Issues...\n')
    
    // Get homepage value proposition data
    const homepageVP = await client.fetch(`*[_type == "homePage"][0]{
      contentBlocks[_type == "valueProposition"]{
        _key,
        heading,
        subheading,
        valueItems[]{
          _key,
          heading,
          description,
          icon
        }
      }
    }`)
    
    console.log('=== HOMEPAGE VALUE PROPOSITION DATA ===')
    console.log('Number of VPs found:', homepageVP?.contentBlocks?.length || 0)
    
    if (homepageVP?.contentBlocks?.[0]) {
      const vp = homepageVP.contentBlocks[0]
      console.log('\nValue Proposition Structure:')
      console.log('- Heading:', vp.heading ? 'Present' : 'Missing')
      console.log('- Subheading:', vp.subheading ? 'Present' : 'Missing')
      console.log('- Value Items:', vp.valueItems ? vp.valueItems.length : 0)
      
      if (vp.valueItems) {
        console.log('\nValue Items Analysis:')
        vp.valueItems.forEach((item: any, index: number) => {
          console.log(`\nItem ${index + 1}:`)
          console.log(`  - Key: ${item._key}`)
          console.log(`  - Heading: "${item.heading}"`)
          console.log(`  - Description: "${item.description}"`)
          console.log(`  - Icon Present: ${item.icon ? 'Yes' : 'No'}`)
          
          if (item.icon) {
            console.log(`  - Icon Type: ${item.icon._type}`)
            console.log(`  - Icon String: ${item.icon.icon || 'N/A'}`)
            console.log(`  - Has Metadata: ${item.icon.metadata ? 'Yes' : 'No'}`)
            if (item.icon.metadata) {
              console.log(`  - Metadata Keys: [${Object.keys(item.icon.metadata).join(', ')}]`)
              if (item.icon.metadata.size) {
                console.log(`  - Size: ${item.icon.metadata.size.width}x${item.icon.metadata.size.height}`)
              }
              if (item.icon.metadata.url) {
                console.log(`  - URL: ${item.icon.metadata.url.substring(0, 50)}...`)
              }
            }
          }
        })
      }
      
      // Check if this matches the expected structure
      console.log('\n=== STRUCTURE VALIDATION ===')
      const hasProperStructure = vp.valueItems && vp.valueItems.every((item: any) => 
        item._key && item.heading && item.description && item.icon
      )
      console.log('Has proper structure:', hasProperStructure)
      
      const allIconsValid = vp.valueItems && vp.valueItems.every((item: any) => 
        item.icon && item.icon._type === 'icon.manager' && item.icon.metadata
      )
      console.log('All icons valid:', allIconsValid)
    }
    
    // Also check a working page for comparison
    console.log('\n\n=== COMPARISON WITH WORKING PAGE ===')
    const workingPage = await client.fetch(`*[_type == "page" && slug.current == "historiske-priser"][0]{
      contentBlocks[_type == "valueProposition"][0]{
        heading,
        valueItems[0]{
          heading,
          icon
        }
      }
    }`)
    
    if (workingPage?.contentBlocks) {
      const workingIcon = workingPage.contentBlocks.icon
      console.log('Working page icon structure:')
      console.log('- Type:', workingIcon?._type)
      console.log('- Icon string:', workingIcon?.icon)
      console.log('- Has metadata:', !!workingIcon?.metadata)
      if (workingIcon?.metadata) {
        console.log('- Metadata structure:', Object.keys(workingIcon.metadata))
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
analyzeValuePropositionImplementation()