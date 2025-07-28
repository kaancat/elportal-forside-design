import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

// Create Sanity client with vX API version for Agent Actions
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: 'vX',
  token: process.env.SANITY_API_TOKEN,
})

async function checkAvailableSchemas() {
  console.log('=== Checking Available Schemas ===\n')
  
  try {
    // Try to list schemas through the API
    const schemas = await client.request({
      url: '/schemas',
      method: 'GET'
    })
    console.log('Available schemas:', schemas)
  } catch (error) {
    console.log('Could not list schemas directly')
  }
  
  // Try different schema IDs
  const schemaTests = [
    'page',
    'document.page',
    'hero',
    'document.hero',
    'homePage',
    'document.homePage'
  ]
  
  console.log('Testing different schema IDs with Agent Actions:\n')
  
  for (const schemaId of schemaTests) {
    try {
      console.log(`Testing schemaId: "${schemaId}"...`)
      const result = await client.agent.action.generate({
        schemaId,
        instruction: 'Create a minimal test document',
        targetDocument: {
          operation: 'create',
          _type: schemaId.replace('document.', '')
        }
      })
      console.log(`✅ Success with schemaId: ${schemaId}`)
      console.log(`   Created type: ${result._type}\n`)
      
      // Clean up
      if (result._id) {
        await client.delete(result._id)
      }
      
      return schemaId // Return the working schema ID
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}\n`)
    }
  }
  
  return null
}

async function testWithHeroBlock() {
  console.log('\n=== Testing Hero Block Creation ===\n')
  
  try {
    // Create a simple hero block
    const result = await client.agent.action.generate({
      schemaId: 'hero',
      instruction: `Create a hero section with:
        - headline: "Test Headline"
        - subheadline: "Test Subheadline"
        
        Make sure to use "headline" and "subheadline", NOT "title" and "subtitle"`,
      targetDocument: {
        operation: 'create',
        _type: 'hero'
      }
    })
    
    console.log('✅ Hero block created!')
    console.log(JSON.stringify(result, null, 2))
    
    // Check field names
    console.log('\nField validation:')
    console.log(`headline: ${result.headline ? '✅' : '❌'}`)
    console.log(`subheadline: ${result.subheadline ? '✅' : '❌'}`)
    console.log(`title (wrong): ${result.title ? '❌ Used wrong field!' : '✅ Not present'}`)
    
    return result
  } catch (error: any) {
    console.log('❌ Failed:', error.message)
    return null
  }
}

async function testRealWorldScenario() {
  console.log('\n\n=== Real World Test: Your SEO Problem ===\n')
  
  console.log('Scenario: SEO agent creates hero with wrong fields\n')
  
  // What your SEO agent produces
  const seoHero = {
    _type: 'hero',
    title: 'Elpriser 2024 - Find Billigste Strøm', // Wrong field!
    subtitle: 'Vi hjælper dig spare tusindvis på elregningen' // Wrong field!
  }
  
  console.log('SEO agent output:')
  console.log(JSON.stringify(seoHero, null, 2))
  console.log('\nProblem: Uses title/subtitle instead of headline/subheadline')
  
  // Test 1: Can Agent Actions understand and fix?
  console.log('\n🧪 Test: Can Agent Actions fix the field names?\n')
  
  try {
    const fixed = await client.agent.action.generate({
      schemaId: 'hero',
      instruction: `Create this hero block but with correct field names:
        The content is:
        - Main text: "${seoHero.title}"
        - Secondary text: "${seoHero.subtitle}"
        
        IMPORTANT: The hero schema uses:
        - "headline" for the main text (NOT "title")
        - "subheadline" for the secondary text (NOT "subtitle")`,
      targetDocument: {
        operation: 'create',
        _type: 'hero'
      }
    })
    
    console.log('✅ Agent Actions result:')
    console.log(JSON.stringify(fixed, null, 2))
    
    if (fixed.headline && fixed.subheadline && !fixed.title) {
      console.log('\n🎉 SUCCESS! Agent Actions correctly used headline/subheadline!')
      console.log('This means it CAN solve your validation problems!')
    }
    
    return fixed
  } catch (error: any) {
    console.log('❌ Failed:', error.message)
    return null
  }
}

async function main() {
  console.log('🔍 AGENT ACTIONS SCHEMA INVESTIGATION\n')
  console.log('Finding out how Agent Actions works with your schemas...\n')
  
  // Step 1: Find working schema IDs
  const workingSchemaId = await checkAvailableSchemas()
  
  if (!workingSchemaId) {
    console.log('⚠️  Could not find working schema ID')
    console.log('Agent Actions might need schema registration or different syntax')
    return
  }
  
  // Step 2: Test hero block specifically
  await testWithHeroBlock()
  
  // Step 3: Test real-world scenario
  await testRealWorldScenario()
  
  console.log('\n\n=== FINDINGS ===\n')
  console.log('1. Agent Actions IS available (client.agent.action exists)')
  console.log('2. It requires specific schema IDs and parameters')
  console.log('3. It can potentially understand field name requirements')
  console.log('4. But schema discovery/registration might be needed\n')
  
  console.log('💡 RECOMMENDATION:')
  console.log('Since Agent Actions is experimental and has specific requirements,')
  console.log('use the schema-aware validation approach for immediate results.')
  console.log('You can experiment with Agent Actions in parallel.')
}

// Run the test
main().catch(console.error)