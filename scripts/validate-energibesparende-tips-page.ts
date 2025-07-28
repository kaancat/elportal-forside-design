import { mutationClient } from '../src/lib/sanity-helpers'
import dotenv from 'dotenv'

dotenv.config()

const PAGE_ID = 'I7aq0qw44tdJ3YglBpsP1G' // New merged page ID

interface ValidationError {
  path: string
  issue: string
  severity: 'error' | 'warning'
}

async function validatePage() {
  console.log('🔍 Starting validation for page:', PAGE_ID)
  console.log('=' .repeat(80))
  
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  
  try {
    // Fetch the complete page document with all references expanded
    const query = `*[_id == "${PAGE_ID}"][0] {
      ...,
      "slug": slug.current,
      parent->{
        _id,
        title,
        "slug": slug.current
      },
      contentBlocks[]{
        ...,
        // Expand all possible references in content blocks
        products[]->{
          _id,
          title,
          slug
        },
        providers[]->{
          _id,
          name,
          slug
        },
        faqs[]->{
          _id,
          question,
          answer
        },
        // For any other reference fields
        "references": *[references(^._id)]._id
      }
    }`
    
    const page = await mutationClient.fetch(query)
    
    if (!page) {
      errors.push({
        path: 'root',
        issue: `Page with ID ${PAGE_ID} not found`,
        severity: 'error'
      })
      return { errors, warnings }
    }
    
    console.log('✅ Page found:', page.title)
    console.log('   Type:', page._type)
    console.log('   Slug:', page.slug)
    console.log('   Content blocks:', page.contentBlocks?.length || 0)
    console.log()
    
    // 1. Validate required top-level fields
    console.log('📋 Validating required fields...')
    if (!page.title) {
      errors.push({
        path: 'title',
        issue: 'Title is required',
        severity: 'error'
      })
    }
    
    if (!page.slug) {
      errors.push({
        path: 'slug',
        issue: 'Slug is required',
        severity: 'error'
      })
    }
    
    // 2. Check SEO fields
    console.log('🔍 Checking SEO fields...')
    const seoFields = ['seoMetaTitle', 'seoMetaDescription', 'seoKeywords']
    seoFields.forEach(field => {
      if (!page[field]) {
        warnings.push({
          path: field,
          issue: `${field} is recommended for SEO`,
          severity: 'warning'
        })
      }
    })
    
    // 3. Validate content blocks
    console.log('🧩 Validating content blocks...')
    if (!page.contentBlocks || page.contentBlocks.length === 0) {
      warnings.push({
        path: 'contentBlocks',
        issue: 'Page has no content blocks',
        severity: 'warning'
      })
    } else {
      page.contentBlocks.forEach((block: any, index: number) => {
        const blockPath = `contentBlocks[${index}]`
        
        // Check for _type
        if (!block._type) {
          errors.push({
            path: blockPath,
            issue: 'Block is missing _type',
            severity: 'error'
          })
        } else {
          console.log(`   - Block ${index}: ${block._type}`)
          
          // Validate block-specific required fields
          validateBlockFields(block, blockPath, errors, warnings)
        }
        
        // Check for _key
        if (!block._key) {
          errors.push({
            path: blockPath,
            issue: 'Block is missing _key',
            severity: 'error'
          })
        }
      })
    }
    
    // 4. Check for deprecated fields
    console.log('⚠️  Checking for deprecated fields...')
    const deprecatedFields = ['contentGoal', 'generatedAt', 'keywords', 'language', 'seoDescription', 'seoTitle']
    deprecatedFields.forEach(field => {
      if (page[field]) {
        warnings.push({
          path: field,
          issue: `${field} is deprecated and should not be used`,
          severity: 'warning'
        })
      }
    })
    
    // 5. Validate references
    console.log('🔗 Checking references...')
    await validateReferences(page, errors, warnings)
    
  } catch (error) {
    console.error('❌ Validation error:', error)
    errors.push({
      path: 'root',
      issue: `Validation failed: ${error}`,
      severity: 'error'
    })
  }
  
  // Output results
  console.log()
  console.log('=' .repeat(80))
  console.log('📊 VALIDATION RESULTS')
  console.log('=' .repeat(80))
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Page is valid! No errors or warnings found.')
  } else {
    if (errors.length > 0) {
      console.log(`\n❌ ERRORS (${errors.length})`)
      errors.forEach(error => {
        console.log(`   - ${error.path}: ${error.issue}`)
      })
    }
    
    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warnings.length})`)
      warnings.forEach(warning => {
        console.log(`   - ${warning.path}: ${warning.issue}`)
      })
    }
  }
  
  console.log()
  console.log('🔗 View in Sanity Studio:')
  console.log(`   https://dinelportal.sanity.studio/structure/page;${PAGE_ID}`)
  
  return { errors, warnings }
}

