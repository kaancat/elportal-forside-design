import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Schema field mappings - correct field names for each type
const schemaFieldMappings = {
  hero: {
    requiredFields: ['headline'],
    validFields: ['headline', 'subheadline', 'image'],
    invalidFields: ['heading', 'ctaText', 'ctaLink']
  },
  pageSection: {
    requiredFields: [],
    validFields: ['title', 'content', 'headerAlignment', 'image', 'imagePosition', 'cta', 'settings'],
    invalidFields: ['heading']
  },
  valueProposition: {
    requiredFields: [],
    validFields: ['title', 'items'],
    invalidFields: ['heading', 'values', 'propositions']
  },
  livePriceGraph: {
    requiredFields: ['title', 'apiRegion'],
    validFields: ['title', 'subtitle', 'apiRegion', 'headerAlignment'],
    invalidFields: ['heading', 'description', 'showDetails']
  },
  faqGroup: {
    requiredFields: ['title', 'faqItems'],
    validFields: ['title', 'faqItems'],
    invalidFields: ['heading', 'faqs']
  },
  featureList: {
    requiredFields: [],
    validFields: ['title', 'features'],
    invalidFields: ['heading']
  },
  callToActionSection: {
    requiredFields: ['title', 'buttonText', 'buttonUrl'],
    validFields: ['title', 'buttonText', 'buttonUrl'],
    invalidFields: ['headline', 'heading']
  },
  richTextSection: {
    requiredFields: ['content'],
    validFields: ['content'],
    invalidFields: ['title', 'heading']
  },
  chargingBoxShowcase: {
    requiredFields: ['heading'],
    validFields: ['heading', 'description', 'products', 'headerAlignment'],
    invalidFields: ['title'] // This one actually uses 'heading'
  }
}

async function validateLadeboksPage() {
  try {
    console.log('Fetching Ladeboks page for validation...\n')
    
    const rawQuery = `*[_id == "page.ladeboks"][0]`
    const page = await client.fetch(rawQuery)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log(`Page: ${page.title} (${page._id})`)
    console.log(`Slug: ${page.slug}`)
    console.log(`Sections: ${page.sections?.length || 0}\n`)
    
    let hasErrors = false
    const errors: string[] = []
    const warnings: string[] = []
    
    // Validate each section
    page.sections?.forEach((section: any, index: number) => {
      const sectionType = section._type
      const mapping = schemaFieldMappings[sectionType as keyof typeof schemaFieldMappings]
      
      console.log(`\nSection ${index + 1}: ${sectionType}`)
      console.log(`  _key: ${section._key || '❌ MISSING'}`)
      
      if (!section._key) {
        errors.push(`Section ${index + 1} (${sectionType}) is missing _key`)
        hasErrors = true
      }
      
      if (!mapping) {
        warnings.push(`Unknown section type: ${sectionType}`)
        console.log(`  ⚠️  Unknown section type`)
        return
      }
      
      // Check for invalid fields
      const invalidFieldsFound = mapping.invalidFields.filter(field => 
        section[field] !== undefined
      )
      
      if (invalidFieldsFound.length > 0) {
        hasErrors = true
        invalidFieldsFound.forEach(field => {
          errors.push(`Section ${index + 1} (${sectionType}) has invalid field: ${field}`)
          console.log(`  ❌ Invalid field: ${field} = "${section[field]}"`)
        })
      }
      
      // Check for required fields
      const missingRequired = mapping.requiredFields.filter(field => 
        section[field] === undefined || section[field] === null
      )
      
      if (missingRequired.length > 0) {
        hasErrors = true
        missingRequired.forEach(field => {
          errors.push(`Section ${index + 1} (${sectionType}) missing required field: ${field}`)
          console.log(`  ❌ Missing required field: ${field}`)
        })
      }
      
      // Show current fields
      const currentFields = Object.keys(section).filter(key => 
        !key.startsWith('_') || key === '_key'
      )
      console.log(`  Current fields: ${currentFields.join(', ')}`)
      
      // Check for proper field values
      if (sectionType === 'valueProposition' && section.items) {
        const invalidItems = section.items.filter((item: any) => 
          !item._key || !item._type
        )
        if (invalidItems.length > 0) {
          warnings.push(`Section ${index + 1} (valueProposition) has items without _key or _type`)
          console.log(`  ⚠️  ${invalidItems.length} items missing _key or _type`)
        }
      }
      
      if (sectionType === 'faqGroup' && section.faqItems) {
        const invalidFaqs = section.faqItems.filter((item: any) => 
          !item._key || !item._type
        )
        if (invalidFaqs.length > 0) {
          warnings.push(`Section ${index + 1} (faqGroup) has FAQ items without _key or _type`)
          console.log(`  ⚠️  ${invalidFaqs.length} FAQ items missing _key or _type`)
        }
      }
    })
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('VALIDATION SUMMARY')
    console.log('='.repeat(60))
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS:')
      errors.forEach(error => console.log(`  - ${error}`))
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:')
      warnings.forEach(warning => console.log(`  - ${warning}`))
    }
    
    if (!hasErrors && warnings.length === 0) {
      console.log('\n✅ Page is valid!')
    } else {
      console.log('\n❌ Page has validation issues that need to be fixed.')
      console.log('\nRun one of these scripts to fix:')
      console.log('  npm run tsx scripts/fix-ladeboks-page.ts')
      console.log('  npm run tsx scripts/fix-ladeboks-page-safe.ts (creates backup)')
    }
    
  } catch (error) {
    console.error('❌ Error validating page:', error)
    if (error instanceof Error) {
      console.error('Details:', error.message)
    }
  }
}

// Run validation
validateLadeboksPage()