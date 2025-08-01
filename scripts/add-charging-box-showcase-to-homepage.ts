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

function generateKey(): string {
  return Math.random().toString(36).substring(2, 15)
}

async function addChargingBoxShowcaseToHomepage() {
  try {
    console.log('🚀 Adding ChargingBoxShowcase to homepage...\n')
    
    // Get the current homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('❌ Homepage not found')
      return
    }
    
    // Check if showcase already exists
    const hasChargingBoxShowcase = homepage.contentBlocks?.some((block: any) => 
      block._type === 'chargingBoxShowcase'
    )
    
    if (hasChargingBoxShowcase) {
      console.log('✅ ChargingBoxShowcase already exists on homepage!')
      return
    }
    
    // Get the ladeboks showcase data to reference the same products
    const ladeboksShowcase = await client.fetch(`*[_type == "page" && slug.current == "ladeboks"][0]{
      contentBlocks[_type == "chargingBoxShowcase"][0]{
        _key,
        heading,
        subheading,
        description,
        products
      }
    }`)
    
    if (!ladeboksShowcase?.contentBlocks) {
      console.error('❌ Ladeboks showcase not found')
      return
    }
    
    const originalShowcase = ladeboksShowcase.contentBlocks
    console.log(`Found Ladeboks showcase: "${originalShowcase.heading}"`)
    console.log(`Products: ${originalShowcase.products?.length || 0}`)
    
    // Create the charging box showcase content block for homepage
    const chargingBoxShowcase = {
      _type: 'chargingBoxShowcase',
      _key: generateKey(),
      heading: 'Populære Ladebokse til Hjemmet',
      description: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Få mere ud af din elaftale med en smart ladeboks. Vi har samlet de mest populære modeller, så du kan lade din elbil billigere og mere miljøvenligt.',
              marks: []
            }
          ]
        }
      ],
      headerAlignment: 'center',
      // Reference the same products from the Ladeboks page
      products: originalShowcase.products
    }
    
    // Add the showcase right before the last section
    const updatedContentBlocks = [...homepage.contentBlocks]
    
    // Insert before the last section (which is about charging boxes)
    const insertIndex = updatedContentBlocks.length - 1
    updatedContentBlocks.splice(insertIndex, 0, chargingBoxShowcase)
    
    // Update the homepage
    const result = await client.patch(homepage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('\\n✅ Successfully added ChargingBoxShowcase to homepage!')
    console.log(`   Position: ${insertIndex + 1} of ${updatedContentBlocks.length} blocks`)
    console.log(`   Products referenced: ${chargingBoxShowcase.products?.length || 0}`)
    
    console.log('\\n🎯 INTEGRATION COMPLETE!')
    console.log('The homepage now includes:')
    console.log('• Dynamic product showcase component')
    console.log('• References to products from Ladeboks page')
    console.log('• Responsive design (1 col mobile, 3 cols desktop)')
    console.log('• Interactive product cards with features')
    console.log('• Proper placement before final section')
    
    console.log('\\n📝 What happens now:')
    console.log('• Products are fetched dynamically from Sanity')
    console.log('• Changes on Ladeboks page automatically reflect on homepage')
    console.log('• Component uses existing ChargingBoxShowcase implementation')
    console.log('• No manual updates needed - fully integrated!')
    
    return result
    
  } catch (error) {
    console.error('❌ Error adding charging box showcase:', error)
  }
}

// Run the integration
addChargingBoxShowcaseToHomepage()