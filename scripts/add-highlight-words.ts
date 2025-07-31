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

async function addHighlightWords() {
  try {
    console.log('🎨 Adding highlight words to hero section...')
    
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
    
    // Update the hero section with highlight words
    const updatedContentBlocks = [...homepage.contentBlocks]
    updatedContentBlocks[heroIndex] = {
      ...updatedContentBlocks[heroIndex],
      highlightWords: ['sammenlign'] // User can add more words in Sanity Studio
    }
    
    // Update the homepage
    const result = await client.patch(homepage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Highlight words added successfully!')
    console.log('Words to highlight:', result.contentBlocks[heroIndex].highlightWords)
    console.log('\nUsers can now add/remove highlight words directly in Sanity Studio!')
    
  } catch (error) {
    console.error('❌ Error adding highlight words:', error)
  }
}

// Run the script
addHighlightWords()