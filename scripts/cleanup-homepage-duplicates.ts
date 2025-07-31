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

async function cleanupHomepageDuplicates() {
  try {
    console.log('🧹 Cleaning up homepage duplicates...')
    
    // Fetch the current homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    const contentBlocks = homepage.contentBlocks || []
    console.log(`Found ${contentBlocks.length} content blocks`)
    
    // Find duplicate appliance calculators
    const applianceCalculatorIndices: number[] = []
    contentBlocks.forEach((block: any, index: number) => {
      if (block._type === 'applianceCalculator') {
        applianceCalculatorIndices.push(index)
      }
    })
    
    console.log(`Found ${applianceCalculatorIndices.length} appliance calculator blocks at indices: ${applianceCalculatorIndices.join(', ')}`)
    
    // Keep only the first appliance calculator if there are duplicates
    if (applianceCalculatorIndices.length > 1) {
      // Remove duplicates (keep the first one)
      const indicesToRemove = applianceCalculatorIndices.slice(1).reverse() // Reverse to remove from end first
      
      indicesToRemove.forEach(index => {
        console.log(`Removing duplicate appliance calculator at index ${index}`)
        contentBlocks.splice(index, 1)
      })
      
      // Update the homepage
      const result = await client.patch(homepage._id)
        .set({ contentBlocks })
        .commit()
      
      console.log(`✅ Removed ${indicesToRemove.length} duplicate appliance calculator(s)`)
      console.log(`Homepage now has ${result.contentBlocks.length} content blocks`)
    } else {
      console.log('✅ No duplicate appliance calculators found')
    }
    
    // Print final structure
    console.log('\nFinal homepage structure:')
    contentBlocks.forEach((block: any, index: number) => {
      console.log(`${index + 1}. ${block._type}${block.title ? ` - "${block.title}"` : ''}`)
    })
    
  } catch (error) {
    console.error('❌ Error cleaning up duplicates:', error)
  }
}

// Run the script
cleanupHomepageDuplicates()