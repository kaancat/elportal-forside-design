import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: 'vX',
  token: process.env.SANITY_API_TOKEN,
})

const SCHEMA_ID = '_.schemas.default'

/**
 * Schema Validation Service using Agent Actions PROMPT
 */
export class SchemaValidationService {
  /**
   * Validates content against Sanity schema rules
   */
  async validateContent(content: any): Promise<{
    isValid: boolean
    errors: Array<{
      path: string
      wrongField: string
      correctField: string
      value: any
    }>
    correctedContent?: any
  }> {
    const validation = await client.agent.action.prompt({
      instruction: `Validate this content against Sanity schema rules:
        
        Schema requirements:
        - hero blocks: use "headline" and "subheadline" (NOT "title" and "subtitle")
        - valueItem: uses "heading" (NOT "title")
        - featureItem: uses "title" (NOT "name")
        - All content blocks must have _type and _key
        
        Analyze the content and return JSON with:
        {
          "isValid": boolean,
          "errors": [
            {
              "path": "exact path to error",
              "wrongField": "incorrect field name",
              "correctField": "what it should be",
              "value": "current value"
            }
          ],
          "correctedContent": { /* content with fixed field names */ }
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
  }
  
  /**
   * Fixes content structure based on validation errors
   */
  async fixContent(content: any, errors: any[]): Promise<any> {
    const fixInstruction = await client.agent.action.prompt({
      instruction: `Fix this content based on these validation errors:
        
        Content: ${JSON.stringify(content)}
        Errors: ${JSON.stringify(errors)}
        
        Return the corrected content structure with all field names fixed.
        Maintain all values, only fix the field names.`,
      format: 'json'
    })
    
    return fixInstruction
  }
}

/**
 * SEO Content Pipeline with Validation
 */
export class SEOContentPipeline {
  private validator = new SchemaValidationService()
  
  /**
   * Creates a page with automatic validation and fixing
   */
  async createPageWithValidation(seoContent: any): Promise<{
    success: boolean
    pageId?: string
    validationReport: any
    errors?: any[]
  }> {
    console.log('📝 Processing SEO content...\n')
    
    // Step 1: Validate the content
    console.log('Step 1: Validating content structure...')
    const validation = await this.validator.validateContent(seoContent)
    
    if (!validation.isValid) {
      console.log(`❌ Found ${validation.errors.length} validation errors:`)
      validation.errors.forEach(err => {
        console.log(`   - ${err.path}: ${err.wrongField} → ${err.correctField}`)
      })
      
      // Step 2: Use corrected content
      console.log('\nStep 2: Using AI-corrected structure...')
      const correctedContent = validation.correctedContent
      
      // Step 3: Create page with corrected content
      console.log('\nStep 3: Creating page with correct structure...')
      try {
        const page = await client.agent.action.generate({
          schemaId: SCHEMA_ID,
          targetDocument: {
            operation: 'create',
            _type: 'page'
          },
          instruction: `Create this exact page structure: ${JSON.stringify(correctedContent)}`
        })
        
        console.log('✅ Page created successfully!')
        return {
          success: true,
          pageId: page._id,
          validationReport: validation
        }
      } catch (error: any) {
        console.log('❌ Failed to create page:', error.message)
        return {
          success: false,
          validationReport: validation,
          errors: [error.message]
        }
      }
    }
    
    // Content is valid, create directly
    console.log('✅ Content is valid, creating page...')
    const page = await client.createOrReplace(seoContent)
    return {
      success: true,
      pageId: page._id,
      validationReport: validation
    }
  }
}

// Demo usage
async function demo() {
  console.log('🚀 SEO CONTENT VALIDATION PIPELINE DEMO\n')
  
  const pipeline = new SEOContentPipeline()
  
  // Simulate SEO agent output with wrong field names
  const seoAgentOutput = {
    _type: 'page',
    title: 'Solceller og Elpriser - Guide 2024',
    slug: { current: 'solceller-guide-2024' },
    seoTitle: 'Solceller Guide 2024 | ElPortal',
    seoDescription: 'Komplet guide til solceller og elpriser i Danmark',
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero1',
        title: 'Solceller: Fremtidens Energi', // ❌ Wrong field
        subtitle: 'Spar op til 80% på din elregning' // ❌ Wrong field
      },
      {
        _type: 'valueProposition',
        _key: 'vp1',
        heading: 'Fordele ved solceller',
        items: [
          {
            _type: 'valueItem',
            _key: 'vi1',
            title: 'Økonomisk frihed', // ❌ Wrong field
            description: 'Bliv selvforsynende med egen strøm'
          },
          {
            _type: 'valueItem',
            _key: 'vi2',
            title: 'Miljøvenlig', // ❌ Wrong field
            description: 'Reducer CO2 med 3 tons årligt'
          }
        ]
      },
      {
        _type: 'featureList',
        _key: 'fl1',
        heading: 'Populære solcelletyper',
        features: [
          {
            _type: 'featureItem',
            _key: 'fi1',
            name: 'Monokrystallinske', // ❌ Wrong field
            description: 'Højeste effektivitet op til 22%'
          },
          {
            _type: 'featureItem',
            _key: 'fi2',
            name: 'Polykrystallinske', // ❌ Wrong field
            description: 'God pris/ydelse forhold'
          }
        ]
      }
    ]
  }
  
  console.log('SEO Agent Output (with wrong field names):')
  console.log('- hero.title (should be headline)')
  console.log('- hero.subtitle (should be subheadline)')
  console.log('- valueItem.title (should be heading)')
  console.log('- featureItem.name (should be title)\n')
  
  // Process with validation
  const result = await pipeline.createPageWithValidation(seoAgentOutput)
  
  console.log('\n📊 Final Result:')
  console.log(`Success: ${result.success}`)
  console.log(`Validation errors found and fixed: ${result.validationReport.errors?.length || 0}`)
  if (result.pageId) {
    console.log(`Page ID: ${result.pageId}`)
  }
  
  console.log('\n✨ Benefits:')
  console.log('1. Automatic validation of SEO content')
  console.log('2. AI-powered field name correction')
  console.log('3. No manual debugging needed')
  console.log('4. "Full-hitter" pages every time!')
}

// Run demo if called directly
if (require.main === module) {
  demo().catch(console.error)
}