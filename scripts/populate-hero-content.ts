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

async function populateHeroContent() {
  try {
    console.log('Fetching homepage data...')
    
    // First, fetch the current homepage to find the heroWithCalculator block
    const homepage = await client.fetch(`*[_type == "homePage"][0]{
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
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    console.log('Current homepage ID:', homepage._id)
    
    // Find the heroWithCalculator block
    const heroBlock = homepage.contentBlocks?.find((block: any) => block._type === 'heroWithCalculator')
    
    if (!heroBlock) {
      console.error('No heroWithCalculator block found in homepage')
      return
    }
    
    console.log('Found heroWithCalculator block with key:', heroBlock._key)
    console.log('Current content:', JSON.stringify(heroBlock, null, 2))
    
    // Check if content is already populated
    if (heroBlock.headline && heroBlock.subheadline) {
      console.log('Hero content already populated. Current values:')
      console.log('- Headline:', heroBlock.headline)
      console.log('- Subheadline:', heroBlock.subheadline)
      return
    }
    
    // Prepare the patch to update the hero content
    const patch = {
      contentBlocks: homepage.contentBlocks.map((block: any) => {
        if (block._type === 'heroWithCalculator' && block._key === heroBlock._key) {
          return {
            ...block,
            headline: block.headline || "Elpriser - Find og sammenlign elpriser",
            subheadline: block.subheadline || "Sammenlign elpriser og se, om du kan finde en bedre elpris ud fra dit estimerede forbrug.",
            calculatorTitle: block.calculatorTitle || "Beregn dit forbrug",
            showLivePrice: block.showLivePrice ?? true,
            showProviderComparison: block.showProviderComparison ?? true,
            stats: block.stats?.length > 0 ? block.stats : [
              { value: "10.000+", label: "Brugere dagligt" },
              { value: "30+", label: "Elaftaler" },
              { value: "2 ud af 3", label: "Kan spare ved at skifte" }
            ]
          }
        }
        return block
      })
    }
    
    console.log('\nUpdating hero content...')
    
    const result = await client
      .patch(homepage._id)
      .set(patch)
      .commit()
    
    console.log('✅ Hero content updated successfully!')
    console.log('Updated values:')
    console.log('- Headline: "Elpriser - Find og sammenlign elpriser"')
    console.log('- Subheadline: "Sammenlign elpriser og se, om du kan finde en bedre elpris ud fra dit estimerede forbrug."')
    console.log('- Stats: 3 statistics added')
    
  } catch (error) {
    console.error('Error updating hero content:', error)
  }
}

// Run the script
populateHeroContent()