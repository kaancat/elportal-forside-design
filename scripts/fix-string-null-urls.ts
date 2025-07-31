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

async function fixStringNullUrls() {
  try {
    console.log('🔧 Fixing CTA URLs with "null" string value...\n')
    
    // Fetch all pages to check for string "null"
    const pages = await client.fetch(`*[_type == "page"]{
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
    }`)
    
    let totalFixed = 0
    
    for (const page of pages) {
      let fixCount = 0
      let needsUpdate = false
      
      const updatedContentBlocks = page.contentBlocks.map((block: any) => {
        if (block._type === 'pageSection' && block.cta && 
            (block.cta.url === 'null' || block.cta.url === null || !block.cta.url)) {
          needsUpdate = true
          fixCount++
          
          // Determine appropriate URL based on button text
          let newUrl = '/elpriser' // Default
          
          const buttonText = (block.cta.text || '').toLowerCase()
          if (buttonText.includes('elselskab')) {
            newUrl = '/elselskaber'
          } else if (buttonText.includes('ladeboks')) {
            newUrl = '/ladeboks'
          } else if (buttonText.includes('grøn') || buttonText.includes('energi')) {
            newUrl = '/groen-energi'
          } else if (buttonText.includes('spar')) {
            newUrl = '/spar-penge'
          }
          
          console.log(`\n📄 ${page.title} - Section: "${block.title}"`)
          console.log(`   Current URL: "${block.cta.url}"`)
          console.log(`   Button: "${block.cta.text}"`)
          console.log(`   New URL: ${newUrl}`)
          
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
      
      if (needsUpdate) {
        try {
          const result = await client
            .patch(page._id)
            .set({ contentBlocks: updatedContentBlocks })
            .commit()
          
          console.log(`   ✅ Fixed ${fixCount} CTA(s)`)
          totalFixed += fixCount
        } catch (error) {
          console.error(`   ❌ Error updating page: ${error}`)
        }
      }
    }
    
    console.log(`\n✅ Total CTAs fixed: ${totalFixed}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
fixStringNullUrls()