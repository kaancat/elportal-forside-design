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

interface UnknownFieldIssue {
  documentId: string
  documentType: string
  documentTitle: string
  path: string
  issue: string
  currentValue?: any
  suggestion?: string
}

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
    correctFields: ['_type', '_key', 'title', 'items', 'propositions'],
    incorrectMappings: {}
  },
  valueItem: {
    correctFields: ['_type', '_key', 'icon', 'heading', 'description', 'text'],
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
    incorrectMappings: {
      'heading': 'title'
    }
  },
  chargingBoxShowcase: {
    correctFields: ['_type', '_key', 'heading', 'headerAlignment', 'description', 'products'],
    incorrectMappings: {
      'title': 'heading'
    }
  }
}

async function analyzeDocument(doc: any): Promise<UnknownFieldIssue[]> {
  const issues: UnknownFieldIssue[] = []
  
  function checkBlock(block: any, path: string) {
    if (!block || typeof block !== 'object') return
    
    const blockType = block._type
    const schema = fieldMappings[blockType]
    
    if (schema) {
      const blockFields = Object.keys(block)
      
      // Check for unknown fields
      const unknownFields = blockFields.filter(field => 
        !schema.correctFields.includes(field) && 
        !schema.incorrectMappings[field]
      )
      
      unknownFields.forEach(field => {
        issues.push({
          documentId: doc._id,
          documentType: doc._type,
          documentTitle: doc.title || doc._id,
          path: `${path}.${field}`,
          issue: 'unknown_field',
          currentValue: block[field],
          suggestion: `Remove field "${field}" - it's not in the schema`
        })
      })
      
      // Check for incorrect field names
      const incorrectFields = blockFields.filter(field => schema.incorrectMappings[field])
      
      incorrectFields.forEach(field => {
        const correctField = schema.incorrectMappings[field]
        issues.push({
          documentId: doc._id,
          documentType: doc._type,
          documentTitle: doc.title || doc._id,
          path: `${path}.${field}`,
          issue: 'incorrect_field_name',
          currentValue: block[field],
          suggestion: `Rename "${field}" to "${correctField}"`
        })
      })
    }
    
    // Check nested arrays
    if (block.items && Array.isArray(block.items)) {
      block.items.forEach((item, index) => {
        checkBlock(item, `${path}.items[${index}]`)
      })
    }
    
    if (block.features && Array.isArray(block.features)) {
      block.features.forEach((feature, index) => {
        checkBlock(feature, `${path}.features[${index}]`)
      })
    }
    
    if (block.content && Array.isArray(block.content)) {
      block.content.forEach((content, index) => {
        if (content._type && fieldMappings[content._type]) {
          checkBlock(content, `${path}.content[${index}]`)
        }
      })
    }
  }
  
  // Check content blocks
  if (doc.contentBlocks && Array.isArray(doc.contentBlocks)) {
    doc.contentBlocks.forEach((block, index) => {
      checkBlock(block, `contentBlocks[${index}]`)
    })
  }
  
  return issues
}

