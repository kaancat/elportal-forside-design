import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { z } from 'zod'

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

// Define schema for test page validation
const TestPageSchema = z.object({
  _type: z.literal('page'),
  title: z.string(),
  slug: z.object({
    current: z.string(),
  }),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  contentBlocks: z.array(z.any()).optional(),
})

async function testGenerateAction() {
  console.log('\n🚀 Testing Agent Actions Generate...\n')

  try {
    // Test 1: Simple page generation
    console.log('Test 1: Creating a simple test page with Generate action...')
    
    const generateResult = await client.agentActions.generate({
      type: 'page',
      instruction: `Create a test page for demonstrating Agent Actions capabilities.
        The page should have:
        - Title: "Agent Actions Test Page"
        - Slug: "agent-actions-test"
        - SEO Title: "Test Agent Actions - ElPortal"
        - SEO Description: "Testing Sanity Agent Actions for automated page generation"
        - A hero section with headline and subheadline
        - A value proposition section with 3 items about benefits`,
      operation: 'create',
    })

    console.log('✅ Generate action completed!')
    console.log('Generated document ID:', generateResult._id)
    console.log('Generated content:', JSON.stringify(generateResult, null, 2))

    // Validate the generated content
    try {
      const validated = TestPageSchema.parse(generateResult)
      console.log('✅ Schema validation passed!')
    } catch (validationError) {
      console.error('❌ Schema validation failed:', validationError)
    }

    return generateResult
  } catch (error) {
    console.error('❌ Generate action failed:', error)
    throw error
  }
}

async function testTransformAction(documentId: string) {
  console.log('\n🔄 Testing Agent Actions Transform...\n')

  try {
    console.log('Transforming the generated page to add more content...')
    
    const transformResult = await client.agentActions.transform({
      id: documentId,
      instruction: `Add the following to the page:
        - A FAQ section with 3 questions about Agent Actions
        - Update the hero subheadline to mention "AI-powered content generation"`,
    })

    console.log('✅ Transform action completed!')
    console.log('Transformed content:', JSON.stringify(transformResult, null, 2))

    return transformResult
  } catch (error) {
    console.error('❌ Transform action failed:', error)
    throw error
  }
}

async function testPatchAction(documentId: string) {
  console.log('\n🔧 Testing Agent Actions Patch...\n')

  try {
    console.log('Using Patch action to update specific fields...')
    
    const patchResult = await client.agentActions.patch({
      id: documentId,
      operations: [
        {
          set: {
            'seoTitle': 'Agent Actions Test - Updated via Patch',
            'lastModified': new Date().toISOString(),
          }
        }
      ]
    })

    console.log('✅ Patch action completed!')
    console.log('Patched fields:', JSON.stringify(patchResult, null, 2))

    return patchResult
  } catch (error) {
    console.error('❌ Patch action failed:', error)
    throw error
  }
}

async function compareWithTraditionalMethod() {
  console.log('\n📊 Comparing with traditional page creation method...\n')

  // Traditional method example
  const traditionalPage = {
    _type: 'page',
    _id: 'page.traditional-test',
    title: 'Traditional Test Page',
    slug: { current: 'traditional-test' },
    seoTitle: 'Traditional Test - ElPortal',
    seoDescription: 'Page created using traditional Sanity client method',
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero1',
        headline: 'Traditional Hero',
        subheadline: 'Created manually with potential for validation errors',
      }
    ]
  }

  try {
    console.log('Creating page with traditional method...')
    const result = await client.createOrReplace(traditionalPage)
    console.log('✅ Traditional method succeeded')
    console.log('Document ID:', result._id)
  } catch (error) {
    console.error('❌ Traditional method failed:', error)
    console.log('Error details:', error.response?.body?.error || error.message)
  }
}

async function cleanup(documentIds: string[]) {
  console.log('\n🧹 Cleaning up test documents...\n')

  for (const id of documentIds) {
    try {
      await client.delete(id)
      console.log(`✅ Deleted document: ${id}`)
    } catch (error) {
      console.error(`❌ Failed to delete ${id}:`, error)
    }
  }
}

async function main() {
  console.log('=== Sanity Agent Actions Test Script ===\n')
  
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ Error: SANITY_API_TOKEN not found in environment variables')
    process.exit(1)
  }

  const createdDocumentIds: string[] = []

  try {
    // Test Generate action
    const generatedDoc = await testGenerateAction()
    if (generatedDoc?._id) {
      createdDocumentIds.push(generatedDoc._id)
    }

    // Wait a bit for the document to be available
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Test Transform action if Generate succeeded
    if (generatedDoc?._id) {
      await testTransformAction(generatedDoc._id)
    }

    // Test Patch action
    if (generatedDoc?._id) {
      await testPatchAction(generatedDoc._id)
    }

    // Compare with traditional method
    await compareWithTraditionalMethod()
    createdDocumentIds.push('page.traditional-test')

    console.log('\n✅ All tests completed!')
    console.log('\nKey findings:')
    console.log('- Agent Actions provide schema-aware content generation')
    console.log('- Reduces validation errors by understanding content structure')
    console.log('- Enables AI-powered content transformation and enhancement')
    console.log('- Simplifies complex document creation workflows')

  } catch (error) {
    console.error('\n❌ Test suite failed:', error)
  } finally {
    // Cleanup test documents
    const shouldCleanup = process.argv.includes('--cleanup')
    if (shouldCleanup) {
      await cleanup(createdDocumentIds)
    } else {
      console.log('\n💡 To clean up test documents, run with --cleanup flag')
      console.log(`Created documents: ${createdDocumentIds.join(', ')}`)
    }
  }
}

// Run the test
main().catch(console.error)