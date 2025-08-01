import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fixHomepageValidation() {
  try {
    console.log('Fetching homepage to identify validation errors...')
    
    // First, get the homepage document to see its structure
    const homepage = await client.fetch(`*[_type == "page" && isHomepage == true][0]`)
    
    if (!homepage) {
      console.error('Homepage not found!')
      return
    }

    console.log('Homepage ID:', homepage._id)
    console.log('Analyzing content blocks for missing values...')

    // Build patch operations based on missing values
    const patches: any = {}

    // Go through content blocks and identify what needs fixing
    homepage.contentBlocks?.forEach((block: any, index: number) => {
      console.log(`\nBlock ${index}: ${block._type}`)
      
      switch (block._type) {
        case 'heroWithCalculator':
          if (!block.headline) {
            patches[`contentBlocks[${index}].headline`] = 'Spar penge på din elregning'
            console.log('  - Missing headline, will add default')
          }
          break
          
        case 'valueProposition':
          if (!block.heading) {
            patches[`contentBlocks[${index}].heading`] = 'Hvorfor vælge Din Elportal?'
            console.log('  - Missing heading, will add default')
          }
          break
          
        case 'priceExampleTable':
          if (!block.example1_title || block.example1_kwh_price == null || block.example1_subscription == null ||
              !block.example2_title || block.example2_kwh_price == null || block.example2_subscription == null) {
            patches[`contentBlocks[${index}].example1_title`] = 'Standard Aftale'
            patches[`contentBlocks[${index}].example1_kwh_price`] = 2.5
            patches[`contentBlocks[${index}].example1_subscription`] = 39
            patches[`contentBlocks[${index}].example2_title`] = 'Grøn Aftale'
            patches[`contentBlocks[${index}].example2_kwh_price`] = 2.8
            patches[`contentBlocks[${index}].example2_subscription`] = 29
            console.log('  - Missing price data, will add example values')
          }
          break
          
        case 'videoSection':
          if (!block.videoUrl) {
            // Remove this block instead of adding dummy URL
            console.log('  - Missing video URL, consider removing this block')
          }
          break
          
        case 'livePriceGraph':
          if (!block.apiRegion) {
            patches[`contentBlocks[${index}].apiRegion`] = 'DK1'
            console.log('  - Missing apiRegion, will set to DK1')
          }
          break
          
        case 'chargingBoxShowcase':
          if (!block.heading) {
            patches[`contentBlocks[${index}].heading`] = 'Populære ladebokse til elbiler'
            console.log('  - Missing heading, will add default')
          }
          break
      }
    })

    // Also check SEO title length
    if (homepage.seoMetaTitle && homepage.seoMetaTitle.length > 60) {
      const truncated = homepage.seoMetaTitle.substring(0, 57) + '...'
      patches.seoMetaTitle = truncated
      console.log('\nSEO title too long, will truncate to:', truncated)
    }

    if (Object.keys(patches).length === 0) {
      console.log('\nNo validation errors found that can be auto-fixed!')
      return
    }

    console.log('\nApplying fixes...')
    
    const result = await client
      .patch(homepage._id)
      .set(patches)
      .commit()

    console.log('\n✅ Successfully fixed validation errors!')
    console.log('Document revision:', result._rev)
    
    // Note about video section
    console.log('\n⚠️  Note: Video Section still needs a valid URL or should be removed manually in Sanity Studio')
    
  } catch (error) {
    console.error('Error fixing homepage:', error)
  }
}

// Run the fix
fixHomepageValidation()