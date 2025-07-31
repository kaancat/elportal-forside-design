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

async function fixAlignmentFieldErrors() {
  try {
    console.log('🔧 Fixing alignment field errors...\n')
    
    // Fetch both homepage documents
    const homepageIds = [
      '084518ec-2f79-48e0-b23c-add29ee83e6d',
      'drafts.084518ec-2f79-48e0-b23c-add29ee83e6d'
    ]
    
    for (const docId of homepageIds) {
      console.log(`\n📄 Processing ${docId.includes('drafts') ? 'draft' : 'published'} homepage...`)
      
      const homepage = await client.fetch(`*[_id == "${docId}"][0]`)
      
      if (!homepage) {
        console.log('   Not found, skipping...')
        continue
      }
      
      let fixCount = 0
      const fieldsToRemove: string[] = []
      
      // Check all content blocks for invalid alignment fields
      const updatedContentBlocks = homepage.contentBlocks.map((block: any) => {
        const updatedBlock = { ...block }
        
        // Value Proposition - remove 'alignment' field if present
        if (block._type === 'valueProposition' && block.alignment) {
          fixCount++
          console.log(`   Found invalid 'alignment' field in valueProposition`)
          delete updatedBlock.alignment
        }
        
        // Hero sections - check if they have alignment field
        if ((block._type === 'hero' || block._type === 'heroWithCalculator') && block.alignment) {
          console.log(`   Found 'alignment' field in ${block._type} - checking if valid...`)
          // For now, we'll keep it as these might support alignment
        }
        
        return updatedBlock
      })
      
      if (fixCount > 0) {
        // Update the document
        const result = await client.patch(docId)
          .set({ contentBlocks: updatedContentBlocks })
          .commit()
        
        console.log(`   ✅ Fixed ${fixCount} alignment field errors`)
      } else {
        console.log('   ✅ No alignment field errors found')
      }
    }
    
    // Now check for other pages with similar issues
    console.log('\n🔍 Checking other pages for alignment field errors...')
    
    const pages = await client.fetch(`*[_type == "page"]{
      _id,
      title,
      "slug": slug.current,
      contentBlocks[]{
        _type,
        _key,
        alignment
      }
    }`)
    
    for (const page of pages) {
      const blocksWithAlignment = page.contentBlocks?.filter((block: any) => 
        block.alignment && block._type === 'valueProposition'
      )
      
      if (blocksWithAlignment && blocksWithAlignment.length > 0) {
        console.log(`\n📄 Found issues in page: ${page.title} (/${page.slug})`)
        console.log(`   ${blocksWithAlignment.length} valueProposition blocks with invalid alignment field`)
        
        // Fix the page
        const updatedBlocks = page.contentBlocks.map((block: any) => {
          if (block._type === 'valueProposition' && block.alignment) {
            const { alignment, ...rest } = block
            return rest
          }
          return block
        })
        
        await client.patch(page._id)
          .set({ contentBlocks: updatedBlocks })
          .commit()
        
        console.log('   ✅ Fixed!')
      }
    }
    
    console.log('\n✅ Alignment field error fixes completed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
fixAlignmentFieldErrors()