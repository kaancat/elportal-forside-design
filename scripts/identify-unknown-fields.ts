import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import chalk from 'chalk'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Known field mappings based on schema
const fieldMappings = {
  hero: {
    correctFields: ['_type', '_key', 'headline', 'subheadline', 'image'],
    incorrectMappings: {
      'title': 'headline',
      'subtitle': 'subheadline',
      'backgroundImage': 'image'
    }
  },
  valueProposition: {
    correctFields: ['_type', '_key', 'title', 'items'],
    incorrectMappings: {}
  },
  valueItem: {
    correctFields: ['_type', '_key', 'icon', 'heading', 'description'],
    incorrectMappings: {
      'title': 'heading',
      'name': 'heading'
    }
  },
  featureList: {
    correctFields: ['_type', '_key', 'title', 'subtitle', 'features'],
    incorrectMappings: {}
  },
  featureItem: {
    correctFields: ['_type', '_key', 'icon', 'title', 'description'],
    incorrectMappings: {
      'name': 'title',
      'heading': 'title'
    }
  },
  pageSection: {
    correctFields: ['_type', '_key', 'title', 'headerAlignment', 'content', 'theme', 'settings'],
    incorrectMappings: {}
  },
  chargingBoxShowcase: {
    correctFields: ['_type', '_key', 'heading', 'headerAlignment', 'description', 'products'],
    incorrectMappings: {
      'title': 'heading'
    }
  }
}

