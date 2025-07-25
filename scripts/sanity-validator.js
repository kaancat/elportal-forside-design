/**
 * Sanity CMS Validation Tool for ElPortal
 * 
 * This script validates all pages and content blocks in Sanity CMS
 * against the schema requirements, ensuring smooth deployments.
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Schema validation rules
const REQUIRED_PAGE_FIELDS = ['title', 'slug']
const REQUIRED_HOMEPAGE_FIELDS = ['title']
const EXPECTED_SEO_FIELDS = ['seoMetaTitle', 'seoMetaDescription', 'seoKeywords', 'ogImage', 'noIndex']

const CONTENT_BLOCK_TYPES = [
  'hero', 'heroWithCalculator', 'pageSection', 'priceExampleTable', 
  'realPriceComparisonTable', 'renewableEnergyForecast', 'monthlyProductionChart',
  'priceCalculator', 'providerList', 'featureList', 'valueProposition',
  'videoSection', 'faqGroup', 'callToActionSection', 'livePriceGraph',
  'co2EmissionsChart', 'declarationProduction', 'declarationGridmix',
  'consumptionMap', 'applianceCalculator', 'energyTipsSection', 'chargingBoxShowcase'
]

function validateDocument(doc) {
  const errors = []
  const warnings = []

  // Check required fields
  let requiredFields = []
  if (doc._type === 'page') {
    requiredFields = REQUIRED_PAGE_FIELDS
  } else if (doc._type === 'homePage') {
    requiredFields = REQUIRED_HOMEPAGE_FIELDS
  }

  requiredFields.forEach(field => {
    if (!doc[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  })

  // Check slug format
  if (doc._type === 'page' && doc.slug) {
    if (typeof doc.slug === 'string') {
      errors.push('slug field should be an object with current property, not a string')
    } else if (doc.slug && !doc.slug.current) {
      errors.push('slug object missing current property')
    }
  }

  // Check SEO fields
  EXPECTED_SEO_FIELDS.forEach(field => {
    if (doc[field] === undefined) {
      warnings.push(`Missing SEO field: ${field}`)
    }
  })

  // Check contentBlocks structure
  if (doc.contentBlocks && Array.isArray(doc.contentBlocks)) {
    doc.contentBlocks.forEach((block, index) => {
      if (!block._key) {
        errors.push(`Content block at index ${index} missing _key`)
      }
      if (!block._type) {
        errors.push(`Content block at index ${index} missing _type`)
      } else if (!CONTENT_BLOCK_TYPES.includes(block._type)) {
        warnings.push(`Unknown content block type: ${block._type}`)
      }

      // Check for arrays that need _key values
      Object.keys(block).forEach(key => {
        if (Array.isArray(block[key])) {
          block[key].forEach((item, itemIndex) => {
            if (typeof item === 'object' && item !== null && !item._key) {
              errors.push(`${block._type}[${index}].${key}[${itemIndex}] missing _key`)
            }
          })
        }
      })
    })
  }

  return { errors, warnings }
}

async function validateAllDocuments() {
  console.log('🔍 Validating Sanity CMS content...\n')

  try {
    const query = '*[_type in ["page", "homePage"]] | order(_type asc, _createdAt desc)'
    const documents = await client.fetch(query)

    let totalErrors = 0
    let totalWarnings = 0
    const problemDocuments = []

    for (const doc of documents) {
      const validation = validateDocument(doc)
      
      if (validation.errors.length > 0 || validation.warnings.length > 0) {
        console.log(`\n📄 ${doc._type}: ${doc._id}`)
        console.log(`   Title: ${doc.title || 'No title'}`)
        
        if (validation.errors.length > 0) {
          console.log(`   ❌ ERRORS (${validation.errors.length}):`)
          validation.errors.forEach(error => console.log(`      - ${error}`))
          problemDocuments.push(doc)
        }

        if (validation.warnings.length > 0) {
          console.log(`   ⚠️  WARNINGS (${validation.warnings.length}):`)
          validation.warnings.forEach(warning => console.log(`      - ${warning}`))
        }
      }

      totalErrors += validation.errors.length
      totalWarnings += validation.warnings.length
    }

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 VALIDATION SUMMARY')
    console.log('='.repeat(50))
    console.log(`Documents checked: ${documents.length}`)
    console.log(`Total errors: ${totalErrors}`)
    console.log(`Total warnings: ${totalWarnings}`)
    
    if (totalErrors === 0 && totalWarnings === 0) {
      console.log('\n✅ All documents are valid!')
    } else if (totalErrors === 0) {
      console.log('\n✅ No critical errors found (warnings only)')
    } else {
      console.log('\n❌ Validation failed - critical errors found')
      console.log('\n🚨 Documents requiring immediate attention:')
      problemDocuments.forEach(doc => {
        console.log(`   - ${doc._type}: ${doc._id} (${doc.title})`)
      })
    }

    return {
      isValid: totalErrors === 0,
      totalErrors,
      totalWarnings,
      documentsChecked: documents.length
    }

  } catch (error) {
    console.error('❌ Validation failed:', error)
    throw error
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  validateAllDocuments()
    .then(result => {
      process.exit(result.isValid ? 0 : 1)
    })
    .catch(() => {
      process.exit(1)
    })
}

export { validateAllDocuments, validateDocument }