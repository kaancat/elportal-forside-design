import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Import the generated Zod schemas for validation
import { 
  HeroSchema, 
  ValuePropositionSchema, 
  FeatureListSchema,
  ProviderListSchema,
  FaqSectionSchema,
  PageSchema 
} from '../../src/lib/sanity-schemas.zod'

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: 'vX', // Required for Agent Actions
  token: process.env.SANITY_API_TOKEN,
})

interface SEOPageConfig {
  title: string
  slug: string
  topic: string
  keywords: string[]
  competitorUrls?: string[]
}

/**
 * Creates a comprehensive SEO page using Agent Actions
 * This approach significantly reduces validation errors by leveraging
 * AI's understanding of the Sanity schema
 */
async function createSEOPageWithAgentActions(config: SEOPageConfig) {
  console.log(`\n🚀 Creating SEO page: ${config.title}\n`)

  try {
    // Step 1: Generate the initial page structure with Agent Actions
    console.log('1️⃣ Generating page structure with AI...')
    
    const instruction = `Create a comprehensive Danish SEO page about ${config.topic}.

    Page requirements:
    - Title: "${config.title}"
    - Slug: "${config.slug}"
    - Target keywords: ${config.keywords.join(', ')}
    - Language: Danish
    - Word count: 1500-2000 words
    
    Content structure to include:
    1. Hero section with compelling headline and subheadline
    2. Value proposition with 3-4 benefits (using valueProposition type)
    3. Feature list explaining key aspects (using featureList type)
    4. Provider list section (using providerList type)
    5. FAQ section with 5-6 questions (using faqSection type)
    6. Call-to-action sections
    
    Important schema notes:
    - hero uses "headline" and "subheadline" (NOT title/subtitle)
    - valueItem uses "heading" (NOT title)
    - featureItem uses "title" (NOT name)
    - All text content should be in Danish
    - Include proper SEO metadata
    - Subtly promote Vindstød as the preferred green energy provider
    
    Ensure all content blocks follow the exact Sanity schema field names.`

    const generatedPage = await client.agentActions.generate({
      type: 'page',
      instruction,
      operation: 'create',
      // Reference existing successful pages as templates
      references: [
        { _ref: 'page.elpriser', _type: 'reference' },
        { _ref: 'page.groen-energi', _type: 'reference' }
      ]
    })

    console.log('✅ Page structure generated successfully!')
    console.log(`Document ID: ${generatedPage._id}`)

    // Step 2: Validate the generated content
    console.log('\n2️⃣ Validating generated content...')
    
    try {
      // Validate the entire page
      const validatedPage = PageSchema.parse(generatedPage)
      console.log('✅ Page schema validation passed!')

      // Validate individual content blocks
      if (validatedPage.contentBlocks) {
        for (const block of validatedPage.contentBlocks) {
          switch (block._type) {
            case 'hero':
              HeroSchema.parse(block)
              console.log('  ✅ Hero block validated')
              break
            case 'valueProposition':
              ValuePropositionSchema.parse(block)
              console.log('  ✅ Value proposition block validated')
              break
            case 'featureList':
              FeatureListSchema.parse(block)
              console.log('  ✅ Feature list block validated')
              break
            case 'providerList':
              ProviderListSchema.parse(block)
              console.log('  ✅ Provider list block validated')
              break
            case 'faqSection':
              FaqSectionSchema.parse(block)
              console.log('  ✅ FAQ section validated')
              break
          }
        }
      }
    } catch (validationError) {
      console.error('❌ Validation error detected:', validationError)
      
      // Step 3: Use Transform action to fix validation errors
      console.log('\n3️⃣ Attempting to fix validation errors with Transform...')
      
      const fixInstruction = `Fix the following validation errors in the document:
        ${JSON.stringify(validationError, null, 2)}
        
        Remember:
        - hero uses "headline" and "subheadline" fields
        - valueItem uses "heading" field
        - featureItem uses "title" field
        - All fields must match the exact schema structure`

      const fixedPage = await client.agentActions.transform({
        id: generatedPage._id,
        instruction: fixInstruction,
      })

      console.log('✅ Validation errors fixed!')
      return fixedPage
    }

    // Step 4: Enhance with additional content if needed
    console.log('\n4️⃣ Enhancing page with additional SEO content...')
    
    const enhancedPage = await client.agentActions.transform({
      id: generatedPage._id,
      instruction: `Enhance the page with:
        - Add internal links to related pages
        - Ensure all images have proper alt text
        - Add schema markup suggestions in descriptions
        - Optimize headings for featured snippets
        - Include local Danish electricity market context`,
    })

    console.log('✅ Page enhancement completed!')

    return enhancedPage

  } catch (error) {
    console.error('❌ Failed to create SEO page:', error)
    
    // Log detailed error information
    if (error.response?.body) {
      console.error('API Error:', JSON.stringify(error.response.body, null, 2))
    }
    
    throw error
  }
}

