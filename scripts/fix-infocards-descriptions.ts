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

async function fixInfoCardsDescriptions() {
  console.log('🔧 Fixing InfoCardsSection Seasonal Descriptions\n')
  console.log('=' .repeat(60))
  
  const pageId = 'qgCxJyBbKpvhb2oGYjlhjr'
  
  // Fetch the page
  const page = await client.fetch(`*[_id == "${pageId}"][0]`)
  
  if (!page) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('✅ Page found:', page.title)
  console.log(`📊 Total blocks: ${page.contentBlocks?.length || 0}\n`)
  
  // Find and fix InfoCardsSection blocks
  let fixedBlocks = page.contentBlocks.map((block: any) => {
    if (block._type === 'infoCardsSection' && block.title === 'Sæsonvariationer i Elpriser') {
      console.log('🔧 Fixing seasonal variations InfoCardsSection...')
      
      // Define complete seasonal cards with descriptions, icons, and colors
      const seasonalCards = [
        {
          title: 'Vinter (Dec-Feb)',
          description: [{
            _type: 'block',
            children: [{ 
              _type: 'span', 
              text: 'Højeste elpriser pga. øget varmeforbruget og lavere vindproduktion. Kul- og gaskraft supplerer ofte.' 
            }],
            markDefs: [],
            style: 'normal'
          }],
          icon: 'snowflake',
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        {
          title: 'Forår (Mar-Maj)',
          description: [{
            _type: 'block',
            children: [{ 
              _type: 'span', 
              text: 'Moderat prisniveau med stigende vindproduktion. Mindre varmeforbruget reducerer presset på elnettet.' 
            }],
            markDefs: [],
            style: 'normal'
          }],
          icon: 'flower',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50'
        },
        {
          title: 'Sommer (Jun-Aug)',
          description: [{
            _type: 'block',
            children: [{ 
              _type: 'span', 
              text: 'Laveste priser takket være høj solproduktion og reduceret energiforbruget til opvarmning.' 
            }],
            markDefs: [],
            style: 'normal'
          }],
          icon: 'sun',
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        },
        {
          title: 'Efterår (Sep-Nov)',
          description: [{
            _type: 'block',
            children: [{ 
              _type: 'span', 
              text: 'Stigende priser når opvarmningssæsonen starter og vindproduktionen bliver mere ustabil.' 
            }],
            markDefs: [],
            style: 'normal'
          }],
          icon: 'leaf',
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50'
        }
      ]
      
      const fixedBlock = {
        ...block,
        cards: seasonalCards,
        subtitle: 'Så meget varierer elpriserne gennem året',
        leadingText: [{
          _type: 'block',
          children: [{ 
            _type: 'span', 
            text: 'Elpriserne følger sæsonmønstrer påvirket af vejrforhold, forbrugerens behov og vedvarende energiproduktion. Her ser du de typiske prisforskelle gennem året:' 
          }],
          markDefs: [],
          style: 'normal'
        }]
      }
      
      console.log('   ✅ Added descriptions, colors, and leading text to all 4 seasonal cards')
      return fixedBlock
    }
    
    return block
  })
  
  // Apply the fixes
  try {
    console.log('\n💾 Saving InfoCardsSection fixes...')
    
    await client
      .patch(pageId)
      .set({ contentBlocks: fixedBlocks })
      .commit()
    
    console.log('\n✅ Successfully fixed InfoCardsSection seasonal descriptions!')
    console.log('\n📊 SUMMARY:')
    console.log('   - Added detailed descriptions to all 4 seasonal cards')
    console.log('   - Added appropriate icon colors (blue, green, yellow, orange)')
    console.log('   - Added matching background colors for better visual hierarchy')
    console.log('   - Added subtitle and leading text for better context')
    
    console.log('\n🎯 Next steps:')
    console.log('   1. Check frontend to see seasonal variations displaying properly')
    console.log('   2. Verify all cards show with descriptions and colors')
    console.log('   3. Test 4-column responsive layout')
    
  } catch (error) {
    console.error('\n❌ Error applying fixes:', error)
  }
}

fixInfoCardsDescriptions().catch(console.error)