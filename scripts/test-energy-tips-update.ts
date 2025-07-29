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

async function testEnergyTipsUpdate() {
  console.log('🧪 Testing Energy Tips Section Update with New Fields...\n')

  try {
    // Find a page with energy tips section
    const query = `*[_type == "page" && defined(contentBlocks[_type == "energyTipsSection"])][0] {
      _id,
      _rev,
      title,
      contentBlocks
    }`

    const page = await client.fetch(query)
    
    if (!page) {
      console.log('⚠️  No page found with energy tips section')
      return
    }

    console.log(`📄 Found page: ${page.title}`)
    console.log(`   ID: ${page._id}`)
    
    // Find energy tips sections and update them
    const updatedBlocks = page.contentBlocks.map((block: any) => {
      if (block._type === 'energyTipsSection') {
        console.log(`\n📝 Updating energy tips section:`)
        console.log(`   Current headerAlignment: ${block.headerAlignment || 'not set'}`)
        console.log(`   Current showSavingsCalculator: ${block.showSavingsCalculator || 'not set'}`)
        
        return {
          ...block,
          headerAlignment: block.headerAlignment || 'left',
          showSavingsCalculator: block.showSavingsCalculator !== undefined ? block.showSavingsCalculator : true
        }
      }
      return block
    })

    // Update the page
    console.log('\n💾 Saving updated page...')
    
    const result = await client
      .patch(page._id)
      .setIfMissing({ contentBlocks: [] })
      .set({ contentBlocks: updatedBlocks })
      .commit()

    console.log('✅ Page updated successfully!')
    
    // Verify the update
    const updatedPage = await client.fetch(`*[_id == "${page._id}"] {
      title,
      "energyTipsSections": contentBlocks[_type == "energyTipsSection"] {
        _type,
        headerAlignment,
        showSavingsCalculator
      }
    }[0]`)

    console.log('\n📊 Verification:')
    console.log(`   Page: ${updatedPage.title}`)
    updatedPage.energyTipsSections.forEach((section: any, index: number) => {
      console.log(`   Energy Tips Section ${index + 1}:`)
      console.log(`     - headerAlignment: ${section.headerAlignment}`)
      console.log(`     - showSavingsCalculator: ${section.showSavingsCalculator}`)
    })

    console.log('\n✨ Test completed successfully!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run with caution - this will update actual content
if (process.argv.includes('--execute')) {
  testEnergyTipsUpdate()
} else {
  console.log('⚠️  This script will update actual content in Sanity.')
  console.log('   Run with --execute flag to proceed:')
  console.log('   npx tsx scripts/test-energy-tips-update.ts --execute')
}