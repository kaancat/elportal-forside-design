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

async function quickFixValueItemTitle() {
  console.log('🔍 Looking for valueItem blocks with "title" field...\n')

  try {
    // First, let's find all pages with valueProposition blocks
    const query = `*[_type == "page" && contentBlocks[_type == "valueProposition"]] {
      _id,
      title,
      slug,
      "affectedBlocks": contentBlocks[_type == "valueProposition"] {
        _key,
        _type,
        items[] {
          _key,
          _type,
          title,
          heading,
          description,
          icon
        }
      }
    }`

    const pages = await client.fetch<any[]>(query)
    console.log(`Found ${pages.length} pages with valueProposition blocks\n`)

    const pagesToFix: any[] = []

    // Check each page
    for (const page of pages) {
      let hasIssues = false
      const issues: any[] = []

      page.affectedBlocks?.forEach((block: any) => {
        block.items?.forEach((item: any, index: number) => {
          if (item.title && !item.heading) {
            hasIssues = true
            issues.push({
              itemKey: item._key,
              itemIndex: index,
              currentTitle: item.title,
              description: item.description || 'No description'
            })
          }
        })
      })

      if (hasIssues) {
        pagesToFix.push({
          ...page,
          issues
        })
      }
    }

    if (pagesToFix.length === 0) {
      console.log('✅ No valueItem blocks found with "title" field. Everything looks good!\n')
      return
    }

    console.log(`❌ Found ${pagesToFix.length} pages with valueItem "title" fields that need fixing:\n`)

    pagesToFix.forEach(page => {
      console.log(`📄 ${page.title} (${page.slug?.current || page._id})`)
      page.issues.forEach((issue: any) => {
        console.log(`   - Item: "${issue.currentTitle}"`)
      })
      console.log()
    })

    // Ask for confirmation
    const readline = await import('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise<string>((resolve) => {
      rl.question('Do you want to fix these issues? (yes/no): ', resolve)
    })
    rl.close()

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Fix cancelled.')
      return
    }

    // Apply fixes
    console.log('\n🔧 Applying fixes...\n')

    for (const page of pagesToFix) {
      try {
        // Fetch the full page document
        const fullPage = await client.fetch(`*[_id == $id][0]`, { id: page._id })
        
        if (!fullPage || !fullPage.contentBlocks) {
          console.error(`❌ Could not fetch full page data for ${page.title}`)
          continue
        }

        // Create a transaction for this page
        const transaction = client.transaction()
        const patches: any[] = []

        // Find and fix each valueProposition block
        fullPage.contentBlocks.forEach((block: any, blockIndex: number) => {
          if (block._type === 'valueProposition' && block.items) {
            block.items.forEach((item: any, itemIndex: number) => {
              if (item.title && !item.heading) {
                // Create the patch for this specific item
                patches.push({
                  path: `contentBlocks[${blockIndex}].items[${itemIndex}]`,
                  value: item.title
                })
              }
            })
          }
        })

        // Apply all patches for this page
        transaction.patch(page._id)
        
        patches.forEach(patch => {
          transaction
            .set({ [`${patch.path}.heading`]: patch.value })
            .unset([`${patch.path}.title`])
        })

        await transaction.commit()
        console.log(`✅ Fixed ${page.issues.length} items in: ${page.title}`)
        
      } catch (error) {
        console.error(`❌ Failed to fix ${page.title}:`, error)
      }
    }

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...\n')
    
    const verifyQuery = `*[_type == "page" && contentBlocks[_type == "valueProposition"]] {
      title,
      "hasErrors": count(contentBlocks[_type == "valueProposition"].items[defined(title) && !defined(heading)])
    }`

    const verification = await client.fetch<any[]>(verifyQuery)
    const remainingErrors = verification.filter(v => v.hasErrors > 0)

    if (remainingErrors.length === 0) {
      console.log('✅ All valueItem "title" fields have been successfully converted to "heading"!')
    } else {
      console.log(`⚠️  ${remainingErrors.length} pages still have errors:`)
      remainingErrors.forEach(page => {
        console.log(`   - ${page.title}: ${page.hasErrors} items`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the fix
console.log('🚀 Quick fix for valueItem title->heading conversion\n')
await quickFixValueItemTitle()
console.log('\n✨ Done!')