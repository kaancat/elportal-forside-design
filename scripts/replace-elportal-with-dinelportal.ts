#!/usr/bin/env tsx

/**
 * Script to replace "ElPortal" with "DinElportal" across all Sanity documents
 * 
 * This script:
 * 1. Queries ALL documents from Sanity CMS
 * 2. Recursively searches through all text fields and Portable Text blocks
 * 3. Replaces "ElPortal" with "DinElportal" (preserves case for "elportal" variations)
 * 4. Updates documents via Sanity API
 * 5. Logs all changes for transparency
 */

import { createClient } from '@sanity/client'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: process.env.VITE_SANITY_API_VERSION || '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

interface ChangeLog {
  documentId: string
  documentType: string
  field: string
  oldValue: string
  newValue: string
}

const changeLog: ChangeLog[] = []

/**
 * Replace all variations of ElPortal/DinElPortal with consistent "DinElportal":
 * - "ElPortal" → "DinElportal" 
 * - "DinElPortal" → "DinElportal" (normalize existing)
 * - "elportal" → "dinelportal"
 * - "ELPORTAL" → "DINELPORTAL"
 * - "Elportal" → "Dinelportal"
 */
function replaceElPortal(text: string): { changed: boolean, newText: string } {
  if (typeof text !== 'string') {
    return { changed: false, newText: text }
  }

  const originalText = text
  
  // Use word boundaries to prevent double replacements
  let newText = text
    .replace(/\bDinElPortal\b/g, 'DinElportal')  // Normalize DinElPortal → DinElportal
    .replace(/\bElPortal\b/g, 'DinElportal')     // Replace ElPortal → DinElportal  
    .replace(/\bELPORTAL\b/g, 'DINELPORTAL')     // Replace ELPORTAL → DINELPORTAL
    .replace(/\belportal\b/g, 'dinelportal')     // Replace elportal → dinelportal
    .replace(/\bElportal\b/g, 'Dinelportal')     // Replace Elportal → Dinelportal

  return {
    changed: originalText !== newText,
    newText: newText
  }
}

/**
 * Process Portable Text blocks recursively
 */
function processPortableText(blocks: any[], path: string): { changed: boolean, newBlocks: any[] } {
  if (!Array.isArray(blocks)) {
    return { changed: false, newBlocks: blocks }
  }

  let hasChanges = false
  const newBlocks = blocks.map((block, index) => {
    if (typeof block === 'string') {
      const { changed, newText } = replaceElPortal(block)
      if (changed) hasChanges = true
      return newText
    }

    if (typeof block === 'object' && block !== null) {
      return processObjectRecursively(block, `${path}[${index}]`).newObj
    }

    return block
  })

  return { changed: hasChanges, newBlocks }
}

/**
 * Process any object recursively, looking for text fields
 */
function processObjectRecursively(obj: any, path: string): { changed: boolean, newObj: any } {
  if (typeof obj !== 'object' || obj === null) {
    return { changed: false, newObj: obj }
  }

  if (Array.isArray(obj)) {
    return processPortableText(obj, path)
  }

  let hasChanges = false
  const newObj = { ...obj }

  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = `${path}.${key}`

    if (typeof value === 'string') {
      const { changed, newText } = replaceElPortal(value)
      if (changed) {
        hasChanges = true
        newObj[key] = newText
        
        // Log the change
        changeLog.push({
          documentId: obj._id || 'unknown',
          documentType: obj._type || 'unknown',
          field: fieldPath,
          oldValue: value,
          newValue: newText
        })
        
        console.log(`📝 Field change: ${fieldPath}`)
        console.log(`   Old: "${value}"`)
        console.log(`   New: "${newText}"`)
      }
    } else if (Array.isArray(value)) {
      const { changed, newBlocks } = processPortableText(value, fieldPath)
      if (changed) {
        hasChanges = true
        newObj[key] = newBlocks
      }
    } else if (typeof value === 'object' && value !== null) {
      const { changed, newObj: processedValue } = processObjectRecursively(value, fieldPath)
      if (changed) {
        hasChanges = true
        newObj[key] = processedValue
      }
    }
  }

  return { changed: hasChanges, newObj }
}

/**
 * Main execution function
 */
