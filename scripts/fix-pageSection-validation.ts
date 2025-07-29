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

interface InvalidBlock {
  pageId: string
  pageTitle: string
  sectionIndex: number
  sectionTitle: string
  invalidBlock: any
  blockIndex: number
}

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

async function findInvalidPageSections() {
  console.log(chalk.blue('🔍 Finding pageSections with invalid nested components...\n'))
  
  const query = `*[_type in ["page", "homePage"]]{
    _id,
    _type,
    title,
    "slug": slug.current,
    contentBlocks[_type == "pageSection"]{
      _key,
      _type,
      title,
      content
    }
  }`
  
  const pages = await client.fetch(query)
  const invalidBlocks: InvalidBlock[] = []
  
  for (const page of pages) {
    if (!page.contentBlocks) continue
    
    const pageSections = page.contentBlocks.filter(b => b._type === 'pageSection')
    
    for (let sectionIndex = 0; sectionIndex < pageSections.length; sectionIndex++) {
      const section = pageSections[sectionIndex]
      
      if (section.content && Array.isArray(section.content)) {
        section.content.forEach((block, blockIndex) => {
          if (INVALID_TYPES_IN_PAGESECTION.includes(block._type)) {
            invalidBlocks.push({
              pageId: page._id,
              pageTitle: page.title || page._id,
              sectionIndex,
              sectionTitle: section.title || 'Untitled Section',
              invalidBlock: block,
              blockIndex
            })
          }
        })
      }
    }
  }
  
  return { pages, invalidBlocks }
}

function extractTextFromBlock(block: any): any[] {
  const extractedBlocks: any[] = []
  
  // Extract from valueProposition
  if (block._type === 'valueProposition') {
    // Add heading as H2
    if (block.heading) {
      extractedBlocks.push({
        _type: 'block',
        _key: `extracted-h2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        style: 'h2',
        children: [{
          _type: 'span',
          _key: `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: block.heading,
          marks: []
        }],
        markDefs: []
      })
    }
    
    // Add subheading as normal text
    if (block.subheading) {
      extractedBlocks.push({
        _type: 'block',
        _key: `extracted-sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: block.subheading,
          marks: []
        }],
        markDefs: []
      })
    }
    
    // Extract content blocks if they exist
    if (block.content && Array.isArray(block.content)) {
      extractedBlocks.push(...block.content)
    }
  }
  
  // Extract from priceExampleTable
  else if (block._type === 'priceExampleTable') {
    // Add title as H2
    if (block.title) {
      extractedBlocks.push({
        _type: 'block',
        _key: `extracted-h2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        style: 'h2',
        children: [{
          _type: 'span',
          _key: `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: block.title,
          marks: []
        }],
        markDefs: []
      })
    }
    
    // Add subtitle
    if (block.subtitle) {
      extractedBlocks.push({
        _type: 'block',
        _key: `extracted-sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: block.subtitle,
          marks: []
        }],
        markDefs: []
      })
    }
    
    // Extract description blocks if they exist
    if (block.description && Array.isArray(block.description)) {
      extractedBlocks.push(...block.description)
    }
  }
  
  return extractedBlocks
}

async function fixPage(pageId: string, invalidBlocksForPage: InvalidBlock[]) {
  console.log(chalk.blue(`\n🔧 Fixing page: ${pageId}`))
  
  // Fetch the full page
  const page = await client.fetch(`*[_id == $id][0]`, { id: pageId })
  if (!page) {
    console.log(chalk.red('   Page not found'))
    return
  }
  
  // Group invalid blocks by section
  const blocksBySection = invalidBlocksForPage.reduce((acc, item) => {
    const key = `${item.sectionIndex}`
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
  
  // Process the contentBlocks
  const updatedContentBlocks = [...page.contentBlocks]
  const newTopLevelBlocks = []
  
  // Process each section with invalid blocks
  for (const [sectionIndexStr, sectionInvalidBlocks] of Object.entries(blocksBySection)) {
    const sectionIndex = parseInt(sectionIndexStr)
    const section = updatedContentBlocks[sectionIndex]
    
    if (!section || section._type !== 'pageSection') continue
    
    console.log(chalk.yellow(`\n   Processing section ${sectionIndex}: "${section.title}"`))
    
    // Extract text content and remove invalid blocks
    const newContent = []
    const extractedComponents = []
    
    for (let i = 0; i < section.content.length; i++) {
      const block = section.content[i]
      
      if (INVALID_TYPES_IN_PAGESECTION.includes(block._type)) {
        console.log(chalk.cyan(`     - Extracting ${block._type} at position ${i}`))
        
        // Extract text content
        const extractedText = extractTextFromBlock(block)
        newContent.push(...extractedText)
        
        // Keep the component for top-level insertion
        extractedComponents.push({
          component: block,
          originalSectionIndex: sectionIndex
        })
      } else {
        // Keep valid blocks as-is
        newContent.push(block)
      }
    }
    
    // Update the section's content
    updatedContentBlocks[sectionIndex].content = newContent
    
    // Store extracted components to add later
    for (const item of extractedComponents) {
      newTopLevelBlocks.push({
        component: item.component,
        insertAfterIndex: sectionIndex
      })
    }
  }
  
  // Now insert the extracted components at the correct positions
  // Sort by insert position in reverse order to maintain correct indices
  newTopLevelBlocks.sort((a, b) => b.insertAfterIndex - a.insertAfterIndex)
  
  for (const item of newTopLevelBlocks) {
    const insertPos = item.insertAfterIndex + 1
    updatedContentBlocks.splice(insertPos, 0, item.component)
    console.log(chalk.green(`     ✓ Moved ${item.component._type} to position ${insertPos}`))
  }
  
  // Update the page
  try {
    const result = await client
      .patch(pageId)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log(chalk.green(`   ✅ Successfully fixed page`))
    return result
  } catch (error) {
    console.log(chalk.red(`   ❌ Error fixing page: ${error.message}`))
  }
}

async function main() {
  try {
    const { pages, invalidBlocks } = await findInvalidPageSections()
    
    if (invalidBlocks.length === 0) {
      console.log(chalk.green('✅ No invalid blocks found! All pageSections are properly structured.'))
      return
    }
    
    console.log(chalk.red(`\n❌ Found ${invalidBlocks.length} invalid blocks across pages:\n`))
    
    // Group by page
    const blocksByPage = invalidBlocks.reduce((acc, item) => {
      if (!acc[item.pageId]) {
        acc[item.pageId] = {
          pageTitle: item.pageTitle,
          blocks: []
        }
      }
      acc[item.pageId].blocks.push(item)
      return acc
    }, {})
    
    // Show summary
    Object.entries(blocksByPage).forEach(([pageId, data]) => {
      console.log(chalk.yellow(`📄 ${data.pageTitle}`))
      console.log(chalk.gray(`   ID: ${pageId}`))
      console.log(chalk.gray(`   Invalid blocks: ${data.blocks.length}`))
      
      data.blocks.forEach(block => {
        console.log(chalk.red(`     - ${block.invalidBlock._type} in section "${block.sectionTitle}"`))
      })
      console.log('')
    })
    
    console.log(chalk.blue('\n🚀 Starting fixes...\n'))
    
    // Fix each page
    for (const [pageId, data] of Object.entries(blocksByPage)) {
      await fixPage(pageId, data.blocks)
    }
    
    console.log(chalk.green('\n\n✅ All fixes completed!'))
    console.log(chalk.blue('\nNext steps:'))
    console.log('1. Check the pages in Sanity Studio')
    console.log('2. Verify no validation errors remain')
    console.log('3. Test frontend rendering')
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

main()