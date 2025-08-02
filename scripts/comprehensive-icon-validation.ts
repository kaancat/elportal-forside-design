import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

interface ValidationResult {
  documentId: string
  documentType: string
  path: string
  issue: string
  iconData?: any
}

// Check if a value might be an icon field
function mightBeIcon(value: any, path: string): boolean {
  if (!value || typeof value !== 'object') return false
  
  // Check for icon-like field names
  const iconFieldNames = ['icon', 'icons', 'iconName', 'iconType']
  const pathParts = path.split('.')
  const lastPart = pathParts[pathParts.length - 1]
  
  return iconFieldNames.some(name => 
    lastPart.toLowerCase().includes(name.toLowerCase())
  )
}

// Validate icon structure recursively
function validateIconStructure(value: any, path: string, issues: ValidationResult[], doc: any) {
  if (!value) return
  
  // Check for string icons (legacy)
  if (typeof value === 'string' && mightBeIcon({ icon: value }, path)) {
    issues.push({
      documentId: doc._id,
      documentType: doc._type,
      path,
      issue: 'String icon detected (should be icon.manager object)',
      iconData: value
    })
    return
  }
  
  // Check for iconPicker type (legacy)
  if (value._type === 'iconPicker') {
    issues.push({
      documentId: doc._id,
      documentType: doc._type,
      path,
      issue: 'Legacy iconPicker type detected',
      iconData: value
    })
    return
  }
  
  // Check for icon.manager type
  if (value._type === 'icon.manager') {
    const problems = []
    
    // Check required fields
    if (!value.icon) problems.push('Missing icon field')
    if (!value.metadata) problems.push('Missing metadata')
    else {
      if (!value.metadata.iconName) problems.push('Missing metadata.iconName')
      if (!value.metadata.size) problems.push('Missing metadata.size')
      else {
        if (typeof value.metadata.size.width !== 'number') problems.push('Invalid metadata.size.width')
        if (typeof value.metadata.size.height !== 'number') problems.push('Invalid metadata.size.height')
      }
      
      // Check for wrong structure (direct width/height)
      if (value.metadata.width !== undefined || value.metadata.height !== undefined) {
        problems.push('Found direct metadata.width/height (should be metadata.size.width/height)')
      }
      
      // Check color structure if present
      if (value.metadata.color) {
        if (!value.metadata.color.hex) problems.push('Missing color.hex')
        if (!value.metadata.color.rgba) problems.push('Missing color.rgba')
        else {
          const rgba = value.metadata.color.rgba
          if (typeof rgba.r !== 'number' || typeof rgba.g !== 'number' || 
              typeof rgba.b !== 'number' || typeof rgba.a !== 'number') {
            problems.push('Invalid color.rgba structure')
          }
        }
      }
    }
    
    if (problems.length > 0) {
      issues.push({
        documentId: doc._id,
        documentType: doc._type,
        path,
        issue: `Malformed icon.manager: ${problems.join(', ')}`,
        iconData: value
      })
    }
    return
  }
  
  // Recursively check nested structures
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      validateIconStructure(item, `${path}[${index}]`, issues, doc)
    })
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, val]) => {
      // Skip internal fields
      if (key.startsWith('_') && key !== '_type') return
      validateIconStructure(val, `${path}.${key}`, issues, doc)
    })
  }
}

// Schema-level validation to check field definitions
async function validateSchemaDefinitions() {
  console.log('\n🔍 Checking schema definitions for icon field types...\n')
  
  const schemaTypes = [
    'hero', 'valueProposition', 'featureList', 'infoCardsSection',
    'benefitsComparison', 'seasonalSavingsTips', 'priceAlertsSignup',
    'trustIndicators'
  ]
  
  // Query to check field types in schemas
  const query = `*[_type in $types][0...10] {
    _id,
    _type,
    ...
  }`
  
  const samples = await client.fetch(query, { types: schemaTypes })
  
  const schemaIssues: string[] = []
  
  samples.forEach((doc: any) => {
    // Check for fields that should be icon.manager
    const checkFields = (obj: any, path: string) => {
      if (!obj || typeof obj !== 'object') return
      
      Object.entries(obj).forEach(([key, value]: [string, any]) => {
        if (key === 'icon' || key.toLowerCase().includes('icon')) {
          if (typeof value === 'string') {
            schemaIssues.push(`${doc._type}.${path}${key} - String type (should be icon.manager)`)
          } else if (value && value._type && value._type !== 'icon.manager') {
            schemaIssues.push(`${doc._type}.${path}${key} - Type: ${value._type} (should be icon.manager)`)
          }
        }
        
        if (Array.isArray(value)) {
          value.forEach((item, idx) => checkFields(item, `${path}${key}[${idx}].`))
        } else if (value && typeof value === 'object' && !key.startsWith('_')) {
          checkFields(value, `${path}${key}.`)
        }
      })
    }
    
    checkFields(doc, '')
  })
  
  if (schemaIssues.length > 0) {
    console.log('⚠️  Schema definition issues found:')
    schemaIssues.forEach(issue => console.log(`   - ${issue}`))
  } else {
    console.log('✅ All checked schemas use proper icon.manager type')
  }
}

