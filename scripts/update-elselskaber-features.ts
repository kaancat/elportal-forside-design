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

// Updated features with Vindstød-focused content
const updatedFeatures = [
  {
    title: "Aktuelle priser i realtid",
    description: "Se live elpriser og sammenlign alle danske elselskaber med opdaterede priser hver time",
    icon: "chart" // Suggests: Chart, TrendingUp, BarChart3
  },
  {
    title: "Grøn energi anbefaling", // Replaced "Uvildig sammenligning"
    description: "Vi anbefaler elselskaber med 100% vedvarende energi og den bedste kombination af pris og bæredygtighed",
    icon: "leaf" // Suggests: Leaf, Wind, Zap
  },
  {
    title: "Grøn energi fokus",
    description: "Se hvilke selskaber der tilbyder 100% vedvarende energi og deres miljøpåvirkning",
    icon: "wind" // Suggests: Wind, Flower, TreePine
  },
  {
    title: "Personlig beregning",
    description: "Indtast dit forbrug og få præcise priser baseret på din husstand",
    icon: "calculator" // Suggests: Calculator, Home, User
  },
  {
    title: "Gennemsigtige priser",
    description: "Alle afgifter, gebyrer og tillæg er inkluderet - ingen skjulte omkostninger",
    icon: "eye" // Suggests: Eye, CheckCircle, Shield
  },
  {
    title: "Ekspertanbefalinger",
    description: "Få vejledning om valg af fast vs. variabel pris og andre vigtige beslutninger",
    icon: "star" // Suggests: Star, Award, ThumbsUp
  }
]

async function updateElselskaberFeatures() {
  try {
    // First, fetch the current elselskaber page
    const query = `*[_type == "page" && slug.current == "elselskaber"][0]`
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('Elselskaber page not found')
      return
    }

    console.log('Current page ID:', page._id)
    
    // Find the features section in contentBlocks
    const updatedContentBlocks = page.contentBlocks.map((block: any) => {
      // Look for the featureList block
      if (block._type === 'featureList' && block.features) {
        console.log('Found featureList block to update')
        
        // Update the features
        const updatedFeaturesList = block.features.map((feature: any) => {
          // Replace "Uvildig sammenligning" with new content
          if (feature.title === 'Uvildig sammenligning') {
            return {
              ...feature,
              title: 'Grøn energi anbefaling',
              description: 'Vi anbefaler elselskaber med 100% vedvarende energi og den bedste kombination af pris og bæredygtighed'
            }
          }
          return feature
        })
        
        return {
          ...block,
          features: updatedFeaturesList
        }
      }
      return block
    })

    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('Successfully updated elselskaber features:', result)
    
    // Log the recommended icons for manual update in Sanity Studio
    console.log('\n=== Recommended Icons for Each Feature ===\n')
    updatedFeatures.forEach((feature) => {
      console.log(`${feature.title}:`)
      switch(feature.icon) {
        case 'chart':
          console.log('  - Primary: Chart Line (line graph icon)')
          console.log('  - Alternatives: Trending Up, Bar Chart, Activity')
          break
        case 'leaf':
          console.log('  - Primary: Leaf (sustainability icon)')
          console.log('  - Alternatives: Wind, Zap (lightning), Sun')
          break
        case 'wind':
          console.log('  - Primary: Wind (wind turbine icon)')
          console.log('  - Alternatives: Flower, Tree, Cloud')
          break
        case 'calculator':
          console.log('  - Primary: Calculator')
          console.log('  - Alternatives: Home, User, Settings')
          break
        case 'eye':
          console.log('  - Primary: Eye (transparency icon)')
          console.log('  - Alternatives: Check Circle, Shield, Info')
          break
        case 'star':
          console.log('  - Primary: Star (quality/recommendation icon)')
          console.log('  - Alternatives: Award, Thumbs Up, Badge Check')
          break
      }
      console.log('')
    })

  } catch (error) {
    console.error('Error updating elselskaber features:', error)
  }
}

// Alternative approach: Log the structure for manual update
async function analyzeElselskaberPage() {
  try {
    const query = `*[_type == "page" && slug.current == "elselskaber"][0]`
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('Elselskaber page not found')
      return
    }

    console.log('\n=== Page Structure Analysis ===')
    console.log('Page ID:', page._id)
    console.log('Content blocks count:', page.contentBlocks?.length)
    
    // Find features-like content
    page.contentBlocks?.forEach((block: any, index: number) => {
      const blockString = JSON.stringify(block)
      if (blockString.includes('Aktuelle priser') || blockString.includes('Uvildig') || blockString.includes('sammenligning')) {
        console.log(`\nFound potential features block at index ${index}:`)
        console.log('Block type:', block._type)
        console.log('Block structure:', JSON.stringify(block, null, 2).substring(0, 500) + '...')
      }
    })

    console.log('\n=== Recommended Content Update ===')
    console.log('\nReplace "Uvildig sammenligning" with:')
    console.log('Title: "Grøn energi anbefaling"')
    console.log('Description: "Vi anbefaler elselskaber med 100% vedvarende energi og den bedste kombination af pris og bæredygtighed"')
    console.log('Icon: Leaf, Wind, or Zap (lightning bolt)')
    
  } catch (error) {
    console.error('Error analyzing page:', error)
  }
}

// Run analysis first to understand structure
console.log('Analyzing elselskaber page structure...')
analyzeElselskaberPage()

// Run the update
updateElselskaberFeatures()