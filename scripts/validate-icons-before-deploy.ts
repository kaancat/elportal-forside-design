#!/usr/bin/env npx tsx

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../.env') })

if (!process.env.VITE_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
  throw new Error('Missing required environment variables')
}

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

interface IconValidationResult {
  isValid: boolean
  errors: string[]
  path: string
}

function validateIcon(icon: any, path: string): IconValidationResult {
  const errors: string[] = []
  
  if (!icon) {
    return { isValid: true, errors: [], path } // No icon is OK
  }
  
  // Check required fields
  if (icon._type !== 'icon.manager') {
    errors.push(`Invalid _type: "${icon._type}" (should be "icon.manager")`)
  }
  
  if (!icon.name) {
    errors.push('Missing required field: name')
  }
  
  if (!icon.provider) {
    errors.push('Missing required field: provider')
  } else if (icon.manager && !icon.provider) {
    errors.push('Using deprecated "manager" field instead of "provider"')
  }
  
  if (!icon.svg) {
    errors.push('Missing required field: svg')
  }
  
  // Check metadata structure
  if (icon.metadata) {
    if (typeof icon.metadata.author === 'string') {
      errors.push('Metadata contains deprecated "author" field (should be removed)')
    }
    if (typeof icon.metadata.license === 'string') {
      errors.push('Metadata contains deprecated "license" field (should be removed)')
    }
    
    // Check required metadata fields
    const requiredMetadata = ['width', 'height', 'viewBox', 'fill', 'stroke', 'strokeWidth']
    for (const field of requiredMetadata) {
      if (!(field in icon.metadata)) {
        errors.push(`Missing metadata field: ${field}`)
      }
    }
  } else {
    errors.push('Missing metadata object')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    path
  }
}

async function validateAllIcons() {
  console.log('🔍 Validating all icons in the database...\n')
  
  try {
    // Fetch all pages with potential icons
    const pages = await client.fetch(`
      *[_type == "page"] {
        _id,
        title,
        slug,
        contentBlocks[] {
          _type,
          _key,
          ...select(
            _type == "featureList" => {
              title,
              features[] {
                _key,
                title,
                icon
              }
            },
            _type == "valueProposition" => {
              heading,
              items[] {
                _key,
                heading,
                icon
              }
            }
          )
        }
      }
    `)
    
    let totalIcons = 0
    let invalidIcons = 0
    const issues: { page: string, results: IconValidationResult[] }[] = []
    
    for (const page of pages) {
      const pageIssues: IconValidationResult[] = []
      
      page.contentBlocks?.forEach((block: any, blockIdx: number) => {
        if (block._type === 'featureList' && block.features) {
          block.features.forEach((feature: any, featureIdx: number) => {
            if (feature.icon) {
              totalIcons++
              const result = validateIcon(
                feature.icon,
                `contentBlocks[${blockIdx}].features[${featureIdx}].icon`
              )
              if (!result.isValid) {
                invalidIcons++
                pageIssues.push(result)
              }
            }
          })
        }
        
        if (block._type === 'valueProposition' && block.items) {
          block.items.forEach((item: any, itemIdx: number) => {
            if (item.icon) {
              totalIcons++
              const result = validateIcon(
                item.icon,
                `contentBlocks[${blockIdx}].items[${itemIdx}].icon`
              )
              if (!result.isValid) {
                invalidIcons++
                pageIssues.push(result)
              }
            }
          })
        }
      })
      
      if (pageIssues.length > 0) {
        issues.push({
          page: `${page.title} (${page.slug?.current || page._id})`,
          results: pageIssues
        })
      }
    }
    
    // Report results
    console.log(`📊 Validation Summary:`)
    console.log(`   Total icons checked: ${totalIcons}`)
    console.log(`   Valid icons: ${totalIcons - invalidIcons}`)
    console.log(`   Invalid icons: ${invalidIcons}`)
    
    if (issues.length > 0) {
      console.log('\n❌ Issues found:\n')
      issues.forEach(({ page, results }) => {
        console.log(`📄 Page: ${page}`)
        results.forEach(result => {
          console.log(`   Path: ${result.path}`)
          result.errors.forEach(error => {
            console.log(`     - ${error}`)
          })
        })
        console.log()
      })
      
      console.log('💡 To fix these issues:')
      console.log('1. Use the fix-icon-structure-properly.ts script for existing content')
      console.log('2. Use the create-icon-helper.ts for creating new icons')
      console.log('3. Ensure all new content follows the new icon structure')
    } else {
      console.log('\n✅ All icons are valid!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

validateAllIcons()