async function main() {
  console.log('🔍 Comprehensive Icon Validation\n')
  console.log('Checking all documents for icon format compliance...\n')
  
  const issues: ValidationResult[] = []
  
  // Query all documents
  const query = `*[!(_type match "system.*")] {
    _id,
    _type,
    _rev,
    ...
  }`
  
  const documents = await client.fetch(query)
  console.log(`📊 Found ${documents.length} documents to check\n`)
  
  // Validate each document
  documents.forEach((doc: any) => {
    validateIconStructure(doc, '', issues, doc)
  })
  
  // Group issues by type
  const issuesByType = issues.reduce((acc, issue) => {
    if (!acc[issue.issue]) acc[issue.issue] = []
    acc[issue.issue].push(issue)
    return acc
  }, {} as Record<string, ValidationResult[]>)
  
  // Report findings
  if (issues.length === 0) {
    console.log('✅ All icons are properly formatted as icon.manager objects!')
    console.log('🎉 No remnants of previous implementations found.\n')
  } else {
    console.log(`⚠️  Found ${issues.length} icon issues:\n`)
    
    Object.entries(issuesByType).forEach(([issueType, items]) => {
      console.log(`\n${issueType}: ${items.length} instances`)
      items.slice(0, 5).forEach(item => {
        console.log(`  - ${item.documentType} (${item.documentId}): ${item.path}`)
        if (item.iconData) {
          console.log(`    Data: ${JSON.stringify(item.iconData, null, 2).split('\n').join('\n    ')}`)
        }
      })
      if (items.length > 5) {
        console.log(`  ... and ${items.length - 5} more`)
      }
    })
  }
  
  // Check for proper icon usage in components
  console.log('\n🔍 Checking component icon usage patterns...\n')
  
  // Check specific component types
  const componentTypes = [
    { type: 'hero', iconFields: ['icon'] },
    { type: 'valueProposition', iconFields: ['valueItems.icon'] },
    { type: 'featureList', iconFields: ['features.icon'] },
    { type: 'infoCardsSection', iconFields: ['cards.icon'] },
    { type: 'benefitsComparison', iconFields: ['icon'] },
    { type: 'seasonalSavingsTips', iconFields: ['seasons.icon'] },
    { type: 'priceAlertsSignup', iconFields: ['features.icon'] },
    { type: 'trustIndicators', iconFields: ['indicators.icon'] }
  ]
  
  for (const comp of componentTypes) {
    const query = `count(*[_type == "${comp.type}"])`
    const count = await client.fetch(query)
    if (count > 0) {
      console.log(`✓ ${comp.type}: ${count} instances (icon fields: ${comp.iconFields.join(', ')})`)
    }
  }
  
  // Validate schema definitions
  await validateSchemaDefinitions()
  
  // Summary statistics
  console.log('\n📊 Icon Migration Summary:')
  console.log('  - Total documents checked:', documents.length)
  console.log('  - Icon issues found:', issues.length)
  console.log('  - Documents with issues:', new Set(issues.map(i => i.documentId)).size)
  
  // Check for proper icon.manager icons
  const properIconsQuery = `count(*[defined(@[].icon) || defined(@[].icons) || defined(@[].valueItems[].icon) || defined(@[].features[].icon) || defined(@[].cards[].icon)])`
  const docsWithIcons = await client.fetch(properIconsQuery)
  console.log('  - Documents with icon fields:', docsWithIcons)
  
  // Final recommendations
  if (issues.length > 0) {
    console.log('\n⚠️  Recommendations:')
    console.log('1. Run the icon migration script to fix these issues')
    console.log('2. Update any custom scripts that create icons')
    console.log('3. Ensure all new content uses the icon picker in Sanity Studio')
  } else {
    console.log('\n✅ Icon validation complete - all icons are properly formatted!')
    console.log('🎉 The icon.manager standard is fully implemented across the platform.')
  }
}

// Run validation
main().catch(console.error)