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

async function verifyElprisberegnerTips() {
  try {
    console.log('🔍 Fetching the elprisberegner page with full tip data...')
    
    // Query matching the frontend query structure
    const pageQuery = `*[_type == "page" && slug.current == "elprisberegner"][0] {
      _id,
      title,
      slug,
      contentBlocks[] {
        ...,
        _type == "energyTipsSection" => {
          _key,
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
          defaultCategory,
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
      }
    }`
    
    const page = await client.fetch(pageQuery)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('✅ Found page:', page.title)
    console.log('📦 Total content blocks:', page.contentBlocks?.length)
    
    // Find the energyTipsSection
    const energyTipsSection = page.contentBlocks?.find((block: any) => block._type === 'energyTipsSection')
    
    if (!energyTipsSection) {
      console.error('❌ No energyTipsSection found in the page!')
      return
    }
    
    console.log('\n✨ Energy Tips Section Details:')
    console.log('  - Title:', energyTipsSection.title)
    console.log('  - Subtitle:', energyTipsSection.subtitle)
    console.log('  - Display Mode:', energyTipsSection.displayMode)
    console.log('  - Default Category:', energyTipsSection.defaultCategory)
    console.log('  - Max Tips Per Category:', energyTipsSection.maxTipsPerCategory || 'No limit')
    console.log('  - Show Difficulty Badges:', energyTipsSection.showDifficultyBadges)
    console.log('  - Show Savings Potential:', energyTipsSection.showSavingsPotential)
    
    if (energyTipsSection.tips && Array.isArray(energyTipsSection.tips)) {
      console.log('\n📊 Tips Statistics:')
      console.log('  - Total tips loaded:', energyTipsSection.tips.length)
      
      // Group by category
      const tipsByCategory = energyTipsSection.tips.reduce((acc: any, tip: any) => {
        acc[tip.category] = (acc[tip.category] || [])
        acc[tip.category].push(tip)
        return acc
      }, {})
      
      console.log('\n📁 Tips by Category:')
      const categoryNames: Record<string, string> = {
        daily_habits: 'Daglige vaner',
        heating: 'Opvarmning',
        lighting: 'Belysning',
        appliances: 'Apparater',
        insulation: 'Isolering',
        smart_tech: 'Smart teknologi'
      }
      
      Object.entries(tipsByCategory).forEach(([category, tips]: [string, any]) => {
        console.log(`\n  ${categoryNames[category] || category} (${tips.length} tips):`)
        tips.slice(0, 3).forEach((tip: any, index: number) => {
          const savings = tip.savingsPotential === 'high' ? '💰💰💰' : 
                          tip.savingsPotential === 'medium' ? '💰💰' : '💰'
          const difficulty = tip.difficulty === 'easy' ? '🟢' : 
                            tip.difficulty === 'medium' ? '🟡' : '🔴'
          console.log(`    ${index + 1}. ${tip.title}`)
          console.log(`       ${savings} ${difficulty} "${tip.shortDescription}"`)
        })
        if (tips.length > 3) {
          console.log(`    ... and ${tips.length - 3} more`)
        }
      })
      
      // Check for any tips without required fields
      const incompleteTips = energyTipsSection.tips.filter((tip: any) => 
        !tip.title || !tip.category || !tip.shortDescription
      )
      
      if (incompleteTips.length > 0) {
        console.log('\n⚠️ Warning: Found', incompleteTips.length, 'tips with missing required fields')
      } else {
        console.log('\n✅ All tips have required fields!')
      }
      
    } else {
      console.error('❌ No tips found or tips is not an array!')
    }
    
    console.log('\n🌐 View the page at: https://www.dinelportal.dk/elprisberegner')
    console.log('📝 View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;' + page._id)
    
  } catch (error) {
    console.error('❌ Error verifying page:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    process.exit(1)
  }
}

// Run the verification
verifyElprisberegnerTips()