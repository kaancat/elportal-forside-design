import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function verifyLadeboksValueProposition() {
  try {
    console.log('🔍 Verifying Ladeboks page ValueProposition...\n')
    
    // Fetch the page with expanded references
    const query = `*[_type == "page" && slug.current == "ladeboks"][0]{
      _id,
      _rev,
      title,
      slug,
      contentBlocks[] {
        _type == "valueProposition" => {
          _key,
          _type,
          heading,
          subheading,
          content,
          valueItems[] {
            _key,
            heading,
            description,
            icon {
              _type,
              icon,
              metadata
            }
          },
          // Check deprecated fields
          title,
          items[] {
            _key,
            heading,
            description,
            icon
          }
        },
        _type != "valueProposition" => {
          _key,
          _type,
          "summary": "Other block type: " + _type
        }
      }
    }`
    
    const page = await client.fetch(query)
    
    if (!page) {
      console.log('❌ Ladeboks page not found!')
      return
    }

    console.log('📄 Page found:', page._id)
    console.log('Revision:', page._rev)
    
    // Find the valueProposition block
    const vpBlock = page.contentBlocks?.find((block: any) => block._type === 'valueProposition')
    
    if (!vpBlock) {
      console.log('❌ No valueProposition block found!')
      return
    }

    console.log('\n✅ ValueProposition block found!')
    console.log('\n📊 Current state:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Key:', vpBlock._key)
    console.log('Type:', vpBlock._type)
    console.log('\n🏷️ Active fields:')
    console.log('  heading:', vpBlock.heading || '❌ MISSING')
    console.log('  subheading:', vpBlock.subheading || '❌ MISSING')
    console.log('  content:', vpBlock.content ? '✅ Has content' : '❌ No content')
    console.log('  valueItems:', vpBlock.valueItems?.length || 0, 'items')
    
    console.log('\n⚠️ Deprecated fields (should be empty):')
    console.log('  title:', vpBlock.title || '✅ Empty (good)')
    console.log('  items:', vpBlock.items?.length || 0, 'items', vpBlock.items?.length > 0 ? '⚠️ Should be empty!' : '✅ Empty (good)')
    
    if (vpBlock.valueItems && vpBlock.valueItems.length > 0) {
      console.log('\n📋 ValueItems details:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      vpBlock.valueItems.forEach((item: any, index: number) => {
        console.log(`\n${index + 1}. ${item.heading}`)
        console.log(`   Description: ${item.description?.substring(0, 60)}...`)
        console.log(`   Icon: ${item.icon?.icon || '❌ No icon'}`)
        if (item.icon?.metadata) {
          console.log(`   Icon type: ${item.icon._type}`)
          console.log(`   Icon valid: ${item.icon._type === 'icon.manager' ? '✅' : '❌'}`)
        }
      })
    }

    // Check if frontend will display correctly
    console.log('\n🖥️ Frontend compatibility check:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // The frontend component checks for block.title first, then block.items
    const willDisplayTitle = vpBlock.title || vpBlock.heading
    const willDisplayItems = vpBlock.items || vpBlock.valueItems || []
    
    console.log('Title will display:', willDisplayTitle ? `✅ "${willDisplayTitle}"` : '❌ No title')
    console.log('Items will display:', willDisplayItems.length > 0 ? `✅ ${willDisplayItems.length} items` : '❌ No items')
    
    if (vpBlock.items && vpBlock.items.length > 0) {
      console.log('\n⚠️ WARNING: Frontend is using deprecated "items" field!')
      console.log('The data should be in "valueItems" field instead.')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the verification
verifyLadeboksValueProposition()