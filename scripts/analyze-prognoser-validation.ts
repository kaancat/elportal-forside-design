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

async function analyzePrognoserValidation() {
  console.log('🔍 Fetching and analyzing prognoser page validation errors...\n')
  
  try {
    // Fetch the page with all its content
    const page = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYkdQx3"][0] {
      ...,
      contentBlocks[] {
        ...,
        _type == "valueProposition" => {
          ...,
          items[]->
        },
        _type == "faqGroup" => {
          ...,
          faqItems[]->
        },
        _type == "featureList" => {
          ...,
          features[]->
        }
      }
    }`)
    
    if (!page) {
      console.error('❌ Prognoser page not found!')
      return
    }
    
    console.log('📄 Page found:', page.title || 'Untitled')
    console.log('📦 Content blocks:', page.contentBlocks?.length || 0)
    console.log('\n' + '='.repeat(80) + '\n')
    
    // Analyze each content block
    page.contentBlocks?.forEach((block, index) => {
      console.log(`\n📦 Block ${index + 1}: ${block._type}`)
      console.log('Key:', block._key)
      
      // Check for common validation issues
      const issues = []
      
      // Check for missing required fields based on block type
      switch (block._type) {
        case 'valueProposition':
          if (!block.title) issues.push('Missing required field: title')
          if (!block.items || block.items.length === 0) {
            issues.push('Missing or empty required field: items')
          } else {
            // Check if items are properly resolved
            block.items.forEach((item, idx) => {
              if (!item || (!item._ref && !item._id)) {
                issues.push(`Item ${idx} is invalid - missing reference or content`)
              } else if (item._ref && !item._type) {
                issues.push(`Item ${idx} might be an unresolved reference`)
              }
            })
          }
          break
          
        case 'faqGroup':
          if (!block.faqItems || block.faqItems.length === 0) {
            issues.push('Missing or empty required field: faqItems')
          } else {
            block.faqItems.forEach((item, idx) => {
              if (!item) {
                issues.push(`FAQ item ${idx} is null/undefined`)
              } else {
                if (!item.question) issues.push(`FAQ item ${idx}: missing question`)
                if (!item.answer) issues.push(`FAQ item ${idx}: missing answer`)
                if (item._ref && !item._type) {
                  issues.push(`FAQ item ${idx} might be an unresolved reference`)
                }
              }
            })
          }
          break
          
        case 'callToActionSection':
          if (!block.title) issues.push('Missing required field: title')
          if (!block.buttonText) issues.push('Missing required field: buttonText')
          if (!block.buttonUrl) issues.push('Missing required field: buttonUrl')
          break
          
        case 'pricingComparison':
          if (!block.title) issues.push('Missing required field: title')
          break
          
        case 'featureList':
          if (!block.features || block.features.length === 0) {
            issues.push('Missing or empty required field: features')
          }
          break
          
        case 'pageSection':
          if (!block.contentBlocks || block.contentBlocks.length === 0) {
            issues.push('Missing or empty required field: contentBlocks')
          }
          break
      }
      
      // Check for common field type issues
      Object.entries(block).forEach(([key, value]) => {
        if (key.startsWith('_')) return // Skip internal fields
        
        // Check for string fields that should be arrays (Portable Text)
        if (typeof value === 'string' && (
          key.endsWith('Text') || 
          key === 'answer' || 
          key === 'description' ||
          key === 'content'
        )) {
          issues.push(`Field '${key}' is a string but might need to be Portable Text array`)
        }
        
        // Check for null/undefined values
        if (value === null || value === undefined) {
          issues.push(`Field '${key}' is ${value}`)
        }
      })
      
      // Print issues for this block
      if (issues.length > 0) {
        console.log('\n❌ VALIDATION ISSUES:')
        issues.forEach(issue => console.log(`   - ${issue}`))
      } else {
        console.log('✅ No obvious validation issues')
      }
      
      // Print block data for debugging
      console.log('\n📋 Block data:')
      console.log(JSON.stringify(block, null, 2))
    })
    
    console.log('\n' + '='.repeat(80))
    console.log('\n📊 Summary:')
    console.log(`Total blocks analyzed: ${page.contentBlocks?.length || 0}`)
    
  } catch (error) {
    console.error('❌ Error fetching page:', error)
  }
}

// Run the analysis
analyzePrognoserValidation()
  .then(() => {
    console.log('\n✅ Analysis complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })