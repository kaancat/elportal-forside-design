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

async function fixDuplicateKeys() {
  try {
    const pageId = '1BrgDwXdqxJ08rMIoYfLjP'
    
    console.log('Fetching page content...')
    const page = await client.fetch(`*[_id == "${pageId}"][0]{
      _id,
      contentBlocks[]{
        _key,
        _type
      }
    }`)
    
    if (!page) {
      console.error('Page not found')
      return
    }
    
    // Check for duplicate keys
    const keys = page.contentBlocks.map((block: any) => block._key)
    const duplicates = keys.filter((key: string, index: number) => keys.indexOf(key) !== index)
    
    if (duplicates.length > 0) {
      console.log('Found duplicate keys:', duplicates)
    }
    
    // Create a map to track key usage
    const keyCount: { [key: string]: number } = {}
    
    // Generate unique keys for all blocks
    const fixedContentBlocks = page.contentBlocks.map((block: any, index: number) => {
      let baseKey = block._key || `block-${index}`
      
      // If we've seen this key before, append a number
      if (keyCount[baseKey]) {
        keyCount[baseKey]++
        return { ...block, _key: `${baseKey}-${keyCount[baseKey]}` }
      } else {
        keyCount[baseKey] = 1
        return block
      }
    })
    
    console.log('\nFixed content blocks:')
    fixedContentBlocks.forEach((block: any) => {
      console.log(`- ${block._type}: ${block._key}`)
    })
    
    // Fetch full content blocks to preserve all data
    const fullPage = await client.fetch(`*[_id == "${pageId}"][0]`)
    
    // Update with fixed keys
    const updatedContentBlocks = fullPage.contentBlocks.map((block: any, index: number) => {
      return { ...block, _key: fixedContentBlocks[index]._key }
    })
    
    console.log('\nUpdating page with unique keys...')
    
    const result = await client
      .patch(pageId)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Successfully fixed duplicate keys!')
    console.log('New revision:', result._rev)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the script
fixDuplicateKeys()