async function replaceElPortalInAllDocuments() {
  try {
    console.log('🔍 Fetching all documents from Sanity...')
    
    // Query ALL documents from Sanity
    const allDocuments = await client.fetch(`*[!(_id in path("drafts.**"))] {
      ...,
      "totalDocuments": count(*[!(_id in path("drafts.**"))])
    }`)
    
    console.log(`📊 Found ${allDocuments.length} documents to process`)
    console.log('🔄 Starting text replacement process...\n')

    const documentsToUpdate: any[] = []
    let processedCount = 0

    for (const document of allDocuments) {
      processedCount++
      console.log(`\n📄 Processing document ${processedCount}/${allDocuments.length}: ${document._type} (${document._id})`)
      
      const { changed, newObj } = processObjectRecursively(document, document._type)
      
      if (changed) {
        documentsToUpdate.push(newObj)
        console.log(`✅ Changes detected in ${document._type} (${document._id})`)
      } else {
        console.log(`⏭️  No changes needed in ${document._type} (${document._id})`)
      }
    }

    // Update all changed documents
    if (documentsToUpdate.length > 0) {
      console.log(`\n🔄 Updating ${documentsToUpdate.length} documents in Sanity...`)
      
      const transaction = client.transaction()
      documentsToUpdate.forEach(doc => {
        transaction.createOrReplace(doc)
      })
      
      const result = await transaction.commit()
      console.log(`✅ Successfully updated ${result.length} documents`)
      
      // Print summary
      console.log('\n📋 SUMMARY OF CHANGES:')
      console.log(`Total documents processed: ${allDocuments.length}`)
      console.log(`Documents updated: ${documentsToUpdate.length}`)
      console.log(`Total field changes: ${changeLog.length}`)
      
      // Group changes by document type
      const changesByType = changeLog.reduce((acc, change) => {
        acc[change.documentType] = (acc[change.documentType] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      console.log('\nChanges by document type:')
      Object.entries(changesByType).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count} changes`)
      })
      
    } else {
      console.log('\n✨ No documents needed updating - all good!')
    }
    
    // Export detailed change log
    const fs = await import('fs/promises')
    await fs.writeFile(
      'elportal-replacement-log.json', 
      JSON.stringify(changeLog, null, 2)
    )
    console.log('\n📝 Detailed change log saved to: elportal-replacement-log.json')
    
  } catch (error) {
    console.error('❌ Error during replacement process:', error)
    throw error
  }
}

/**
 * Dry run function - shows what would be changed without making updates
 */
async function dryRun() {
  console.log('🧪 DRY RUN MODE - No changes will be made\n')
  
  try {
    const allDocuments = await client.fetch(`*[!(_id in path("drafts.**"))] {
      ...,
      "totalDocuments": count(*[!(_id in path("drafts.**"))])
    }`)
    
    console.log(`📊 Found ${allDocuments.length} documents to analyze`)
    
    let documentsWithChanges = 0
    let totalFieldChanges = 0

    for (const document of allDocuments) {
      const originalChangeLogLength = changeLog.length
      processObjectRecursively(document, document._type)
      
      const newChanges = changeLog.length - originalChangeLogLength
      if (newChanges > 0) {
        documentsWithChanges++
        totalFieldChanges += newChanges
        console.log(`📄 ${document._type} (${document._id}): ${newChanges} changes`)
      }
    }
    
    console.log('\n📋 DRY RUN SUMMARY:')
    console.log(`Documents that would be updated: ${documentsWithChanges}`)
    console.log(`Total field changes: ${totalFieldChanges}`)
    
    if (totalFieldChanges > 0) {
      console.log('\nFirst 10 changes preview:')
      changeLog.slice(0, 10).forEach(change => {
        console.log(`  ${change.documentType}.${change.field}: "${change.oldValue}" → "${change.newValue}"`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error during dry run:', error)
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  
  console.log('🚀 ElPortal → DinElportal Replacement Script')
  console.log('============================================\n')
  
  if (isDryRun) {
    await dryRun()
  } else {
    console.log('⚠️  This script will make REAL changes to your Sanity dataset!')
    console.log('⚠️  Make sure you have a backup or are working on a test dataset.')
    console.log('⚠️  Use --dry-run flag to preview changes first.\n')
    
    // Add a small delay to give user time to cancel
    console.log('Starting in 3 seconds... (Press Ctrl+C to cancel)')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    await replaceElPortalInAllDocuments()
  }
  
  console.log('\n🎉 Script completed!')
}

// Run if this is the main module (ES modules)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}