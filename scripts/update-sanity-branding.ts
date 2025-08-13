#!/usr/bin/env npx tsx
/**
 * Updates all "ElPortal" references to "DinElportal" in Sanity CMS
 * This script updates documents one at a time with proper error handling
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

interface UpdateResult {
  documentId: string
  success: boolean
  error?: string
  changes?: string[]
}

// Function to recursively replace ElPortal with DinElportal
function replaceInObject(obj: any, path: string = ''): { updated: any; changes: string[] } {
  const changes: string[] = []
  
  if (typeof obj === 'string') {
    // Replace various case patterns
    const patterns = [
      { pattern: /\bElPortal\b/g, replacement: 'DinElportal' },
      { pattern: /\belportal\b/g, replacement: 'dinelportal' },
      { pattern: /\bELPORTAL\b/g, replacement: 'DINELPORTAL' },
      // Also normalize already changed ones
      { pattern: /\bDinElPortal\b/g, replacement: 'DinElportal' },
    ]
    
    let updated = obj
    for (const { pattern, replacement } of patterns) {
      const newValue = updated.replace(pattern, replacement)
      if (newValue !== updated) {
        changes.push(`${path}: "${updated.substring(0, 50)}..." → "${newValue.substring(0, 50)}..."`)
        updated = newValue
      }
    }
    return { updated, changes }
  }
  
  if (Array.isArray(obj)) {
    const updatedArray: any[] = []
    for (let i = 0; i < obj.length; i++) {
      const result = replaceInObject(obj[i], `${path}[${i}]`)
      updatedArray.push(result.updated)
      changes.push(...result.changes)
    }
    return { updated: updatedArray, changes }
  }
  
  if (obj && typeof obj === 'object') {
    const updatedObj: any = {}
    for (const key in obj) {
      if (key.startsWith('_')) {
        // Skip Sanity internal fields
        updatedObj[key] = obj[key]
      } else {
        const result = replaceInObject(obj[key], path ? `${path}.${key}` : key)
        updatedObj[key] = result.updated
        changes.push(...result.changes)
      }
    }
    return { updated: updatedObj, changes }
  }
  
  return { updated: obj, changes: [] }
}

async function updateDocument(doc: any): Promise<UpdateResult> {
  try {
    // Skip system documents
    if (doc._id.startsWith('_.') || doc._type === 'system.schema') {
      console.log(`\n⏭️  Skipping system document: ${doc._id}`)
      return { documentId: doc._id, success: true, changes: [] }
    }
    
    const { updated, changes } = replaceInObject(doc)
    
    if (changes.length === 0) {
      return { documentId: doc._id, success: true, changes: [] }
    }
    
    console.log(`\n📝 Updating document: ${doc._id} (${doc._type})`)
    console.log(`   Found ${changes.length} changes`)
    
    // Use createOrReplace which should work with the token
    const result = await client.createOrReplace(updated)
    
    console.log(`   ✅ Successfully updated`)
    return { documentId: doc._id, success: true, changes }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error(`   ❌ Failed to update: ${errorMsg}`)
    return { documentId: doc._id, success: false, error: errorMsg, changes: [] }
  }
}

async function main() {
  console.log('🔍 Fetching all documents from Sanity...')
  
  try {
    // Fetch all documents
    const documents = await client.fetch('*[]')
    console.log(`Found ${documents.length} documents total`)
    
    // Filter to documents that actually contain ElPortal
    const documentsToUpdate = documents.filter((doc: any) => {
      const docString = JSON.stringify(doc)
      return /\bElPortal\b/i.test(docString) || /\bDinElPortal\b/i.test(docString)
    })
    
    console.log(`\n📊 ${documentsToUpdate.length} documents contain "ElPortal" or need normalization`)
    
    const results: UpdateResult[] = []
    
    // Update documents one by one
    for (const doc of documentsToUpdate) {
      const result = await updateDocument(doc)
      results.push(result)
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 UPDATE SUMMARY')
    console.log('='.repeat(60))
    
    const successful = results.filter(r => r.success && r.changes && r.changes.length > 0)
    const failed = results.filter(r => !r.success)
    const unchanged = results.filter(r => r.success && (!r.changes || r.changes.length === 0))
    
    console.log(`✅ Successfully updated: ${successful.length} documents`)
    console.log(`⏭️  No changes needed: ${unchanged.length} documents`)
    console.log(`❌ Failed to update: ${failed.length} documents`)
    
    if (failed.length > 0) {
      console.log('\n❌ Failed documents:')
      failed.forEach(r => {
        console.log(`   - ${r.documentId}: ${r.error}`)
      })
    }
    
    console.log('\n✨ Brand update complete!')
    
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
main()