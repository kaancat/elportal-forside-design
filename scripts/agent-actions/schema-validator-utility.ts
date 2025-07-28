import { z } from 'zod'

/**
 * Schema-aware validation utility for Sanity content
 * This provides the validation without importing the problematic file
 */

// Define the schemas we need inline
const HeroSchema = z.object({
  _type: z.literal('hero'),
  _key: z.string(),
  headline: z.string(),
  subheadline: z.string(),
})

const ValueItemSchema = z.object({
  _type: z.literal('valueItem'),
  _key: z.string(),
  heading: z.string(),
  description: z.string(),
})

const ValuePropositionSchema = z.object({
  _type: z.literal('valueProposition'),
  _key: z.string(),
  heading: z.string(),
  items: z.array(ValueItemSchema),
})

const FeatureItemSchema = z.object({
  _type: z.literal('featureItem'),
  _key: z.string(),
  title: z.string(),
  description: z.string(),
})

const FeatureListSchema = z.object({
  _type: z.literal('featureList'),
  _key: z.string(),
  heading: z.string(),
  features: z.array(FeatureItemSchema),
})

/**
 * Common field name mappings for auto-fixing
 */
export const FIELD_MAPPINGS = {
  hero: {
    'title': 'headline',
    'subtitle': 'subheadline',
  },
  valueItem: {
    'title': 'heading',
  },
  featureItem: {
    'name': 'title',
  }
}

/**
 * Auto-fix common field name errors
 */
export function fixFieldNames(block: any): any {
  const fixed = { ...block }
  
  // Get mappings for this block type
  const mappings = FIELD_MAPPINGS[block._type as keyof typeof FIELD_MAPPINGS]
  
  if (mappings) {
    // Apply field name fixes
    for (const [wrong, correct] of Object.entries(mappings)) {
      if (wrong in fixed && !(correct in fixed)) {
        fixed[correct] = fixed[wrong]
        delete fixed[wrong]
      }
    }
  }
  
  // Recursively fix nested items
  if (fixed.items && Array.isArray(fixed.items)) {
    fixed.items = fixed.items.map(fixFieldNames)
  }
  if (fixed.features && Array.isArray(fixed.features)) {
    fixed.features = fixed.features.map(fixFieldNames)
  }
  
  return fixed
}

/**
 * Validate a content block
 */
export function validateBlock(block: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    switch (block._type) {
      case 'hero':
        HeroSchema.parse(block)
        break
      case 'valueProposition':
        ValuePropositionSchema.parse(block)
        break
      case 'featureList':
        FeatureListSchema.parse(block)
        break
      default:
        // Unknown block type, skip validation
        return { valid: true, errors: [] }
    }
    
    return { valid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`))
    } else {
      errors.push(String(error))
    }
    
    return { valid: false, errors }
  }
}

/**
 * Process page content with auto-fixing and validation
 */
export function processPageContent(pageData: any): {
  processed: any
  validationReport: {
    totalBlocks: number
    validBlocks: number
    fixedBlocks: number
    errors: string[]
  }
} {
  const processed = { ...pageData }
  const report = {
    totalBlocks: 0,
    validBlocks: 0,
    fixedBlocks: 0,
    errors: [] as string[]
  }
  
  if (!processed.contentBlocks || !Array.isArray(processed.contentBlocks)) {
    return { processed, validationReport: report }
  }
  
  // Process each content block
  processed.contentBlocks = processed.contentBlocks.map((block: any) => {
    report.totalBlocks++
    
    // Check if block needs fixing
    const originalJSON = JSON.stringify(block)
    const fixed = fixFieldNames(block)
    const wasFixed = JSON.stringify(fixed) !== originalJSON
    
    if (wasFixed) {
      report.fixedBlocks++
    }
    
    // Validate the fixed block
    const validation = validateBlock(fixed)
    
    if (validation.valid) {
      report.validBlocks++
    } else {
      report.errors.push(`${block._type} block: ${validation.errors.join(', ')}`)
    }
    
    return fixed
  })
  
  return { processed, validationReport: report }
}

/**
 * Example usage in your SEO agent
 */
export function createSchemaAwarePage(seoAgentOutput: {
  title: string
  slug: string
  content: any
}): any {
  // Convert SEO agent output to Sanity structure
  const rawPage = {
    _type: 'page',
    _id: `page.${seoAgentOutput.slug}`,
    title: seoAgentOutput.title,
    slug: { current: seoAgentOutput.slug },
    contentBlocks: seoAgentOutput.content
  }
  
  // Process with auto-fixing and validation
  const { processed, validationReport } = processPageContent(rawPage)
  
  console.log('📊 Schema Processing Report:')
  console.log(`   Total blocks: ${validationReport.totalBlocks}`)
  console.log(`   Auto-fixed: ${validationReport.fixedBlocks}`)
  console.log(`   Valid: ${validationReport.validBlocks}`)
  
  if (validationReport.errors.length > 0) {
    console.log('   ❌ Errors:')
    validationReport.errors.forEach(err => console.log(`      - ${err}`))
  } else {
    console.log('   ✅ All blocks validated successfully!')
  }
  
  return processed
}