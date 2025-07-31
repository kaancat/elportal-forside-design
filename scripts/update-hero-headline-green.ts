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

async function updateHeroHeadlineForGreen() {
  try {
    console.log('🎨 Updating hero headline to include green highlighting...')
    
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
    
    // Check current headline
    const currentHeadline = homepage.contentBlocks[heroIndex].headline
    console.log('Current headline:', currentHeadline)
    
    // Update the hero section to match the original design
    const updatedContentBlocks = [...homepage.contentBlocks]
    updatedContentBlocks[heroIndex] = {
      ...updatedContentBlocks[heroIndex],
      headline: 'Elpriser - Find og sammenlign elpriser',
      subheadline: 'Sammenlign elpriser og se, om du kan finde en bedre elpris ud fra dit estimerede forbrug.'
    }
    
    // Update the homepage
    const result = await client.patch(homepage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Headline updated successfully!')
    console.log('New headline:', result.contentBlocks[heroIndex].headline)
    console.log('New subheadline:', result.contentBlocks[heroIndex].subheadline)
    
  } catch (error) {
    console.error('❌ Error updating headline:', error)
  }
}

// Run the script
updateHeroHeadlineForGreen()