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

async function fixInvalidCTAUrls() {
  try {
    console.log('🔧 Fixing invalid CTA URLs...\n')
    
    // Pages to fix with appropriate URLs
    const pagesToFix = [
      {
        id: 'drafts.80a93cd8-34a6-4041-8b4b-2f65424dcbc6',
        title: 'Om os',
        defaultUrl: '/elpriser' // Default URL for comparison CTAs
      },
      {
        id: 'I7aq0qw44tdJ3YglBfyS8h',
        title: 'Elselskaber',
        defaultUrl: '/elpriser' // Comparison page
      },
      {
        id: 'I7aq0qw44tdJ3YglBpsP1G',
        title: 'Energibesparende Tips',
        defaultUrl: '/elpriser' // Comparison page
      }
    ]
    
    for (const pageInfo of pagesToFix) {
      console.log(`\n📄 Fixing page: ${pageInfo.title}`)
      console.log(`   ID: ${pageInfo.id}`)
      
      // Fetch the page
      const page = await client.fetch(`*[_id == "${pageInfo.id}"][0]`)
      
      if (!page) {
        console.log(`   ❌ Page not found`)
        continue
      }
      
      let fixCount = 0
      
      // Update content blocks
      const updatedContentBlocks = page.contentBlocks.map((block: any) => {
        if (block._type === 'pageSection' && block.cta && (block.cta.url === null || block.cta.url === 'null')) {
          fixCount++
          console.log(`   🔧 Fixing CTA in section: "${block.title}"`)
          console.log(`      Button text: "${block.cta.text}"`)
          console.log(`      New URL: ${pageInfo.defaultUrl}`)
          
          return {
            ...block,
            cta: {
              ...block.cta,
              url: pageInfo.defaultUrl
            }
          }
        }
        return block
      })
      
      if (fixCount > 0) {
        // Apply the fix
        const result = await client.patch(pageInfo.id)
          .set({ contentBlocks: updatedContentBlocks })
          .commit()
        
        console.log(`   ✅ Fixed ${fixCount} CTA(s)`)
      } else {
        console.log(`   ℹ️  No invalid CTAs found`)
      }
    }
    
    console.log('\n✅ All CTA URL fixes completed!')
    
  } catch (error) {
    console.error('❌ Error fixing CTA URLs:', error)
  }
}

// Run the script
fixInvalidCTAUrls()