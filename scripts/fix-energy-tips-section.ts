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

async function fixEnergyTipsSection() {
  try {
    console.log('Fetching the Energibesparende Tips page...')
    
    // Find the page document
    const query = `*[_type == "page" && slug.current == "energibesparende-tips-2025"][0]`
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('Page not found!')
      return
    }
    
    console.log('Found page:', page._id)
    console.log('Current contentBlocks count:', page.contentBlocks?.length)
    
    // Find and update the energyTipsSection
    const updatedBlocks = page.contentBlocks.map((block: any) => {
      if (block._type === 'energyTipsSection') {
        console.log('Found energyTipsSection, updating title...')
        return {
          ...block,
          title: '50 Konkrete Energispare Tips',
          subtitle: 'Praktiske råd, du kan implementere i dag for at reducere dit elforbrug',
          displayMode: 'tabs',
          showCategories: ['daily_habits', 'heating', 'lighting', 'appliances', 'insulation', 'smart_tech'],
          showDifficultyBadges: true,
          showSavingsPotential: true,
          maxTipsPerCategory: 0 // Show all tips
        }
      }
      return block
    })
    
    // Update the document
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedBlocks })
      .commit()
    
    console.log('✅ Successfully updated energyTipsSection title to "50 Konkrete Energispare Tips"')
    console.log('View at: https://dinelportal.sanity.studio/structure/page;' + result._id)
    
  } catch (error) {
    console.error('❌ Error updating page:', error)
    process.exit(1)
  }
}

fixEnergyTipsSection()