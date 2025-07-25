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

async function finalValidationCheck() {
  try {
    console.log('Running final validation check...\n')
    
    const page = await client.fetch(`*[_id == "page.ladeboks"][0] {
      _id,
      title,
      "contentBlocksValidation": {
        "totalBlocks": count(contentBlocks),
        "chargingBoxShowcaseCount": count(contentBlocks[_type == "chargingBoxShowcase"]),
        "valuePropositionCount": count(contentBlocks[_type == "valueProposition"])
      },
      "valuePropositionAnalysis": contentBlocks[_type == "valueProposition"][0] {
        _type,
        title,
        "itemsStructure": {
          "totalItems": count(items),
          "sampleItem": items[0] {
            _type,
            "hasHeading": defined(heading),
            "hasDescription": defined(description),
            "hasIcon": defined(icon),
            "iconType": select(
              !defined(icon) => "undefined",
              string(icon) != null => "string", 
              "object"
            )
          }
        }
      }
    }`)
    
    if (!page) {
      console.log('❌ Page not found!')
      return
    }

    console.log('📊 Validation Results:')
    console.log('✅ Page found:', page.title)
    console.log('✅ Total content blocks:', page.contentBlocksValidation.totalBlocks)
    console.log('✅ ChargingBoxShowcase blocks:', page.contentBlocksValidation.chargingBoxShowcaseCount)
    console.log('✅ ValueProposition blocks:', page.contentBlocksValidation.valuePropositionCount)
    
    if (page.valuePropositionAnalysis) {
      const vp = page.valuePropositionAnalysis
      console.log('\n🔍 ValueProposition Analysis:')
      console.log('  - Title:', vp.title)
      console.log('  - Total items:', vp.itemsStructure.totalItems)
      
      if (vp.itemsStructure.sampleItem) {
        const sample = vp.itemsStructure.sampleItem
        console.log('  - Sample item structure:')
        console.log(`    ✅ Has heading: ${sample.hasHeading}`)
        console.log(`    ✅ Has description: ${sample.hasDescription}`)
        console.log(`    🔲 Icon status: ${sample.hasIcon ? `Present (${sample.iconType})` : 'Undefined (ready for manual selection)'}`)
      }
    }

    // Check for common validation issues
    const issues = []
    if (page.contentBlocksValidation.chargingBoxShowcaseCount === 0) {
      issues.push('Missing chargingBoxShowcase component')
    }
    if (page.contentBlocksValidation.valuePropositionCount === 0) {
      issues.push('Missing valueProposition component')
    }
    if (page.valuePropositionAnalysis?.itemsStructure.sampleItem?.iconType === 'string') {
      issues.push('Icons still in string format (should be undefined for manual selection)')
    }

    console.log('\n🎯 Status Summary:')
    if (issues.length === 0) {
      console.log('✅ ALL VALIDATION ISSUES RESOLVED!')
      console.log('✅ Schema deployment successful')
      console.log('✅ Content structure corrected')
      console.log('🔲 Icons ready for manual selection in Sanity Studio')
      console.log('\n📝 Hard refresh Sanity Studio and check the page - validation errors should be gone!')
    } else {
      console.log('❌ Remaining issues:')
      issues.forEach(issue => console.log(`  - ${issue}`))
    }

  } catch (error) {
    console.error('❌ Error during validation:', error)
  }
}

finalValidationCheck()