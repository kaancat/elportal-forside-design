import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

async function verifyInfoCardsFix() {
  console.log('🔍 Verifying InfoCardsSection Fix\n')
  console.log('=' .repeat(60))
  
  const pageId = 'f7ecf92783e749828f7281a6e5829d52'
  
  // Fetch the page with full details
  const page = await client.fetch(`*[_id == "${pageId}"][0] {
    _id,
    _type,
    title,
    slug,
    contentBlocks[] {
      ...,
      _type == "infoCardsSection" => {
        _type,
        _key,
        title,
        subtitle,
        headerAlignment,
        columns,
        leadingText,
        cards[] {
          _key,
          _type,
          title,
          icon,
          iconColor,
          bgColor,
          description
        }
      }
    }
  }`)
  
  if (!page) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('✅ Page found:', page.title)
  console.log(`📊 Total blocks: ${page.contentBlocks?.length || 0}\n`)
  
  // Find all InfoCardsSection blocks
  const infoCardsSections = page.contentBlocks?.filter((block: any) => block._type === 'infoCardsSection') || []
  
  console.log(`📦 Found ${infoCardsSections.length} InfoCardsSection block(s)\n`)
  
  let issuesFound = false
  
  infoCardsSections.forEach((block: any, index: number) => {
    console.log(`📋 InfoCardsSection ${index + 1}:`)
    console.log(`   Block _key: ${block._key || '❌ MISSING'}`)
    console.log(`   Title: ${block.title || 'NO TITLE'}`)
    console.log(`   Subtitle: ${block.subtitle || 'NO SUBTITLE'}`)
    console.log(`   Header Alignment: ${block.headerAlignment || 'NOT SET'}`)
    console.log(`   Columns: ${block.columns || 'NOT SET'}`)
    
    if (!block._key) {
      console.log('   ⚠️  Block itself is missing _key!')
      issuesFound = true
    }
    
    if (block.cards && Array.isArray(block.cards)) {
      console.log(`\n   📇 Cards (${block.cards.length} total):`)
      
      block.cards.forEach((card: any, cardIdx: number) => {
        console.log(`\n      Card ${cardIdx + 1}:`)
        console.log(`         _key: ${card._key || '❌ MISSING'}`)
        console.log(`         Title: ${card.title || 'NO TITLE'}`)
        console.log(`         Icon: ${card.icon || 'NO ICON'}`)
        console.log(`         Icon Color: ${card.iconColor || 'DEFAULT'}`)
        console.log(`         BG Color: ${card.bgColor || 'DEFAULT'}`)
        
        if (!card._key) {
          console.log('         ⚠️  Card is missing _key!')
          issuesFound = true
        }
        
        // Check description structure
        if (card.description) {
          if (Array.isArray(card.description)) {
            console.log(`         Description: ${card.description.length} block(s)`)
            card.description.forEach((desc: any, descIdx: number) => {
              if (!desc._key) {
                console.log(`         ⚠️  Description block ${descIdx + 1} missing _key!`)
                issuesFound = true
              }
              if (desc.children && Array.isArray(desc.children)) {
                desc.children.forEach((child: any, childIdx: number) => {
                  if (!child._key) {
                    console.log(`         ⚠️  Description child ${childIdx + 1} missing _key!`)
                    issuesFound = true
                  }
                })
              }
            })
          } else {
            console.log(`         Description: ${typeof card.description}`)
          }
        } else {
          console.log('         Description: NOT SET')
        }
      })
    } else {
      console.log('   ⚠️  No cards array found!')
      issuesFound = true
    }
    
    console.log('\n' + '-'.repeat(60))
  })
  
  console.log('\n📊 SUMMARY:')
  if (issuesFound) {
    console.log('❌ Issues found - some items still missing _key properties')
    console.log('\nRecommended actions:')
    console.log('1. Run the fix script again')
    console.log('2. Check for nested blocks that may need _key properties')
    console.log('3. Verify portable text blocks have proper structure')
  } else {
    console.log('✅ All items have proper _key properties!')
    console.log('✅ InfoCardsSection is properly structured')
    console.log('\nThe validation error should now be resolved.')
  }
  
  // Additional check for other potential issues
  console.log('\n🔍 Additional Checks:')
  
  // Check if any blocks have duplicate keys
  const allKeys = new Set<string>()
  const duplicateKeys: string[] = []
  
  page.contentBlocks?.forEach((block: any) => {
    if (block._key) {
      if (allKeys.has(block._key)) {
        duplicateKeys.push(block._key)
      }
      allKeys.add(block._key)
    }
  })
  
  if (duplicateKeys.length > 0) {
    console.log(`⚠️  Found duplicate _key values: ${duplicateKeys.join(', ')}`)
  } else {
    console.log('✅ No duplicate _key values found')
  }
}

// Run the verification
verifyInfoCardsFix().catch(console.error)