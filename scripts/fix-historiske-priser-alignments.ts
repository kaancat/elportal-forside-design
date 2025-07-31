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

async function updateAlignments() {
  try {
    console.log('Fetching historiske-priser page...')
    
    // Fetch the page
    const page = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYjlhjr"][0]`)
    if (!page) {
      console.error('historiske-priser page not found')
      return
    }

    console.log('Found page, updating alignments...')

    // Map of content block keys to their required alignments
    const alignmentUpdates = new Map([
      // LEFT alignments
      ['co2-historisk', 'left'], // CO₂-udledning fra elforbrug
      ['fast-variabel-intro', 'left'], // Valget mellem fast og variabel pris
      ['price-factors', 'left'], // Hvad Påvirker Elpriserne?
      ['conclusion', 'left'], // Historiske elpriser giver værdifuld indsigt
      
      // CENTER alignments
      ['pricing-intro', 'center'] // Fast vs Variabel Pris: Hvad Passer Bedst til Dig?
    ])

    // Update contentBlocks
    const updatedContentBlocks = page.contentBlocks.map((block: any) => {
      const newAlignment = alignmentUpdates.get(block._key)
      
      if (newAlignment && block.headerAlignment !== newAlignment) {
        console.log(`Updating alignment for ${block._key}: ${block.headerAlignment || 'none'} -> ${newAlignment}`)
        return {
          ...block,
          headerAlignment: newAlignment
        }
      }
      
      return block
    })

    // Check if any updates were made
    const hasUpdates = updatedContentBlocks.some((block: any, index: number) => 
      block !== page.contentBlocks[index]
    )

    if (!hasUpdates) {
      console.log('No alignment updates needed')
      return
    }

    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('✅ Alignments updated successfully!')
    
    // Log the updates made
    console.log('\nUpdated components:')
    alignmentUpdates.forEach((alignment, key) => {
      const block = page.contentBlocks.find((b: any) => b._key === key)
      if (block) {
        console.log(`- ${block.title || 'Untitled'} (${key}): ${alignment}`)
      }
    })

  } catch (error) {
    console.error('Error updating alignments:', error)
  }
}

// Run the update
updateAlignments()