#!/usr/bin/env tsx

/**
 * Phase 6 Webhook Revalidation Testing Script
 * Tests the enhanced /api/revalidate endpoint with all document types
 */

import crypto from 'crypto'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET
const WEBHOOK_URL = process.env.SITE_URL ? 
  `${process.env.SITE_URL}/api/revalidate` : 
  'http://localhost:3000/api/revalidate'

interface TestPayload {
  _id: string
  _type: 'homePage' | 'page' | 'provider' | 'siteSettings'
  slug?: {
    _type: 'slug'
    current?: string
  }
  title?: string
  isHomepage?: boolean
}

// Generate HMAC signature like Sanity does
function generateSignature(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex')
}

// Test webhook with different document types
async function testWebhook(payload: TestPayload, testName: string) {
  console.log(`\n🧪 Testing: ${testName}`)
  console.log(`   Document Type: ${payload._type}`)
  console.log(`   Document ID: ${payload._id}`)
  if (payload.slug?.current) {
    console.log(`   Slug: ${payload.slug.current}`)
  }

  try {
    const body = JSON.stringify(payload)
    const signature = generateSignature(body, WEBHOOK_SECRET!)
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sanity-webhook-signature': `sha256=${signature}`
      },
      body
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log(`   ✅ Success (${response.status})`)
      console.log(`   📊 Processing Time: ${result.processingTime || 'N/A'}`)
      console.log(`   🏷️ Tags Revalidated: ${result.revalidatedTags?.join(', ') || 'None'}`)
      console.log(`   📄 Paths Revalidated: ${result.revalidatedPaths?.join(', ') || 'None'}`)
    } else {
      console.log(`   ❌ Failed (${response.status})`)
      console.log(`   💥 Error: ${result.message || result.error || 'Unknown error'}`)
    }
    
    // Check response headers
    const headers = {
      'X-Document-Type': response.headers.get('X-Document-Type'),
      'X-Processing-Time': response.headers.get('X-Processing-Time'),
      'X-Cache-Strategy': response.headers.get('X-Cache-Strategy')
    }
    console.log(`   📋 Headers: ${JSON.stringify(headers, null, 2)}`)
    
    return response.ok
  } catch (error) {
    console.log(`   💥 Network Error: ${error}`)
    return false
  }
}

// Test health check endpoint
async function testHealthCheck() {
  console.log(`\n🏥 Testing Health Check Endpoint`)
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET'
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log(`   ✅ Health Check Passed`)
      console.log(`   🔧 Configuration:`)
      console.log(`      Secret Configured: ${result.configuration?.secret_configured}`)
      console.log(`      Runtime: ${result.configuration?.runtime}`)
      console.log(`      Max Duration: ${result.configuration?.max_duration}s`)
      console.log(`      Supported Types: ${result.configuration?.supported_document_types?.join(', ')}`)
    } else {
      console.log(`   ❌ Health Check Failed (${response.status})`)
      console.log(`   💥 Error: ${result.message || 'Unknown error'}`)
    }
    
    return response.ok
  } catch (error) {
    console.log(`   💥 Network Error: ${error}`)
    return false
  }
}

// Main testing function
async function runWebhookTests() {
  console.log('🚀 PHASE 6 WEBHOOK REVALIDATION TESTING')
  console.log('=====================================')
  console.log(`Target URL: ${WEBHOOK_URL}`)
  console.log(`Secret Configured: ${!!WEBHOOK_SECRET}`)
  console.log(`Timestamp: ${new Date().toISOString()}`)

  if (!WEBHOOK_SECRET) {
    console.error('\n❌ SANITY_WEBHOOK_SECRET environment variable not found!')
    console.error('   Please configure this in .env.local before testing')
    process.exit(1)
  }

  // Test scenarios covering all document types
  const tests = [
    // Test 1: Homepage update
    {
      payload: {
        _id: 'test-homepage-001',
        _type: 'homePage' as const,
        title: 'DinElPortal Homepage',
        isHomepage: true
      },
      name: 'Homepage Update'
    },
    
    // Test 2: Regular page update
    {
      payload: {
        _id: 'test-page-001', 
        _type: 'page' as const,
        slug: {
          _type: 'slug',
          current: 'elpriser'
        },
        title: 'Elpriser Side'
      },
      name: 'Regular Page Update'
    },
    
    // Test 3: Provider update
    {
      payload: {
        _id: 'test-provider-001',
        _type: 'provider' as const,
        title: 'Vindstød Energi'
      },
      name: 'Provider Update'
    },
    
    // Test 4: Site settings update  
    {
      payload: {
        _id: 'siteSettings',
        _type: 'siteSettings' as const,
        title: 'Site Settings'
      },
      name: 'Site Settings Update'
    }
  ]

  // Run health check first
  await testHealthCheck()

  // Run all webhook tests
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    const success = await testWebhook(test.payload, test.name)
    if (success) {
      passed++
    } else {
      failed++
    }
  }

  // Summary
  console.log(`\n📊 TEST RESULTS SUMMARY`)
  console.log(`======================`)
  console.log(`✅ Passed: ${passed}/${tests.length}`)
  console.log(`❌ Failed: ${failed}/${tests.length}`)
  
  if (failed === 0) {
    console.log(`\n🎉 ALL TESTS PASSED!`)
    console.log(`   Phase 6 webhook implementation is working correctly`)
    console.log(`   Ready to configure Sanity Studio webhook`)
  } else {
    console.log(`\n⚠️  SOME TESTS FAILED`)
    console.log(`   Please check the webhook implementation before configuring Studio`)
  }

  // Next steps
  console.log(`\n🎯 NEXT STEPS:`)
  console.log(`1. Deploy the enhanced webhook to production`)
  console.log(`2. Configure webhook in Sanity Studio using the guide in docs/PHASE6_WEBHOOK_CONFIGURATION.md`)
  console.log(`3. Test with real content changes in Studio`)
  console.log(`4. Monitor webhook delivery and performance`)
}

// Run the tests
runWebhookTests().catch(console.error)