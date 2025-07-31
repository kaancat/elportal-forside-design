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

async function fixCTAUrlsRobust() {
  try {
    console.log('🔧 Fixing invalid CTA URLs (robust approach)...\n')
    
    // First, let's identify all documents with null CTA URLs
    const query = `*[_type == "page" && contentBlocks[_type == "pageSection" && cta.url == null]]{
      _id,
      title,
      "slug": slug.current,
      contentBlocks[]{
        _type,
        _key,
        _type == "pageSection" => {
          title,
          cta
        }
      }
    }`
    
    const pagesWithNullUrls = await client.fetch(query)
    
    console.log(`Found ${pagesWithNullUrls.length} pages with null CTA URLs\n`)
    
    for (const page of pagesWithNullUrls) {
      console.log(`\n📄 Processing: ${page.title} (/${page.slug})`)
      console.log(`   ID: ${page._id}`)
      
      let fixCount = 0
      const updatedContentBlocks = page.contentBlocks.map((block: any) => {
        if (block._type === 'pageSection' && block.cta && block.cta.url === null) {
          fixCount++
          
          // Determine appropriate URL based on button text and page context
          let newUrl = '/elpriser' // Default fallback
          
          const buttonText = block.cta.text.toLowerCase()
          if (buttonText.includes('elselskab')) {
            newUrl = '/elselskaber'
          } else if (buttonText.includes('ladeboks')) {
            newUrl = '/ladeboks'
          } else if (buttonText.includes('grøn') || buttonText.includes('energi')) {
            newUrl = '/groen-energi'
          }
          
          console.log(`   🔧 Fixing CTA in section: "${block.title}"`)
          console.log(`      Button: "${block.cta.text}"`)
          console.log(`      New URL: ${newUrl}`)
          
          return {
            ...block,
            cta: {
              ...block.cta,
              url: newUrl
            }
          }
        }
        return block
      })
      
      if (fixCount > 0) {
        try {
          // Handle both regular and draft documents
          const documentId = page._id.replace('drafts.', '')
          
          // Update the document
          const result = await client
            .patch(page._id)
            .set({ contentBlocks: updatedContentBlocks })
            .commit()
          
          console.log(`   ✅ Successfully fixed ${fixCount} CTA(s)`)
          
          // If it was a draft, also publish it
          if (page._id.startsWith('drafts.')) {
            console.log(`   📤 Publishing draft...`)
            await client.patch(documentId)
              .set({ contentBlocks: updatedContentBlocks })
              .commit()
          }
        } catch (patchError) {
          console.error(`   ❌ Error patching document: ${patchError}`)
        }
      }
    }
    
    console.log('\n✅ CTA URL fix process completed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
fixCTAUrlsRobust()