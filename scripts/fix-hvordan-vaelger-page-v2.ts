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

async function fixHvordanVaelgerPageV2() {
  const slug = 'hvordan-vaelger-du-elleverandoer'
  
  console.log(`\n🔧 Fixing page (v2): ${slug}\n`)
  
  try {
    // Fetch the complete page data with all content
    const query = `*[_type == "page" && slug.current == $slug][0] {
      _id,
      _type,
      title,
      slug,
      description,
      keywords,
      contentBlocks[] {
        _type,
        _key,
        ...,
        // Expand all possible nested content
        content[] {
          _type,
          _key,
          ...
        },
        items[] {
          _type,
          _key,
          ...
        },
        features[] {
          _type,
          _key,
          ...
        },
        valueItems[] {
          _type,
          _key,
          ...
        }
      }
    }`
    
    const page = await client.fetch(query, { slug })
    
    if (!page) {
      console.log('❌ Page not found')
      return
    }
    
    console.log('✅ Page found:', page.title)
    console.log('🔍 Processing content blocks...\n')
    
    // Track issues found and fixed
    let fixCount = 0
    
    // Fix the content blocks - this time preserving all valid content
    const fixedContentBlocks = page.contentBlocks.map((block: any, index: number) => {
      const fixedBlock = { ...block } // Start with a copy of the block
      
      // Fix featureList issues
      if (block._type === 'featureList') {
        console.log(`📝 Processing featureList block at index ${index}`)
        
        // Issue 1: Remove headerAlignment (not in schema)
        if ('headerAlignment' in fixedBlock) {
          console.log('  - Removing invalid headerAlignment field')
          delete fixedBlock.headerAlignment
          fixCount++
        }
        
        // Issue 2: If items exist but not features, rename items to features
        if (fixedBlock.items && !fixedBlock.features) {
          console.log('  - Renaming "items" to "features"')
          fixedBlock.features = fixedBlock.items
          delete fixedBlock.items
          fixCount++
        }
        
        // If both exist, keep features and remove items
        else if (fixedBlock.items && fixedBlock.features) {
          console.log('  - Removing duplicate "items" field (keeping "features")')
          delete fixedBlock.items
          fixCount++
        }
      }
      
      // Fix valueProposition issues
      if (block._type === 'valueProposition') {
        console.log(`📝 Processing valueProposition block at index ${index}`)
        
        // Issue: Ensure valueItems array exists
        if (!fixedBlock.valueItems) {
          console.log('  - Creating empty valueItems array')
          
          // If there's an items array, convert it to valueItems
          if (fixedBlock.items && Array.isArray(fixedBlock.items)) {
            console.log('  - Converting items to valueItems')
            fixedBlock.valueItems = fixedBlock.items.map((item: any) => ({
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
            delete fixedBlock.items
          } else {
            // Create empty array
            fixedBlock.valueItems = []
          }
          fixCount++
        }
      }
      
      return fixedBlock
    })
    
    console.log(`\n📊 Total issues fixed: ${fixCount}`)
    
    if (fixCount === 0) {
      console.log('✅ No issues found - page is already clean!')
      return
    }
    
    // Update the page with fixed content blocks
    console.log('\n📤 Updating page in Sanity...')
    
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: fixedContentBlocks })
      .commit()
    
    console.log('\n✅ Page successfully updated!')
    console.log('Document ID:', result._id)
    console.log('Updated at:', result._updatedAt)
    
    // Verify specific fixes
    console.log('\n🔍 Verifying fixes...')
    
    const verifyQuery = `*[_type == "page" && slug.current == $slug][0] {
      contentBlocks[] {
        _type == "featureList" => {
          _type,
          _key,
          "hasHeaderAlignment": defined(headerAlignment),
          "hasItems": defined(items),
          "hasFeatures": defined(features),
          "featuresCount": count(features)
        },
        _type == "valueProposition" => {
          _type,
          _key,
          "hasValueItems": defined(valueItems),
          "valueItemsCount": count(valueItems)
        }
      }
    }`
    
    const verification = await client.fetch(verifyQuery, { slug })
    
    console.log('\n📊 Verification Results:')
    verification.contentBlocks
      .filter((b: any) => b._type === 'featureList' || b._type === 'valueProposition')
      .forEach((block: any, i: number) => {
        if (block._type === 'featureList') {
          console.log(`\nFeatureList:`)
          console.log(`  - Has headerAlignment: ${block.hasHeaderAlignment} (should be false)`)
          console.log(`  - Has items: ${block.hasItems} (should be false)`)
          console.log(`  - Has features: ${block.hasFeatures} (should be true)`)
          console.log(`  - Features count: ${block.featuresCount}`)
        }
        if (block._type === 'valueProposition') {
          console.log(`\nValueProposition:`)
          console.log(`  - Has valueItems: ${block.hasValueItems} (should be true)`)
          console.log(`  - ValueItems count: ${block.valueItemsCount}`)
        }
      })
    
  } catch (error) {
    console.error('❌ Error fixing page:', error)
  }
}

// Helper function to generate unique keys
function generateKey(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Run the fix
fixHvordanVaelgerPageV2()