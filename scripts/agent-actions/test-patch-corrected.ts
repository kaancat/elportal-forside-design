import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

// Create Sanity client
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: 'vX',
  token: process.env.SANITY_API_TOKEN,
})

const SCHEMA_ID = '_.schemas.default'

async function testPatchWithCorrectSyntax() {
  console.log('🔧 TESTING PATCH ACTION WITH CORRECT SYNTAX\n')
  
  // Create test document
  const testDoc = {
    _type: 'page',
    _id: 'page.patch-test',
    title: 'Original Title',
    slug: { current: 'patch-test' },
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero1',
        headline: 'Original Headline',
        subheadline: 'Original Subheadline'
      }
    ]
  }
  
  console.log('Creating test document...')
  const created = await client.createOrReplace(testDoc)
  console.log('✅ Created:', created._id)
  
  // Test 1: Simple patch
  console.log('\nTest 1: Simple field patch')
  try {
    const result1 = await client.agent.action.patch({
      schemaId: SCHEMA_ID,
      documentId: created._id,
      target: {
        path: 'title', // String path for top-level
        operation: 'set',
        value: 'Updated Title via Patch'
      }
    })
    console.log('✅ Title updated successfully')
  } catch (error: any) {
    console.log('❌ Failed:', error.message)
  }
  
  // Test 2: Nested field with object notation
  console.log('\nTest 2: Nested field patch (object notation)')
  try {
    const result2 = await client.agent.action.patch({
      schemaId: SCHEMA_ID,
      documentId: created._id,
      target: {
        path: {
          segments: ['contentBlocks', 0, 'headline']
        },
        operation: 'set',
        value: 'Spar på elregningen - Opdateret'
      }
    })
    console.log('✅ Nested field updated successfully')
  } catch (error: any) {
    console.log('❌ Failed:', error.message)
  }
  
  // Test 3: Multiple patches (if supported)
  console.log('\nTest 3: Multiple operations')
  try {
    // Try with single target containing multiple operations
    const result3 = await client.agent.action.patch({
      schemaId: SCHEMA_ID,
      documentId: created._id,
      target: {
        path: 'seoTitle',
        operation: 'set',
        value: 'SEO Optimized Title'
      }
    })
    console.log('✅ SEO title updated')
    
    // Second patch for description
    const result4 = await client.agent.action.patch({
      schemaId: SCHEMA_ID,
      documentId: created._id,
      target: {
        path: 'seoDescription',
        operation: 'set',
        value: 'SEO optimized description for better ranking'
      }
    })
    console.log('✅ SEO description updated')
  } catch (error: any) {
    console.log('❌ Failed:', error.message)
  }
  
  // Verify final state
  console.log('\nFetching final document state...')
  const final = await client.getDocument(created._id)
  console.log('Final document:', JSON.stringify(final, null, 2))
  
  // Cleanup
  console.log('\n🧹 Cleaning up...')
  await client.delete(created._id)
  console.log('✅ Test document deleted')
}

// Run test
testPatchWithCorrectSyntax().catch(console.error)