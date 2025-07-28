import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables
dotenv.config({ path: '.env' })

// Import our generated Zod schemas for validation
import { 
  HeroSchema, 
  ValuePropositionSchema, 
  FeatureListSchema
} from '../../src/lib/sanity-schemas.zod'

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
})

/**
 * Test a schema-aware approach that could work TODAY
 * without Agent Actions
 */

// Helper function to validate and fix common field name errors
function fixCommonFieldErrors(block: any): any {
  const fixed = { ...block }
  
  switch (block._type) {
    case 'hero':
      // Fix common hero errors
      if ('title' in block && !('headline' in block)) {
        fixed.headline = block.title
        delete fixed.title
      }
      if ('subtitle' in block && !('subheadline' in block)) {
        fixed.subheadline = block.subtitle
        delete fixed.subtitle
      }
      break
      
    case 'valueItem':
      // Fix valueItem errors
      if ('title' in block && !('heading' in block)) {
        fixed.heading = block.title
        delete fixed.title
      }
      break
      
    case 'featureItem':
      // Fix featureItem errors
      if ('name' in block && !('title' in block)) {
        fixed.title = block.name
        delete fixed.name
      }
      break
  }
  
  return fixed
}

// Schema-aware page creation function
async function createPageWithValidation(pageData: any) {
  console.log(`\n📝 Creating page: ${pageData.title}`)
  
  // Step 1: Fix known field name issues
  if (pageData.contentBlocks) {
    pageData.contentBlocks = pageData.contentBlocks.map((block: any) => {
      const fixed = fixCommonFieldErrors(block)
      
      // Fix nested items
      if (block.items && Array.isArray(block.items)) {
        fixed.items = block.items.map((item: any) => fixCommonFieldErrors(item))
      }
      if (block.features && Array.isArray(block.features)) {
        fixed.features = block.features.map((feature: any) => fixCommonFieldErrors(feature))
      }
      
      return fixed
    })
  }
  
  // Step 2: Validate each content block
  const validationErrors: string[] = []
  
  if (pageData.contentBlocks) {
    for (const block of pageData.contentBlocks) {
      try {
        switch (block._type) {
          case 'hero':
            HeroSchema.parse(block)
            console.log('  ✅ Hero block validated')
            break
          case 'valueProposition':
            ValuePropositionSchema.parse(block)
            console.log('  ✅ Value proposition validated')
            break
          case 'featureList':
            FeatureListSchema.parse(block)
            console.log('  ✅ Feature list validated')
            break
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          validationErrors.push(`${block._type}: ${error.errors.map(e => e.message).join(', ')}`)
        }
      }
    }
  }
  
  if (validationErrors.length > 0) {
    console.log('  ❌ Validation errors found:')
    validationErrors.forEach(err => console.log(`     - ${err}`))
    return null
  }
  
  // Step 3: Create the page
  try {
    const result = await client.createOrReplace(pageData)
    console.log('  ✅ Page created successfully!')
    console.log(`     ID: ${result._id}`)
    return result
  } catch (error) {
    console.log('  ❌ Creation failed:', error.message)
    return null
  }
}

async function testSchemaAwareApproach() {
  console.log('=== Testing Schema-Aware Approach (Available Today) ===\n')
  console.log('This approach uses validation and auto-fixing without Agent Actions.\n')
  
  // Test 1: Page with common errors that get auto-fixed
  const pageWithErrors = {
    _type: 'page',
    _id: 'page.test-schema-aware',
    title: 'Varmepumper - Spar på El',
    slug: { current: 'test-schema-aware' },
    seoTitle: 'Varmepumper og Elpriser | ElPortal',
    seoDescription: 'Lær hvordan varmepumper kan reducere din elregning',
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero1',
        // Using WRONG field names on purpose
        title: 'Varmepumper og Elpriser', // Will be fixed to 'headline'
        subtitle: 'Spar op til 70% på opvarmning', // Will be fixed to 'subheadline'
      },
      {
        _type: 'valueProposition',
        _key: 'vp1',
        heading: 'Hvorfor vælge varmepumpe?',
        items: [
          {
            _type: 'valueItem',
            _key: 'vi1',
            title: 'Lavere elregning', // Will be fixed to 'heading'
            description: 'Reducer dine opvarmningsomkostninger markant',
          },
          {
            _type: 'valueItem',
            _key: 'vi2',
            heading: 'Miljøvenlig', // Already correct
            description: 'Reducer CO2-udledning med op til 50%',
          }
        ]
      }
    ]
  }
  
  const result1 = await createPageWithValidation(pageWithErrors)
  
  // Clean up
  if (result1) {
    await client.delete(result1._id)
    console.log('  (Cleaned up test page)')
  }
  
  // Test 2: Complex page with mixed errors
  console.log('\n📝 Testing complex page with auto-fixing')
  const complexPage = {
    _type: 'page',
    _id: 'page.test-complex-schema-aware',
    title: 'Smart Home og Elpriser',
    slug: { current: 'test-complex-schema-aware' },
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero2',
        title: 'Smart Home Energistyring', // Will be fixed
        subtitle: 'Optimer dit elforbrug automatisk', // Will be fixed
      },
      {
        _type: 'featureList',
        _key: 'fl1',
        heading: 'Smart Home fordele',
        features: [
          {
            _type: 'featureItem',
            _key: 'fi1',
            name: 'Automatisk styring', // Will be fixed to 'title'
            description: 'Tænd og sluk baseret på elpriser',
          },
          {
            _type: 'featureItem',
            _key: 'fi2',
            title: 'Energirapporter', // Already correct
            description: 'Detaljeret overblik over forbrug',
          }
        ]
      }
    ]
  }
  
  const result2 = await createPageWithValidation(complexPage)
  
  // Clean up
  if (result2) {
    await client.delete(result2._id)
    console.log('  (Cleaned up test page)')
  }
}

