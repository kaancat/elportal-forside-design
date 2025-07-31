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

async function fixHeroStatsKeys() {
  try {
    console.log('🔧 Fixing hero statistics keys...')
    
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
    
    // Update the hero section with proper statistics INCLUDING keys
    const updatedContentBlocks = [...homepage.contentBlocks]
    updatedContentBlocks[heroIndex] = {
      ...updatedContentBlocks[heroIndex],
      stats: [
        {
          _key: generateKey(),
          value: "100+",
          label: "Besøgende dagligt"
        },
        {
          _key: generateKey(),
          value: "15+",
          label: "Elselskaber"
        },
        {
          _key: generateKey(),
          value: "2 ud af 3",
          label: "Kan spare ved at skifte"
        }
      ]
    }
    
    // Update the homepage
    const result = await client.patch(homepage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Statistics keys fixed successfully!')
    console.log('Statistics with keys:')
    result.contentBlocks[heroIndex].stats.forEach((stat: any) => {
      console.log(`- [${stat._key}] ${stat.value}: ${stat.label}`)
    })
    
  } catch (error) {
    console.error('❌ Error fixing statistics:', error)
  }
}

// Run the script
fixHeroStatsKeys()