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

// Icon configurations with complete metadata including URLs
const iconConfigs = {
  'spring-feature': {
    icon: 'lucide:flower',
    metadata: {
      collectionId: 'lucide',
      collectionName: 'Lucide',
      icon: 'flower',
      iconName: 'Flower',
      url: 'https://api.iconify.design/lucide:flower.svg?color=%2384db41',
      inlineSvg: null,
      size: { width: 24, height: 24 }
    }
  },
  'summer-feature': {
    icon: 'lucide:sun',
    metadata: {
      collectionId: 'lucide',
      collectionName: 'Lucide',
      icon: 'sun',
      iconName: 'Sun',
      url: 'https://api.iconify.design/lucide:sun.svg?color=%2384db41',
      inlineSvg: null,
      size: { width: 24, height: 24 }
    }
  },
  'autumn-feature': {
    icon: 'lucide:leaf',
    metadata: {
      collectionId: 'lucide',
      collectionName: 'Lucide',
      icon: 'leaf',
      iconName: 'Leaf',
      url: 'https://api.iconify.design/lucide:leaf.svg?color=%2384db41',
      inlineSvg: null,
      size: { width: 24, height: 24 }
    }
  },
  'winter-feature': {
    icon: 'lucide:snowflake',
    metadata: {
      collectionId: 'lucide',
      collectionName: 'Lucide',
      icon: 'snowflake',
      iconName: 'Snowflake',
      url: 'https://api.iconify.design/lucide:snowflake.svg?color=%2384db41',
      inlineSvg: null,
      size: { width: 24, height: 24 }
    }
  }
}

async function fixFeatureListIcons() {
  try {
    // Fetch the current page
    const page = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYjlhjr"][0]`)
    if (!page) {
      console.error('Page not found')
      return
    }

    console.log('Current page found:', page.title)

    // Find the feature list block
    const featureListIndex = page.contentBlocks?.findIndex((block: any) => 
      block._type === 'featureList' && block._key === 'saeson-intro'
    )

    if (featureListIndex === -1) {
      console.error('Feature list block not found')
      return
    }

    const featureList = page.contentBlocks[featureListIndex]
    console.log('Found feature list:', featureList.title)

    // Update each feature with proper icon structure
    const updatedFeatures = featureList.features.map((feature: any) => {
      const iconConfig = iconConfigs[feature._key as keyof typeof iconConfigs]
      
      if (!iconConfig) {
        console.warn(`No icon config found for ${feature._key}`)
        return feature
      }

      console.log(`Updating icon for ${feature.title}`)
      
      return {
        ...feature,
        icon: {
          _type: 'icon.manager',
          icon: iconConfig.icon,
          metadata: iconConfig.metadata
        }
      }
    })

    // Create updated feature list
    const updatedFeatureList = {
      ...featureList,
      features: updatedFeatures
    }

    // Update contentBlocks with new feature list
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[featureListIndex] = updatedFeatureList

    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('\n✅ Successfully updated feature list icons!')
    console.log('Updated features:')
    updatedFeatures.forEach((f: any) => {
      console.log(`- ${f.title}: ${f.icon.icon} (${f.icon.metadata.url})`)
    })
    
  } catch (error) {
    console.error('Error updating feature list icons:', error)
  }
}

// Run the fix
fixFeatureListIcons()