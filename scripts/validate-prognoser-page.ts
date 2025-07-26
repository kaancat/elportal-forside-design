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

interface ValidationError {
  field: string
  issue: string
  suggestion: string
}

async function validatePrognoserPage() {
  console.log('🔍 Fetching prognoser page data...')
  
  try {
    // Fetch the page
    const page = await client.fetch(`*[_id == "page.prognoser"][0]`)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('📄 Page found. Analyzing structure...')
    
    const errors: ValidationError[] = []
    
    // Check page-level fields
    if (page.description && !page.seoMetaDescription) {
      errors.push({
        field: 'description',
        issue: 'Field "description" exists but should be "seoMetaDescription"',
        suggestion: 'Move description to seoMetaDescription'
      })
    }
    
    // Check content blocks
    if (page.contentBlocks && Array.isArray(page.contentBlocks)) {
      page.contentBlocks.forEach((block: any, index: number) => {
        console.log(`\n🔍 Checking block ${index + 1}: ${block._type}`)
        
        // Hero validation
        if (block._type === 'hero') {
          if (block.heading && !block.headline) {
            errors.push({
              field: `contentBlocks[${index}].heading`,
              issue: 'Hero uses "heading" but schema expects "headline"',
              suggestion: 'Rename heading to headline'
            })
          }
          if (block.ctaText || block.ctaLink) {
            errors.push({
              field: `contentBlocks[${index}].cta*`,
              issue: 'Hero has ctaText/ctaLink fields that don\'t exist in schema',
              suggestion: 'Remove ctaText and ctaLink fields'
            })
          }
        }
        
        // PageSection validation
        if (block._type === 'pageSection') {
          if (block.title && !block.heading) {
            errors.push({
              field: `contentBlocks[${index}].title`,
              issue: 'PageSection uses "title" but schema expects "heading"',
              suggestion: 'Rename title to heading'
            })
          }
          if (!block.headerAlignment) {
            errors.push({
              field: `contentBlocks[${index}].headerAlignment`,
              issue: 'PageSection missing required headerAlignment field',
              suggestion: 'Add headerAlignment with value "left", "center", or "right"'
            })
          }
        }
        
        // ProviderList validation
        if (block._type === 'providerList') {
          if (block.description && !block.subtitle) {
            errors.push({
              field: `contentBlocks[${index}].description`,
              issue: 'ProviderList uses "description" but schema expects "subtitle"',
              suggestion: 'Rename description to subtitle'
            })
          }
        }
        
        // InfoCardsSection validation
        if (block._type === 'infoCardsSection') {
          if (!block.cards || !Array.isArray(block.cards)) {
            errors.push({
              field: `contentBlocks[${index}].cards`,
              issue: 'InfoCardsSection missing cards array',
              suggestion: 'Add cards array with infoCard objects'
            })
          }
        }
        
        // DailyPriceTimeline validation
        if (block._type === 'dailyPriceTimeline') {
          const validRegions = ['DK1', 'DK2', 'both']
          if (block.region && !validRegions.includes(block.region)) {
            errors.push({
              field: `contentBlocks[${index}].region`,
              issue: `Invalid region value "${block.region}"`,
              suggestion: 'Use "DK1", "DK2", or "both"'
            })
          }
        }
        
        // Check for components that might not be in ContentBlocks
        const knownTypes = [
          'hero', 'pageSection', 'dailyPriceTimeline', 'renewableEnergyForecast',
          'priceCalculator', 'monthlyProductionChart', 'co2EmissionsChart',
          'providerList', 'infoCardsSection', 'regionalComparison', 'faqGroup',
          'valueProposition', 'pricingComparison', 'callToActionSection'
        ]
        
        if (!knownTypes.includes(block._type)) {
          errors.push({
            field: `contentBlocks[${index}]._type`,
            issue: `Unknown content block type "${block._type}"`,
            suggestion: 'Verify this component exists in ContentBlocks.tsx'
          })
        }
      })
    }
    
    // Print results
    console.log('\n' + '='.repeat(60))
    console.log('VALIDATION RESULTS')
    console.log('='.repeat(60))
    
    if (errors.length === 0) {
      console.log('✅ No validation errors found!')
    } else {
      console.log(`❌ Found ${errors.length} validation errors:\n`)
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.field}`)
        console.log(`   Issue: ${error.issue}`)
        console.log(`   Fix: ${error.suggestion}\n`)
      })
    }
    
    // Show page structure
    console.log('\n📊 Page Structure Summary:')
    console.log(`- Title: ${page.title}`)
    console.log(`- Slug: ${page.slug?.current}`)
    console.log(`- Content blocks: ${page.contentBlocks?.length || 0}`)
    
    if (page.contentBlocks) {
      const blockTypes = page.contentBlocks.reduce((acc: any, block: any) => {
        acc[block._type] = (acc[block._type] || 0) + 1
        return acc
      }, {})
      
      console.log('\n📦 Content Block Types:')
      Object.entries(blockTypes).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run validation
validatePrognoserPage()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })