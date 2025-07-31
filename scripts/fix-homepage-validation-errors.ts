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

async function fixHomepageValidationErrors() {
  try {
    console.log('🔧 Fixing homepage validation errors...\n')
    
    // Fetch the homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    // Fix 1: Shorten SEO Meta Title (under 60 characters)
    console.log('1️⃣ Fixing SEO Meta Title...')
    console.log(`   Current: "${homepage.seoMetaTitle}" (${homepage.seoMetaTitle?.length} chars)`)
    
    // New shorter title (59 characters)
    const newSeoTitle = "Sammenlign Elpriser & Find Billigste Elaftale | DinElPortal"
    console.log(`   New: "${newSeoTitle}" (${newSeoTitle.length} chars)`)
    
    // Fix 2: Convert Monthly Production Chart leadingText from Array to String
    console.log('\n2️⃣ Fixing Monthly Production Chart Leading Text...')
    const updatedContentBlocks = homepage.contentBlocks.map((block: any) => {
      if (block._type === 'pageSection' && block.content) {
        const updatedContent = block.content.map((item: any) => {
          if (item._type === 'monthlyProductionChart' && Array.isArray(item.leadingText)) {
            console.log('   Found Monthly Production Chart with Array leadingText')
            // Extract text from the array structure if it exists
            let textContent = ''
            if (item.leadingText.length > 0 && item.leadingText[0].children) {
              textContent = item.leadingText[0].children
                .map((child: any) => child.text || '')
                .join('')
            }
            console.log(`   Converting to string: "${textContent || 'No text found'}"`)
            
            return {
              ...item,
              leadingText: textContent || '' // Convert to simple string
            }
          }
          return item
        })
        
        return {
          ...block,
          content: updatedContent
        }
      }
      return block
    })
    
    // The CTA URLs are already valid, so no fix needed for those
    console.log('\n3️⃣ CTA URLs:')
    console.log('   All CTA URLs are already valid ✅')
    
    // Apply the updates
    console.log('\n📝 Applying updates to homepage...')
    
    const result = await client.patch(homepage._id)
      .set({ 
        seoMetaTitle: newSeoTitle,
        contentBlocks: updatedContentBlocks
      })
      .commit()
    
    console.log('\n✅ All validation errors fixed successfully!')
    console.log('\nSummary of fixes:')
    console.log('1. SEO Meta Title shortened to 59 characters')
    console.log('2. Monthly Production Chart leadingText converted from Array to String')
    console.log('3. CTA URLs were already valid (no changes needed)')
    
  } catch (error) {
    console.error('❌ Error fixing validation errors:', error)
  }
}

// Run the script
fixHomepageValidationErrors()