import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function autoFixSchemaIssues() {
  console.log('🔧 Starting Auto-Fix for Schema Issues...\n')
  
  let totalFixed = 0
  
  try {
    // Get all pages with pageSection issues
    const pagesWithIssues = await client.fetch(`
      *[_type == "page" && defined(contentBlocks)] {
        _id,
        _rev,
        title,
        "hasPageSectionIssues": count(contentBlocks[_type == "pageSection" && (defined(title) || !defined(headerAlignment))]) > 0,
        contentBlocks
      }
    `)
    
    const pagesToFix = pagesWithIssues.filter((page: any) => page.hasPageSectionIssues)
    
    console.log(`Found ${pagesToFix.length} pages with pageSection issues to fix\n`)
    
    for (const page of pagesToFix) {
      console.log(`\nFixing page: ${page.title} (${page._id})`)
      
      let fixedCount = 0
      const fixedContentBlocks = page.contentBlocks.map((block: any) => {
        const fixedBlock = { ...block }
        
        if (block._type === 'pageSection') {
          // Fix title -> heading
          if (block.title && !block.heading) {
            fixedBlock.heading = block.title
            delete fixedBlock.title
            console.log(`  ✅ Fixed title -> heading in pageSection`)
            fixedCount++
          }
          
          // Add missing headerAlignment
          if (!block.headerAlignment) {
            fixedBlock.headerAlignment = 'left' // default to left
            console.log(`  ✅ Added missing headerAlignment`)
            fixedCount++
          }
        }
        
        return fixedBlock
      })
      
      if (fixedCount > 0) {
        // Update the document
        try {
          const result = await client
            .patch(page._id)
            .set({ contentBlocks: fixedContentBlocks })
            .commit()
          
          console.log(`  ✨ Updated document successfully (${fixedCount} fixes applied)`)
          totalFixed += fixedCount
        } catch (error) {
          console.error(`  ❌ Error updating document:`, error)
        }
      } else {
        console.log(`  ℹ️  No fixes needed`)
      }
    }
    
    console.log(`\n✅ Auto-fix complete! Fixed ${totalFixed} issues across ${pagesToFix.length} pages.`)
    
    // Re-run audit to confirm all issues are fixed
    console.log('\n=== Running verification audit ===')
    const verificationCheck = await client.fetch(`
      *[_type == "page" && defined(contentBlocks)] {
        "remainingIssues": count(contentBlocks[_type == "pageSection" && (defined(title) || !defined(headerAlignment))]) > 0
      }
    `)
    
    const pagesWithRemainingIssues = verificationCheck.filter((p: any) => p.remainingIssues).length
    
    if (pagesWithRemainingIssues === 0) {
      console.log('✅ Verification passed! All pageSection issues have been resolved.')
    } else {
      console.log(`⚠️  ${pagesWithRemainingIssues} pages still have issues. You may need to run this script again.`)
    }
    
  } catch (error) {
    console.error('Error during auto-fix:', error)
  }
}

// Run the auto-fix
autoFixSchemaIssues()