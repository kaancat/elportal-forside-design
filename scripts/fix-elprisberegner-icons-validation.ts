import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Define new icons with correct metadata format (inlineSvg as string)
const newIcons = [
  {
    // Feature 1: Aktuelle Spotpriser - Use a chart/analytics icon
    icon: {
      _type: 'icon.manager',
      metadata: {
        iconName: 'analytics-board-graph-line',
        url: 'https://api.iconify.design/streamline:analytics-board-graph-line.svg'
      }
    }
  },
  {
    // Feature 2: Alle Afgifter Inkluderet - Use a receipt/money icon
    icon: {
      _type: 'icon.manager',
      metadata: {
        iconName: 'business-cash-eye',
        url: 'https://api.iconify.design/streamline:business-cash-eye.svg'
      }
    }
  },
  {
    // Feature 3: Sammenlign Elselskaber - Use a comparison/search icon
    icon: {
      _type: 'icon.manager',
      metadata: {
        iconName: 'app-window-search-text',
        url: 'https://api.iconify.design/streamline:app-window-search-text.svg'
      }
    }
  },
  {
    // Feature 4: Dit Præcise Forbrug - Use a home/energy icon
    icon: {
      _type: 'icon.manager',
      metadata: {
        iconName: 'home-chimney-2',
        url: 'https://api.iconify.design/streamline:home-chimney-2.svg'
      }
    }
  }
]

async function updateFeatureIcons() {
  try {
    // First, fetch the current page
    const query = `*[_type == "page" && slug.current == "elprisberegner"][0]`
    const page = await client.fetch(query)
    
    if (!page) {
      console.log('Page not found')
      return
    }

    console.log('Found page:', page.title)
    
    // Find the featureList block
    const featureListIndex = page.contentBlocks.findIndex((block: any) => 
      block._type === 'featureList' && block.title === 'Sådan Fungerer Elprisberegneren'
    )
    
    if (featureListIndex === -1) {
      console.log('FeatureList not found')
      return
    }

    console.log('Found featureList at index:', featureListIndex)
    const featureList = page.contentBlocks[featureListIndex]
    
    // Update each feature with new icons
    const updatedFeatures = featureList.features.map((feature: any, index: number) => {
      if (index < newIcons.length) {
        return {
          ...feature,
          icon: newIcons[index].icon
        }
      }
      return feature
    })

    // Create the updated featureList
    const updatedFeatureList = {
      ...featureList,
      features: updatedFeatures
    }

    // Update the page with the new featureList
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[featureListIndex] = updatedFeatureList

    // Patch the document
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('\nSuccessfully updated icons with correct validation!')
    console.log('Updated features:')
    updatedFeatures.forEach((feature: any, index: number) => {
      console.log(`- ${feature.title}: ${newIcons[index].icon.metadata.iconName} icon`)
    })

  } catch (error) {
    console.error('Error updating icons:', error)
  }
}

updateFeatureIcons()