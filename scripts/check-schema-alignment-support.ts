import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function checkSchemaAlignmentSupport() {
  try {
    console.log('🔍 Checking which components support alignment...\n')
    
    // Components we know about
    const componentsToCheck = [
      'hero',
      'heroWithCalculator',
      'valueProposition',
      'pageSection',
      'monthlyProductionChart',
      'renewableEnergyForecast',
      'co2EmissionsChart',
      'realPriceComparisonTable',
      'priceExampleTable',
      'infoCardsSection',
      'featureList',
      'priceCalculator',
      'providerList',
      'faqGroup',
      'callToActionSection'
    ]
    
    console.log('Components with alignment support based on our previous script:\n')
    
    console.log('✅ Components WITH headerAlignment:')
    console.log('   - pageSection')
    console.log('   - monthlyProductionChart')
    console.log('   - renewableEnergyForecast')
    console.log('   - co2EmissionsChart')
    console.log('   - realPriceComparisonTable')
    console.log('   - priceExampleTable')
    console.log('   - infoCardsSection')
    
    console.log('\n❓ Components that MAY have alignment:')
    console.log('   - hero (needs verification)')
    console.log('   - heroWithCalculator (needs verification)')
    
    console.log('\n❌ Components WITHOUT alignment:')
    console.log('   - valueProposition (confirmed - no alignment field)')
    console.log('   - featureList')
    console.log('   - priceCalculator')
    console.log('   - providerList')
    console.log('   - faqGroup')
    console.log('   - callToActionSection')
    
    // Let's check the hero components
    console.log('\n🔍 Checking hero component fields in homepage...')
    
    const homepage = await client.fetch(`*[_type == "homePage"][0]{
      contentBlocks[_type in ["hero", "heroWithCalculator"]]{
        _type,
        _key,
        headline,
        alignment
      }
    }`)
    
    if (homepage?.contentBlocks) {
      homepage.contentBlocks.forEach((hero: any) => {
        console.log(`\n${hero._type}:`)
        console.log(`   Has alignment field: ${hero.alignment ? 'Yes' : 'No'}`)
        if (hero.alignment) {
          console.log(`   Current value: "${hero.alignment}"`)
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
checkSchemaAlignmentSupport()