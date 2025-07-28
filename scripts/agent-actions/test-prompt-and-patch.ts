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

const SCHEMA_ID = '_.schemas.default' // Found to be working in previous tests

// Test document for our experiments
const TEST_PAGE = {
  _type: 'page',
  _id: 'page.agent-actions-test',
  title: 'Test Page for Agent Actions',
  slug: { current: 'agent-actions-test' },
  seoTitle: 'Testing Agent Actions - ElPortal',
  seoDescription: 'This page is used to test Prompt and Patch Agent Actions',
  contentBlocks: [
    {
      _type: 'hero',
      _key: 'hero1',
      headline: 'Original Headline',
      subheadline: 'Original Subheadline'
    }
  ]
}

async function setupTestDocument() {
  console.log('📝 Setting up test document...\n')
  try {
    const result = await client.createOrReplace(TEST_PAGE)
    console.log(`✅ Created test document: ${result._id}`)
    return result._id
  } catch (error) {
    console.log('❌ Failed to create test document:', error.message)
    return null
  }
}

async function testPromptAction(documentId: string) {
  console.log('\n=== TESTING PROMPT ACTION ===\n')
  
  console.log('Prompt Action allows AI analysis without modifying documents.\n')
  
  // Test 1: Analyze content for SEO improvements
  console.log('Test 1: Analyze page for SEO improvements')
  try {
    const seoAnalysis = await client.agent.action.prompt({
      instruction: `Analyze this page for SEO improvements. 
        Focus on:
        1. Title optimization for Danish market
        2. Keyword opportunities
        3. Content suggestions
        
        Provide specific recommendations in JSON format.`,
      instructionParams: {
        page: {
          type: 'document',
          documentId: documentId
        }
      },
      format: 'json' // Request JSON response
    })
    
    console.log('✅ SEO Analysis Result:')
    console.log(JSON.stringify(seoAnalysis, null, 2))
  } catch (error: any) {
    console.log('❌ SEO Analysis failed:', error.message)
  }
  
  // Test 2: Content validation without the schema errors
  console.log('\n\nTest 2: Validate content structure')
  try {
    const validation = await client.agent.action.prompt({
      instruction: `Check if this document follows our content guidelines:
        - Hero sections should have compelling headlines
        - SEO descriptions should be 150-160 characters
        - All text should be in Danish
        
        Return a validation report.`,
      instructionParams: {
        content: {
          type: 'document',
          documentId: documentId
        }
      }
    })
    
    console.log('✅ Validation Result:')
    console.log(validation)
  } catch (error: any) {
    console.log('❌ Validation failed:', error.message)
  }
  
  // Test 3: Generate content suggestions
  console.log('\n\nTest 3: Generate content improvement suggestions')
  try {
    const suggestions = await client.agent.action.prompt({
      instruction: `Based on this page about electricity prices, suggest:
        1. Three alternative hero headlines in Danish
        2. Two value propositions for Vindstød
        3. Keywords for SEO optimization
        
        Focus on the Danish electricity market.`,
      instructionParams: {
        currentPage: {
          type: 'document',
          documentId: documentId
        }
      }
    })
    
    console.log('✅ Content Suggestions:')
    console.log(suggestions)
  } catch (error: any) {
    console.log('❌ Suggestions failed:', error.message)
  }
}

async function testPatchAction(documentId: string) {
  console.log('\n\n=== TESTING PATCH ACTION ===\n')
  
  console.log('Patch Action allows schema-aware updates to documents.\n')
  
  // Test 1: Simple field update
  console.log('Test 1: Update page title')
  try {
    const patchResult = await client.agent.action.patch({
      schemaId: SCHEMA_ID,
      documentId: documentId,
      target: {
        path: ['title'],
        operation: 'set',
        value: 'Updated Title via Agent Actions Patch'
      }
    })
    
    console.log('✅ Title updated successfully')
    console.log('Result:', patchResult)
  } catch (error: any) {
    console.log('❌ Title update failed:', error.message)
  }
  
  // Test 2: Nested field update
  console.log('\n\nTest 2: Update hero headline (nested field)')
  try {
    const patchResult = await client.agent.action.patch({
      schemaId: SCHEMA_ID,
      documentId: documentId,
      target: {
        path: ['contentBlocks', 0, 'headline'],
        operation: 'set',
        value: 'Spar på elregningen med Vindstød'
      }
    })
    
    console.log('✅ Hero headline updated successfully')
  } catch (error: any) {
    console.log('❌ Hero headline update failed:', error.message)
  }
  
  // Test 3: Multiple operations
  console.log('\n\nTest 3: Multiple patch operations')
  try {
    const patchResult = await client.agent.action.patch({
      schemaId: SCHEMA_ID,
      documentId: documentId,
      targets: [
        {
          path: ['seoTitle'],
          operation: 'set',
          value: 'Elpriser 2024 - Vindstød | ElPortal'
        },
        {
          path: ['seoDescription'],
          operation: 'set',
          value: 'Find de bedste elpriser i Danmark med Vindstød. Spar op til 4000 kr årligt på din elregning med grøn energi.'
        }
      ]
    })
    
    console.log('✅ Multiple fields updated successfully')
  } catch (error: any) {
    console.log('❌ Multiple updates failed:', error.message)
  }
}

