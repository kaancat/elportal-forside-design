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

// Define known schema field mappings
const FIELD_MAPPINGS = {
  valueItem: {
    'title': 'heading' // title should be heading in valueItem
  },
  // Add more mappings as needed
}

// Define required fields for each content type
const REQUIRED_FIELDS = {
  valueItem: ['heading', 'description'],
  hero: ['heading'],
  featureSection: ['title'],
  testimonials: ['title'],
  ctaSection: ['heading', 'ctaText'],
  pageSection: [], // pageSection itself doesn't have required fields
  // Add more as needed
}

interface ValidationError {
  pageId: string
  pageTitle: string
  pageSlug: string
  blockIndex: number
  blockType: string
  itemIndex?: number
  errorType: 'field_mismatch' | 'missing_required' | 'unknown_field'
  field: string
  message: string
  fix?: {
    operation: 'rename' | 'set' | 'unset'
    from?: string
    to?: string
    value?: any
  }
}

async function comprehensiveSchemaValidation() {
  console.log('🔍 Running comprehensive schema validation...\n')

  try {
    // Fetch all pages with their complete content structure
    const query = `*[_type == "page"] {
      _id,
      _type,
      title,
      slug,
      contentBlocks[] {
        _key,
        _type,
        ...,
        // Expand nested items for valueProposition
        _type == "valueProposition" => {
          items[] {
            _key,
            _type,
            ...
          }
        },
        // Expand nested features for featureSection
        _type == "featureSection" => {
          features[] {
            _key,
            _type,
            ...
          }
        },
        // Add more expansions as needed
      }
    }`

    const pages = await client.fetch<any[]>(query)
    console.log(`Found ${pages.length} pages to validate\n`)

    const validationErrors: ValidationError[] = []

    // Validate each page
    for (const page of pages) {
      if (!page.contentBlocks || page.contentBlocks.length === 0) continue

      const pageSlug = page.slug?.current || page._id

      // Check each content block
      page.contentBlocks.forEach((block: any, blockIndex: number) => {
        // Special handling for valueProposition blocks
        if (block._type === 'valueProposition' && block.items) {
          block.items.forEach((item: any, itemIndex: number) => {
            // Check for field mismatches
            if (item._type === 'valueItem') {
              // Check for 'title' that should be 'heading'
              if (item.title && !item.heading) {
                validationErrors.push({
                  pageId: page._id,
                  pageTitle: page.title,
                  pageSlug: pageSlug,
                  blockIndex,
                  blockType: block._type,
                  itemIndex,
                  errorType: 'field_mismatch',
                  field: 'title',
                  message: `Value item has 'title' field but should use 'heading'`,
                  fix: {
                    operation: 'rename',
                    from: 'title',
                    to: 'heading'
                  }
                })
              }

              // Check for required fields
              const requiredFields = REQUIRED_FIELDS.valueItem || []
              requiredFields.forEach(field => {
                if (!item[field]) {
                  validationErrors.push({
                    pageId: page._id,
                    pageTitle: page.title,
                    pageSlug: pageSlug,
                    blockIndex,
                    blockType: block._type,
                    itemIndex,
                    errorType: 'missing_required',
                    field,
                    message: `Value item missing required field '${field}'`
                  })
                }
              })
            }
          })
        }

        // Check for required fields in the block itself
        const blockRequiredFields = REQUIRED_FIELDS[block._type] || []
        blockRequiredFields.forEach(field => {
          if (!block[field]) {
            validationErrors.push({
              pageId: page._id,
              pageTitle: page.title,
              pageSlug: pageSlug,
              blockIndex,
              blockType: block._type,
              errorType: 'missing_required',
              field,
              message: `${block._type} block missing required field '${field}'`
            })
          }
        })
      })
    }

    // Display validation results
    if (validationErrors.length === 0) {
      console.log('✅ No schema validation errors found!\n')
      return
    }

    console.log(`❌ Found ${validationErrors.length} validation errors:\n`)

    // Group errors by page
    const errorsByPage = validationErrors.reduce((acc, error) => {
      if (!acc[error.pageId]) {
        acc[error.pageId] = {
          title: error.pageTitle,
          slug: error.pageSlug,
          errors: []
        }
      }
      acc[error.pageId].errors.push(error)
      return acc
    }, {} as Record<string, { title: string; slug: string; errors: ValidationError[] }>)

    // Display errors by page
    Object.entries(errorsByPage).forEach(([pageId, { title, slug, errors }]) => {
      console.log(`📄 Page: ${title} (${slug})`)
      errors.forEach(error => {
        const location = error.itemIndex !== undefined 
          ? `Block ${error.blockIndex + 1}, Item ${error.itemIndex + 1}`
          : `Block ${error.blockIndex + 1}`
        console.log(`   ${location}: ${error.message}`)
      })
      console.log()
    })

    // Separate fixable and non-fixable errors
    const fixableErrors = validationErrors.filter(e => e.fix)
    const nonFixableErrors = validationErrors.filter(e => !e.fix)

    if (fixableErrors.length > 0) {
      console.log(`\n🔧 ${fixableErrors.length} errors can be automatically fixed`)
    }
    
    if (nonFixableErrors.length > 0) {
      console.log(`⚠️  ${nonFixableErrors.length} errors require manual intervention`)
    }

    if (fixableErrors.length === 0) {
      console.log('\nNo automatic fixes available. Manual intervention required.')
      return
    }

    // Ask for confirmation to fix
    const readline = await import('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const answer = await new Promise<string>((resolve) => {
      rl.question('\nDo you want to apply the automatic fixes? (yes/no): ', resolve)
    })
    rl.close()

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Fix cancelled.')
      return
    }

    // Apply fixes
    console.log('\n🔧 Applying fixes...\n')

    // Group fixes by page
    const fixesByPage = fixableErrors.reduce((acc, error) => {
      if (!acc[error.pageId]) {
        acc[error.pageId] = []
      }
      acc[error.pageId].push(error)
      return acc
    }, {} as Record<string, ValidationError[]>)

    let successCount = 0
    let failCount = 0

    for (const [pageId, fixes] of Object.entries(fixesByPage)) {
      try {
        const transaction = client.transaction()
        const setOperations: any = {}
        const unsetPaths: string[] = []

        fixes.forEach(fix => {
          if (fix.fix?.operation === 'rename' && fix.fix.from && fix.fix.to) {
            const basePath = fix.itemIndex !== undefined
              ? `contentBlocks[${fix.blockIndex}].items[${fix.itemIndex}]`
              : `contentBlocks[${fix.blockIndex}]`
            
            // Get the current value to set in the new field
            const currentValue = fix.itemIndex !== undefined
              ? errorsByPage[pageId].errors.find(e => 
                  e.blockIndex === fix.blockIndex && 
                  e.itemIndex === fix.itemIndex && 
                  e.field === fix.fix?.from
                )
              : null

            // For rename operations, we need to fetch the current value
            const pageData = await client.fetch(`*[_id == $id][0]`, { id: pageId })
            let value
            
            if (fix.itemIndex !== undefined) {
              value = pageData.contentBlocks[fix.blockIndex].items[fix.itemIndex][fix.fix.from]
            } else {
              value = pageData.contentBlocks[fix.blockIndex][fix.fix.from]
            }

            if (value !== undefined) {
              setOperations[`${basePath}.${fix.fix.to}`] = value
              unsetPaths.push(`${basePath}.${fix.fix.from}`)
            }
          }
        })

        transaction.patch(pageId)
        
        if (Object.keys(setOperations).length > 0) {
          transaction.set(setOperations)
        }
        
        if (unsetPaths.length > 0) {
          transaction.unset(unsetPaths)
        }
        
        await transaction.commit()
        console.log(`✅ Fixed ${fixes.length} errors in: ${errorsByPage[pageId].title}`)
        successCount++
      } catch (error) {
        console.error(`❌ Failed to fix errors in ${errorsByPage[pageId].title}:`, error)
        failCount++
      }
    }

    console.log(`\n✅ Successfully fixed errors in ${successCount} pages`)
    if (failCount > 0) {
      console.log(`❌ Failed to fix errors in ${failCount} pages`)
    }

    // Run validation again to verify
    console.log('\n🔍 Running validation again to verify fixes...\n')
    await comprehensiveSchemaValidation()

  } catch (error) {
    console.error('❌ Error during validation:', error)
    process.exit(1)
  }
}

// Run the validation
console.log('🚀 Starting comprehensive schema validation and fix...\n')
await comprehensiveSchemaValidation()
console.log('\n✨ Script completed!')