function validateBlockFields(block: any, path: string, errors: ValidationError[], warnings: ValidationError[]) {
  // Common required fields by block type
  const requiredFieldsByType: Record<string, string[]> = {
    hero: ['headline'],
    heroWithCalculator: ['headline'],
    pageSection: ['content'],
    providerList: [],
    featureList: ['features'],
    valueProposition: ['values'],
    faqGroup: ['faqItems'],
    callToActionSection: ['heading', 'ctaText', 'ctaLink'],
    livePriceGraph: [],
    co2EmissionsChart: [],
    energyTipsSection: ['tips'],
    applianceCalculator: [],
    // Add more as needed
  }
  
  const requiredFields = requiredFieldsByType[block._type] || []
  
  requiredFields.forEach(field => {
    if (!block[field] || (Array.isArray(block[field]) && block[field].length === 0)) {
      errors.push({
        path: `${path}.${field}`,
        issue: `Required field '${field}' is missing or empty`,
        severity: 'error'
      })
    }
  })
  
  // Special validations
  switch (block._type) {
    case 'pageSection':
      // Check if content is valid Portable Text
      if (block.content && Array.isArray(block.content)) {
        block.content.forEach((contentBlock: any, idx: number) => {
          if (!contentBlock._type || !contentBlock._key) {
            errors.push({
              path: `${path}.content[${idx}]`,
              issue: 'Portable Text block missing _type or _key',
              severity: 'error'
            })
          }
        })
      }
      break
      
    case 'featureList':
      // Validate feature items
      if (block.features && Array.isArray(block.features)) {
        block.features.forEach((feature: any, idx: number) => {
          if (!feature._type || feature._type !== 'featureItem') {
            errors.push({
              path: `${path}.features[${idx}]`,
              issue: 'Feature item must have _type: "featureItem"',
              severity: 'error'
            })
          }
          if (!feature.title) {
            errors.push({
              path: `${path}.features[${idx}].title`,
              issue: 'Feature title is required',
              severity: 'error'
            })
          }
        })
      }
      break
      
    case 'valueProposition':
      // Validate value items
      if (block.values && Array.isArray(block.values)) {
        block.values.forEach((value: any, idx: number) => {
          if (!value._type || value._type !== 'valueItem') {
            errors.push({
              path: `${path}.values[${idx}]`,
              issue: 'Value item must have _type: "valueItem"',
              severity: 'error'
            })
          }
          if (!value.heading) {
            errors.push({
              path: `${path}.values[${idx}].heading`,
              issue: 'Value heading is required',
              severity: 'error'
            })
          }
        })
      }
      break
  }
}

async function validateReferences(page: any, errors: ValidationError[], warnings: ValidationError[]) {
  // Check parent reference
  if (page.parent && !page.parent._id) {
    errors.push({
      path: 'parent',
      issue: 'Parent page reference is invalid',
      severity: 'error'
    })
  }
  
  // Check references in content blocks
  if (page.contentBlocks) {
    for (let i = 0; i < page.contentBlocks.length; i++) {
      const block = page.contentBlocks[i]
      const blockPath = `contentBlocks[${i}]`
      
      // Check product references
      if (block.products && Array.isArray(block.products)) {
        const invalidProducts = block.products.filter((p: any) => p && !p._id)
        if (invalidProducts.length > 0) {
          errors.push({
            path: `${blockPath}.products`,
            issue: `${invalidProducts.length} invalid product reference(s)`,
            severity: 'error'
          })
        }
      }
      
      // Check provider references
      if (block.providers && Array.isArray(block.providers)) {
        const invalidProviders = block.providers.filter((p: any) => p && !p._id)
        if (invalidProviders.length > 0) {
          errors.push({
            path: `${blockPath}.providers`,
            issue: `${invalidProviders.length} invalid provider reference(s)`,
            severity: 'error'
          })
        }
      }
      
      // Check FAQ references (only for reference-based FAQs)
      if (block.faqs && Array.isArray(block.faqs)) {
        // Check if these are references or inline FAQs
        const hasReferences = block.faqs.some((f: any) => f && (f._ref || f._id))
        if (hasReferences) {
          const invalidFaqs = block.faqs.filter((f: any) => f && f._ref && !f._id)
          if (invalidFaqs.length > 0) {
            errors.push({
              path: `${blockPath}.faqs`,
              issue: `${invalidFaqs.length} invalid FAQ reference(s)`,
              severity: 'error'
            })
          }
        }
      }
    }
  }
}

// Run validation
validatePage().then(({ errors, warnings }) => {
  process.exit(errors.length > 0 ? 1 : 0)
})