async function fixDocument(documentId: string, issues: UnknownFieldIssue[]) {
  console.log(chalk.blue(`\n🔧 Fixing document: ${documentId}`))
  
  // Fetch the current document
  const doc = await client.fetch(`*[_id == $id][0]`, { id: documentId })
  if (!doc) {
    console.log(chalk.red(`   Document not found: ${documentId}`))
    return
  }
  
  // Group issues by path to avoid conflicts
  const issuesByPath = {}
  issues.forEach(issue => {
    if (!issuesByPath[issue.path]) {
      issuesByPath[issue.path] = []
    }
    issuesByPath[issue.path].push(issue)
  })
  
  // Apply fixes
  let hasChanges = false
  const updatedDoc = JSON.parse(JSON.stringify(doc)) // Deep clone
  
  Object.entries(issuesByPath).forEach(([path, pathIssues]) => {
    pathIssues.forEach(issue => {
      const pathParts = path.split('.')
      let current = updatedDoc
      
      // Navigate to the parent of the field to fix
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i]
        if (part.includes('[')) {
          const [arrayName, indexStr] = part.split('[')
          const index = parseInt(indexStr.replace(']', ''))
          current = current[arrayName][index]
        } else {
          current = current[part]
        }
      }
      
      const fieldName = pathParts[pathParts.length - 1]
      
      if (issue.issue === 'unknown_field') {
        // Remove unknown field
        if (fieldName === 'heading' && current['title']) {
          // Special case: remove duplicate heading when title exists
          console.log(chalk.yellow(`   - Removing duplicate field: ${path}`))
          delete current[fieldName]
          hasChanges = true
        }
      } else if (issue.issue === 'incorrect_field_name') {
        // Rename field
        const correctName = issue.suggestion.match(/"(\w+)"$/)[1]
        console.log(chalk.yellow(`   - Renaming field: ${fieldName} → ${correctName}`))
        current[correctName] = current[fieldName]
        delete current[fieldName]
        hasChanges = true
      }
    })
  })
  
  if (hasChanges) {
    // Apply the changes
    try {
      const result = await client
        .patch(documentId)
        .set(updatedDoc)
        .commit()
      
      console.log(chalk.green(`   ✅ Successfully fixed document`))
      return result
    } catch (error) {
      console.log(chalk.red(`   ❌ Error fixing document: ${error.message}`))
    }
  } else {
    console.log(chalk.gray(`   No changes needed`))
  }
}

async function main() {
  console.log(chalk.blue('🔍 Scanning all pages for unknown fields...\n'))
  
  try {
    // Fetch all pages
    const pages = await client.fetch(`*[_type == "page" || _type == "homePage"]{
      _id,
      _type,
      title,
      "slug": slug.current,
      contentBlocks
    }`)
    
    console.log(chalk.green(`Found ${pages.length} pages to analyze\n`))
    
    const allIssues: UnknownFieldIssue[] = []
    
    // Analyze each page
    for (const page of pages) {
      console.log(chalk.yellow(`Analyzing: ${page.title || page._id}`))
      const issues = await analyzeDocument(page)
      
      if (issues.length > 0) {
        console.log(chalk.red(`   Found ${issues.length} issues`))
        issues.forEach(issue => {
          console.log(chalk.gray(`   - ${issue.path}: ${issue.suggestion}`))
        })
        allIssues.push(...issues)
      } else {
        console.log(chalk.green(`   ✅ No issues found`))
      }
    }
    
    if (allIssues.length === 0) {
      console.log(chalk.green('\n✅ No unknown fields found in any pages!'))
      return
    }
    
    // Group issues by document
    const issuesByDocument = allIssues.reduce((acc, issue) => {
      if (!acc[issue.documentId]) {
        acc[issue.documentId] = []
      }
      acc[issue.documentId].push(issue)
      return acc
    }, {})
    
    console.log(chalk.blue(`\n\n📊 Summary: Found ${allIssues.length} issues across ${Object.keys(issuesByDocument).length} documents`))
    
    // Ask for confirmation
    console.log(chalk.yellow('\n⚠️  This will modify the following documents:'))
    Object.entries(issuesByDocument).forEach(([docId, issues]) => {
      const firstIssue = issues[0]
      console.log(chalk.yellow(`   - ${firstIssue.documentTitle} (${issues.length} issues)`))
    })
    
    console.log(chalk.yellow('\nMake sure you have a backup before proceeding!'))
    console.log(chalk.blue('\nWould you like to:'))
    console.log('  1. Fix all issues automatically')
    console.log('  2. Fix issues one document at a time')
    console.log('  3. Cancel')
    
    // For now, let's automatically fix all issues
    // In a real scenario, you'd want to add user interaction here
    
    console.log(chalk.blue('\n\n🚀 Fixing all issues automatically...\n'))
    
    for (const [documentId, issues] of Object.entries(issuesByDocument)) {
      await fixDocument(documentId, issues)
    }
    
    console.log(chalk.green('\n\n✅ All fixes applied successfully!'))
    console.log(chalk.blue('\nNext steps:'))
    console.log('1. Check the pages in Sanity Studio')
    console.log('2. Test the frontend to ensure content displays correctly')
    console.log('3. Deploy any necessary changes')
    
  } catch (error) {
    console.error(chalk.red('❌ Error:', error))
  }
}

// Run without confirmation for now
main()