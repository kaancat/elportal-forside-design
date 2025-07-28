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

// Fix FAQ group title
async function fixFaqGroupTitle() {
  console.log('🔧 Fixing FAQ Group title')
  
  const documentId = 'qgCxJyBbKpvhb2oGYqfgkp'
  
  try {
    const document = await client.getDocument(documentId)
    console.log(`\n📄 Document: ${document.title}`)
    
    let fixCount = 0
    
    // Fix FAQ group title
    const fixedContentBlocks = document.contentBlocks.map((block: any, index: number) => {
      // Fix faqGroup blocks that are missing title
      if (block._type === 'faqGroup') {
        console.log(`\n🔍 Found faqGroup at index ${index}`)
        console.log(`   Current title: "${block.title || '(missing)'}"`)
        console.log(`   Current heading: "${block.heading || '(none)'}"`)
        console.log(`   FAQ items: ${block.faqItems?.length || 0}`)
        
        if (!block.title || block.title === '') {
          fixCount++
          const title = block.heading || 'Ofte stillede spørgsmål'
          console.log(`\n✏️  Adding title: "${title}"`)
          
          // Remove heading if it exists and add as title
          const { heading, ...rest } = block
          return {
            ...rest,
            title: title
          }
        }
      }
      
      return block
    })
    
    if (fixCount > 0) {
      console.log(`\n📝 Applying FAQ title fix...`)
      
      await client
        .patch(documentId)
        .set({ contentBlocks: fixedContentBlocks })
        .commit()
      
      console.log('✅ FAQ Group title fixed successfully!')
    } else {
      console.log('\n✅ FAQ Group already has a title')
    }
    
    // Verify final state
    console.log('\n📊 Final FAQ Group state:')
    fixedContentBlocks.forEach((block: any, index: number) => {
      if (block._type === 'faqGroup') {
        console.log(`[${index}] FAQ Group:`)
        console.log(`   title: "${block.title || '(missing)'}"`)
        console.log(`   faqItems: ${block.faqItems?.length || 0} items`)
      }
    })
    
    console.log(`\n🔗 View document: https://dinelportal.sanity.studio/structure/page;${documentId}`)
    console.log('\n💡 Refresh Sanity Studio to see the updated FAQ title.')
    
  } catch (error) {
    console.error('❌ Error fixing FAQ title:', error)
    process.exit(1)
  }
}

// Execute
fixFaqGroupTitle()