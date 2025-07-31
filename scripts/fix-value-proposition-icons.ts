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
  'flexibility': {
    icon: 'lucide:clock',
    metadata: {
      collectionId: 'lucide',
      collectionName: 'Lucide',
      icon: 'clock',
      iconName: 'Clock',
      url: 'https://api.iconify.design/lucide:clock.svg?color=%2384db41',
      inlineSvg: null,
      size: { width: 24, height: 24 }
    }
  },
  'monitor': {
    icon: 'lucide:line-chart',
    metadata: {
      collectionId: 'lucide',
      collectionName: 'Lucide', 
      icon: 'line-chart',
      iconName: 'Line Chart',
      url: 'https://api.iconify.design/lucide:line-chart.svg?color=%2384db41',
      inlineSvg: null,
      size: { width: 24, height: 24 }
    }
  },
  'seasonal': {
    icon: 'lucide:calendar',
    metadata: {
      collectionId: 'lucide',
      collectionName: 'Lucide',
      icon: 'calendar',
      iconName: 'Calendar',
      url: 'https://api.iconify.design/lucide:calendar.svg?color=%2384db41',
      inlineSvg: null,
      size: { width: 24, height: 24 }
    }
  },
  'invest': {
    icon: 'lucide:lightbulb',
    metadata: {
      collectionId: 'lucide',
      collectionName: 'Lucide',
      icon: 'lightbulb',
      iconName: 'Lightbulb',
      url: 'https://api.iconify.design/lucide:lightbulb.svg?color=%2384db41',
      inlineSvg: null,
      size: { width: 24, height: 24 }
    }
  }
}

async function fixValuePropositionIcons() {
  try {
    // Fetch the current page
    const page = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYjlhjr"][0]`)
    if (!page) {
      console.error('Page not found')
      return
    }

    console.log('Current page found:', page.title)

    // Find the value proposition block
    const valuePropIndex = page.contentBlocks?.findIndex((block: any) => 
      block._type === 'valueProposition' && block._key === 'saving-tips'
    )

    if (valuePropIndex === -1) {
      console.error('Value proposition block not found')
      return
    }

    const valueProp = page.contentBlocks[valuePropIndex]
    console.log('Found value proposition:', valueProp.title)
    console.log('Current items:', valueProp.items.length)

    // Update each item with proper icon structure
    const updatedItems = valueProp.items.map((item: any) => {
      const iconConfig = iconConfigs[item._key as keyof typeof iconConfigs]
      
      if (!iconConfig) {
        console.warn(`No icon config found for ${item._key}`)
        return item
      }

      console.log(`Updating icon for ${item.heading}`)
      
      return {
        ...item,
        icon: {
          _type: 'icon.manager',
          icon: iconConfig.icon,
          metadata: iconConfig.metadata
        }
      }
    })

    // Create updated value proposition
    const updatedValueProp = {
      ...valueProp,
      items: updatedItems
    }

    // Update contentBlocks with new value proposition
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[valuePropIndex] = updatedValueProp

    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('\n✅ Successfully updated value proposition icons!')
    console.log('Updated items:')
    updatedItems.forEach((item: any) => {
      console.log(`- ${item.heading}: ${item.icon.icon} (${item.icon.metadata.url})`)
    })
    
  } catch (error) {
    console.error('Error updating value proposition icons:', error)
  }
}

// Run the fix
fixValuePropositionIcons()