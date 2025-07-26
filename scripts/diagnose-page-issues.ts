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

async function diagnosePageIssues() {
  console.log('🔍 Diagnosing Historiske Priser Page Issues\n')
  console.log('=' .repeat(60))
  
  const pageId = 'qgCxJyBbKpvhb2oGYjlhjr'
  
  // Fetch the page
  const page = await client.fetch(`*[_id == "${pageId}"][0]`)
  
  if (!page) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('✅ Found page:', page.title)
  console.log(`📊 Total content blocks: ${page.contentBlocks?.length || 0}\n`)
  
  // 1. Check for duplicate blocks
  console.log('🔍 CHECKING FOR DUPLICATE BLOCKS:')
  console.log('-'.repeat(60))
  
  const blockTypeCounts: Record<string, number> = {}
  const duplicateBlocks: any[] = []
  
  page.contentBlocks?.forEach((block: any, index: number) => {
    blockTypeCounts[block._type] = (blockTypeCounts[block._type] || 0) + 1
    
    // Find specific duplicates
    if (block._type === 'regionalComparison' || 
        block._type === 'pricingComparison' || 
        block._type === 'dailyPriceTimeline') {
      duplicateBlocks.push({ index, type: block._type, title: block.title })
    }
  })
  
  // Report duplicates
  Object.entries(blockTypeCounts).forEach(([type, count]) => {
    if (count > 1) {
      console.log(`⚠️  ${type}: ${count} instances`)
    }
  })
  
  if (duplicateBlocks.length > 0) {
    console.log('\n📍 New component blocks found:')
    duplicateBlocks.forEach(block => {
      console.log(`   - Block ${block.index}: ${block.type} - "${block.title || 'No title'}"`)
    })
  }
  
  // 2. Check icon issues in featureList
  console.log('\n\n🔍 CHECKING ICON ISSUES:')
  console.log('-'.repeat(60))
  
  const featureLists = page.contentBlocks?.filter((b: any) => b._type === 'featureList') || []
  
  featureLists.forEach((block: any, idx: number) => {
    console.log(`\n📋 FeatureList ${idx + 1}: "${block.title}"`)
    block.features?.forEach((feature: any, fIdx: number) => {
      if (feature.icon) {
        console.log(`   Feature ${fIdx + 1}: ${feature.title}`)
        console.log(`     Icon data:`, JSON.stringify(feature.icon, null, 2))
        
        // Check for URL in metadata
        if (feature.icon.metadata?.url) {
          console.log(`     ⚠️  ISSUE: Icon has URL (${feature.icon.metadata.url})`)
          console.log(`     ✅ FIX: Should use icon name only`)
        }
      }
    })
  })
  
  // 3. Check problematic component structures
  console.log('\n\n🔍 CHECKING NEW COMPONENT STRUCTURES:')
  console.log('-'.repeat(60))
  
  const newComponentTypes = ['regionalComparison', 'pricingComparison', 'dailyPriceTimeline', 'infoCardsSection']
  
  page.contentBlocks?.forEach((block: any, index: number) => {
    if (newComponentTypes.includes(block._type)) {
      console.log(`\n📦 Block ${index}: ${block._type}`)
      console.log('   Structure:', Object.keys(block).join(', '))
      
      // Check for common issues
      if (!block._key) {
        console.log('   ❌ Missing _key!')
      }
      
      // Type-specific checks
      if (block._type === 'regionalComparison') {
        console.log('   DK1 Features:', block.dk1Features)
        console.log('   DK2 Features:', block.dk2Features)
      } else if (block._type === 'dailyPriceTimeline') {
        console.log('   Time slots:', block.timeSlots?.length || 0)
      } else if (block._type === 'pricingComparison') {
        console.log('   Fixed advantages:', block.fixedPriceAdvantages?.length || 0)
        console.log('   Variable advantages:', block.variablePriceAdvantages?.length || 0)
      }
    }
  })
  
  // 4. Generate fix recommendations
  console.log('\n\n📝 RECOMMENDED FIXES:')
  console.log('-'.repeat(60))
  
  let fixCount = 0
  
  // Fix 1: Remove duplicates
  if (Object.values(blockTypeCounts).some(count => count > 1)) {
    fixCount++
    console.log(`\n${fixCount}. Remove duplicate blocks:`)
    console.log('   - Keep only one instance of each component type')
    console.log('   - Merge content if needed')
  }
  
  // Fix 2: Fix icons
  if (featureLists.some((fl: any) => fl.features?.some((f: any) => f.icon?.metadata?.url))) {
    fixCount++
    console.log(`\n${fixCount}. Fix icon metadata:`)
    console.log('   - Remove URL references')
    console.log('   - Use only icon names (flower, sun, leaf, snowflake)')
  }
  
  // Fix 3: Component issues
  if (duplicateBlocks.length > 0) {
    fixCount++
    console.log(`\n${fixCount}. Debug component rendering:`)
    console.log('   - Check browser console for component-specific errors')
    console.log('   - Verify all required fields are present')
    console.log('   - Test components in isolation')
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ Diagnosis complete!')
}

diagnosePageIssues().catch(console.error)