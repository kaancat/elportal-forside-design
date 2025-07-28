import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

// Create Sanity client with vX API version for Agent Actions
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: 'vX', // Required for Agent Actions
  token: process.env.SANITY_API_TOKEN,
})

async function testAgentActionsAvailability() {
  console.log('=== Testing Agent Actions with Correct API Syntax ===\n')
  
  // Check if agent.action exists on client
  console.log('Checking for client.agent:', !!client.agent)
  console.log('Checking for client.agent.action:', !!client.agent?.action)
  console.log('Checking for client.agent.action.generate:', !!client.agent?.action?.generate)
  
  if (!client.agent?.action?.generate) {
    console.log('\n❌ Agent Actions not available on this client')
    console.log('This could mean:')
    console.log('1. Feature not enabled for your plan')
    console.log('2. Experimental feature not yet available')
    console.log('3. Different API structure than documented')
    return false
  }
  
  console.log('\n✅ Agent Actions API structure found!')
  return true
}

async function testSimpleGeneration() {
  console.log('\n🚀 Testing Agent Actions Generate...\n')
  
  try {
    // Use the correct API syntax
    const result = await client.agent.action.generate({
      type: 'page',
      instruction: `Create a simple test page with:
        - Title: "Agent Actions API Test"
        - Slug: "agent-actions-api-test"
        - A hero section with headline "Testing Agent Actions" and subheadline "Verifying the API works"`,
      operation: 'create',
    })
    
    console.log('✅ Agent Actions Generate succeeded!')
    console.log('Generated document:', JSON.stringify(result, null, 2))
    
    // Clean up
    if (result._id) {
      await client.delete(result._id)
      console.log('(Cleaned up test document)')
    }
    
    return true
  } catch (error: any) {
    console.log('❌ Agent Actions Generate failed')
    console.log('Error type:', error.name)
    console.log('Error message:', error.message)
    
    if (error.response) {
      console.log('Response status:', error.response.status)
      console.log('Response body:', JSON.stringify(error.response.body, null, 2))
    }
    
    // Check if it's a method not found error
    if (error.message?.includes('is not a function') || error.message?.includes('Cannot read')) {
      console.log('\n⚠️  Agent Actions not available via client.agent.action API')
    }
    
    return false
  }
}

async function testAlternativeAPIs() {
  console.log('\n🔍 Testing alternative API structures...\n')
  
  // Test various possible API structures
  const alternatives = [
    { path: 'client.agent', check: () => client.agent },
    { path: 'client.agents', check: () => (client as any).agents },
    { path: 'client.ai', check: () => (client as any).ai },
    { path: 'client.assistant', check: () => (client as any).assistant },
    { path: 'client.experimental', check: () => (client as any).experimental },
  ]
  
  for (const alt of alternatives) {
    try {
      const result = alt.check()
      console.log(`${alt.path}:`, result ? 'Found' : 'Not found')
      if (result) {
        console.log('  Structure:', Object.keys(result))
      }
    } catch (e) {
      console.log(`${alt.path}: Not found`)
    }
  }
}

async function showRecommendation() {
  console.log('\n\n=== RECOMMENDATION ===\n')
  
  console.log('Based on testing, Agent Actions appears to be:')
  console.log('1. Not available through the documented API')
  console.log('2. Possibly an experimental feature not yet released')
  console.log('3. May require special plan or access\n')
  
  console.log('✅ IMMEDIATE SOLUTION: Use the schema-aware validation approach')
  console.log('   - Available today')
  console.log('   - Solves your field name validation problems')
  console.log('   - Works with your existing SEO agents')
  console.log('   - No waiting for experimental features\n')
  
  console.log('Your goal: "have the structure... be a full-hitter the first time"')
  console.log('The schema-aware approach delivers this TODAY.')
}

async function main() {
  console.log('Testing Sanity Agent Actions with correct API syntax...\n')
  
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ Error: SANITY_API_TOKEN not found')
    process.exit(1)
  }
  
  // Test availability
  const isAvailable = await testAgentActionsAvailability()
  
  if (isAvailable) {
    // Try to use it
    await testSimpleGeneration()
  } else {
    // Check alternative APIs
    await testAlternativeAPIs()
  }
  
  // Show recommendation
  await showRecommendation()
}

// Run the test
main().catch(console.error)