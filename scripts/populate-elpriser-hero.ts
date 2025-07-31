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

async function populateElpriserHero() {
  try {
    console.log('Updating hero content for Elpriser page...')
    
    const pageId = '1BrgDwXdqxJ08rMIoYfLjP'
    
    // Fetch the current page
    const page = await client.fetch(`*[_id == "${pageId}"][0]{
      _id,
      contentBlocks[]{
        _key,
        _type,
        _type == "heroWithCalculator" => {
          headline,
          subheadline,
          content,
          calculatorTitle,
          showLivePrice,
          showProviderComparison,
          stats
        }
      }
    }`)
    
    if (!page) {
      console.error('Page not found')
      return
    }
    
    // Find the heroWithCalculator block
    const heroBlockIndex = page.contentBlocks?.findIndex((block: any) => block._type === 'heroWithCalculator')
    
    if (heroBlockIndex === -1) {
      console.error('No heroWithCalculator block found')
      return
    }
    
    const heroBlock = page.contentBlocks[heroBlockIndex]
    console.log('Current hero block:', JSON.stringify(heroBlock, null, 2))
    
    // Update the hero block with content
    const updatedHeroBlock = {
      _key: heroBlock._key,
      _type: 'heroWithCalculator',
      headline: "Elpriser - Find og sammenlign elpriser",
      subheadline: "Sammenlign elpriser og se, om du kan finde en bedre elpris ud fra dit estimerede forbrug.",
      calculatorTitle: "Beregn dit forbrug",
      showLivePrice: true,
      showProviderComparison: true,
      stats: [
        { _key: 'stat1', value: "10.000+", label: "Brugere dagligt" },
        { _key: 'stat2', value: "30+", label: "Elaftaler" },
        { _key: 'stat3', value: "2 ud af 3", label: "Kan spare ved at skifte" }
      ]
    }
    
    // Create updated contentBlocks array
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[heroBlockIndex] = updatedHeroBlock
    
    console.log('\nUpdating page with populated hero content...')
    
    const result = await client
      .patch(pageId)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Hero content updated successfully!')
    console.log('\nUpdated values:')
    console.log('- Headline:', updatedHeroBlock.headline)
    console.log('- Subheadline:', updatedHeroBlock.subheadline)
    console.log('- Calculator Title:', updatedHeroBlock.calculatorTitle)
    console.log('- Stats:', updatedHeroBlock.stats.length, 'statistics')
    
  } catch (error) {
    console.error('Error updating hero content:', error)
  }
}

// Run the script
populateElpriserHero()