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

async function fixHeaderAlignments() {
  try {
    console.log('Fetching Ladeboks page...\n')
    
    // Fetch the page
    const page = await client.fetch(`*[_type == "page" && slug.current == "ladeboks"][0]`)
    
    if (!page) {
      console.log('Ladeboks page not found!')
      return
    }

    console.log('Found page:', page._id)
    console.log('Content blocks count:', page.contentBlocks?.length || 0)
    
    // Check current alignments
    console.log('\nCurrent header alignments:')
    let needsUpdate = false
    
    page.contentBlocks?.forEach((block, index) => {
      if ('headerAlignment' in block) {
        console.log(`${index + 1}. ${block._type} (${block._key}): headerAlignment = "${block.headerAlignment || 'undefined'}"`)
        if (block.headerAlignment !== 'left') {
          needsUpdate = true
          console.log('   ⚠️  Needs update to "left"')
        }
      }
    })

    if (!needsUpdate) {
      console.log('\n✅ All header alignments are already set to "left"')
      return
    }

    // Update alignments
    console.log('\nUpdating header alignments...')
    
    const updatedBlocks = page.contentBlocks.map(block => {
      if ('headerAlignment' in block && block.headerAlignment !== 'left') {
        console.log(`Updating ${block._type} (${block._key}) from "${block.headerAlignment}" to "left"`)
        return { ...block, headerAlignment: 'left' }
      }
      return block
    })

    // Patch the document
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedBlocks })
      .commit()

    console.log('\n✅ Page updated successfully!')
    
    // Verify the update
    console.log('\nVerifying update...')
    const updatedPage = await client.fetch(`*[_id == "${page._id}"][0]`)
    
    console.log('\nUpdated header alignments:')
    updatedPage.contentBlocks?.forEach((block, index) => {
      if ('headerAlignment' in block) {
        console.log(`${index + 1}. ${block._type}: headerAlignment = "${block.headerAlignment}"`)
      }
    })

  } catch (error) {
    console.error('Error updating page:', error)
  }
}

// Run the update
fixHeaderAlignments()