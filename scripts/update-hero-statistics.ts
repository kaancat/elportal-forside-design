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

async function updateHeroStatistics() {
  try {
    console.log('📊 Updating hero statistics...')
    
    // Fetch the homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    // Find the hero section index
    const heroIndex = homepage.contentBlocks.findIndex(
      (block: any) => block._type === 'heroWithCalculator'
    )
    
    if (heroIndex === -1) {
      console.error('Hero section not found')
      return
    }
    
    // Update the hero section with proper statistics
    const updatedContentBlocks = [...homepage.contentBlocks]
    updatedContentBlocks[heroIndex] = {
      ...updatedContentBlocks[heroIndex],
      stats: [
        {
          value: "100+",
          label: "Besøgende dagligt"
        },
        {
          value: "15+",
          label: "Elselskaber"
        },
        {
          value: "2 ud af 3",
          label: "Kan spare ved at skifte"
        }
      ]
    }
    
    // Update the homepage
    const result = await client.patch(homepage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Statistics updated successfully!')
    console.log('New statistics:')
    result.contentBlocks[heroIndex].stats.forEach((stat: any) => {
      console.log(`- ${stat.value}: ${stat.label}`)
    })
    
  } catch (error) {
    console.error('❌ Error updating statistics:', error)
  }
}

// Run the script
updateHeroStatistics()