async function identifyUnknownFields() {
  try {
    console.log(chalk.blue('🔍 Fetching page from Sanity...\n'))
    
    // Try multiple ID formats (from the URL you provided)
    const pageIdOptions = [
      'f7ecf92783e749828f7281a6e5829d52',
      'page.f7ecf92783e749828f7281a6e5829d52',
      'drafts.f7ecf92783e749828f7281a6e5829d52',
      'drafts.page.f7ecf92783e749828f7281a6e5829d52'
    ]
    
    let page = null
    for (const pageId of pageIdOptions) {
      const query = `*[_id == $pageId][0]`
      const result = await client.fetch(query, { pageId })
      if (result) {
        page = result
        console.log(chalk.green(`✅ Found page with ID: ${pageId}`))
        break
      }
    }
    
    // If not found by ID, try to find all pages to debug
    if (!page) {
      console.log(chalk.yellow('⚠️  Page not found by ID, listing all pages...'))
      const allPages = await client.fetch(`*[_type == "page"]{_id, title, slug}[0...10]`)
      console.log('Available pages:')
      allPages.forEach(p => {
        console.log(`  - ${p._id}: ${p.title} (slug: ${p.slug?.current})`)
      })
    }
    
    if (!page) {
      console.error(chalk.red('❌ Page not found!'))
      return
    }
    
    console.log(chalk.green(`✅ Found page: ${page.title || page._id}`))
    console.log(chalk.gray(`   Type: ${page._type}`))
    console.log(chalk.gray(`   Slug: ${page.slug?.current || 'N/A'}\n`))
    
    // Analyze content blocks
    if (page.contentBlocks && Array.isArray(page.contentBlocks)) {
      console.log(chalk.blue(`📦 Found ${page.contentBlocks.length} content blocks:\n`))
      
      const issues = []
      
      page.contentBlocks.forEach((block, index) => {
        console.log(chalk.yellow(`\n${index + 1}. ${block._type} (key: ${block._key})`))
        
        const blockType = block._type
        const schema = fieldMappings[blockType]
        
        if (schema) {
          // Check for unknown fields
          const blockFields = Object.keys(block)
          const unknownFields = blockFields.filter(field => !schema.correctFields.includes(field))
          const misnamedFields = blockFields.filter(field => schema.incorrectMappings[field])
          
          if (unknownFields.length > 0) {
            console.log(chalk.red('   ❌ Unknown fields:'))
            unknownFields.forEach(field => {
              console.log(chalk.red(`      - ${field}: ${JSON.stringify(block[field], null, 2).substring(0, 50)}...`))
              issues.push({
                blockIndex: index,
                blockType,
                issue: 'unknown_field',
                field,
                value: block[field]
              })
            })
          }
          
          if (misnamedFields.length > 0) {
            console.log(chalk.yellow('   ⚠️  Incorrectly named fields:'))
            misnamedFields.forEach(field => {
              const correctField = schema.incorrectMappings[field]
              console.log(chalk.yellow(`      - "${field}" should be "${correctField}"`))
              issues.push({
                blockIndex: index,
                blockType,
                issue: 'incorrect_field_name',
                field,
                correctField,
                value: block[field]
              })
            })
          }
          
          // Check for missing required fields
          const missingFields = schema.correctFields.filter(field => 
            !field.startsWith('_') && !block[field]
          )
          if (missingFields.length > 0) {
            console.log(chalk.magenta('   ⚠️  Missing fields:'))
            missingFields.forEach(field => {
              console.log(chalk.magenta(`      - ${field}`))
              issues.push({
                blockIndex: index,
                blockType,
                issue: 'missing_field',
                field
              })
            })
          }
          
          // Check nested items
          if (block.items && Array.isArray(block.items)) {
            console.log(chalk.gray(`   📋 Has ${block.items.length} items`))
            block.items.forEach((item, itemIndex) => {
              const itemType = item._type || 'valueItem'
              const itemSchema = fieldMappings[itemType]
              if (itemSchema) {
                const itemFields = Object.keys(item)
                const incorrectItemFields = itemFields.filter(field => itemSchema.incorrectMappings[field])
                
                if (incorrectItemFields.length > 0) {
                  incorrectItemFields.forEach(field => {
                    const correctField = itemSchema.incorrectMappings[field]
                    console.log(chalk.yellow(`      - Item ${itemIndex}: "${field}" should be "${correctField}"`))
                    issues.push({
                      blockIndex: index,
                      blockType,
                      itemIndex,
                      issue: 'incorrect_item_field_name',
                      field,
                      correctField,
                      value: item[field]
                    })
                  })
                }
                
                // Check icon fields
                if (item.icon && typeof item.icon === 'string') {
                  console.log(chalk.red(`      - Item ${itemIndex}: icon is a string, should be icon.manager object`))
                  issues.push({
                    blockIndex: index,
                    blockType,
                    itemIndex,
                    issue: 'incorrect_icon_format',
                    field: 'icon',
                    value: item.icon
                  })
                }
              }
            })
          }
          
          // Check features array
          if (block.features && Array.isArray(block.features)) {
            console.log(chalk.gray(`   📋 Has ${block.features.length} features`))
            block.features.forEach((feature, featureIndex) => {
              if (feature.icon && typeof feature.icon === 'string') {
                console.log(chalk.red(`      - Feature ${featureIndex}: icon is a string, should be icon.manager object`))
                issues.push({
                  blockIndex: index,
                  blockType,
                  featureIndex,
                  issue: 'incorrect_icon_format',
                  field: 'icon',
                  value: feature.icon
                })
              }
            })
          }
          
        } else {
          console.log(chalk.gray('   ℹ️  No schema validation available for this type'))
        }
        
        // Show all fields for debugging
        console.log(chalk.gray('   Fields present:'))
        Object.keys(block).forEach(field => {
          const value = JSON.stringify(block[field], null, 2)
          const preview = value.length > 50 ? value.substring(0, 50) + '...' : value
          console.log(chalk.gray(`      - ${field}: ${preview}`))
        })
      })
      
      // Summary
      console.log(chalk.blue('\n\n📊 Summary:'))
      console.log(chalk.blue('=' * 50))
      console.log(`Total issues found: ${issues.length}`)
      
      if (issues.length > 0) {
        console.log(chalk.red('\n🚨 Issues to fix:'))
        
        const groupedIssues = issues.reduce((acc, issue) => {
          const key = issue.issue
          if (!acc[key]) acc[key] = []
          acc[key].push(issue)
          return acc
        }, {})
        
        Object.entries(groupedIssues).forEach(([issueType, issueList]) => {
          console.log(chalk.yellow(`\n${issueType}: ${issueList.length} occurrences`))
          issueList.forEach(issue => {
            console.log(`  - Block ${issue.blockIndex} (${issue.blockType}): ${issue.field}`)
          })
        })
        
        console.log(chalk.blue('\n\n💡 Next steps:'))
        console.log('1. Run the migration script to fix these issues')
        console.log('2. Update the frontend queries to include all fields')
        console.log('3. Test in Sanity Studio to ensure all fields are recognized')
      } else {
        console.log(chalk.green('\n✅ No issues found! All fields appear to be correctly named.'))
      }
      
    } else {
      console.log(chalk.red('❌ No content blocks found in the page!'))
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

identifyUnknownFields()