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

async function deleteEnergyTips() {
  try {
    console.log('Fetching all energyTip documents...')
    
    // Find all energyTip documents
    const query = `*[_type == "energyTip"]._id`
    const tipIds = await client.fetch<string[]>(query)
    
    if (!tipIds || tipIds.length === 0) {
      console.log('No energyTip documents found')
      return
    }
    
    console.log(`Found ${tipIds.length} energyTip documents to delete`)
    
    // Delete all tips
    for (const id of tipIds) {
      try {
        await client.delete(id)
        console.log(`Deleted: ${id}`)
      } catch (err) {
        console.error(`Failed to delete ${id}:`, err)
      }
    }
    
    console.log('✅ Successfully deleted all energyTip documents')
    
  } catch (error) {
    console.error('❌ Error deleting tips:', error)
    process.exit(1)
  }
}

deleteEnergyTips()