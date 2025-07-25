import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from the Sanity CMS project
dotenv.config({ path: resolve(__dirname, '../../sanityelpriscms/.env') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function verifyLadeboksPage() {
  try {
    console.log('🔍 Verifying Ladeboks page...')
    
    // Fetch the page
    const page = await client.fetch(`*[_id == "page.ladeboks"][0]{
      _id,
      _type,
      title,
      slug,
      metaTitle,
      metaDescription,
      "contentBlocksCount": count(contentBlocks),
      contentBlocks[]{
        _type,
        _key,
        heading,
        components[]{
          _type,
          _key,
          ...,
          products[]{
            _ref
          }
        }
      }
    }`)
    
    if (page) {
      console.log('✅ Page found successfully!')
      console.log('📊 Page details:')
      console.log('  - ID:', page._id)
      console.log('  - Title:', page.title)
      console.log('  - Slug:', page.slug?.current)
      console.log('  - Content blocks:', page.contentBlocksCount)
      console.log('\n📦 Content structure:')
      page.contentBlocks?.forEach((block, index) => {
        console.log(`  ${index + 1}. ${block._type} (${block._key})`)
        if (block.heading) console.log(`     Heading: "${block.heading}"`)
        if (block.components) {
          block.components.forEach((comp) => {
            console.log(`     - ${comp._type} (${comp._key})`)
            if (comp._type === 'chargingBoxProductGrid' && comp.products) {
              console.log(`       Products: ${comp.products.map(p => p._ref).join(', ')}`)
            }
          })
        }
      })
    } else {
      console.log('❌ Page not found!')
    }
    
  } catch (error) {
    console.error('❌ Error verifying page:', error)
  }
}

// Run verification
verifyLadeboksPage()