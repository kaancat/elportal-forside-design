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

async function analyzeValuePropositionIssue() {
  console.log('🔍 Comprehensive analysis of valueProposition issue...\n')
  
  try {
    // 1. Check schema validation scripts
    console.log('📋 ISSUE 1: Validation Scripts have WRONG field lists!')
    console.log('❌ Scripts list: title, items, propositions (DEPRECATED)')
    console.log('✅ Correct fields: heading, subheading, content, valueItems\n')
    
    // 2. Fetch the page and find valueProposition
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      contentBlocks[_type == "valueProposition"]{
        ...,
        "allFields": @
      }
    }`
    
    const page = await client.fetch(query)
    
    if (!page || !page.contentBlocks || page.contentBlocks.length === 0) {
      console.error('❌ No valueProposition found on historiske-priser page')
      return
    }
    
    const valueProposition = page.contentBlocks[0]
    
    console.log('📊 Current valueProposition data structure:')
    console.log('----------------------------------------')
    
    // Show all fields present
    const allFields = Object.keys(valueProposition.allFields || {})
    console.log('All fields present:', allFields.join(', '))
    
    console.log('\n🔍 Field Analysis:')
    console.log('✅ Valid fields present:')
    const validFields = ['heading', 'subheading', 'content', 'valueItems']
    validFields.forEach(field => {
      const hasField = allFields.includes(field)
      const value = valueProposition.allFields[field]
      console.log(`   - ${field}: ${hasField ? '✓' : '✗'} ${hasField && value ? `(${typeof value === 'string' ? value.substring(0, 30) + '...' : Array.isArray(value) ? `${value.length} items` : 'present'})` : ''}`)
    })
    
    console.log('\n⚠️  Deprecated fields present:')
    const deprecatedFields = ['title', 'items', 'propositions']
    deprecatedFields.forEach(field => {
      const hasField = allFields.includes(field)
      const value = valueProposition.allFields[field]
      console.log(`   - ${field}: ${hasField ? '✓' : '✗'} ${hasField && value ? `(${typeof value === 'string' ? value.substring(0, 30) + '...' : Array.isArray(value) ? `${value.length} items` : 'present'})` : ''}`)
    })
    
    console.log('\n🔧 Raw data:')
    console.log(JSON.stringify(valueProposition.allFields, null, 2))
    
    console.log('\n💡 SOLUTION NEEDED:')
    console.log('1. If data uses deprecated fields (title, items), migrate to new fields')
    console.log('2. Fix all validation scripts to use correct field names')
    console.log('3. Ensure GROQ queries fetch all fields properly')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the analysis
analyzeValuePropositionIssue()