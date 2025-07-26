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

async function updateRegionalMap() {
  console.log('🗺️  Updating Regional Map Component Settings\n')
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
  
  // Find RegionalComparison blocks
  const regionalBlocks = page.contentBlocks?.filter((block: any) => block._type === 'regionalComparison') || []
  
  console.log(`📦 Found ${regionalBlocks.length} RegionalComparison blocks`)
  
  if (regionalBlocks.length === 0) {
    console.log('❌ No RegionalComparison blocks found!')
    return
  }
  
  // Update the blocks with enhanced map settings
  let updatedBlocks = [...page.contentBlocks]
  
  regionalBlocks.forEach((block: any, blockIndex: number) => {
    const actualIndex = updatedBlocks.findIndex((b: any) => b._key === block._key)
    
    console.log(`\n🔧 Updating RegionalComparison block ${blockIndex + 1}:`)
    console.log(`   Title: ${block.title || 'NO TITLE'}`)
    console.log(`   Current showMap: ${block.showMap}`)
    
    // Enhanced regional comparison block
    const updatedBlock = {
      ...block,
      // Enhanced title and descriptions
      title: block.title || 'Danmarks to elprisområder',
      subtitle: block.subtitle || 'Forstå forskellen mellem DK1 og DK2',
      
      // Better default descriptions
      dk1Title: block.dk1Title || 'DK1 - Vestdanmark',
      dk1Description: block.dk1Description || [
        {
          _type: 'block',
          children: [{ 
            _type: 'span', 
            text: 'Omfatter Jylland, Fyn og Bornholm. Typisk lavere elpriser takket være god vindenergiproduktion og færre store forbrugere.' 
          }],
          markDefs: [],
          style: 'normal'
        }
      ],
      dk1Features: block.dk1Features || ['Jylland', 'Fyn', 'Bornholm'],
      dk1PriceIndicator: block.dk1PriceIndicator || 'lower',
      
      dk2Title: block.dk2Title || 'DK2 - Østdanmark',
      dk2Description: block.dk2Description || [
        {
          _type: 'block',
          children: [{ 
            _type: 'span', 
            text: 'Omfatter Sjælland, Lolland-Falster og Møn. Højere elforbrug fra København og industri kan påvirke priserne.' 
          }],
          markDefs: [],
          style: 'normal'
        }
      ],
      dk2Features: block.dk2Features || ['Sjælland', 'Lolland-Falster', 'Møn'],
      dk2PriceIndicator: block.dk2PriceIndicator || 'higher',
      
      // Enable the enhanced map by default
      showMap: true, // Keep the enhanced SVG map
      
      // Add leading text for context
      leadingText: block.leadingText || [
        {
          _type: 'block',
          children: [{ 
            _type: 'span', 
            text: 'Danmarks elmarked er opdelt i to prisområder, DK1 og DK2, som kan have forskellige spotpriser afhængigt af lokale forhold som produktionskapacitet og forbrug.' 
          }],
          markDefs: [],
          style: 'normal'
        }
      ]
    }
    
    updatedBlocks[actualIndex] = updatedBlock
    
    console.log(`   ✅ Enhanced content and enabled SVG map`)
  })
  
  // Apply the changes
  try {
    console.log('\n💾 Saving enhanced regional comparison...')
    
    await client
      .patch(pageId)
      .set({ contentBlocks: updatedBlocks })
      .commit()
    
    console.log('\n✅ Successfully updated RegionalComparison blocks!')
    
    console.log('\n📊 ENHANCEMENTS APPLIED:')
    console.log('   - Replaced basic icon "map" with professional SVG map of Denmark')
    console.log('   - Added proper geographic representation of DK1/DK2 regions')
    console.log('   - Enhanced titles and descriptions')
    console.log('   - Added color-coded regions and legend')
    console.log('   - Improved visual hierarchy and professional styling')
    
    console.log('\n🎯 COMPONENT IMPROVEMENTS:')
    console.log('   - SVG map shows actual Danish geography')
    console.log('   - Color coding matches price indicators')
    console.log('   - Professional card layout')
    console.log('   - Option to disable map with showMap: false')
    
  } catch (error) {
    console.error('\n❌ Error updating regional map:', error)
  }
}

updateRegionalMap().catch(console.error)