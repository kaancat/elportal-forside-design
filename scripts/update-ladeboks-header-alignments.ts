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

async function updateHeaderAlignments() {
  console.log('Fetching ladeboks page...')
  
  // Fetch the page with the specific ID
  const page = await client.fetch(`*[_id == "Ldbn1aqxfi6rpqe9dn"][0]`)
  
  if (!page) {
    console.error('Page not found with ID: Ldbn1aqxfi6rpqe9dn')
    return
  }
  
  console.log(`Found page: ${page.title}`)
  console.log('Current content blocks:', page.contentBlocks?.length || 0)
  
  // Create a deep copy of the page
  const updatedPage = JSON.parse(JSON.stringify(page))
  
  // Track changes
  let changesCount = 0
  
  // Update headerAlignment in all content blocks
  if (updatedPage.contentBlocks && Array.isArray(updatedPage.contentBlocks)) {
    updatedPage.contentBlocks = updatedPage.contentBlocks.map((block: any) => {
      // Check if this block has headerAlignment
      if (block.headerAlignment && block.headerAlignment !== 'left') {
        console.log(`Updating ${block._type} headerAlignment from '${block.headerAlignment}' to 'left'`)
        changesCount++
        return {
          ...block,
          headerAlignment: 'left'
        }
      }
      
      // Check for nested headerAlignment in pageSection
      if (block._type === 'pageSection' && block.headerAlignment && block.headerAlignment !== 'left') {
        console.log(`Updating pageSection headerAlignment from '${block.headerAlignment}' to 'left'`)
        changesCount++
        return {
          ...block,
          headerAlignment: 'left'
        }
      }
      
      // Check for chargingBoxShowcase
      if (block._type === 'chargingBoxShowcase' && block.headerAlignment && block.headerAlignment !== 'left') {
        console.log(`Updating chargingBoxShowcase headerAlignment from '${block.headerAlignment}' to 'left'`)
        changesCount++
        return {
          ...block,
          headerAlignment: 'left'
        }
      }
      
      // Check for co2EmissionsChart
      if (block._type === 'co2EmissionsChart' && block.headerAlignment && block.headerAlignment !== 'left') {
        console.log(`Updating co2EmissionsChart headerAlignment from '${block.headerAlignment}' to 'left'`)
        changesCount++
        return {
          ...block,
          headerAlignment: 'left'
        }
      }
      
      // Check for any other component types with headerAlignment
      if (block.headerAlignment && block.headerAlignment !== 'left') {
        console.log(`Updating ${block._type} headerAlignment from '${block.headerAlignment}' to 'left'`)
        changesCount++
        return {
          ...block,
          headerAlignment: 'left'
        }
      }
      
      return block
    })
  }
  
  if (changesCount === 0) {
    console.log('No headerAlignment fields found that need updating.')
    return
  }
  
  console.log(`\nFound ${changesCount} headerAlignment fields to update.`)
  console.log('Updating page in Sanity...')
  
  try {
    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedPage.contentBlocks })
      .commit()
    
    console.log('\n✅ Successfully updated headerAlignment fields!')
    console.log(`Updated ${changesCount} fields from 'center' to 'left'`)
    console.log('Page ID:', result._id)
    
    // Verify the update
    console.log('\nVerifying update...')
    const verifiedPage = await client.fetch(`*[_id == "${page._id}"][0]`)
    
    let verifiedCount = 0
    if (verifiedPage.contentBlocks) {
      verifiedPage.contentBlocks.forEach((block: any) => {
        if (block.headerAlignment === 'left') {
          verifiedCount++
        }
      })
    }
    
    console.log(`Verified: ${verifiedCount} blocks now have headerAlignment: 'left'`)
    
  } catch (error) {
    console.error('Error updating page:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
  }
}

// Execute the update
updateHeaderAlignments()
  .then(() => {
    console.log('\nUpdate process completed!')
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })