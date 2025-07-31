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

async function analyzePage() {
  const slug = 'hvordan-vaelger-du-elleverandoer'
  
  console.log(`\n🔍 Fetching page data for: ${slug}\n`)
  
  try {
    // Fetch the complete page data with all content blocks
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
    console.log('\n📊 Page Structure Analysis:\n')
    console.log('Total content blocks:', page.contentBlocks?.length || 0)
    
    // Analyze each content block
    const issues: any[] = []
    
    page.contentBlocks?.forEach((block: any, index: number) => {
      console.log(`\n--- Block ${index + 1}: ${block._type} ---`)
      console.log('Key:', block._key)
      
      // Check for common issues
      if (block._type === 'featureList') {
        console.log('⚠️  Feature List found - checking for issues...')
        
        if (block.headerAlignment) {
          issues.push({
            blockIndex: index,
            type: 'featureList',
            issue: 'Has headerAlignment field (not in schema)',
            value: block.headerAlignment
          })
        }
        
        if (block.items) {
          issues.push({
            blockIndex: index,
            type: 'featureList',
            issue: 'Has "items" field instead of "features"',
            itemCount: block.items.length
          })
          console.log(`  - Has ${block.items.length} items (should be "features")`)
        }
        
        if (block.features) {
          console.log(`  - Has ${block.features.length} features (correct field)`)
        }
      }
      
      if (block._type === 'valueProposition') {
        console.log('⚠️  Value Proposition found - checking structure...')
        
        if (!block.heading) {
          issues.push({
            blockIndex: index,
            type: 'valueProposition',
            issue: 'Missing heading field'
          })
        }
        
        if (!block.valueItems) {
          issues.push({
            blockIndex: index,
            type: 'valueProposition',
            issue: 'Missing valueItems array'
          })
        } else {
          console.log(`  - Has ${block.valueItems.length} value items`)
          
          // Check each value item
          block.valueItems.forEach((item: any, itemIndex: number) => {
            if (!item.heading) {
              issues.push({
                blockIndex: index,
                type: 'valueProposition',
                issue: `Value item ${itemIndex} missing heading`,
                item: item
              })
            }
          })
        }
      }
      
      // Log all fields for detailed inspection
      console.log('Fields:', Object.keys(block).filter(k => !k.startsWith('_')))
    })
    
    // Output detailed issues report
    console.log('\n\n🚨 ISSUES FOUND:\n')
    
    if (issues.length === 0) {
      console.log('✅ No schema validation issues found!')
    } else {
      issues.forEach((issue, i) => {
        console.log(`\nIssue ${i + 1}:`)
        console.log('  Block Index:', issue.blockIndex)
        console.log('  Block Type:', issue.type)
        console.log('  Problem:', issue.issue)
        if (issue.value) console.log('  Value:', issue.value)
        if (issue.itemCount) console.log('  Item Count:', issue.itemCount)
        if (issue.item) console.log('  Item Data:', JSON.stringify(issue.item, null, 2))
      })
    }
    
    // Output the raw data for manual inspection
    console.log('\n\n📄 RAW PAGE DATA (for manual inspection):\n')
    console.log(JSON.stringify(page, null, 2))
    
  } catch (error) {
    console.error('Error fetching page:', error)
  }
}

// Run the analysis
analyzePage()