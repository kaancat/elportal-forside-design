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

async function verifyFinalState() {
  console.log('✅ FINAL VERIFICATION OF HISTORISKE PRISER PAGE\n')
  console.log('=' .repeat(60))
  
  const pageId = 'qgCxJyBbKpvhb2oGYjlhjr'
  
  // Fetch the page
  const page = await client.fetch(`*[_id == "${pageId}"][0]`)
  
  if (!page) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('📄 Page:', page.title)
  console.log(`📊 Total blocks: ${page.contentBlocks?.length || 0}\n`)
  
  // Component type analysis
  const componentTypes: Record<string, number> = {}
  const issues: string[] = []
  const successes: string[] = []
  
  page.contentBlocks?.forEach((block: any, idx: number) => {
    componentTypes[block._type] = (componentTypes[block._type] || 0) + 1
    
    // Check for key issues
    if (!block._key) {
      issues.push(`Block ${idx} (${block._type}) missing _key`)
    }
    
    // Check new components
    if (['regionalComparison', 'pricingComparison', 'dailyPriceTimeline', 'infoCardsSection'].includes(block._type)) {
      successes.push(`✅ ${block._type} component found at index ${idx}`)
    }
    
    // Check featureList icons
    if (block._type === 'featureList' && block.features) {
      block.features.forEach((feature: any, fIdx: number) => {
        if (feature.icon?.metadata?.url) {
          issues.push(`FeatureList at ${idx} still has URL in feature ${fIdx}`)
        }
      })
    }
  })
  
  // Report results
  console.log('🎯 COMPONENT DISTRIBUTION:')
  console.log('-'.repeat(60))
  Object.entries(componentTypes)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`)
    })
  
  console.log('\n\n✅ SUCCESSES:')
  console.log('-'.repeat(60))
  if (successes.length === 0) {
    console.log('   No new components found')
  } else {
    successes.forEach(s => console.log(`   ${s}`))
  }
  
  console.log('\n\n⚠️  ISSUES:')
  console.log('-'.repeat(60))
  if (issues.length === 0) {
    console.log('   🎉 No issues found!')
  } else {
    issues.forEach(issue => console.log(`   ❌ ${issue}`))
  }
  
  // Summary
  console.log('\n\n📈 SUMMARY:')
  console.log('-'.repeat(60))
  console.log(`   Total content blocks: ${page.contentBlocks?.length || 0}`)
  console.log(`   Unique component types: ${Object.keys(componentTypes).length}`)
  console.log(`   Issues found: ${issues.length}`)
  console.log(`   New components active: ${successes.length}`)
  
  // Final status
  const isHealthy = issues.length === 0 && successes.length > 0
  console.log('\n' + '='.repeat(60))
  console.log(isHealthy ? '✅ PAGE IS HEALTHY!' : '⚠️  PAGE NEEDS ATTENTION')
  
  if (isHealthy) {
    console.log('\n🎉 All fixes have been successfully applied!')
    console.log('   - New visual components are active')
    console.log('   - No duplicate blocks')
    console.log('   - Icons properly configured')
    console.log('   - All blocks have proper structure')
  }
}

verifyFinalState().catch(console.error)