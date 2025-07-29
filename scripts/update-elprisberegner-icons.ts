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

// Define new icons for each feature
const newIcons = [
  {
    // Feature 1: Aktuelle Spotpriser
    icon: {
      _type: 'icon.manager',
      name: 'Activity',
      provider: 'lucide',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
    }
  },
  {
    // Feature 2: Alle Afgifter Inkluderet
    icon: {
      _type: 'icon.manager',
      name: 'Receipt',
      provider: 'lucide',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 17V7"></path></svg>'
    }
  },
  {
    // Feature 3: Sammenlign Elselskaber
    icon: {
      _type: 'icon.manager',
      name: 'GitCompare',
      provider: 'lucide',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><path d="M11 18H8a2 2 0 0 1-2-2V9"></path></svg>'
    }
  },
  {
    // Feature 4: Dit Præcise Forbrug
    icon: {
      _type: 'icon.manager',
      name: 'Zap',
      provider: 'lucide',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'
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

    console.log('\nSuccessfully updated icons!')
    console.log('Updated features:')
    updatedFeatures.forEach((feature: any, index: number) => {
      console.log(`- ${feature.title}: ${newIcons[index].icon.name} icon`)
    })

  } catch (error) {
    console.error('Error updating icons:', error)
  }
}

updateFeatureIcons()