async function demonstrateHybridApproach() {
  console.log('\n\n=== Hybrid Approach for Your SEO Agents ===\n')
  console.log('This is how your SEO agents could work with schema validation:\n')
  
  // Simulate SEO agent output
  const seoAgentOutput = {
    title: 'Elpriser i København - Find Billigste Elselskab 2024',
    topic: 'electricity prices in Copenhagen',
    keywords: ['elpriser københavn', 'billigste elselskab', 'strømpriser hovedstaden'],
    content: {
      hero: {
        // SEO agent uses wrong field names
        title: 'Elpriser i København - Spar op til 4.000 kr årligt',
        subtitle: 'Vi sammenligner alle elselskaber i hovedstadsområdet og finder den bedste pris for dig',
      },
      valueProps: [
        {
          title: 'Lokale elpriser', // Wrong field name
          description: 'Priser specifikt for København og omegn',
        },
        {
          title: 'Grønne alternativer',
          description: 'Vindstød tilbyder 100% vindenergi i København',
        }
      ]
    }
  }
  
  console.log('1️⃣ SEO Agent generates excellent content')
  console.log(`   Title: ${seoAgentOutput.title}`)
  console.log(`   Keywords: ${seoAgentOutput.keywords.join(', ')}`)
  
  console.log('\n2️⃣ Schema-aware converter fixes structure')
  
  // Convert SEO output to valid Sanity structure
  const validPage = {
    _type: 'page',
    _id: `page.${seoAgentOutput.topic.replace(/\s+/g, '-')}`,
    title: seoAgentOutput.title,
    slug: { current: seoAgentOutput.topic.replace(/\s+/g, '-') },
    seoTitle: seoAgentOutput.title,
    seoDescription: `Alt om ${seoAgentOutput.topic}. ${seoAgentOutput.content.hero.subtitle}`,
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero1',
        // Auto-fixed field names
        headline: seoAgentOutput.content.hero.title,
        subheadline: seoAgentOutput.content.hero.subtitle,
      },
      {
        _type: 'valueProposition',
        _key: 'vp1',
        heading: 'Fordele',
        items: seoAgentOutput.content.valueProps.map((prop, i) => ({
          _type: 'valueItem',
          _key: `vi${i + 1}`,
          // Auto-fixed field name
          heading: prop.title,
          description: prop.description,
        }))
      }
    ]
  }
  
  const result = await createPageWithValidation(validPage)
  
  if (result) {
    await client.delete(result._id)
    console.log('  (Cleaned up test page)')
  }
  
  console.log('\n✅ Benefits of this approach:')
  console.log('   - Your SEO agents keep generating great content')
  console.log('   - Auto-fixing handles common field name errors')
  console.log('   - Validation catches issues before API calls')
  console.log('   - No more hours debugging validation errors')
}

async function main() {
  await testSchemaAwareApproach()
  await demonstrateHybridApproach()
  
  console.log('\n\n📊 Summary: Schema-Aware Approach (No Agent Actions Needed)')
  console.log('═'.repeat(60))
  console.log('\n✅ What we can do TODAY:')
  console.log('1. Auto-fix common field name errors')
  console.log('2. Validate before sending to Sanity')
  console.log('3. Provide clear error messages')
  console.log('4. Work with your existing SEO agents')
  
  console.log('\n🚀 Implementation:')
  console.log('1. Create a schema-aware converter utility')
  console.log('2. Use Zod schemas for validation')
  console.log('3. Auto-fix known field name patterns')
  console.log('4. Integrate with your SEO agents')
  
  console.log('\n💡 This solves your main problem:')
  console.log('   "spending 1 hour debugging validation and routing errors"')
  console.log('\nNo need to wait for Agent Actions!')
}

// Run the test
main().catch(console.error)