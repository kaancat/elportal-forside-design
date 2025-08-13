import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function updateElprisberegnerWithAllTips() {
  try {
    console.log('🔍 Fetching all energy tips from Sanity...')
    
    // Query all energy tips ordered by priority
    const tipsQuery = `*[_type == "energyTip"] | order(priority asc, _createdAt asc) {
      _id,
      _key,
      title,
      slug,
      category,
      shortDescription,
      savingsPotential,
      difficulty,
      icon,
      priority
    }`
    
    const allTips = await client.fetch(tipsQuery)
    console.log(`✅ Found ${allTips.length} energy tips`)
    
    // Group tips by category for verification
    const tipsByCategory = allTips.reduce((acc: any, tip: any) => {
      acc[tip.category] = (acc[tip.category] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📊 Tips by category:')
    Object.entries(tipsByCategory).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count} tips`)
    })
    
    console.log('\n🔍 Fetching the elprisberegner page...')
    
    // Find the elprisberegner page
    const pageQuery = `*[_type == "page" && slug.current == "elprisberegner"][0]`
    const page = await client.fetch(pageQuery)
    
    if (!page) {
      console.error('❌ Elprisberegner page not found!')
      return
    }
    
    console.log('✅ Found elprisberegner page:', page._id)
    console.log('📦 Current contentBlocks count:', page.contentBlocks?.length)
    
    // Create references to all tips
    const tipReferences = allTips.map((tip: any) => ({
      _type: 'reference',
      _ref: tip._id,
      _key: tip._id // Use _id as key for uniqueness
    }))
    
    console.log(`\n🔗 Created ${tipReferences.length} tip references`)
    
    // Find and update the energyTipsSection in contentBlocks
    let energyTipsSectionFound = false
    const updatedBlocks = page.contentBlocks.map((block: any) => {
      if (block._type === 'energyTipsSection') {
        energyTipsSectionFound = true
        console.log('\n✨ Found energyTipsSection, updating with all tips...')
        
        // Preserve existing settings but update tips
        return {
          ...block,
          title: block.title || '50 Praktiske Energispare Tips',
          subtitle: block.subtitle || 'Følg disse simple råd for at reducere dit energiforbrug og spare penge',
          tips: tipReferences, // Add all tip references
          showCategories: ['daily_habits', 'heating', 'lighting', 'appliances', 'insulation', 'smart_tech'],
          displayMode: block.displayMode || 'tabs',
          showDifficultyBadges: block.showDifficultyBadges !== false,
          showSavingsPotential: block.showSavingsPotential !== false,
          maxTipsPerCategory: 0, // Show all tips (0 = no limit)
          defaultCategory: block.defaultCategory || 'daily_habits',
          headerAlignment: block.headerAlignment || 'left'
        }
      }
      return block
    })
    
    if (!energyTipsSectionFound) {
      console.error('❌ No energyTipsSection found in the page!')
      console.log('\n📋 Available content blocks:')
      page.contentBlocks.forEach((block: any, index: number) => {
        console.log(`  ${index + 1}. ${block._type}`)
      })
      return
    }
    
    console.log('\n💾 Updating the page with all tips...')
    
    // Update the document
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedBlocks })
      .commit()
    
    console.log('\n✅ Successfully updated elprisberegner page with all', allTips.length, 'energy tips!')
    console.log('🔗 View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;' + result._id)
    console.log('🌐 View on website: https://www.dinelportal.dk/elprisberegner')
    
    // Verify the update
    console.log('\n🔍 Verifying update...')
    const verifyQuery = `*[_type == "page" && slug.current == "elprisberegner"][0] {
      contentBlocks[_type == "energyTipsSection"][0] {
        _type,
        title,
        "tipsCount": count(tips)
      }
    }`
    
    const verification = await client.fetch(verifyQuery)
    if (verification?.contentBlocks?.[0]) {
      const section = verification.contentBlocks[0]
      console.log(`✅ Verification successful: Section now has ${section.tipsCount} tips`)
    } else {
      console.log('⚠️ Could not verify update, but it should be successful')
    }
    
  } catch (error) {
    console.error('❌ Error updating page:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  }
}

// Run the update
updateElprisberegnerWithAllTips()