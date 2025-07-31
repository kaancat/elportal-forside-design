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

async function fixElpriserPage() {
  console.log('🔧 Fixing validation errors on elpriser page...')

  // First, fetch the current page
  const page = await client.fetch(`*[_type == 'page' && slug.current == 'elpriser'][0]`)
  
  if (!page) {
    console.error('❌ Could not find elpriser page')
    return
  }

  console.log(`✅ Found page with ID: ${page._id}`)

  // Create Value Proposition content
  const valuePropositionContent = {
    _type: 'valueProposition',
    _key: 'value-prop-1',
    heading: 'Hvorfor vælge Din Elportal?',
    subheading: 'Vi gør det nemt og trygt at skifte til grøn strøm og spare penge',
    valueItems: [
      {
        _key: 'value-1',
        _type: 'valueItem',
        icon: {
          _type: 'icon.manager',
          icon: 'streamline-freehand:money-currency-coin-dollar',
          metadata: {
            author: {
              name: 'Streamline',
              url: 'https://github.com/webalys-hq/streamline-vectors'
            },
            collectionId: 'streamline-freehand',
            collectionName: 'Freehand free icons',
            iconName: 'money-currency-coin-dollar',
            license: {
              name: 'CC BY 4.0',
              url: 'https://creativecommons.org/licenses/by/4.0/'
            },
            url: 'https://api.iconify.design/streamline-freehand:money-currency-coin-dollar.svg?width=20&height=20',
            downloadUrl: 'https://api.iconify.design/streamline-freehand:money-currency-coin-dollar.svg?width=20&height=20&download=1',
            size: { width: 20, height: 20 },
            hFlip: false,
            vFlip: false,
            flip: '',
            rotate: 0,
            palette: false
          }
        },
        heading: 'Spar op til 3.000 kr. årligt',
        description: 'Vi finder de billigste elpriser i dit område og viser dig præcis hvor meget du kan spare'
      },
      {
        _key: 'value-2',
        _type: 'valueItem',
        icon: {
          _type: 'icon.manager',
          icon: 'streamline-freehand:ecology-leaf',
          metadata: {
            author: {
              name: 'Streamline',
              url: 'https://github.com/webalys-hq/streamline-vectors'
            },
            collectionId: 'streamline-freehand',
            collectionName: 'Freehand free icons',
            iconName: 'ecology-leaf',
            license: {
              name: 'CC BY 4.0',
              url: 'https://creativecommons.org/licenses/by/4.0/'
            },
            url: 'https://api.iconify.design/streamline-freehand:ecology-leaf.svg?width=20&height=20',
            downloadUrl: 'https://api.iconify.design/streamline-freehand:ecology-leaf.svg?width=20&height=20&download=1',
            size: { width: 20, height: 20 },
            hFlip: false,
            vFlip: false,
            flip: '',
            rotate: 0,
            palette: false
          }
        },
        heading: '100% Grøn strøm fra vindmøller',
        description: 'Vælg mellem leverandører der kun bruger vedvarende energikilder - uden at betale ekstra'
      },
      {
        _key: 'value-3',
        _type: 'valueItem',
        icon: {
          _type: 'icon.manager',
          icon: 'streamline-freehand:graph-up',
          metadata: {
            author: {
              name: 'Streamline',
              url: 'https://github.com/webalys-hq/streamline-vectors'
            },
            collectionId: 'streamline-freehand',
            collectionName: 'Freehand free icons',
            iconName: 'graph-up',
            license: {
              name: 'CC BY 4.0',
              url: 'https://creativecommons.org/licenses/by/4.0/'
            },
            url: 'https://api.iconify.design/streamline-freehand:graph-up.svg?width=20&height=20',
            downloadUrl: 'https://api.iconify.design/streamline-freehand:graph-up.svg?width=20&height=20&download=1',
            size: { width: 20, height: 20 },
            hFlip: false,
            vFlip: false,
            flip: '',
            rotate: 0,
            palette: false
          }
        },
        heading: 'Realtidspriser direkte fra Energinet',
        description: 'Se timepriser, prognoser og historisk udvikling - altid opdateret med de seneste data'
      },
      {
        _key: 'value-4',
        _type: 'valueItem',
        icon: {
          _type: 'icon.manager',
          icon: 'streamline-freehand:shield-check',
          metadata: {
            author: {
              name: 'Streamline',
              url: 'https://github.com/webalys-hq/streamline-vectors'
            },
            collectionId: 'streamline-freehand',
            collectionName: 'Freehand free icons',
            iconName: 'shield-check',
            license: {
              name: 'CC BY 4.0',
              url: 'https://creativecommons.org/licenses/by/4.0/'
            },
            url: 'https://api.iconify.design/streamline-freehand:shield-check.svg?width=20&height=20',
            downloadUrl: 'https://api.iconify.design/streamline-freehand:shield-check.svg?width=20&height=20&download=1',
            size: { width: 20, height: 20 },
            hFlip: false,
            vFlip: false,
            flip: '',
            rotate: 0,
            palette: false
          }
        },
        heading: 'Trygt og nemt at skifte',
        description: 'Vi guider dig gennem hele processen - dit nye elselskab klarer alt det praktiske'
      }
    ]
  }

  // Add value proposition after the provider list
  const providerListIndex = page.contentBlocks.findIndex((block: any) => block._type === 'providerList')
  if (providerListIndex !== -1) {
    page.contentBlocks.splice(providerListIndex + 1, 0, valuePropositionContent)
  }

  // Prepare the update operations using unset for removing fields
  const operations: any = {
    set: {
      contentBlocks: page.contentBlocks
    },
    unset: []
  }

  // Remove the seo field if it exists
  if (page.seo) {
    operations.unset.push('seo')
    console.log('📝 Removing deprecated seo field')
  }

  // Remove the opengraph field if it exists
  if (page.opengraph) {
    operations.unset.push('opengraph')
    console.log('📝 Removing null opengraph field')
  }

  try {
    // Perform the patch
    await client
      .patch(page._id)
      .set(operations.set)
      .unset(operations.unset)
      .commit()

    console.log('✅ Successfully fixed all validation errors on elpriser page!')
    console.log('📋 Changes made:')
    console.log('   - Added Value Proposition component with 4 value items')
    if (operations.unset.length > 0) {
      console.log(`   - Removed fields: ${operations.unset.join(', ')}`)
    }
    console.log('\n🚀 The elpriser page should now pass all validation checks!')
    
  } catch (error) {
    console.error('❌ Error updating page:', error)
  }
}

// Run the fix
fixElpriserPage()