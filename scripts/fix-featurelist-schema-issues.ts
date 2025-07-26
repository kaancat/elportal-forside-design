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

async function fixFeatureListIssues() {
  try {
    // Fetch the elselskaber page
    const query = `*[_type == "page" && slug.current == "elselskaber"][0]`
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('Elselskaber page not found')
      return
    }

    console.log('Current page ID:', page._id)
    let hasChanges = false
    
    // Fix the feature blocks
    const updatedContentBlocks = page.contentBlocks.map((block: any) => {
      if (block._type === 'featureList') {
        console.log('\nFound featureList block')
        console.log('Has subtitle field:', !!block.subtitle)
        console.log('Features count:', block.features?.length)
        
        // Remove the subtitle field if it exists (not in schema)
        const { subtitle, ...cleanBlock } = block
        
        // Fix feature items with wrong type
        if (block.features && Array.isArray(block.features)) {
          const fixedFeatures = block.features.map((feature: any) => {
            if (feature._type === 'feature') {
              console.log(`Fixing feature type: "${feature.title}"`)
              hasChanges = true
              return {
                ...feature,
                _type: 'featureItem' // Change from 'feature' to 'featureItem'
              }
            }
            return feature
          })
          
          if (subtitle) {
            console.log('Removing subtitle field:', subtitle)
            hasChanges = true
          }
          
          return {
            ...cleanBlock,
            features: fixedFeatures
          }
        }
        
        return cleanBlock
      }
      return block
    })

    if (hasChanges) {
      // Update the page
      const result = await client
        .patch(page._id)
        .set({ contentBlocks: updatedContentBlocks })
        .commit()

      console.log('\nSuccessfully fixed featureList schema issues')
      console.log('Updated page:', result._id)
    } else {
      console.log('\nNo schema issues found that need fixing')
    }
    
    // Scan for other potential issues
    console.log('\n=== Scanning for other potential schema issues ===')
    
    page.contentBlocks.forEach((block: any, index: number) => {
      // Check for unknown fields in each block type
      const knownBlockTypes = [
        'hero', 'pageSection', 'featureList', 'providerList', 
        'livePriceGraph', 'co2EmissionsChart', 'renewableEnergyForecast',
        'faqGroup', 'callToActionSection'
      ]
      
      if (!knownBlockTypes.includes(block._type)) {
        console.warn(`Block ${index}: Unknown block type "${block._type}"`)
      }
      
      // Check specific block types for common issues
      if (block._type === 'pageSection' && block.image) {
        if (!block.image.asset || !block.image.asset._ref) {
          console.warn(`Block ${index} (pageSection): Missing image asset reference`)
        }
      }
      
      if (block._type === 'providerList' && block.providers) {
        block.providers.forEach((provider: any, pIndex: number) => {
          if (!provider._ref) {
            console.warn(`Block ${index} (providerList): Provider ${pIndex} missing _ref`)
          }
        })
      }
    })
    
    console.log('\nScan complete!')
    
  } catch (error) {
    console.error('Error fixing featureList issues:', error)
  }
}

// Also add the subtitle field to the schema if needed
async function updateFeatureListSchema() {
  console.log('\n=== Schema Update Recommendation ===')
  console.log('The featureList component has a subtitle in the data but not in the schema.')
  console.log('To fix this permanently, add this field to /sanityelpriscms/schemaTypes/featureList.ts:')
  console.log(`
    defineField({ 
      name: 'subtitle', 
      title: 'Subtitle', 
      type: 'string',
      description: 'Optional subtitle for the feature list'
    }),
  `)
  console.log('\nPlace it after the title field and before the features array.')
}

// Run the fixes
console.log('Fixing featureList schema issues...')
fixFeatureListIssues().then(() => {
  updateFeatureListSchema()
})