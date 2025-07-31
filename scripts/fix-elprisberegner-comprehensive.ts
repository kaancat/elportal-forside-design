import { createClient } from '@sanity/client'

// Get token from command line argument
const token = process.argv[2]

if (!token) {
  console.error('Please provide Sanity API token as first argument')
  console.error('Usage: tsx fix-elprisberegner-comprehensive.ts YOUR_SANITY_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: token
})

// Icon mappings with larger, colorful icons
const featureListIcons = {
  'Aktuelle Spotpriser': {
    icon: 'streamline-bold:graph-up-dynamic-1',
    name: 'TrendingUp',
    color: '#10b981' // Emerald 500
  },
  'Alle Afgifter Inkluderet': {
    icon: 'streamline-bold:calculator-1-solid',
    name: 'Calculator',
    color: '#3b82f6' // Blue 500
  },
  'Sammenlign Elselskaber': {
    icon: 'streamline-bold:analytics-graph-bar-solid',
    name: 'BarChart',
    color: '#f59e0b' // Amber 500
  },
  'Dit Præcise Forbrug': {
    icon: 'streamline-bold:house-chimney-2-solid',
    name: 'Home',
    color: '#ef4444' // Red 500
  }
}

const valuePropositionIcons = {
  'Gennemsnitlig elpris 2025': {
    icon: 'streamline-bold:money-graph-bar-increase-solid',
    name: 'TrendingUp',
    color: '#10b981' // Emerald 500
  },
  'Mulig besparelse': {
    icon: 'streamline-bold:piggy-bank-coins-solid',
    name: 'PiggyBank',
    color: '#3b82f6' // Blue 500
  },
  'Prisudsving': {
    icon: 'streamline-bold:graph-fluctuation-solid',
    name: 'Activity',
    color: '#f59e0b' // Amber 500
  }
}

function createIconObject(iconConfig: any) {
  return {
    _type: 'icon.manager',
    icon: iconConfig.icon,
    metadata: {
      author: {
        name: 'Streamline',
        url: 'https://streamlinehq.com'
      },
      collectionId: 'streamline-bold',
      collectionName: 'Streamline Bold',
      color: {
        hex: iconConfig.color,
        rgba: {
          a: 1,
          b: parseInt(iconConfig.color.slice(5, 7), 16),
          g: parseInt(iconConfig.color.slice(3, 5), 16),
          r: parseInt(iconConfig.color.slice(1, 3), 16)
        }
      },
      downloadUrl: `https://api.iconify.design/${iconConfig.icon}.svg?width=32&height=32&color=${encodeURIComponent(iconConfig.color)}&download=1`,
      flip: '',
      hFlip: false,
      iconName: iconConfig.icon.split(':')[1],
      license: {
        name: 'Premium',
        url: 'https://streamlinehq.com/license'
      },
      palette: false,
      rotate: 0,
      size: {
        height: 32,
        width: 32
      },
      url: `https://api.iconify.design/${iconConfig.icon}.svg?width=32&height=32&color=${encodeURIComponent(iconConfig.color)}`,
      vFlip: false
    },
    name: iconConfig.name,
    provider: 'streamline',
    svg: `<svg width="32" height="32" viewBox="0 0 32 32" fill="${iconConfig.color}"><!-- Placeholder SVG --></svg>`
  }
}

async function updatePage() {
  try {
    console.log('Fetching current page data...')
    
    const page = await client.fetch(`*[_type == "page" && slug.current == "elprisberegner"][0]`)
    
    if (!page) {
      console.error('Page not found')
      return
    }

    console.log('Current page ID:', page._id)
    
    // Update contentBlocks
    const updatedContentBlocks = page.contentBlocks.map((block: any) => {
      // Fix featureList icons
      if (block._type === 'featureList' && block.features) {
        console.log('Updating featureList icons...')
        return {
          ...block,
          features: block.features.map((feature: any) => {
            const iconConfig = featureListIcons[feature.title as keyof typeof featureListIcons]
            if (iconConfig) {
              console.log(`Updating icon for: ${feature.title}`)
              return {
                ...feature,
                icon: createIconObject(iconConfig)
              }
            }
            return feature
          })
        }
      }
      
      // Fix valueProposition icons
      if (block._type === 'valueProposition' && block.valueItems) {
        console.log('Updating valueProposition icons...')
        return {
          ...block,
          valueItems: block.valueItems.map((item: any) => {
            const iconConfig = valuePropositionIcons[item.heading as keyof typeof valuePropositionIcons]
            if (iconConfig) {
              console.log(`Adding icon for: ${item.heading}`)
              return {
                ...item,
                icon: createIconObject(iconConfig)
              }
            }
            return item
          })
        }
      }
      
      return block
    })

    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('Successfully updated page:', result._id)
    
    // Verify the update
    const updatedPage = await client.fetch(`*[_type == "page" && slug.current == "elprisberegner"][0]{
      contentBlocks[_type == "featureList" || _type == "valueProposition"]{
        _type,
        _type == "featureList" => {
          features[]{
            title,
            "hasIcon": defined(icon)
          }
        },
        _type == "valueProposition" => {
          valueItems[]{
            heading,
            "hasIcon": defined(icon)
          }
        }
      }
    }`)
    
    console.log('\nVerification:')
    console.log(JSON.stringify(updatedPage, null, 2))

  } catch (error) {
    console.error('Error updating page:', error)
  }
}

// Execute the update
updatePage()