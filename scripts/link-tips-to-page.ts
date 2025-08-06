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

async function linkTipsToPage() {
  try {
    console.log('🔗 Linking energy tips to page...\n')
    
    // Step 1: Fetch all energy tips
    console.log('📋 Step 1: Fetching all energy tips...')
    const tips = await client.fetch(`*[_type == "energyTip"] | order(category asc, priority asc)`)
    
    if (tips.length === 0) {
      console.error('❌ No energy tips found! Please run deploy-complete-energy-tips.ts first.')
      process.exit(1)
    }
    
    console.log(`Found ${tips.length} energy tips\n`)
    
    // Create references for all tips
    const tipReferences = tips.map((tip: any) => ({
      _type: 'reference',
      _ref: tip._id,
      _key: `ref-${tip._id}`
    }))
    
    // Step 2: Find the energibesparende-tips-2025 page
    console.log('📋 Step 2: Finding the energibesparende-tips-2025 page...')
    const page = await client.fetch(
      `*[_type == "page" && slug.current == "energibesparende-tips-2025"][0]`
    )
    
    if (!page) {
      console.error('❌ Page not found!')
      process.exit(1)
    }
    
    console.log(`Found page: ${page.title || page.slug.current}\n`)
    
    // Step 3: Update the energyTipsSection with tip references
    console.log('📋 Step 3: Updating energyTipsSection with tip references...')
    
    const updatedBlocks = page.contentBlocks.map((block: any) => {
      if (block._type === 'energyTipsSection') {
        console.log('Found energyTipsSection block')
        console.log(`Current config: ${block.title}`)
        console.log(`Adding ${tipReferences.length} tip references...`)
        
        return {
          ...block,
          tips: tipReferences
        }
      }
      return block
    })
    
    // Step 4: Save the updated page
    console.log('\n📋 Step 4: Saving updated page...')
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedBlocks })
      .commit()
    
    console.log('\n✅ Success! Energy tips are now linked to the page.')
    console.log(`\n📱 View in Sanity Studio:`)
    console.log(`   https://dinelportal.sanity.studio/structure/page;${result._id}`)
    console.log(`\n🌐 View on frontend:`)
    console.log(`   http://localhost:3000/energibesparende-tips-2025`)
    
  } catch (error) {
    console.error('❌ Error linking tips:', error)
    process.exit(1)
  }
}

// Run the script
linkTipsToPage()