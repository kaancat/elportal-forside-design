import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

async function checkPageValidation() {
  console.log('🔍 Checking Page Validation Status\n')
  console.log('=' .repeat(60))
  
  const pageId = 'f7ecf92783e749828f7281a6e5829d52'
  
  // Fetch the page with all content blocks
  const page = await client.fetch(`*[_id == "${pageId}"][0] {
    _id,
    _type,
    _rev,
    _updatedAt,
    title,
    slug,
    seoMetaTitle,
    seoMetaDescription,
    seoKeywords,
    contentBlocks[] {
      _type,
      _key,
      ...
    }
  }`)
  
  if (!page) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('📄 Page Details:')
  console.log(`   ID: ${page._id}`)
  console.log(`   Title: ${page.title}`)
  console.log(`   Slug: ${page.slug?.current || 'NO SLUG'}`)
  console.log(`   Last Updated: ${new Date(page._updatedAt).toLocaleString()}`)
  console.log(`   Revision: ${page._rev}`)
  console.log(`   Total Blocks: ${page.contentBlocks?.length || 0}`)
  
  console.log('\n📊 Content Block Types:')
  const blockTypes: { [key: string]: number } = {}
  let missingKeys = 0
  let totalArrayItems = 0
  let itemsWithoutKeys = 0
  
  page.contentBlocks?.forEach((block: any, index: number) => {
    // Count block types
    blockTypes[block._type] = (blockTypes[block._type] || 0) + 1
    
    // Check for missing _key on block
    if (!block._key) {
      console.log(`   ⚠️  Block ${index + 1} (${block._type}) missing _key!`)
      missingKeys++
    }
    
    // Check for arrays within blocks that might need _key properties
    Object.keys(block).forEach(key => {
      if (Array.isArray(block[key]) && key !== 'marks' && key !== 'markDefs') {
        block[key].forEach((item: any, itemIndex: number) => {
          if (typeof item === 'object' && item !== null) {
            totalArrayItems++
            if (!item._key) {
              console.log(`   ⚠️  ${block._type}.${key}[${itemIndex}] missing _key!`)
              itemsWithoutKeys++
            }
          }
        })
      }
    })
  })
  
  // Display block type summary
  Object.entries(blockTypes).sort().forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`)
  })
  
  console.log('\n🔍 Validation Summary:')
  console.log(`   Content Blocks with _key: ${page.contentBlocks?.length - missingKeys}/${page.contentBlocks?.length}`)
  console.log(`   Array items with _key: ${totalArrayItems - itemsWithoutKeys}/${totalArrayItems}`)
  
  if (missingKeys === 0 && itemsWithoutKeys === 0) {
    console.log('\n✅ All validation checks passed!')
    console.log('   All blocks and array items have proper _key properties.')
  } else {
    console.log('\n❌ Validation issues found:')
    if (missingKeys > 0) {
      console.log(`   - ${missingKeys} content blocks missing _key`)
    }
    if (itemsWithoutKeys > 0) {
      console.log(`   - ${itemsWithoutKeys} array items missing _key`)
    }
    console.log('\n   These issues may cause validation errors in the frontend.')
  }
  
  // Check specific known problematic blocks
  console.log('\n🎯 Specific Block Checks:')
  
  // Check InfoCardsSection
  const infoCards = page.contentBlocks?.filter((b: any) => b._type === 'infoCardsSection')
  if (infoCards?.length > 0) {
    console.log(`   InfoCardsSection: ${infoCards.length} found`)
    infoCards.forEach((block: any, idx: number) => {
      const cardsCount = block.cards?.length || 0
      const cardsWithKeys = block.cards?.filter((c: any) => c._key)?.length || 0
      console.log(`     Block ${idx + 1}: ${cardsWithKeys}/${cardsCount} cards have _key`)
    })
  }
  
  // Check FAQ sections
  const faqSections = page.contentBlocks?.filter((b: any) => b._type === 'faqSection')
  if (faqSections?.length > 0) {
    console.log(`   FAQ Sections: ${faqSections.length} found`)
    faqSections.forEach((block: any, idx: number) => {
      const itemsCount = block.items?.length || 0
      const itemsWithKeys = block.items?.filter((i: any) => i._key)?.length || 0
      console.log(`     Block ${idx + 1}: ${itemsWithKeys}/${itemsCount} items have _key`)
    })
  }
  
  console.log('\n✨ Page validation check complete!')
}

// Run the check
checkPageValidation().catch(console.error)