async function testPromptPatchWorkflow(documentId: string) {
  console.log('\n\n=== TESTING PROMPT + PATCH WORKFLOW ===\n')
  
  console.log('Combining Prompt and Patch for intelligent content updates.\n')
  
  try {
    // Step 1: Use Prompt to analyze and suggest improvements
    console.log('Step 1: Analyzing content with Prompt...')
    const analysis = await client.agent.action.prompt({
      instruction: `Analyze this page and suggest a better Danish headline for the hero section.
        Current headline might be in English or not optimized.
        Return JSON with:
        - currentHeadline: the current headline
        - suggestedHeadline: improved Danish headline
        - reason: why this is better`,
      instructionParams: {
        page: {
          type: 'document',
          documentId: documentId
        }
      },
      format: 'json'
    })
    
    console.log('Analysis result:', JSON.stringify(analysis, null, 2))
    
    // Step 2: Apply the suggestion using Patch
    if (analysis.suggestedHeadline) {
      console.log('\nStep 2: Applying suggestion with Patch...')
      
      const patchResult = await client.agent.action.patch({
        schemaId: SCHEMA_ID,
        documentId: documentId,
        target: {
          path: ['contentBlocks', 0, 'headline'],
          operation: 'set',
          value: analysis.suggestedHeadline
        }
      })
      
      console.log('✅ Successfully applied AI-suggested improvement!')
    }
  } catch (error: any) {
    console.log('❌ Workflow failed:', error.message)
  }
}

async function demonstrateUseCases() {
  console.log('\n\n=== USE CASES FOR YOUR SEO WORKFLOW ===\n')
  
  console.log('1. PROMPT: Pre-publication Content Review')
  console.log('```typescript')
  console.log('// Before publishing, analyze content quality')
  console.log('const review = await client.agent.action.prompt({')
  console.log('  instruction: "Review this page for Danish SEO best practices",')
  console.log('  instructionParams: { page: { type: "document", documentId } },')
  console.log('  format: "json"')
  console.log('})')
  console.log('```\n')
  
  console.log('2. PATCH: Fix Specific Fields')
  console.log('```typescript')
  console.log('// Fix wrong field names in existing documents')
  console.log('await client.agent.action.patch({')
  console.log('  schemaId: SCHEMA_ID,')
  console.log('  documentId: existingPageId,')
  console.log('  target: {')
  console.log('    path: ["contentBlocks", 0, "headline"],')
  console.log('    operation: "set",')
  console.log('    value: heroTitleContent // Move from wrong field')
  console.log('  }')
  console.log('})')
  console.log('```\n')
  
  console.log('3. COMBO: Intelligent Content Enhancement')
  console.log('```typescript')
  console.log('// Analyze and improve in one workflow')
  console.log('const suggestions = await client.agent.action.prompt({')
  console.log('  instruction: "Suggest Danish keywords for this content",')
  console.log('  instructionParams: { doc: { type: "document", documentId } }')
  console.log('})')
  console.log('')
  console.log('await client.agent.action.patch({')
  console.log('  schemaId: SCHEMA_ID,')
  console.log('  documentId,')
  console.log('  target: { path: ["keywords"], operation: "set", value: suggestions }')
  console.log('})')
  console.log('```')
}

async function cleanup(documentId: string) {
  console.log('\n\n🧹 Cleaning up test document...')
  try {
    await client.delete(documentId)
    console.log('✅ Test document deleted')
  } catch (error) {
    console.log('❌ Cleanup failed:', error.message)
  }
}

async function main() {
  console.log('🚀 TESTING PROMPT AND PATCH AGENT ACTIONS\n')
  
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ Error: SANITY_API_TOKEN not found')
    process.exit(1)
  }
  
  // Create test document
  const documentId = await setupTestDocument()
  if (!documentId) {
    console.log('Cannot proceed without test document')
    return
  }
  
  // Run tests
  await testPromptAction(documentId)
  await testPatchAction(documentId)
  await testPromptPatchWorkflow(documentId)
  
  // Show use cases
  await demonstrateUseCases()
  
  // Cleanup
  const shouldCleanup = process.argv.includes('--cleanup')
  if (shouldCleanup) {
    await cleanup(documentId)
  } else {
    console.log('\n💡 Run with --cleanup to delete test document')
    console.log(`Test document ID: ${documentId}`)
  }
  
  console.log('\n\n✨ SUMMARY ✨')
  console.log('Agent Actions provides powerful AI capabilities:')
  console.log('- PROMPT: Analyze content without modifications')
  console.log('- PATCH: Make schema-aware updates')
  console.log('- COMBO: Intelligent analysis + targeted updates')
  console.log('\nPerfect for your SEO workflow automation!')
}

// Run the tests
main().catch(console.error)