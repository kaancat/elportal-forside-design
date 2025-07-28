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

async function analyzeElprisberegnerPage() {
  console.log('Fetching elprisberegner page (ID: f7ecf92783e749828f7281a6e5829d52)...\n')
  
  try {
    // Fetch the document with all its content
    const document = await client.fetch(`*[_id == "f7ecf92783e749828f7281a6e5829d52"][0]`)
    
    if (!document) {
      console.error('Document not found!')
      return
    }
    
    console.log('Document fetched successfully.')
    console.log('Type:', document._type)
    console.log('Title:', document.title)
    console.log('\n=== ANALYZING VALIDATION ISSUES ===\n')
    
    // Check required fields at page level
    const requiredPageFields = ['title', 'slug']
    const missingRequired = []
    
    for (const field of requiredPageFields) {
      if (!document[field]) {
        missingRequired.push(field)
      }
    }
    
    if (missingRequired.length > 0) {
      console.log('❌ MISSING REQUIRED PAGE FIELDS:')
      missingRequired.forEach(field => console.log(`   - ${field}`))
      console.log()
    }
    
    // Check for deprecated fields that might be causing issues
    const deprecatedFields = ['contentGoal', 'generatedAt', 'keywords', 'language', 'seoDescription', 'seoTitle']
    const presentDeprecated = []
    
    for (const field of deprecatedFields) {
      if (document[field] !== undefined) {
        presentDeprecated.push({ field, value: document[field] })
      }
    }
    
    if (presentDeprecated.length > 0) {
      console.log('⚠️  DEPRECATED FIELDS PRESENT (These are hidden but may cause warnings):')
      presentDeprecated.forEach(({ field, value }) => {
        console.log(`   - ${field}: ${JSON.stringify(value)}`)
      })
      console.log()
    }
    
    // Analyze content blocks
    if (!document.contentBlocks || !Array.isArray(document.contentBlocks)) {
      console.log('❌ CRITICAL: contentBlocks field is missing or not an array!')
      return
    }
    
    console.log(`Found ${document.contentBlocks.length} content blocks.\n`)
    
    // Analyze each content block
    document.contentBlocks.forEach((block, index) => {
      console.log(`\n=== BLOCK ${index + 1}: ${block._type} ===`)
      
      // Check for _key
      if (!block._key) {
        console.log('❌ Missing _key (required for all array items)')
      }
      
      // Analyze block structure
      console.log('Fields present:', Object.keys(block).filter(k => !k.startsWith('_')).join(', '))
      
      // Check for common issues
      if (block._type === 'pageSection') {
        // Check if title/subtitle are at section level (correct) or nested
        if (block.title) {
          console.log('✅ Title is at section level (correct)')
        }
        
        // Check content array
        if (block.content && Array.isArray(block.content)) {
          console.log(`   Content blocks: ${block.content.length}`)
          
          // Check for misplaced titles inside content
          block.content.forEach((contentItem, idx) => {
            if (contentItem.title || contentItem.subtitle) {
              console.log(`   ❌ ISSUE: Title/subtitle found inside content[${idx}] - should be at section level`)
              console.log(`      Found fields: ${Object.keys(contentItem).join(', ')}`)
            }
          })
        }
      }
      
      // Print full block structure for debugging
      console.log('\nFull block structure:')
      console.log(JSON.stringify(block, null, 2))
    })
    
    // Check for undeclared fields at document level
    const validPageFields = [
      '_id', '_type', '_rev', '_createdAt', '_updatedAt',
      'title', 'slug', 'parent', 'contentBlocks',
      'seoMetaTitle', 'seoMetaDescription', 'seoKeywords', 'ogImage',
      // Deprecated but valid
      'contentGoal', 'generatedAt', 'keywords', 'language', 'seoDescription', 'seoTitle'
    ]
    
    const undeclaredFields = Object.keys(document).filter(key => !validPageFields.includes(key))
    
    if (undeclaredFields.length > 0) {
      console.log('\n❌ UNDECLARED FIELDS AT PAGE LEVEL:')
      undeclaredFields.forEach(field => {
        console.log(`   - ${field}: ${JSON.stringify(document[field])}`)
      })
    }
    
    console.log('\n=== SUMMARY OF ISSUES ===')
    console.log('1. Check if all content blocks have _type and _key')
    console.log('2. Verify titles/subtitles are at pageSection level, not inside content arrays')
    console.log('3. Ensure all field types match schema expectations')
    console.log('4. Remove any undeclared fields')
    
  } catch (error) {
    console.error('Error fetching document:', error)
  }
}

analyzeElprisberegnerPage()