import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Regular Sanity client for data operations
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Agent Actions client with vX API version
const agentClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: 'vX', // Required for Agent Actions
  token: process.env.SANITY_API_TOKEN
})

const SCHEMA_ID = '_.schemas.default'

// Helper function to generate unique keys
function generateKey() {
  return `key_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validates content using Agent Actions PROMPT
 */
async function validateContent(content: any): Promise<{
  isValid: boolean
  errors: any[]
  correctedContent?: any
  validationReport: string
}> {
  console.log('🔍 Validating content structure with Agent Actions...\n')
  
  try {
    const validation = await agentClient.agent.action.prompt({
      instruction: `Validate this Sanity page content against schema rules:
        
        CRITICAL Schema Requirements:
        - hero blocks: MUST use "headline" and "subheadline" (NOT "title" and "subtitle")
        - valueProposition items: MUST use "heading" (NOT "title") 
        - featureList items: MUST use "title" (NOT "name")
        - All content blocks must have _type and _key
        - Rich text must be Portable Text array format
        
        Check EVERY field carefully and return JSON:
        {
          "isValid": boolean,
          "errors": [
            {
              "path": "exact.path.to.error",
              "wrongField": "incorrect field name",
              "correctField": "what it should be",
              "value": "current value"
            }
          ],
          "correctedContent": { /* complete corrected content */ },
          "validationReport": "human-readable summary"
        }`,
      instructionParams: {
        content: {
          type: 'constant',
          value: JSON.stringify(content)
        }
      },
      format: 'json'
    })
    
    return validation
  } catch (error: any) {
    console.error('❌ Validation failed:', error.message)
    return {
      isValid: false,
      errors: [{ error: error.message }],
      validationReport: 'Validation service error'
    }
  }
}

/**
 * Creates a page with automatic validation and correction
 */
export async function createPageWithValidation(pageData: any) {
  console.log('🚀 Creating SEO Page with Agent Actions Validation\n')
  console.log(`📝 Page Title: ${pageData.title}`)
  console.log(`🔗 Slug: ${pageData.slug?.current || pageData.slug}\n`)
  
  // Step 1: Validate the content
  const validation = await validateContent(pageData)
  
  console.log('📊 Validation Results:')
  console.log(`   Valid: ${validation.isValid ? '✅' : '❌'}`)
  console.log(`   Errors Found: ${validation.errors?.length || 0}`)
  
  if (validation.errors?.length > 0) {
    console.log('\n🔧 Errors detected:')
    validation.errors.forEach(err => {
      console.log(`   - ${err.path}: ${err.wrongField} → ${err.correctField}`)
    })
  }
  
  let contentToCreate = pageData
  
  // Step 2: Use corrected content if validation failed
  if (!validation.isValid && validation.correctedContent) {
    console.log('\n✨ Using AI-corrected content structure')
    contentToCreate = validation.correctedContent
    
    // Ensure _id is preserved
    if (pageData._id) {
      contentToCreate._id = pageData._id
    }
  }
  
  // Step 3: Create the page
  console.log('\n📤 Creating page in Sanity...')
  
  try {
    let result
    
    if (contentToCreate._id) {
      // Use createOrReplace if _id is provided
      result = await client.createOrReplace(contentToCreate)
      console.log('✅ Page created/updated successfully!')
    } else {
      // Use create for new documents
      result = await client.create(contentToCreate)
      console.log('✅ Page created successfully!')
    }
    
    console.log(`   ID: ${result._id}`)
    console.log(`   Title: ${result.title}`)
    console.log(`   Slug: /${result.slug?.current || result.slug}`)
    
    // Step 4: Optional - Analyze for SEO improvements
    console.log('\n🎯 Analyzing for SEO improvements...')
    
    const seoAnalysis = await agentClient.agent.action.prompt({
      instruction: `Analyze this Danish electricity page for SEO improvements:
        1. Title optimization
        2. Meta description quality
        3. Keyword density
        4. Content suggestions
        
        Return specific recommendations in JSON format.`,
      instructionParams: {
        page: {
          type: 'document',
          documentId: result._id
        }
      },
      format: 'json'
    })
    
    console.log('\n💡 SEO Recommendations:')
    if (seoAnalysis.recommendations) {
      Object.entries(seoAnalysis.recommendations).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`)
      })
    }
    
    return {
      success: true,
      pageId: result._id,
      validation,
      seoAnalysis
    }
    
  } catch (error: any) {
    console.error('\n❌ Failed to create page:', error.message)
    
    // If creation failed, try to provide more specific guidance
    const errorAnalysis = await agentClient.agent.action.prompt({
      instruction: `This Sanity page creation failed with error: "${error.message}"
        
        Analyze the content structure and suggest specific fixes.
        Focus on schema validation issues.`,
      instructionParams: {
        content: {
          type: 'constant',
          value: JSON.stringify(contentToCreate)
        }
      }
    })
    
    console.log('\n🔍 Error Analysis:')
    console.log(errorAnalysis)
    
    return {
      success: false,
      error: error.message,
      validation,
      errorAnalysis
    }
  }
}

// Example usage for testing
async function testWithExamplePage() {
  // Example page that might have wrong field names
  const seoPageContent = {
    _id: 'page.test-validation',
    _type: 'page',
    title: 'Smart Opladning af Elbil - Spar på Elregningen',
    slug: { current: 'smart-opladning-elbil' },
    seoTitle: 'Smart Elbil Opladning - Spar med Vindstød | ElPortal',
    seoDescription: 'Lær hvordan du kan spare tusindvis på elbil opladning med smart styring og grøn strøm fra Vindstød.',
    contentBlocks: [
      {
        _type: 'hero',
        _key: generateKey(),
        // These might be wrong field names that need correction
        title: 'Smart Opladning - Spar 50% på Elbil Strøm', // Should be 'headline'
        subtitle: 'Udnyt lave elpriser og grøn energi med intelligent styring' // Should be 'subheadline'
      },
      {
        _type: 'valueProposition',
        _key: generateKey(),
        heading: 'Fordele ved Smart Opladning',
        items: [
          {
            _type: 'valueItem',
            _key: generateKey(),
            title: 'Billigere opladning', // Should be 'heading'
            description: 'Lad automatisk når strømmen er billigst - ofte om natten'
          },
          {
            _type: 'valueItem',
            _key: generateKey(),
            heading: 'Grøn energi', // This one is correct
            description: 'Prioriter opladning når der er mest vindenergi i nettet'
          }
        ]
      }
    ]
  }
  
  return await createPageWithValidation(seoPageContent)
}

// Main execution
async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ ERROR: SANITY_API_TOKEN not found')
    console.error('Add SANITY_API_TOKEN to your .env file')
    process.exit(1)
  }
  
  console.log('🌟 SEO Page Creator with Agent Actions Validation\n')
  console.log('Features:')
  console.log('✅ Automatic field name validation')
  console.log('✅ AI-powered error correction')
  console.log('✅ SEO analysis and recommendations')
  console.log('✅ No more debugging validation errors!\n')
  
  // Uncomment to test with example
  // await testWithExamplePage()
}

// Export for use in other scripts
export { validateContent, generateKey }

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}