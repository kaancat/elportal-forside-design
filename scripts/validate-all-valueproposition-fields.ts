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

interface ValidationResult {
  pageId: string
  title: string
  issues: Array<{
    type: 'deprecated_field' | 'missing_field' | 'icon_structure'
    field: string
    location: string
    recommendation: string
  }>
}

async function validateAllValuePropositionFields() {
  console.log('🔍 Validating all valueProposition fields across all pages...\n')
  
  try {
    // Fetch all pages with valueProposition blocks
    const pages = await client.fetch(`
      *[_type == "page" && defined(contentBlocks[_type == "valueProposition"])] {
        _id,
        title,
        slug,
        contentBlocks[_type == "valueProposition"] {
          _key,
          _type,
          heading,
          title,
          valueItems,
          items,
          propositions,
          valueItems[] {
            _key,
            heading,
            title,
            icon
          }
        }
      }
    `)
    
    console.log(`📄 Found ${pages.length} pages with valueProposition blocks\n`)
    
    const results: ValidationResult[] = []
    
    for (const page of pages) {
      const issues: ValidationResult['issues'] = []
      
      for (const vpBlock of page.contentBlocks) {
        // Check for deprecated 'title' field
        if (vpBlock.title && !vpBlock.heading) {
          issues.push({
            type: 'deprecated_field',
            field: 'title',
            location: `valueProposition block ${vpBlock._key}`,
            recommendation: 'Migrate title → heading'
          })
        }
        
        // Check for deprecated 'items' field
        if (vpBlock.items && !vpBlock.valueItems) {
          issues.push({
            type: 'deprecated_field', 
            field: 'items',
            location: `valueProposition block ${vpBlock._key}`,
            recommendation: 'Migrate items → valueItems'
          })
        }
        
        // Check for very old 'propositions' field
        if (vpBlock.propositions) {
          issues.push({
            type: 'deprecated_field',
            field: 'propositions', 
            location: `valueProposition block ${vpBlock._key}`,
            recommendation: 'Migrate to proper valueItems structure'
          })
        }
        
        // Check valueItems for deprecated 'title' field
        if (vpBlock.valueItems) {
          vpBlock.valueItems.forEach((item: any, index: number) => {
            if (item.title && !item.heading) {
              issues.push({
                type: 'deprecated_field',
                field: 'valueItem.title',
                location: `valueProposition block ${vpBlock._key}, item ${index}`,
                recommendation: 'Migrate valueItem.title → valueItem.heading'
              })
            }
            
            // Check icon structure
            if (item.icon && typeof item.icon === 'string') {
              issues.push({
                type: 'icon_structure',
                field: 'valueItem.icon',
                location: `valueProposition block ${vpBlock._key}, item ${index}`,
                recommendation: 'Convert string icon to icon.manager object'
              })
            }
          })
        }
        
        // Check items array for deprecated fields (if items exists)
        if (vpBlock.items) {
          vpBlock.items.forEach((item: any, index: number) => {
            if (item.title && !item.heading) {
              issues.push({
                type: 'deprecated_field',
                field: 'item.title',
                location: `valueProposition items[${index}]`,
                recommendation: 'Migrate item.title → item.heading when migrating items → valueItems'
              })
            }
          })
        }
      }
      
      if (issues.length > 0) {
        results.push({
          pageId: page._id,
          title: page.title,
          issues
        })
      }
    }
    
    // Generate report
    console.log('📊 VALIDATION REPORT\n' + '='.repeat(50))
    
    if (results.length === 0) {
      console.log('✅ SUCCESS: All valueProposition blocks are using correct field names!')
      console.log('   No deprecated fields found.')
    } else {
      console.log(`❌ ISSUES FOUND: ${results.length} pages need attention\n`)
      
      results.forEach((result, index) => {
        console.log(`${index + 1}. 📄 ${result.title} (${result.pageId})`)
        result.issues.forEach(issue => {
          const icon = issue.type === 'deprecated_field' ? '🔧' : '⚠️'
          console.log(`   ${icon} ${issue.field} in ${issue.location}`)
          console.log(`      → ${issue.recommendation}`)
        })
        console.log('')
      })
      
      // Summary
      const deprecatedCount = results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'deprecated_field').length, 0)
      const iconIssueCount = results.reduce((sum, r) => sum + r.issues.filter(i => i.type === 'icon_structure').length, 0)
      
      console.log('📈 SUMMARY:')
      console.log(`   Deprecated field issues: ${deprecatedCount}`)
      console.log(`   Icon structure issues: ${iconIssueCount}`)
      console.log(`   Total pages affected: ${results.length}`)
    }
    
    console.log('\n💡 To fix these issues:')
    console.log('   1. Run migration scripts for pages with deprecated fields')
    console.log('   2. Update icon fields to use proper icon.manager structure')
    console.log('   3. Re-run this validation script to confirm fixes')
    
  } catch (error) {
    console.error('❌ Validation failed:', error)
  }
}

// Run the validation
validateAllValuePropositionFields()