import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function inspectLadeboksPage() {
  try {
    console.log('Fetching Ladeboks page...\n')
    
    const page = await client.fetch(`*[_id == "page.ladeboks"][0]`)
    
    if (!page) {
      console.log('Ladeboks page not found!')
      return
    }

    console.log('Page Structure:')
    console.log(JSON.stringify(page, null, 2))
    
    console.log('\n\nContent Blocks Count:', page.contentBlocks?.length || 0)
    
    if (page.contentBlocks) {
      console.log('\nContent Block Types:')
      page.contentBlocks.forEach((block, index) => {
        console.log(`${index + 1}. ${block._type} (key: ${block._key})`)
        // Show first few fields
        const fields = Object.keys(block).filter(k => !k.startsWith('_'))
        console.log(`   Fields: ${fields.slice(0, 5).join(', ')}${fields.length > 5 ? '...' : ''}`)
      })
    }

  } catch (error) {
    console.error('Error inspecting page:', error)
  }
}

// Run the inspection
inspectLadeboksPage()