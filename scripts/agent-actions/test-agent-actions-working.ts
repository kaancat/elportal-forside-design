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

async function testGenerateWithTargetDocument() {
  console.log('=== Testing Agent Actions with targetDocument ===\n')
  
  try {
    // Create a target document structure
    const targetDocument = {
      _type: 'page',
      title: 'Agent Actions Test Page',
      slug: { current: 'agent-actions-test' },
      seoTitle: 'Testing Agent Actions - ElPortal',
      seoDescription: 'Testing if Agent Actions can fix our validation problems',
      contentBlocks: []
    }
    
    console.log('Generating content with Agent Actions...\n')
    
    const result = await client.agent.action.generate({
      targetDocument,
      instruction: `Add content blocks to this page:
        1. A hero section with:
           - headline: "Vindkraft og Elpriser i Danmark"
           - subheadline: "Spar penge med grøn energi fra Vindstød"
        2. A value proposition section with 3 items about wind energy benefits
        3. Make sure all field names match the exact Sanity schema requirements`,
    })
    
    console.log('✅ Agent Actions Generate succeeded!')
    console.log('\nGenerated document:')
    console.log(JSON.stringify(result, null, 2))
    
    // Check if field names are correct
    if (result.contentBlocks?.[0]?._type === 'hero') {
      const hero = result.contentBlocks[0]
      console.log('\n📊 Field name validation:')
      console.log(`   headline field: ${hero.headline ? '✅' : '❌'} ${hero.headline || 'Missing'}`)
      console.log(`   subheadline field: ${hero.subheadline ? '✅' : '❌'} ${hero.subheadline || 'Missing'}`)
      console.log(`   title field (wrong): ${hero.title ? '❌ Found incorrect field!' : '✅ Not present'}`)
    }
    
    return result
  } catch (error: any) {
    console.log('❌ Agent Actions failed')
    console.log('Error:', error.message)
    if (error.response?.body) {
      console.log('Details:', JSON.stringify(error.response.body, null, 2))
    }
  }
}

async function testGenerateForSEOContent() {
  console.log('\n\n=== Testing Agent Actions for SEO Content Fix ===\n')
  
  // Simulate what your SEO agent produces
  const seoAgentOutput = {
    _type: 'page',
    title: 'Solceller og Elpriser - Komplet Guide 2024',
    slug: { current: 'solceller-elpriser-guide' },
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero1',
        // SEO agent uses wrong field names
        title: 'Solceller: Bliv Selvforsynende med El',
        subtitle: 'Spar op til 100% på elregningen med egen solcelleproduktion'
      },
      {
        _type: 'valueProposition',
        _key: 'vp1',
        heading: 'Fordele ved solceller',
        items: [
          {
            _type: 'valueItem',
            _key: 'vi1',
            title: 'Økonomisk frihed', // Wrong field
            description: 'Producér din egen strøm og bliv uafhængig af elpriser'
          }
        ]
      }
    ]
  }
  
  console.log('SEO agent produced content with wrong field names:')
  console.log('- hero.title (should be headline)')
  console.log('- hero.subtitle (should be subheadline)')
  console.log('- valueItem.title (should be heading)\n')
  
  try {
    console.log('Using Agent Actions to fix the structure...\n')
    
    const result = await client.agent.action.generate({
      targetDocument: seoAgentOutput,
      instruction: `Fix all field names in this document to match the exact Sanity schema:
        - In hero blocks: "title" should be "headline", "subtitle" should be "subheadline"
        - In valueItem blocks: "title" should be "heading"
        - Keep all the content exactly the same, just fix the field names`,
    })
    
    console.log('✅ Agent Actions fixed the structure!')
    console.log('\nCorrected document:')
    console.log(JSON.stringify(result, null, 2))
    
    return result
  } catch (error: any) {
    console.log('❌ Agent Actions failed to fix structure')
    console.log('Error:', error.message)
  }
}

async function testTransformExistingContent() {
  console.log('\n\n=== Testing Agent Actions Transform ===\n')
  
  try {
    // First create a test document
    const testDoc = {
      _type: 'page',
      _id: 'page.agent-actions-transform-test',
      title: 'Transform Test Page',
      slug: { current: 'agent-actions-transform-test' },
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
    console.log('Created:', created._id)
    
    // Transform it
    console.log('\nTransforming with Agent Actions...')
    const transformed = await client.agent.action.transform({
      documentId: created._id,
      instruction: `Add a value proposition section with 3 benefits of using ElPortal. 
        Make sure to use correct field names (heading for valueItem, not title)`,
    })
    
    console.log('\n✅ Transform succeeded!')
    console.log('Transformed document:')
    console.log(JSON.stringify(transformed, null, 2))
    
    // Clean up
    await client.delete(created._id)
    console.log('\n(Cleaned up test document)')
    
  } catch (error: any) {
    console.log('❌ Transform failed')
    console.log('Error:', error.message)
  }
}

async function main() {
  console.log('🚀 Testing Sanity Agent Actions (Correct API)\n')
  console.log('Goal: See if Agent Actions can solve your field name validation problems\n')
  
  // Test 1: Basic generation with targetDocument
  await testGenerateWithTargetDocument()
  
  // Test 2: Fix SEO content structure
  await testGenerateForSEOContent()
  
  // Test 3: Transform existing content
  await testTransformExistingContent()
  
  console.log('\n\n=== CONCLUSION ===\n')
  console.log('Agent Actions IS available through client.agent.action!')
  console.log('It can potentially help with:')
  console.log('- Generating content with correct field names')
  console.log('- Fixing structure from SEO agents')
  console.log('- Transforming existing content')
  console.log('\nNext step: Test if it correctly handles field name mapping')
}

// Run the test
main().catch(console.error)