import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Schema definitions based on the validation agent's findings
const schemaDefinitions: Record<string, any> = {
  hero: {
    headline: { type: 'string', required: true },
    subheadline: { type: 'text', required: false }, // Plain text, NOT array
    image: { type: 'image', required: false }
  },
  dailyPriceTimeline: {
    title: { type: 'string', required: false },
    subtitle: { type: 'string', required: false },
    description: { type: 'string', required: false },
    leadingText: { type: 'array', required: false }, // Array of blocks
    headerAlignment: { type: 'string', required: false, values: ['left', 'center', 'right'] },
    showAveragePrice: { type: 'boolean', required: false },
    showPeakHours: { type: 'boolean', required: false },
    region: { type: 'string', required: false, values: ['DK1', 'DK2', 'both'] }
  },
  renewableEnergyForecast: {
    title: { type: 'string', required: true },
    leadingText: { type: 'text', required: false }, // Plain text, NOT array
    description: { type: 'text', required: false }, // Plain text
    headerAlignment: { type: 'string', required: false, values: ['left', 'center', 'right'] },
    showPercentages: { type: 'boolean', required: false },
    showTrend: { type: 'boolean', required: false }
  },
  monthlyProductionChart: {
    title: { type: 'string', required: true },
    leadingText: { type: 'text', required: false }, // Plain text, NOT array
    description: { type: 'text', required: false },
    headerAlignment: { type: 'string', required: false, values: ['left', 'center', 'right'] },
    showComparison: { type: 'boolean', required: false },
    comparisonType: { type: 'string', required: false }
  },
  providerList: {
    title: { type: 'string', required: false },
    // NO subtitle field exists!
    providers: { type: 'array', required: false },
    showDetailedPricing: { type: 'boolean', required: false },
    showGreenEnergy: { type: 'boolean', required: false },
    maxProviders: { type: 'number', required: false }
  },
  co2EmissionsChart: {
    title: { type: 'string', required: false },
    subtitle: { type: 'string', required: false },
    description: { type: 'string', required: false },
    leadingText: { type: 'array', required: false }, // Array of blocks
    headerAlignment: { type: 'string', required: false, values: ['left', 'center', 'right'] },
    showForecast: { type: 'boolean', required: false },
    region: { type: 'string', required: false }
  },
  regionalComparison: {
    title: { type: 'string', required: false },
    subtitle: { type: 'string', required: false },
    description: { type: 'string', required: false },
    leadingText: { type: 'array', required: false }, // Array of blocks
    headerAlignment: { type: 'string', required: false, values: ['left', 'center', 'right'] },
    showHistoricalTrend: { type: 'boolean', required: false },
    showPriceDifference: { type: 'boolean', required: false }
  },
  pricingComparison: {
    title: { type: 'string', required: false },
    subtitle: { type: 'string', required: false },
    description: { type: 'string', required: false },
    leadingText: { type: 'array', required: false }, // Array of blocks
    headerAlignment: { type: 'string', required: false, values: ['left', 'center', 'right'] },
    showCalculator: { type: 'boolean', required: false },
    showRecommendation: { type: 'boolean', required: false }
  },
  infoCardsSection: {
    heading: { type: 'string', required: false },
    subheading: { type: 'string', required: false },
    leadingText: { type: 'array', required: false }, // Array of blocks
    headerAlignment: { type: 'string', required: false, values: ['left', 'center', 'right'] },
    cards: { type: 'array', required: true }
  },
  faqGroup: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: false },
    faqItems: { type: 'array', required: true }
  },
  valueProposition: {
    heading: { type: 'string', required: false },
    subheading: { type: 'string', required: false },
    items: { type: 'array', required: true }
  },
  callToActionSection: {
    heading: { type: 'string', required: true },
    description: { type: 'string', required: true },
    primaryButtonText: { type: 'string', required: true },
    primaryButtonLink: { type: 'string', required: true },
    secondaryButtonText: { type: 'string', required: false },
    secondaryButtonLink: { type: 'string', required: false },
    variant: { type: 'string', required: false }
  }
}

function validateField(value: any, schema: any, path: string): string[] {
  const errors: string[] = []
  
  if (schema.required && (value === undefined || value === null || value === '')) {
    errors.push(`${path} is required but missing`)
  }
  
  if (value !== undefined && value !== null) {
    // Check type
    if (schema.type === 'string' || schema.type === 'text') {
      if (typeof value !== 'string') {
        errors.push(`${path} should be string but is ${typeof value}`)
      }
    } else if (schema.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`${path} should be array but is ${typeof value}`)
      }
    } else if (schema.type === 'boolean') {
      if (typeof value !== 'boolean') {
        errors.push(`${path} should be boolean but is ${typeof value}`)
      }
    } else if (schema.type === 'number') {
      if (typeof value !== 'number') {
        errors.push(`${path} should be number but is ${typeof value}`)
      }
    }
    
    // Check allowed values
    if (schema.values && !schema.values.includes(value)) {
      errors.push(`${path} has invalid value "${value}". Allowed: ${schema.values.join(', ')}`)
    }
  }
  
  return errors
}

async function deepValidatePrognoser() {
  console.log('🔍 Deep validation of prognoser page...\n')
  
  try {
    const page = await client.fetch(`*[_id == "page.prognoser"][0]`)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    const allErrors: string[] = []
    
    // Validate content blocks
    if (page.contentBlocks && Array.isArray(page.contentBlocks)) {
      page.contentBlocks.forEach((block: any, index: number) => {
        const blockPath = `contentBlocks[${index}]`
        const schema = schemaDefinitions[block._type]
        
        if (!schema) {
          allErrors.push(`${blockPath}: Unknown block type "${block._type}"`)
          return
        }
        
        console.log(`Validating ${block._type} (block ${index + 1})...`)
        
        // Check for unknown fields
        Object.keys(block).forEach(key => {
          if (!key.startsWith('_') && !schema[key]) {
            allErrors.push(`${blockPath}.${key}: Field not in schema`)
          }
        })
        
        // Validate each field
        Object.entries(schema).forEach(([fieldName, fieldSchema]) => {
          const fieldErrors = validateField(block[fieldName], fieldSchema, `${blockPath}.${fieldName}`)
          allErrors.push(...fieldErrors)
        })
      })
    }
    
    // Print results
    console.log('\n' + '='.repeat(60))
    console.log('DEEP VALIDATION RESULTS')
    console.log('='.repeat(60))
    
    if (allErrors.length === 0) {
      console.log('✅ All validations passed!')
    } else {
      console.log(`❌ Found ${allErrors.length} validation errors:\n`)
      allErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`)
      })
      
      // Auto-fix suggestions
      console.log('\n🔧 Auto-fix available for these issues.')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run validation
deepValidatePrognoser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })