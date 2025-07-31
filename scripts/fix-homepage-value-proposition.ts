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

function generateKey(): string {
  return `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

async function fixHomepageValueProposition() {
  try {
    console.log('🔧 Fixing homepage Value Proposition box...\n')
    
    // Define the value items based on the homepage content strategy
    const valueItems = [
      {
        _key: generateKey(),
        _type: 'valueItem',
        heading: 'Spar op til 2.400 kr årligt',
        description: 'Find den billigste elleverandør og reducer din elregning markant med vores gratis sammenligningstjeneste.',
        icon: {
          _type: 'icon.manager',
          icon: 'piggy-bank',
          metadata: {
            version: '0.296',
            iconName: 'piggy-bank',
            collectionId: 'lucide',
            collectionName: 'Lucide',
            url: 'https://lucide.dev/icons/piggy-bank',
            author: {
              name: 'Lucide Contributors',
              url: 'https://github.com/lucide-icons/lucide'
            },
            license: {
              name: 'ISC',
              url: 'https://github.com/lucide-icons/lucide/blob/main/LICENSE'
            },
            downloadUrl: 'https://lucide.dev/api/download/piggy-bank?lucide=0.296.0',
            svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-piggy-bank"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h0"/></svg>'
          }
        }
      },
      {
        _key: generateKey(),
        _type: 'valueItem',
        heading: '100% gennemsigtige priser',
        description: 'Alle priser vises tydeligt uden skjulte gebyrer. Se præcis hvad du betaler for.',
        icon: {
          _type: 'icon.manager',
          icon: 'eye',
          metadata: {
            version: '0.296',
            iconName: 'eye',
            collectionId: 'lucide',
            collectionName: 'Lucide',
            url: 'https://lucide.dev/icons/eye',
            author: {
              name: 'Lucide Contributors',
              url: 'https://github.com/lucide-icons/lucide'
            },
            license: {
              name: 'ISC',
              url: 'https://github.com/lucide-icons/lucide/blob/main/LICENSE'
            },
            downloadUrl: 'https://lucide.dev/api/download/eye?lucide=0.296.0',
            svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'
          }
        }
      },
      {
        _key: generateKey(),
        _type: 'valueItem',
        heading: 'Grøn strøm fra vindmøller',
        description: 'Vælg elleverandører med fokus på vedvarende energi og støt den grønne omstilling.',
        icon: {
          _type: 'icon.manager',
          icon: 'wind',
          metadata: {
            version: '0.296',
            iconName: 'wind',
            collectionId: 'lucide',
            collectionName: 'Lucide',
            url: 'https://lucide.dev/icons/wind',
            author: {
              name: 'Lucide Contributors',
              url: 'https://github.com/lucide-icons/lucide'
            },
            license: {
              name: 'ISC',
              url: 'https://github.com/lucide-icons/lucide/blob/main/LICENSE'
            },
            downloadUrl: 'https://lucide.dev/api/download/wind?lucide=0.296.0',
            svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wind"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>'
          }
        }
      },
      {
        _key: generateKey(),
        _type: 'valueItem',
        heading: 'Nemt og hurtigt skift',
        description: 'Skift elleverandør på under 5 minutter. Vi håndterer hele processen for dig.',
        icon: {
          _type: 'icon.manager',
          icon: 'zap',
          metadata: {
            version: '0.296',
            iconName: 'zap',
            collectionId: 'lucide',
            collectionName: 'Lucide',
            url: 'https://lucide.dev/icons/zap',
            author: {
              name: 'Lucide Contributors',
              url: 'https://github.com/lucide-icons/lucide'
            },
            license: {
              name: 'ISC',
              url: 'https://github.com/lucide-icons/lucide/blob/main/LICENSE'
            },
            downloadUrl: 'https://lucide.dev/api/download/zap?lucide=0.296.0',
            svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap"><path d="m13 2-2 9h5l-2 9"/></svg>'
          }
        }
      }
    ]
    
    // Fetch both homepage documents
    const homepageIds = [
      '084518ec-2f79-48e0-b23c-add29ee83e6d',
      'drafts.084518ec-2f79-48e0-b23c-add29ee83e6d'
    ]
    
    for (const docId of homepageIds) {
      console.log(`\n📄 Processing ${docId.includes('drafts') ? 'draft' : 'published'} homepage...`)
      
      const homepage = await client.fetch(`*[_id == "${docId}"][0]`)
      
      if (!homepage) {
        console.log('   Not found, skipping...')
        continue
      }
      
      // Find the value proposition block
      let foundAndFixed = false
      const updatedContentBlocks = homepage.contentBlocks.map((block: any) => {
        if (block._type === 'valueProposition' && (!block.valueItems || block.valueItems.length === 0)) {
          foundAndFixed = true
          console.log('   Found empty Value Proposition')
          console.log(`   Heading: "${block.heading}"`)
          console.log('   Adding 4 value items with icons...')
          
          return {
            ...block,
            valueItems: valueItems
          }
        }
        return block
      })
      
      if (foundAndFixed) {
        // Update the document
        const result = await client.patch(docId)
          .set({ contentBlocks: updatedContentBlocks })
          .commit()
        
        console.log('   ✅ Successfully added value items!')
      } else {
        console.log('   No empty Value Proposition found')
      }
    }
    
    console.log('\n✅ Value Proposition fix completed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
fixHomepageValueProposition()