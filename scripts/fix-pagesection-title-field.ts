import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Sanity client configuration
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Fix pageSection to use 'title' instead of 'heading'
async function fixPageSectionTitleField() {
  console.log('🔧 Fixing pageSection to use title field instead of heading')
  
  const documentId = 'qgCxJyBbKpvhb2oGYqfgkp'
  
  try {
    const document = await client.getDocument(documentId)
    console.log(`\n📄 Document: ${document.title}`)
    
    let fixCount = 0
    
    // Fix field names in content blocks
    const fixedContentBlocks = document.contentBlocks.map((block: any, index: number) => {
      // Fix pageSection blocks that have 'heading' instead of 'title'
      if (block._type === 'pageSection' && block.heading && !block.title) {
        fixCount++
        console.log(`\n✏️  Fixing pageSection[${index}]: moving heading → title`)
        console.log(`   "${block.heading}"`)
        
        const { heading, ...rest } = block // Remove heading field
        return {
          ...rest,
          title: heading // Add as title field
        }
      }
      
      return block
    })
    
    if (fixCount > 0) {
      console.log(`\n📝 Applying ${fixCount} field name fixes...`)
      
      await client
        .patch(documentId)
        .set({ contentBlocks: fixedContentBlocks })
        .commit()
      
      console.log('✅ Field names fixed successfully!')
    } else {
      console.log('\n✅ All pageSection blocks already use the correct field')
    }
    
    // Verify final state
    console.log('\n📊 Final pageSection analysis:')
    fixedContentBlocks.forEach((block: any, index: number) => {
      if (block._type === 'pageSection') {
        console.log(`[${index}] title: "${block.title || '(missing)'}" | heading: ${block.heading ? '"' + block.heading + '"' : '(none)'}`)
      }
    })
    
    console.log(`\n🔗 View document: https://dinelportal.sanity.studio/structure/page;${documentId}`)
    console.log('\n💡 If you still see "Untitled Page Section" in Sanity Studio, try refreshing the page.')
    
  } catch (error) {
    console.error('❌ Error fixing field names:', error)
    process.exit(1)
  }
}

// Execute
fixPageSectionTitleField()