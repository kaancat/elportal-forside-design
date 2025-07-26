#!/usr/bin/env node

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production', 
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
})

interface ValueItem {
  _key: string
  _type: string
  title?: string
  heading?: string
  description?: string
  icon?: any
}

interface ContentBlock {
  _key: string
  _type: string
  title?: string
  items?: ValueItem[]
}

interface Page {
  _id: string
  _type: string
  title: string
  slug?: { current: string }
  contentBlocks?: ContentBlock[]
}

async function findAndFixValuePropositionErrors() {
  console.log('🔍 Searching for value proposition blocks with validation errors...\n')

  try {
    // Query for all pages with content blocks
    const query = `*[_type == "page"] {
      _id,
      _type,
      title,
      slug,
      contentBlocks[] {
        _key,
        _type,
        ...,
        items[] {
          _key,
          _type,
          ...
        }
      }
    }`

    const pages = await client.fetch<Page[]>(query)
    console.log(`Found ${pages.length} pages to check\n`)

    let totalErrors = 0
    let totalFixed = 0
    const updates: any[] = []

    for (const page of pages) {
      if (!page.contentBlocks || page.contentBlocks.length === 0) continue

      const pageSlug = page.slug?.current || page._id
      let pageHasErrors = false
      const pageUpdates: any[] = []

      // Check each content block
      page.contentBlocks.forEach((block, blockIndex) => {
        if (block._type === 'valueProposition' && block.items) {
          // Check each value item
          block.items.forEach((item, itemIndex) => {
            // Check if item has 'title' instead of 'heading'
            if (item.title && !item.heading) {
              totalErrors++
              pageHasErrors = true
              
              console.log(`❌ Found error in page "${page.title}" (${pageSlug})`)
              console.log(`   Block ${blockIndex + 1}: Value Item ${itemIndex + 1} has 'title' instead of 'heading'`)
              console.log(`   Title value: "${item.title}"`)
              
              // Create patch operation to fix this
              const patchPath = `contentBlocks[${blockIndex}].items[${itemIndex}]`
              pageUpdates.push({
                set: {
                  [`${patchPath}.heading`]: item.title
                },
                unset: [`${patchPath}.title`]
              })
            }

            // Check for other potential issues
            if (!item.description) {
              console.log(`⚠️  Warning: Value Item ${itemIndex + 1} in block ${blockIndex + 1} is missing required 'description' field`)
            }
          })
        }
      })

      if (pageHasErrors && pageUpdates.length > 0) {
        updates.push({
          pageId: page._id,
          pageTitle: page.title,
          pageSlug: pageSlug,
          patches: pageUpdates
        })
      }
    }

    if (totalErrors === 0) {
      console.log('✅ No validation errors found! All value items are using the correct "heading" field.\n')
      return
    }

    console.log(`\n📊 Summary: Found ${totalErrors} validation errors across ${updates.length} pages\n`)

    // Ask for confirmation
    console.log('The following updates will be applied:\n')
    updates.forEach(update => {
      console.log(`📄 Page: ${update.pageTitle} (${update.pageSlug})`)
      console.log(`   Will fix ${update.patches.length} value items\n`)
    })

    const readline = await import('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise<string>((resolve) => {
      rl.question('\nDo you want to apply these fixes? (yes/no): ', resolve)
    })
    rl.close()

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Migration cancelled.')
      return
    }

    // Apply the fixes
    console.log('\n🔧 Applying fixes...\n')

    for (const update of updates) {
      try {
        console.log(`Updating ${update.pageTitle}...`)
        
        // Combine all patches for this page
        const transaction = client.transaction()
        
        // Apply all set operations
        const setOperations: any = {}
        const unsetOperations: string[] = []
        
        update.patches.forEach((patch: any) => {
          if (patch.set) {
            Object.assign(setOperations, patch.set)
          }
          if (patch.unset) {
            unsetOperations.push(...patch.unset)
          }
        })
        
        transaction.patch(update.pageId)
        
        if (Object.keys(setOperations).length > 0) {
          transaction.set(setOperations)
        }
        
        if (unsetOperations.length > 0) {
          transaction.unset(unsetOperations)
        }
        
        await transaction.commit()
        
        console.log(`✅ Successfully updated ${update.pageTitle}`)
        totalFixed++
      } catch (error) {
        console.error(`❌ Failed to update ${update.pageTitle}:`, error)
      }
    }

    console.log(`\n✅ Migration complete! Fixed ${totalFixed} out of ${updates.length} pages with errors.`)

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...\n')
    
    const verificationQuery = `*[_type == "page"] {
      _id,
      title,
      slug,
      contentBlocks[] {
        _type == "valueProposition" => {
          _type,
          items[] {
            _key,
            _type,
            title,
            heading,
            description
          }
        }
      }
    }`

    const verifiedPages = await client.fetch<any[]>(verificationQuery)
    let remainingErrors = 0

    verifiedPages.forEach(page => {
      if (page.contentBlocks) {
        page.contentBlocks.forEach((block: any) => {
          if (block._type === 'valueProposition' && block.items) {
            block.items.forEach((item: any) => {
              if (item.title && !item.heading) {
                remainingErrors++
                console.log(`❌ Still has error: ${page.title} - value item has 'title' field`)
              }
            })
          }
        })
      }
    })

    if (remainingErrors === 0) {
      console.log('✅ All validation errors have been successfully fixed!')
    } else {
      console.log(`⚠️  Warning: ${remainingErrors} errors remain. You may need to run the script again.`)
    }

  } catch (error) {
    console.error('❌ Error during migration:', error)
    process.exit(1)
  }
}

// Check for other common validation errors
async function checkOtherValidationErrors() {
  console.log('\n\n🔍 Checking for other common validation errors...\n')

  try {
    const query = `*[_type == "page"] {
      _id,
      title,
      slug,
      contentBlocks[] {
        _key,
        _type,
        ...
      }
    }`

    const pages = await client.fetch<any[]>(query)
    const validationIssues: string[] = []

    pages.forEach(page => {
      if (page.contentBlocks) {
        page.contentBlocks.forEach((block: any, index: number) => {
          // Check for missing required fields based on block type
          switch (block._type) {
            case 'hero':
              if (!block.heading) {
                validationIssues.push(`${page.title}: Hero block ${index + 1} missing required 'heading'`)
              }
              break
            
            case 'featureSection':
              if (!block.title) {
                validationIssues.push(`${page.title}: Feature section ${index + 1} missing required 'title'`)
              }
              break
              
            case 'testimonials':
              if (!block.title) {
                validationIssues.push(`${page.title}: Testimonials block ${index + 1} missing required 'title'`)
              }
              break
              
            case 'ctaSection':
              if (!block.heading) {
                validationIssues.push(`${page.title}: CTA section ${index + 1} missing required 'heading'`)
              }
              if (!block.ctaText) {
                validationIssues.push(`${page.title}: CTA section ${index + 1} missing required 'ctaText'`)
              }
              break
          }
        })
      }
    })

    if (validationIssues.length > 0) {
      console.log('⚠️  Found the following potential validation issues:\n')
      validationIssues.forEach(issue => console.log(`  - ${issue}`))
      console.log('\nThese may need manual review and fixing.')
    } else {
      console.log('✅ No other obvious validation errors found!')
    }

  } catch (error) {
    console.error('❌ Error checking for validation errors:', error)
  }
}

// Run the migration
console.log('🚀 Starting Value Proposition migration script...\n')

await findAndFixValuePropositionErrors()
await checkOtherValidationErrors()

console.log('\n✨ Script completed!')