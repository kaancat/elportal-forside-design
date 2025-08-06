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

async function debugTipsIssue() {
  console.log('🔍 Debugging Energy Tips Issue...\n')
  
  // 1. Check tips by category
  console.log('1. Checking tips distribution by category:')
  const tips = await client.fetch(`*[_type == 'energyTip'] | order(category asc, priority asc) {
    _id,
    title,
    category,
    priority
  }`)
  
  const byCategory: Record<string, any[]> = {}
  tips.forEach((tip: any) => {
    if (!byCategory[tip.category]) byCategory[tip.category] = []
    byCategory[tip.category].push(tip)
  })
  
  Object.entries(byCategory).forEach(([cat, catTips]) => {
    console.log(`   ${cat}: ${catTips.length} tips`)
  })
  console.log(`   Total: ${tips.length} tips\n`)
  
  // 2. Check what the page query returns
  console.log('2. Testing the actual GROQ query used by frontend:')
  const pageQuery = `*[_type == "page" && slug.current == "energibesparende-tips-2025"][0]{
    contentBlocks[_type == "energyTipsSection"][0]{
      _type,
      title,
      subtitle,
      showCategories,
      displayMode,
      headerAlignment,
      showDifficultyBadges,
      showSavingsPotential,
      showSavingsCalculator,
      maxTipsPerCategory,
      "tipsCount": count(tips),
      tips[]-> {
        _id,
        title,
        slug,
        category,
        shortDescription,
        savingsPotential,
        difficulty,
        icon,
        estimatedSavings,
        implementationTime,
        priority
      }
    }
  }`
  
  const result = await client.fetch(pageQuery)
  
  if (result?.contentBlocks) {
    const section = result.contentBlocks
    console.log(`   Tips fetched: ${section.tips?.length || 0}`)
    console.log(`   Display mode: ${section.displayMode}`)
    console.log(`   Show categories: ${section.showCategories?.join(', ')}`)
    console.log(`   Max tips per category: ${section.maxTipsPerCategory}`)
    
    // Check category distribution in fetched tips
    if (section.tips && section.tips.length > 0) {
      const fetchedByCategory: Record<string, number> = {}
      section.tips.forEach((tip: any) => {
        fetchedByCategory[tip.category] = (fetchedByCategory[tip.category] || 0) + 1
      })
      
      console.log('\n3. Distribution of fetched tips:')
      Object.entries(fetchedByCategory).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} tips`)
      })
    }
  }
  
  // 3. Check for any null/undefined values
  console.log('\n4. Checking for problematic tips:')
  const problematicTips = tips.filter((tip: any) => 
    !tip.title || !tip.category || !tip.shortDescription
  )
  
  if (problematicTips.length > 0) {
    console.log(`   Found ${problematicTips.length} tips with missing required fields`)
    problematicTips.forEach((tip: any) => {
      console.log(`   - ${tip._id}: Missing ${!tip.title ? 'title' : !tip.category ? 'category' : 'shortDescription'}`)
    })
  } else {
    console.log('   ✅ All tips have required fields')
  }
  
  // 4. Check if there's a mismatch in categories
  console.log('\n5. Checking category configuration:')
  const validCategories = ['daily_habits', 'heating', 'lighting', 'appliances', 'insulation', 'smart_tech']
  const tipsWithInvalidCategory = tips.filter((tip: any) => 
    !validCategories.includes(tip.category)
  )
  
  if (tipsWithInvalidCategory.length > 0) {
    console.log(`   ⚠️ Found ${tipsWithInvalidCategory.length} tips with invalid categories`)
  } else {
    console.log('   ✅ All tips have valid categories')
  }
}

debugTipsIssue()