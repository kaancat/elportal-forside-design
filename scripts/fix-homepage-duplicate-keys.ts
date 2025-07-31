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

// Helper function to generate unique keys
function generateKey() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

// Function to recursively fix keys in any object/array
function fixKeysRecursively(obj: any, usedKeys: Set<string> = new Set()): any {
  if (Array.isArray(obj)) {
    return obj.map(item => fixKeysRecursively(item, usedKeys))
  }
  
  if (obj && typeof obj === 'object') {
    const newObj = { ...obj }
    
    // If this object has a _key, ensure it's unique
    if (newObj._key) {
      let newKey = newObj._key
      let attempts = 0
      while (usedKeys.has(newKey) && attempts < 10) {
        newKey = generateKey()
        attempts++
      }
      usedKeys.add(newKey)
      newObj._key = newKey
    }
    
    // Recursively process all properties
    for (const key in newObj) {
      if (newObj.hasOwnProperty(key) && key !== '_key') {
        newObj[key] = fixKeysRecursively(newObj[key], usedKeys)
      }
    }
    
    return newObj
  }
  
  return obj
}

async function fixHomepageDuplicateKeys() {
  try {
    console.log('🔧 Fixing duplicate keys in homepage content...')
    
    // Fetch the current homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    console.log(`Found homepage with ${homepage.contentBlocks?.length || 0} content blocks`)
    
    // Track all keys to ensure uniqueness
    const usedKeys = new Set<string>()
    
    // Fix keys in contentBlocks
    const fixedContentBlocks = fixKeysRecursively(homepage.contentBlocks || [], usedKeys)
    
    // Count how many keys were processed
    console.log(`Processed ${usedKeys.size} unique keys`)
    
    // Update the homepage with fixed keys
    const result = await client.patch(homepage._id)
      .set({ contentBlocks: fixedContentBlocks })
      .commit()
    
    console.log('✅ Successfully fixed duplicate keys!')
    console.log('Homepage is now accessible in Sanity Studio')
    
    // Verify by checking for duplicates
    const allKeys: string[] = []
    const extractKeys = (obj: any) => {
      if (Array.isArray(obj)) {
        obj.forEach(item => extractKeys(item))
      } else if (obj && typeof obj === 'object') {
        if (obj._key) allKeys.push(obj._key)
        Object.values(obj).forEach(value => extractKeys(value))
      }
    }
    
    extractKeys(result.contentBlocks)
    const uniqueKeys = new Set(allKeys)
    
    if (allKeys.length === uniqueKeys.size) {
      console.log(`✅ Verification passed: All ${allKeys.length} keys are unique`)
    } else {
      console.log(`⚠️  Warning: Found ${allKeys.length - uniqueKeys.size} duplicate keys remaining`)
    }
    
  } catch (error) {
    console.error('❌ Error fixing duplicate keys:', error)
  }
}

// Run the script
fixHomepageDuplicateKeys()