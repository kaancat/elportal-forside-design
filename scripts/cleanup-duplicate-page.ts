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

async function cleanupDuplicatePage() {
  console.log('Checking for duplicate forbrug-tracker pages...')

  try {
    // Check if page.forbrug-tracker exists
    const duplicatePage = await client.fetch('*[_id == "page.forbrug-tracker"][0]')
    
    if (duplicatePage) {
      console.log('Found duplicate page with ID: page.forbrug-tracker')
      console.log('Deleting duplicate...')
      
      await client.delete('page.forbrug-tracker')
      console.log('✅ Duplicate page deleted successfully!')
    } else {
      console.log('No duplicate found with ID: page.forbrug-tracker')
    }

    // Verify we still have the correct page
    const correctPage = await client.fetch('*[_id == "f5IMbE4BjT3OYPNFYb8v2Z"][0]{_id, title, "blockCount": count(contentBlocks)}')
    
    if (correctPage) {
      console.log('\n✅ Correct page verified:')
      console.log(`   ID: ${correctPage._id}`)
      console.log(`   Title: ${correctPage.title}`)
      console.log(`   Content blocks: ${correctPage.blockCount}`)
    } else {
      console.error('❌ Warning: Could not find the main forbrug-tracker page!')
    }

  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

// Run the cleanup
cleanupDuplicatePage()
  .then(() => {
    console.log('\n✨ Cleanup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })