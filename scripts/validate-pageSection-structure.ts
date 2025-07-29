import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import chalk from 'chalk'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Types that are NOT allowed in pageSection.content
const INVALID_TYPES_IN_PAGESECTION = [
  'valueProposition',
  'priceExampleTable',
  'faqGroup',
  'featureList',
  'providerList',
  'hero',
  'heroWithCalculator',
  'callToActionSection',
  'chargingBoxShowcase',
  'applianceCalculator',
  'energyTipsSection',
  'regionalComparison',
  'pricingComparison',
  'dailyPriceTimeline',
  'infoCardsSection'
]

// Types that ARE allowed in pageSection.content
const ALLOWED_TYPES_IN_PAGESECTION = [
  'block',
  'image',
  'livePriceGraph',
  'renewableEnergyForecast',
  'monthlyProductionChart',
  'priceCalculator',
  'realPriceComparisonTable',
  'videoSection'
]

interface ValidationIssue {
  pageId: string
  pageTitle: string
  pageSlug?: string
  sectionIndex: number
  sectionTitle: string
  issue: 'invalid_type' | 'unknown_type'
  blockType: string
  blockIndex: number
}

async function validatePageSectionStructure() {
  try {
    console.log(chalk.blue('🔍 Validating pageSection structure across all pages...\n'))
    
    const query = `*[_type in ["page", "homePage"]]{
      _id,
      _type,
      title,
      "slug": slug.current,
      contentBlocks[_type == "pageSection"]{
        _key,
        _type,
        title,
        content[]{
          _type,
          _key
        }
      }
    }`
    
    const pages = await client.fetch(query)
    const issues: ValidationIssue[] = []
    
    console.log(chalk.green(`Found ${pages.length} pages to validate\n`))
    
    for (const page of pages) {
      if (!page.contentBlocks) continue
      
      const pageSections = page.contentBlocks.filter(b => b._type === 'pageSection')
      
      if (pageSections.length === 0) continue
      
      console.log(chalk.yellow(`Checking: ${page.title} (${pageSections.length} sections)`))
      
      for (let sectionIndex = 0; sectionIndex < pageSections.length; sectionIndex++) {
        const section = pageSections[sectionIndex]
        
        if (!section.content || !Array.isArray(section.content)) continue
        
        for (let blockIndex = 0; blockIndex < section.content.length; blockIndex++) {
          const block = section.content[blockIndex]
          
          if (INVALID_TYPES_IN_PAGESECTION.includes(block._type)) {
            issues.push({
              pageId: page._id,
              pageTitle: page.title || page._id,
              pageSlug: page.slug,
              sectionIndex,
              sectionTitle: section.title || 'Untitled Section',
              issue: 'invalid_type',
              blockType: block._type,
              blockIndex
            })
            console.log(chalk.red(`   ❌ Invalid type "${block._type}" in section "${section.title}"`))
          } else if (!ALLOWED_TYPES_IN_PAGESECTION.includes(block._type)) {
            issues.push({
              pageId: page._id,
              pageTitle: page.title || page._id,
              pageSlug: page.slug,
              sectionIndex,
              sectionTitle: section.title || 'Untitled Section',
              issue: 'unknown_type',
              blockType: block._type,
              blockIndex
            })
            console.log(chalk.orange(`   ⚠️  Unknown type "${block._type}" in section "${section.title}"`))
          }
        }
      }
      
      if (pageSections.some(s => s.content?.some(b => 
        INVALID_TYPES_IN_PAGESECTION.includes(b._type) || 
        !ALLOWED_TYPES_IN_PAGESECTION.includes(b._type)
      ))) {
        console.log('')
      } else {
        console.log(chalk.green('   ✅ All sections valid'))
      }
    }
    
    // Summary
    console.log(chalk.blue('\n\n📊 Validation Summary:'))
    console.log('=' * 50)
    
    if (issues.length === 0) {
      console.log(chalk.green('✅ All pageSection structures are valid!'))
      console.log(chalk.green('No nested invalid components found.'))
      return
    }
    
    console.log(chalk.red(`❌ Found ${issues.length} validation issues:\n`))
    
    // Group issues by type
    const invalidTypeIssues = issues.filter(i => i.issue === 'invalid_type')
    const unknownTypeIssues = issues.filter(i => i.issue === 'unknown_type')
    
    if (invalidTypeIssues.length > 0) {
      console.log(chalk.red(`🚨 CRITICAL - Invalid nested components (${invalidTypeIssues.length}):`))
      invalidTypeIssues.forEach(issue => {
        console.log(chalk.red(`   - ${issue.pageTitle}: ${issue.blockType} in "${issue.sectionTitle}"`))
        if (issue.pageSlug) {
          console.log(chalk.gray(`     URL: /${issue.pageSlug}`))
        }
      })
      console.log('')
      
      console.log(chalk.yellow('These components must be moved to top-level contentBlocks!'))
      console.log(chalk.yellow('Run: npx tsx scripts/fix-pageSection-validation.ts'))
      console.log('')
    }
    
    if (unknownTypeIssues.length > 0) {
      console.log(chalk.orange(`⚠️  Unknown types found (${unknownTypeIssues.length}):`))
      unknownTypeIssues.forEach(issue => {
        console.log(chalk.orange(`   - ${issue.pageTitle}: ${issue.blockType} in "${issue.sectionTitle}"`))
      })
      console.log('')
      
      console.log(chalk.blue('These types need to be reviewed:'))
      console.log('1. If they should be allowed, add them to the schema')
      console.log('2. If they should be top-level, move them out of pageSection.content')
      console.log('')
    }
    
    // Recommendations
    console.log(chalk.blue('💡 Recommendations:'))
    console.log('')
    console.log(chalk.white('Allowed in pageSection.content:'))
    ALLOWED_TYPES_IN_PAGESECTION.forEach(type => {
      console.log(chalk.green(`   ✅ ${type}`))
    })
    console.log('')
    console.log(chalk.white('Must be top-level contentBlocks:'))
    INVALID_TYPES_IN_PAGESECTION.forEach(type => {
      console.log(chalk.red(`   ❌ ${type}`))
    })
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

// Run validation when script is executed directly
validatePageSectionStructure()

export { validatePageSectionStructure }