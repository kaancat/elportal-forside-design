import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

// Create regular Sanity client
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
})

/**
 * Test traditional page creation approach to show the validation errors
 * your SEO agents currently face
 */

async function testTraditionalPageCreation() {
  console.log('=== Testing Traditional Page Creation ===\n')
  console.log('This demonstrates the validation errors that occur with manual JSON construction.\n')

  // Example 1: Common field name errors
  console.log('Test 1: Hero section with incorrect field names')
  const pageWithErrors = {
    _type: 'page',
    _id: 'page.test-validation-errors',
    title: 'Test Page - Validation Errors',
    slug: { current: 'test-validation-errors' },
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero1',
        // ❌ These are the WRONG field names that cause validation errors
        title: 'This will cause an error', // Should be 'headline'
        subtitle: 'This too', // Should be 'subheadline'
      },
      {
        _type: 'valueProposition',
        _key: 'vp1',
        heading: 'Fordele ved ElPortal', // ✅ Correct field name
        items: [
          {
            _type: 'valueItem',
            _key: 'vi1',
            // ❌ Wrong field name
            title: 'Spar op til 3000 kr årligt', // Should be 'heading'
            description: 'Find det billigste elselskab',
          }
        ]
      }
    ]
  }

  try {
    console.log('Attempting to create page with field name errors...')
    const result = await client.createOrReplace(pageWithErrors)
    console.log('❓ Unexpectedly succeeded (should have failed)')
    console.log(`Created: ${result._id}`)
    
    // Clean up if it somehow succeeded
    await client.delete(result._id)
  } catch (error) {
    console.log('❌ Failed as expected with validation error:')
    console.log(`   Error: ${error.response?.body?.error?.description || error.message}`)
    console.log('   This is the type of error your SEO agents encounter!\n')
  }

  // Example 2: Correct field names
  console.log('Test 2: Hero section with CORRECT field names')
  const pageCorrect = {
    _type: 'page',
    _id: 'page.test-correct-structure',
    title: 'Test Page - Correct Structure',
    slug: { current: 'test-correct-structure' },
    seoTitle: 'Test Page - ElPortal',
    seoDescription: 'Testing correct Sanity structure',
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero2',
        // ✅ CORRECT field names
        headline: 'Din Elportal',
        subheadline: 'Find de bedste elpriser',
      },
      {
        _type: 'valueProposition',
        _key: 'vp2',
        heading: 'Fordele ved ElPortal',
        items: [
          {
            _type: 'valueItem',
            _key: 'vi2',
            // ✅ CORRECT field name
            heading: 'Spar op til 3000 kr årligt',
            description: 'Vi finder automatisk det billigste elselskab for dig',
          },
          {
            _type: 'valueItem',
            _key: 'vi3',
            heading: 'Grøn energi',
            description: 'Vælg mellem 100% vedvarende energikilder',
          }
        ]
      }
    ]
  }

  try {
    console.log('Creating page with correct field names...')
    const result = await client.createOrReplace(pageCorrect)
    console.log('✅ Success! Page created with correct structure')
    console.log(`   ID: ${result._id}`)
    console.log(`   Slug: ${result.slug.current}`)
    
    // Clean up
    await client.delete(result._id)
    console.log('   (Cleaned up test page)')
  } catch (error) {
    console.log('❌ Failed:', error.response?.body?.error?.description || error.message)
  }

  // Summary of common field name issues
  console.log('\n📊 Common Field Name Validation Errors:')
  console.log('═'.repeat(50))
  console.log('❌ WRONG → ✅ CORRECT')
  console.log('─'.repeat(50))
  console.log('hero.title → hero.headline')
  console.log('hero.subtitle → hero.subheadline')
  console.log('valueItem.title → valueItem.heading')
  console.log('featureItem.name → featureItem.title')
  console.log('─'.repeat(50))
  console.log('\nThese are the exact errors your SEO agents encounter!')
  console.log('Each error requires manual debugging and fixing.\n')
}

async function testComplexPageStructure() {
  console.log('\nTest 3: Complex page with multiple content blocks')
  console.log('This shows how errors compound with more content...\n')

  const complexPage = {
    _type: 'page',
    _id: 'page.test-complex-errors',
    title: 'Varmepumper og Elpriser - Komplet Guide',
    slug: { current: 'test-complex-errors' },
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero3',
        title: '❌ Wrong field', // Should be 'headline'
        subtitle: '❌ Wrong field', // Should be 'subheadline'
      },
      {
        _type: 'featureList',
        _key: 'fl1',
        heading: 'Varmepumpe fordele',
        features: [
          {
            _type: 'featureItem',
            _key: 'fi1',
            name: '❌ Wrong field', // Should be 'title'
            description: 'Reducer elforbruget',
          }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'faq1',
        title: 'Ofte stillede spørgsmål',
        items: [
          {
            _type: 'faqItem',
            _key: 'faqi1',
            question: 'Hvad koster en varmepumpe?',
            answer: 'Prisen varierer mellem 50.000 og 150.000 kr',
          }
        ]
      }
    ]
  }

  try {
    console.log('Attempting to create complex page with multiple errors...')
    await client.createOrReplace(complexPage)
    console.log('❓ Unexpectedly succeeded')
  } catch (error) {
    console.log('❌ Failed with validation errors:')
    console.log(`   ${error.response?.body?.error?.description || error.message}`)
    console.log('\n   With complex pages, debugging becomes even harder!')
    console.log('   You need to find and fix each field name error.')
  }
}

async function main() {
  console.log('This test demonstrates why Agent Actions would help:\n')
  console.log('1. Your SEO agents generate great content')
  console.log('2. But they struggle with Sanity\'s exact field names')
  console.log('3. Each validation error requires manual debugging')
  console.log('4. Agent Actions could provide the correct structure automatically\n')
  
  await testTraditionalPageCreation()
  await testComplexPageStructure()
  
  console.log('\n🎯 Key Insight:')
  console.log('─'.repeat(50))
  console.log('Agent Actions would solve these structural issues by:')
  console.log('1. Understanding your exact Sanity schema')
  console.log('2. Using correct field names automatically')
  console.log('3. Validating before submission')
  console.log('4. Self-healing validation errors')
  console.log('\nThis would let your SEO agents focus on content quality')
  console.log('while Agent Actions handles the structure correctly.')
}

// Run the test
main().catch(console.error)