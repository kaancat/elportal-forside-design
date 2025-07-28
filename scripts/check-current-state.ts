import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Sanity client configuration
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Check current state
async function checkCurrentState() {
  console.log('🔍 Checking current document state')
  
  const documentId = 'qgCxJyBbKpvhb2oGYqfgkp'
  
  try {
    const document = await client.getDocument(documentId)
    
    console.log('\n📊 Document Analysis:')
    console.log(`Title: ${document.title}`)
    console.log(`Total blocks: ${document.contentBlocks?.length || 0}`)
    
    // Analyze block types and issues
    const blockAnalysis = document.contentBlocks?.map((block: any, index: number) => {
      const issues = []
      
      // Check for validation issues
      if (block._type === 'priceCalculatorWidget') {
        issues.push('Invalid type: should be priceCalculator')
      }
      
      if (block._type === 'pageSection' && (!block.heading || block.heading.includes('Untitled'))) {
        issues.push(`Untitled section: "${block.heading || 'null'}"`)
      }
      
      if (block._type === 'providerList' && (!block.providers || block.providers.length === 0)) {
        issues.push('No provider references')
      }
      
      if (block._type === 'priceCalculator' && block._key) {
        // This is valid in page contentBlocks
        issues.push('✅ Valid priceCalculator block')
      }
      
      return {
        index,
        type: block._type,
        title: block.title || block.heading || block.headline || 'No title',
        issues
      }
    }) || []
    
    // Display findings
    console.log('\n📋 Block Analysis:')
    blockAnalysis.forEach(({ index, type, title, issues }) => {
      if (issues.length > 0) {
        console.log(`\n[${index}] ${type}`)
        console.log(`    Title: ${title}`)
        issues.forEach(issue => console.log(`    ⚠️  ${issue}`))
      }
    })
    
    // Summary
    const totalIssues = blockAnalysis.reduce((sum, b) => sum + b.issues.filter(i => !i.includes('✅')).length, 0)
    console.log('\n📌 Summary:')
    console.log(`- Total blocks: ${document.contentBlocks?.length || 0}`)
    console.log(`- Issues found: ${totalIssues}`)
    
    // Check specific block at index 4 (from the screenshot)
    if (document.contentBlocks?.[4]) {
      const block4 = document.contentBlocks[4]
      console.log(`\n🔍 Block at index 4:`)
      console.log(`- Type: ${block4._type}`)
      console.log(`- Title: ${block4.title || block4.heading || 'No title'}`)
      console.log(`- Has _key: ${!!block4._key}`)
    }
    
  } catch (error) {
    console.error('❌ Error checking state:', error)
    process.exit(1)
  }
}

// Execute
checkCurrentState()