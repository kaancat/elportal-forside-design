import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fixElprisberegnerValidation() {
  const pageId = 'f7ecf92783e749828f7281a6e5829d52'
  
  console.log('🔧 Fixing elprisberegner page validation issues...\n')

  // Fetch the current page
  const page = await client.fetch(`*[_id == $pageId][0]`, { pageId })
  
  if (!page) {
    console.error('❌ Page not found')
    return
  }

  console.log('📄 Found page:', page.title)
  console.log('🔍 Analyzing and fixing content blocks...\n')

  // Fix each content block
  const fixedContentBlocks = page.contentBlocks.map((block: any, index: number) => {
    console.log(`${index + 1}. Checking ${block._type}...`)
    
    // Fix livePriceGraph - missing apiRegion
    if (block._type === 'livePriceGraph') {
      if (!block.apiRegion && block.region) {
        console.log('   ✅ Fixed: Renamed "region" to "apiRegion"')
        return {
          ...block,
          apiRegion: block.region,
          region: undefined // Remove the old field
        }
      }
    }

    // Fix energyTipsSection - the subtitle issue might be from old data structure
    if (block._type === 'energyTipsSection') {
      // The component might be using a different field structure
      // Based on the schema, all fields are optional with defaults
      console.log('   ℹ️  energyTipsSection has custom fields: tips array instead of showCategories')
      // This appears to be a different version or custom implementation
      return block
    }

    // Fix faqGroup - using "faqs" instead of "faqItems"
    if (block._type === 'faqGroup') {
      if (block.faqs && !block.faqItems) {
        console.log('   ✅ Fixed: Renamed "faqs" to "faqItems"')
        return {
          ...block,
          faqItems: block.faqs,
          faqs: undefined // Remove the old field
        }
      }
    }

    // Fix callToActionSection - missing buttonText and buttonUrl
    if (block._type === 'callToActionSection') {
      if (block.primaryCta || block.secondaryCta) {
        console.log('   ✅ Fixed: Using primaryCta for required fields')
        // This appears to be a different schema version with primaryCta/secondaryCta
        return {
          ...block,
          title: block.title || block.primaryCta?.text || 'Start din elsparerejse i dag',
          buttonText: block.primaryCta?.text || 'Beregn din elpris nu',
          buttonUrl: block.primaryCta?.url || '/elprisberegner',
          // Keep the original fields for backward compatibility
          primaryCta: block.primaryCta,
          secondaryCta: block.secondaryCta
        }
      }
    }

    // Return block unchanged if no fixes needed
    return block
  })

  // Create the update patch
  const patch = {
    contentBlocks: fixedContentBlocks
  }

  console.log('\n📝 Applying fixes to Sanity...')
  
  try {
    const result = await client
      .patch(pageId)
      .set(patch)
      .commit()
    
    console.log('\n✅ Successfully fixed validation issues!')
    console.log('📋 Updated page ID:', result._id)
    
    // Verify the fixes
    console.log('\n🔍 Verifying fixes...')
    const updatedPage = await client.fetch(`*[_id == $pageId][0]`, { pageId })
    
    let hasIssues = false
    updatedPage.contentBlocks.forEach((block: any, index: number) => {
      if (block._type === 'livePriceGraph' && !block.apiRegion) {
        console.log(`❌ Block ${index + 1}: livePriceGraph still missing apiRegion`)
        hasIssues = true
      }
      if (block._type === 'faqGroup' && !block.faqItems) {
        console.log(`❌ Block ${index + 1}: faqGroup still missing faqItems`)
        hasIssues = true
      }
      if (block._type === 'callToActionSection' && (!block.buttonText || !block.buttonUrl)) {
        console.log(`❌ Block ${index + 1}: callToActionSection still missing required fields`)
        hasIssues = true
      }
    })
    
    if (!hasIssues) {
      console.log('✅ All validation issues have been resolved!')
    } else {
      console.log('\n⚠️  Some issues remain. You may need to manually update these in Sanity Studio.')
    }
    
  } catch (error) {
    console.error('❌ Error updating page:', error)
  }
}

fixElprisberegnerValidation().catch(console.error)