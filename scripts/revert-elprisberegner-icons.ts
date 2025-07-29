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

// Original icons that were working
const originalIcons = [
  {
    // Feature 1: Aktuelle Spotpriser
    icon: {
      _type: 'icon.manager',
      name: 'TrendingUp',
      provider: 'lucide',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>'
    }
  },
  {
    // Feature 2: Alle Afgifter Inkluderet
    icon: {
      _type: 'icon.manager',
      name: 'Calculator',
      provider: 'lucide',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" x2="16" y1="6" y2="6"></line><line x1="16" x2="16" y1="14" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>'
    }
  },
  {
    // Feature 3: Sammenlign Elselskaber
    icon: {
      _type: 'icon.manager',
      name: 'BarChart3',
      provider: 'lucide',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>'
    }
  },
  {
    // Feature 4: Dit Præcise Forbrug
    icon: {
      _type: 'icon.manager',
      name: 'Home',
      provider: 'lucide',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
    }
  }
]

async function revertFeatureIcons() {
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
    
    // Update each feature with original icons
    const updatedFeatures = featureList.features.map((feature: any, index: number) => {
      if (index < originalIcons.length) {
        return {
          ...feature,
          icon: originalIcons[index].icon
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

    console.log('\nSuccessfully reverted to original icons!')
    console.log('Restored features:')
    updatedFeatures.forEach((feature: any, index: number) => {
      console.log(`- ${feature.title}: ${originalIcons[index].icon.name} icon`)
    })

  } catch (error) {
    console.error('Error reverting icons:', error)
  }
}

revertFeatureIcons()