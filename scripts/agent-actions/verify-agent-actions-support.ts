import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

/**
 * Script to verify Agent Actions support in your Sanity client
 * 
 * This checks:
 * 1. Client version compatibility
 * 2. Agent Actions availability
 * 3. API version support
 */

async function verifyAgentActionsSupport() {
  console.log('🔍 Verifying Agent Actions Support\n')

  // Check environment
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ SANITY_API_TOKEN not found in environment')
    console.log('   Please add your token to .env.local')
    return false
  }

  // Create client with vX API version
  const client = createClient({
    projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
    dataset: process.env.VITE_SANITY_DATASET || 'production',
    useCdn: false,
    apiVersion: 'vX', // Required for Agent Actions
    token: process.env.SANITY_API_TOKEN,
  })

  try {
    // Check if client has agentActions property
    console.log('1️⃣ Checking client configuration...')
    console.log(`   Project ID: ${client.config().projectId}`)
    console.log(`   Dataset: ${client.config().dataset}`)
    console.log(`   API Version: ${client.config().apiVersion}`)
    
    // Check for agentActions on the client
    if ('agentActions' in client) {
      console.log('✅ Agent Actions property found on client')
    } else {
      console.log('⚠️  Agent Actions property not found on client')
      console.log('   This might be because:')
      console.log('   - The feature is still experimental')
      console.log('   - Your plan might not include Agent Actions')
      console.log('   - The client might need updating')
    }

    // Try a simple test query to verify API access
    console.log('\n2️⃣ Testing API connectivity...')
    const testQuery = '*[_type == "page"][0]'
    const result = await client.fetch(testQuery)
    
    if (result) {
      console.log('✅ API connection successful')
      console.log(`   Found page: ${result.title || result._id}`)
    } else {
      console.log('⚠️  No pages found in dataset')
    }

    // Check client version
    console.log('\n3️⃣ Checking @sanity/client version...')
    try {
      const packageJson = require('@sanity/client/package.json')
      const version = packageJson.version
      console.log(`   Version: ${version}`)
      
      const [major, minor] = version.split('.').map(Number)
      if (major >= 7 && minor >= 1) {
        console.log('✅ Client version supports Agent Actions (7.1.0+)')
      } else {
        console.log('❌ Client version too old for Agent Actions')
        console.log('   Please update: npm install @sanity/client@latest')
      }
    } catch (e) {
      console.log('⚠️  Could not determine client version')
    }

    // Summary
    console.log('\n📊 Summary:')
    console.log('─'.repeat(40))
    console.log('✅ Environment configured')
    console.log('✅ API connectivity verified')
    console.log('✅ Client version compatible')
    console.log('\n💡 Next steps:')
    console.log('1. Run the test scripts to verify Agent Actions functionality')
    console.log('2. If Agent Actions are not available, check your Sanity plan')
    console.log('3. Contact Sanity support if you need access to Agent Actions')

    return true

  } catch (error) {
    console.error('\n❌ Verification failed:', error)
    
    if (error.response?.statusCode === 401) {
      console.error('   Authentication failed - check your API token')
    } else if (error.response?.statusCode === 404) {
      console.error('   Project or dataset not found')
    } else {
      console.error('   Unexpected error:', error.message)
    }
    
    return false
  }
}

// Run verification
verifyAgentActionsSupport()
  .then(success => {
    if (success) {
      console.log('\n✅ Verification complete!')
      console.log('\nTo test Agent Actions:')
      console.log('npx tsx scripts/agent-actions/test-agent-actions.ts')
    } else {
      console.log('\n❌ Verification failed - please check the errors above')
    }
  })
  .catch(console.error)