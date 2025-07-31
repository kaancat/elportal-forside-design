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

// Helper function to generate unique keys
function generateKey() {
  return Math.random().toString(36).substring(2, 15)
}

async function updateElpriserPageSchema() {
  try {
    console.log('📝 Updating Elpriser page to conform to new schema standards...\n')
    
    // Fetch the Elpriser page
    const elpriserPage = await client.fetch(`*[_id == "1BrgDwXdqxJ08rMIoYfLjP"][0]`)
    
    if (!elpriserPage) {
      console.error('❌ Elpriser page not found')
      return
    }
    
    console.log('Found Elpriser page:', elpriserPage.title)
    
    // Find the heroWithCalculator block
    const heroIndex = elpriserPage.contentBlocks.findIndex(
      (block: any) => block._type === 'heroWithCalculator'
    )
    
    if (heroIndex === -1) {
      console.error('❌ No heroWithCalculator block found')
      return
    }
    
    const currentHero = elpriserPage.contentBlocks[heroIndex]
    console.log('\nCurrent hero state:')
    console.log('- Headline:', currentHero.headline)
    console.log('- Subheadline:', currentHero.subheadline || 'EMPTY')
    console.log('- Highlight Words:', currentHero.highlightWords || 'NONE')
    console.log('- Calculator Title:', currentHero.calculatorTitle || 'DEFAULT')
    console.log('- Stats:', currentHero.stats ? `${currentHero.stats.length} items` : 'NONE')
    
    // Update the hero block with new schema fields
    const updatedContentBlocks = [...elpriserPage.contentBlocks]
    updatedContentBlocks[heroIndex] = {
      ...currentHero,
      // Add highlight words based on the headline
      highlightWords: ['elpriser', 'billigste'],
      
      // Add a proper subheadline
      subheadline: 'Sammenlign elpriser fra Danmarks største elselskaber og find den bedste aftale til dit forbrug',
      
      // Set a custom calculator title
      calculatorTitle: 'Beregn din elpris',
      
      // Ensure stats have proper structure with keys
      stats: currentHero.stats && currentHero.stats.length > 0 
        ? currentHero.stats.map((stat: any) => ({
            _key: stat._key || generateKey(),
            value: stat.value,
            label: stat.label
          }))
        : [
            {
              _key: generateKey(),
              value: "15+",
              label: "Elselskaber"
            },
            {
              _key: generateKey(),
              value: "2025",
              label: "Opdaterede priser"
            },
            {
              _key: generateKey(),
              value: "100%",
              label: "Gennemsigtighed"
            }
          ]
    }
    
    // Update the page
    const result = await client.patch(elpriserPage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('\n✅ Elpriser page updated successfully!')
    
    const updatedHero = result.contentBlocks[heroIndex]
    console.log('\nUpdated hero state:')
    console.log('- Headline:', updatedHero.headline)
    console.log('- Subheadline:', updatedHero.subheadline)
    console.log('- Highlight Words:', updatedHero.highlightWords)
    console.log('- Calculator Title:', updatedHero.calculatorTitle)
    console.log('- Stats:', updatedHero.stats.length, 'items with keys')
    
    console.log('\n✨ The Elpriser page now conforms to the new schema standards!')
    
  } catch (error) {
    console.error('❌ Error updating Elpriser page:', error)
  }
}

// Run the script
updateElpriserPageSchema()