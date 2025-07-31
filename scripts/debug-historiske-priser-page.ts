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

async function debugHistoriskePriserPage() {
  console.log('🔍 Debugging historiske-priser page valueProposition issue...\n')
  
  try {
    // Use the exact same query as frontend getPageBySlug
    const query = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      _id,
      _type,
      title,
      slug,
      description,
      contentBlocks[]{
        _key,
        _type,
        _type == "valueProposition" => {
          _key,
          _type,
          heading,
          subheading,
          content,
          valueItems[]{
            _key,
            heading,
            description,
            icon {
              _type,
              icon,
              metadata {
                collectionId,
                collectionName,
                iconName,
                icon,
                size,
                url,
                inlineSvg
              }
            }
          }
        },
        _type == "pageSection" => {
          _key,
          _type,
          title,
          headerAlignment,
          content[]
        }
      }
    }`
    
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('📄 Page found:', page.title)
    console.log('📦 Total content blocks:', page.contentBlocks?.length || 0)
    
    // Find valueProposition blocks
    const valuePropositionBlocks = page.contentBlocks?.filter(b => b._type === 'valueProposition') || []
    
    console.log(`\n🎯 ValueProposition blocks found: ${valuePropositionBlocks.length}`)
    
    if (valuePropositionBlocks.length > 0) {
      valuePropositionBlocks.forEach((block, index) => {
        console.log(`\n--- ValueProposition Block ${index + 1} ---`)
        console.log('Key:', block._key)
        console.log('Type:', block._type)
        console.log('Heading:', block.heading || 'MISSING')
        console.log('Subheading:', block.subheading || 'MISSING')
        console.log('Content:', block.content ? `${block.content.length} blocks` : 'MISSING')
        console.log('ValueItems:', block.valueItems ? `${block.valueItems.length} items` : 'MISSING')
        
        if (block.valueItems) {
          console.log('\nValueItems details:')
          block.valueItems.forEach((item, i) => {
            console.log(`  ${i + 1}. "${item.heading}" - ${item.description ? 'has description' : 'no description'}`)
          })
        }
      })
      
      console.log('\n✅ DIAGNOSIS: ValueProposition data is present in the page!')
      console.log('The component should be rendering on the frontend.')
      
      // Check if the block might be inside a pageSection
      console.log('\n🔍 Checking if valueProposition is nested inside pageSection...')
      const pageSections = page.contentBlocks?.filter(b => b._type === 'pageSection') || []
      pageSections.forEach((section, i) => {
        if (section.content && Array.isArray(section.content)) {
          const nestedValueProps = section.content.filter(c => c?._type === 'valueProposition')
          if (nestedValueProps.length > 0) {
            console.log(`⚠️  Found ${nestedValueProps.length} valueProposition(s) nested in pageSection ${i + 1}!`)
            console.log('This might be causing the issue - valueProposition should be a top-level block.')
          }
        }
      })
    } else {
      console.log('❌ No valueProposition blocks found in contentBlocks array!')
    }
    
    // Show all block types for context
    console.log('\n📋 All content block types on the page:')
    page.contentBlocks?.forEach((block, i) => {
      console.log(`  ${i + 1}. ${block._type} (key: ${block._key})`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run debug
debugHistoriskePriserPage()