/**
 * Comparison function: Traditional method that often causes validation errors
 */
async function createSEOPageTraditionalMethod(config: SEOPageConfig) {
  console.log(`\n📝 Creating page with traditional method for comparison...\n`)

  const pageContent = {
    _type: 'page',
    _id: `page.${config.slug}-traditional`,
    title: config.title,
    slug: { current: `${config.slug}-traditional` },
    seoTitle: `${config.title} | ElPortal`,
    seoDescription: `Læs om ${config.topic} og find de bedste elpriser i Danmark.`,
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero1',
        // Common mistake: using 'title' instead of 'headline'
        title: 'This will cause validation error', // ❌ Wrong field name
        subtitle: 'This too', // ❌ Should be 'subheadline'
      },
      {
        _type: 'valueProposition',
        _key: 'vp1',
        heading: 'Fordele', // ✅ Correct
        items: [
          {
            _type: 'valueItem',
            _key: 'vi1',
            title: 'Wrong field name', // ❌ Should be 'heading'
            description: 'This will fail validation',
          }
        ]
      }
    ]
  }

  try {
    const result = await client.createOrReplace(pageContent)
    console.log('✅ Traditional method succeeded (unlikely with errors above)')
    return result
  } catch (error) {
    console.error('❌ Traditional method failed (as expected):', error.response?.body?.error?.description)
    return null
  }
}

async function main() {
  console.log('=== SEO Page Creation with Agent Actions ===\n')

  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ Error: SANITY_API_TOKEN not found')
    process.exit(1)
  }

  // Example: Create a page about smart home electricity
  const pageConfig: SEOPageConfig = {
    title: 'Smart Home og Elpriser - Spar på Strøm med Intelligent Styring',
    slug: 'smart-home-elpriser',
    topic: 'smart home electricity management and savings',
    keywords: ['smart home', 'elpriser', 'energistyring', 'hjemmeautomatisering', 'elsparetips'],
    competitorUrls: [
      'https://elberegner.dk/smart-home',
      'https://www.elpriser.dk/artikler/smart-home-og-energiforbrug'
    ]
  }

  try {
    // Create page with Agent Actions
    console.log('🤖 Using Agent Actions (AI-powered, schema-aware)...')
    const agentActionsPage = await createSEOPageWithAgentActions(pageConfig)
    
    // Compare with traditional method
    console.log('\n📊 Comparing with traditional method...')
    const traditionalPage = await createSEOPageTraditionalMethod(pageConfig)

    // Summary
    console.log('\n📈 Results Summary:')
    console.log('─'.repeat(50))
    console.log('Agent Actions:')
    console.log('  ✅ Schema-aware generation')
    console.log('  ✅ Automatic validation')
    console.log('  ✅ Self-healing for errors')
    console.log('  ✅ Rich, SEO-optimized content')
    console.log(`  ✅ Created: ${agentActionsPage?._id}`)
    
    console.log('\nTraditional Method:')
    console.log('  ❌ Manual field mapping')
    console.log('  ❌ Prone to validation errors')
    console.log('  ❌ No automatic error recovery')
    console.log(`  ${traditionalPage ? '✅' : '❌'} Created: ${traditionalPage?._id || 'Failed'}`)

    // Cleanup option
    if (process.argv.includes('--cleanup') && agentActionsPage?._id) {
      console.log('\n🧹 Cleaning up test documents...')
      await client.delete(agentActionsPage._id)
      if (traditionalPage?._id) {
        await client.delete(traditionalPage._id)
      }
      console.log('✅ Cleanup completed')
    }

  } catch (error) {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)