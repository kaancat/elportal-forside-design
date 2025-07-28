import { createClient, SanityClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

interface ValidationResult {
  field: string
  status: 'valid' | 'error' | 'warning'
  message: string
  value?: any
}

const client: SanityClient = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function validatePage(pageId: string) {
  console.log(`\n🔍 Validating page with ID: ${pageId}\n`)

  try {
    // Fetch the page with all content blocks expanded
    const page = await client.fetch(`
      *[_id == $id][0] {
        _id,
        _type,
        title,
        slug,
        parent,
        seoMetaTitle,
        seoMetaDescription,
        seoKeywords,
        ogImage,
        noIndex,
        contentBlocks[] {
          _type,
          _key,
          ...
        }
      }
    `, { id: pageId })

    if (!page) {
      console.error('❌ Page not found!')
      return
    }

    const results: ValidationResult[] = []

    // Validate page-level fields
    results.push({
      field: '_type',
      status: page._type === 'page' ? 'valid' : 'error',
      message: page._type === 'page' ? 'Correct type' : `Wrong type: ${page._type}`,
      value: page._type
    })

    results.push({
      field: 'title',
      status: page.title ? 'valid' : 'error',
      message: page.title ? 'Title present' : 'Missing required title',
      value: page.title
    })

    results.push({
      field: 'slug',
      status: page.slug?.current ? 'valid' : 'error',
      message: page.slug?.current ? 'Slug present' : 'Missing required slug',
      value: page.slug
    })

    results.push({
      field: 'contentBlocks',
      status: Array.isArray(page.contentBlocks) ? 'valid' : 'error',
      message: Array.isArray(page.contentBlocks) ? `${page.contentBlocks.length} blocks found` : 'contentBlocks is not an array',
      value: Array.isArray(page.contentBlocks) ? page.contentBlocks.length : page.contentBlocks
    })

    // Print page-level results
    console.log('📄 PAGE VALIDATION\n')
    results.forEach(result => {
      const icon = result.status === 'valid' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
      console.log(`${icon} ${result.field}: ${result.message}`)
      if (result.value !== undefined && result.status !== 'valid') {
        console.log(`   Value: ${JSON.stringify(result.value, null, 2)}`)
      }
    })

    // Validate each content block
    if (Array.isArray(page.contentBlocks)) {
      console.log('\n\n📦 CONTENT BLOCKS VALIDATION\n')
      
      for (let i = 0; i < page.contentBlocks.length; i++) {
        const block = page.contentBlocks[i]
        console.log(`\n--- Block ${i + 1}: ${block._type} ---`)
        
        const blockResults = await validateContentBlock(block)
        blockResults.forEach(result => {
          const icon = result.status === 'valid' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
          console.log(`${icon} ${result.field}: ${result.message}`)
          if (result.value !== undefined && result.status !== 'valid') {
            console.log(`   Value: ${JSON.stringify(result.value, null, 2)}`)
          }
        })
      }
    }

    // Summary
    console.log('\n\n📊 VALIDATION SUMMARY\n')
    console.log(`Page Title: ${page.title}`)
    console.log(`Page Slug: ${page.slug?.current}`)
    console.log(`Total Content Blocks: ${page.contentBlocks?.length || 0}`)
    
    if (page.contentBlocks && Array.isArray(page.contentBlocks)) {
      const blockTypes = page.contentBlocks.reduce((acc, block) => {
        acc[block._type] = (acc[block._type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      console.log('\nBlock Type Distribution:')
      Object.entries(blockTypes).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`)
      })
    }

  } catch (error) {
    console.error('❌ Validation error:', error)
  }
}

async function validateContentBlock(block: any): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []

  // Common validations for all blocks
  results.push({
    field: '_type',
    status: block._type ? 'valid' : 'error',
    message: block._type ? `Type: ${block._type}` : 'Missing _type',
    value: block._type
  })

  results.push({
    field: '_key',
    status: block._key ? 'valid' : 'error',
    message: block._key ? 'Has unique key' : 'Missing required _key',
    value: block._key
  })

  // Type-specific validations
  switch (block._type) {
    case 'hero':
      results.push(...validateHero(block))
      break
    case 'pageSection':
      results.push(...validatePageSection(block))
      break
    case 'providerList':
      results.push(...validateProviderList(block))
      break
    case 'featureList':
      results.push(...validateFeatureList(block))
      break
    case 'callToActionSection':
      results.push(...validateCallToAction(block))
      break
    case 'livePriceGraph':
      results.push(...validateLivePriceGraph(block))
      break
    case 'infoCardsSection':
      results.push(...validateInfoCardsSection(block))
      break
    case 'applianceCalculator':
      results.push(...validateApplianceCalculator(block))
      break
    case 'energyTipsSection':
      results.push(...validateEnergyTipsSection(block))
      break
    case 'faqGroup':
      results.push(...validateFaqGroup(block))
      break
  }

  return results
}

function validateHero(block: any): ValidationResult[] {
  const results: ValidationResult[] = []
  
  results.push({
    field: 'headline',
    status: block.headline ? 'valid' : 'error',
    message: block.headline ? 'Has headline' : 'Missing required headline',
    value: block.headline
  })

  results.push({
    field: 'subheadline',
    status: 'valid',
    message: block.subheadline ? 'Has subheadline' : 'No subheadline (optional)',
    value: block.subheadline
  })

  results.push({
    field: 'variant',
    status: ['default', 'centered', 'withImage'].includes(block.variant) ? 'valid' : 'warning',
    message: block.variant ? `Variant: ${block.variant}` : 'No variant specified',
    value: block.variant
  })

  return results
}

function validatePageSection(block: any): ValidationResult[] {
  const results: ValidationResult[] = []
  
  results.push({
    field: 'content',
    status: Array.isArray(block.content) ? 'valid' : 'error',
    message: Array.isArray(block.content) ? 'Has content array' : 'Content must be an array',
    value: typeof block.content
  })

  results.push({
    field: 'headerAlignment',
    status: ['left', 'center', 'right'].includes(block.headerAlignment) ? 'valid' : 'warning',
    message: block.headerAlignment ? `Alignment: ${block.headerAlignment}` : 'No alignment specified',
    value: block.headerAlignment
  })

  return results
}

function validateProviderList(block: any): ValidationResult[] {
  const results: ValidationResult[] = []
  
  results.push({
    field: 'title',
    status: 'valid',
    message: block.title ? 'Has title' : 'No title (optional)',
    value: block.title
  })

  results.push({
    field: 'subtitle',
    status: 'valid',
    message: block.subtitle ? 'Has subtitle' : 'No subtitle (optional)',
    value: block.subtitle
  })

  results.push({
    field: 'headerAlignment',
    status: ['left', 'center', 'right'].includes(block.headerAlignment) ? 'valid' : 'warning',
    message: block.headerAlignment ? `Alignment: ${block.headerAlignment}` : 'No alignment specified',
    value: block.headerAlignment
  })

  return results
}

function validateFeatureList(block: any): ValidationResult[] {
  const results: ValidationResult[] = []
  
  results.push({
    field: 'items',
    status: Array.isArray(block.items) && block.items.length > 0 ? 'valid' : 'error',
    message: Array.isArray(block.items) ? `${block.items.length} items` : 'Items must be an array',
    value: Array.isArray(block.items) ? block.items.length : typeof block.items
  })

  if (Array.isArray(block.items)) {
    block.items.forEach((item: any, index: number) => {
      if (!item.title) {
        results.push({
          field: `items[${index}].title`,
          status: 'error',
          message: 'Missing required title',
          value: item
        })
      }
    })
  }

  return results
}

function validateCallToAction(block: any): ValidationResult[] {
  const results: ValidationResult[] = []
  
  results.push({
    field: 'heading',
    status: block.heading ? 'valid' : 'warning',
    message: block.heading ? 'Has heading' : 'No heading (optional)',
    value: block.heading
  })

  results.push({
    field: 'subheading',
    status: 'valid',
    message: block.subheading ? 'Has subheading' : 'No subheading (optional)',
    value: block.subheading
  })

  results.push({
    field: 'primaryCta',
    status: block.primaryCta ? 'valid' : 'warning',
    message: block.primaryCta ? 'Has primary CTA' : 'No primary CTA',
    value: block.primaryCta
  })

  return results
}

function validateLivePriceGraph(block: any): ValidationResult[] {
  const results: ValidationResult[] = []
  
  results.push({
    field: 'title',
    status: 'valid',
    message: block.title ? 'Has title' : 'No title (optional)',
    value: block.title
  })

  results.push({
    field: 'region',
    status: ['DK1', 'DK2'].includes(block.region) ? 'valid' : 'error',
    message: block.region ? `Region: ${block.region}` : 'Missing required region',
    value: block.region
  })

  return results
}

function validateInfoCardsSection(block: any): ValidationResult[] {
  const results: ValidationResult[] = []
  
  results.push({
    field: 'cards',
    status: Array.isArray(block.cards) && block.cards.length > 0 ? 'valid' : 'error',
    message: Array.isArray(block.cards) ? `${block.cards.length} cards` : 'Cards must be an array',
    value: Array.isArray(block.cards) ? block.cards.length : typeof block.cards
  })

  return results
}

function validateApplianceCalculator(block: any): ValidationResult[] {
  const results: ValidationResult[] = []
  
  results.push({
    field: 'title',
    status: 'valid',
    message: block.title ? 'Has title' : 'No title (optional)',
    value: block.title
  })

  results.push({
    field: 'description',
    status: 'valid',
    message: block.description ? 'Has description' : 'No description (optional)',
    value: block.description
  })

  return results
}

function validateEnergyTipsSection(block: any): ValidationResult[] {
  const results: ValidationResult[] = []
  
  results.push({
    field: 'title',
    status: 'valid',
    message: block.title ? 'Has title' : 'No title (optional)',
    value: block.title
  })

  results.push({
    field: 'tips',
    status: Array.isArray(block.tips) && block.tips.length > 0 ? 'valid' : 'error',
    message: Array.isArray(block.tips) ? `${block.tips.length} tips` : 'Tips must be an array',
    value: Array.isArray(block.tips) ? block.tips.length : typeof block.tips
  })

  return results
}

function validateFaqGroup(block: any): ValidationResult[] {
  const results: ValidationResult[] = []
  
  results.push({
    field: 'title',
    status: 'valid',
    message: block.title ? 'Has title' : 'No title (optional)',
    value: block.title
  })

  results.push({
    field: 'items',
    status: Array.isArray(block.items) && block.items.length > 0 ? 'valid' : 'error',
    message: Array.isArray(block.items) ? `${block.items.length} FAQ items` : 'Items must be an array',
    value: Array.isArray(block.items) ? block.items.length : typeof block.items
  })

  return results
}

// Run validation
validatePage('qgCxJyBbKpvhb2oGYqfgkp')