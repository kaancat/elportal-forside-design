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

async function fixHvordanVaelgerPage() {
  const slug = 'hvordan-vaelger-du-elleverandoer'
  
  console.log(`\n🔧 Fixing page: ${slug}\n`)
  
  try {
    // First, fetch the current page data
    const query = `*[_type == "page" && slug.current == $slug][0]`
    const page = await client.fetch(query, { slug })
    
    if (!page) {
      console.log('❌ Page not found')
      return
    }
    
    console.log('✅ Page found:', page.title)
    console.log('🔍 Processing content blocks...\n')
    
    // Fix the content blocks
    const fixedContentBlocks = page.contentBlocks.map((block: any, index: number) => {
      // Fix featureList issues
      if (block._type === 'featureList') {
        console.log(`📝 Fixing featureList block at index ${index}`)
        
        // Remove headerAlignment (not in schema)
        delete block.headerAlignment
        
        // If items exist but not features, rename items to features
        if (block.items && !block.features) {
          console.log('  - Renaming "items" to "features"')
          block.features = block.items
          delete block.items
        }
        
        // If both exist, keep features and remove items
        if (block.items && block.features) {
          console.log('  - Removing duplicate "items" field')
          delete block.items
        }
        
        // Clean up other invalid fields
        delete block.content
        delete block.valueItems
        
        console.log('  ✅ featureList fixed')
      }
      
      // Fix valueProposition issues
      if (block._type === 'valueProposition') {
        console.log(`📝 Fixing valueProposition block at index ${index}`)
        
        // Ensure valueItems array exists
        if (!block.valueItems) {
          console.log('  - Creating valueItems array')
          block.valueItems = []
        }
        
        // If there's an items array, use it
        if (block.items && block.items.length > 0) {
          console.log('  - Moving items to valueItems')
          block.valueItems = block.items.map((item: any) => ({
            _type: 'valueItem',
            _key: item._key || generateKey(),
            heading: item.heading || item.title || 'Værdi',
            description: item.description || '',
            icon: item.icon || {
              _type: 'icon.manager',
              name: 'star',
              provider: 'fi',
              svg: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>'
            }
          }))
          delete block.items
        }
        
        // Ensure heading exists
        if (!block.heading) {
          console.log('  - Adding default heading')
          block.heading = 'Vores værditilbud'
        }
        
        // Clean up invalid fields
        delete block.content
        delete block.features
        
        console.log('  ✅ valueProposition fixed')
      }
      
      // Clean up any remaining invalid fields on all blocks
      delete block.items
      delete block.features
      delete block.valueItems
      delete block.content
      
      // Only keep valid fields based on the block type
      return cleanBlockFields(block)
    })
    
    // Update the page with fixed content blocks
    const updatedPage = {
      ...page,
      contentBlocks: fixedContentBlocks
    }
    
    console.log('\n📤 Updating page in Sanity...')
    
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: fixedContentBlocks })
      .commit()
    
    console.log('\n✅ Page successfully updated!')
    console.log('Document ID:', result._id)
    console.log('Updated at:', result._updatedAt)
    
    // Verify the fix
    console.log('\n🔍 Verifying the fix...')
    const verifyQuery = `*[_type == "page" && slug.current == $slug][0] {
      contentBlocks[] {
        _type,
        _key,
        "fieldNames": {...} | keys()
      }
    }`
    
    const verifiedPage = await client.fetch(verifyQuery, { slug })
    
    console.log('\n📊 Content blocks after fix:')
    verifiedPage.contentBlocks.forEach((block: any, index: number) => {
      console.log(`\nBlock ${index + 1}: ${block._type}`)
      console.log('Fields:', block.fieldNames.filter((f: string) => !f.startsWith('_')))
    })
    
  } catch (error) {
    console.error('❌ Error fixing page:', error)
  }
}

// Helper function to generate unique keys
function generateKey(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Helper function to clean block fields based on type
function cleanBlockFields(block: any) {
  const baseFields = ['_type', '_key']
  
  switch (block._type) {
    case 'hero':
      return pick(block, [...baseFields, 'headline', 'subheadline', 'image', 'variant', 'showScrollIndicator'])
      
    case 'pageSection':
      return pick(block, [...baseFields, 'title', 'content', 'headerAlignment', 'image', 'imagePosition'])
      
    case 'featureList':
      return pick(block, [...baseFields, 'title', 'subtitle', 'features'])
      
    case 'valueProposition':
      return pick(block, [...baseFields, 'heading', 'subheading', 'valueItems'])
      
    case 'providerList':
      return pick(block, [...baseFields, 'title', 'subtitle', 'headerAlignment'])
      
    case 'faqGroup':
      return pick(block, [...baseFields, 'title', 'faqItems'])
      
    case 'callToActionSection':
      return pick(block, [...baseFields, 'title', 'buttonText', 'buttonUrl'])
      
    default:
      // For unknown types, keep all fields
      return block
  }
}

// Helper function to pick specific fields from an object
function pick(obj: any, fields: string[]): any {
  const result: any = {}
  fields.forEach(field => {
    if (obj.hasOwnProperty(field)) {
      result[field] = obj[field]
    }
  })
  return result
}

// Run the fix
fixHvordanVaelgerPage()