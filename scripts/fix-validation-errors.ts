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

async function fixValidationErrors() {
  console.log('🔧 Fixing All Validation Errors in Historiske Priser Page\n')
  console.log('=' .repeat(60))
  
  const pageId = 'qgCxJyBbKpvhb2oGYjlhjr'
  
  // Fetch the page
  const page = await client.fetch(`*[_id == "${pageId}"][0]`)
  
  if (!page) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('✅ Page found:', page.title)
  console.log(`📊 Total blocks: ${page.contentBlocks?.length || 0}\n`)
  
  let fixedBlocks = page.contentBlocks.map((block: any, index: number) => {
    let fixedBlock = { ...block }
    let changesMade: string[] = []
    
    // Fix 1: Replace "heading" field with "title" in pageSection blocks
    if (block._type === 'pageSection' && block.heading && !block.title) {
      fixedBlock.title = block.heading
      delete fixedBlock.heading
      changesMade.push(`Moved heading "${block.heading}" to title field`)
    }
    
    // Fix 2: Fix valueProposition items with string icons
    if (block._type === 'valueProposition' && block.items) {
      fixedBlock.items = block.items.map((item: any) => {
        if (typeof item.icon === 'string') {
          // Convert string icon to proper icon manager object
          const iconObject = {
            _type: 'icon.manager',
            icon: item.icon,
            metadata: {
              icon: item.icon,
              iconName: item.icon.charAt(0).toUpperCase() + item.icon.slice(1),
              collectionId: 'lucide',
              collectionName: 'Lucide'
            }
          }
          changesMade.push(`Fixed string icon "${item.icon}" to object`)
          return { ...item, icon: iconObject }
        }
        return item
      })
    }
    
    // Fix 3: Ensure all pageSection blocks have titles for Sanity Studio display
    if (block._type === 'pageSection' && !fixedBlock.title) {
      // Generate meaningful titles based on content
      if (block.content && block.content.length > 0) {
        const firstTextBlock = block.content.find((c: any) => c.children?.[0]?.text)
        if (firstTextBlock?.children?.[0]?.text) {
          let autoTitle = firstTextBlock.children[0].text
          // Truncate if too long
          if (autoTitle.length > 50) {
            autoTitle = autoTitle.substring(0, 47) + '...'
          }
          fixedBlock.title = autoTitle
          changesMade.push(`Added auto-generated title: "${autoTitle}"`)
        }
      }
      
      // Fallback titles for specific patterns
      if (!fixedBlock.title) {
        if (index === 1) fixedBlock.title = 'Vigtige Nøgletal for Elmarkedet'
        else if (index === 3) fixedBlock.title = 'Energikrisen 2022: Hvad Skete Der?'
        else if (index === 6) fixedBlock.title = 'Fast eller Variabel Pris?'
        else if (index === 9) fixedBlock.title = 'Grøn Strøm og Priser'
        else if (index === 11) fixedBlock.title = 'Vindkraftens Indflydelse'
        else if (index === 12) fixedBlock.title = '10 Tips til Lave Elpriser'
        else if (index === 14) fixedBlock.title = 'Find den Bedste Elaftale'
        else if (index === 16) fixedBlock.title = 'Om Vores Data'
        else fixedBlock.title = `Tekstsektion ${index + 1}`
        
        if (fixedBlock.title) {
          changesMade.push(`Added fallback title: "${fixedBlock.title}"`)
        }
      }
    }
    
    // Fix 4: Add missing _key fields
    if (!fixedBlock._key) {
      fixedBlock._key = `block-${index}-${Math.random().toString(36).substring(7)}`
      changesMade.push('Added missing _key field')
    }
    
    // Fix 5: Clean up unknown fields that might cause issues
    if (block._type === 'pageSection') {
      // Remove any legacy fields that might cause validation issues
      const validFields = ['_type', '_key', 'title', 'subtitle', 'content', 'headerAlignment', 'colorTheme', 'alignment']
      const blockKeys = Object.keys(fixedBlock)
      blockKeys.forEach(key => {
        if (!validFields.includes(key)) {
          console.log(`   ⚠️  Removing unknown field "${key}" from pageSection`)
          delete fixedBlock[key]
          changesMade.push(`Removed unknown field: ${key}`)
        }
      })
    }
    
    // Log changes for this block
    if (changesMade.length > 0) {
      console.log(`\n🔧 Block ${index} (${block._type}):`)
      changesMade.forEach(change => console.log(`   - ${change}`))
    }
    
    return fixedBlock
  })
  
  // Apply the fixes
  try {
    console.log('\n💾 Saving all validation fixes...')
    
    await client
      .patch(pageId)
      .set({ contentBlocks: fixedBlocks })
      .commit()
    
    console.log('\n✅ Successfully fixed all validation errors!')
    
    // Generate summary
    const pageBlocks = fixedBlocks.filter((b: any) => b._type === 'pageSection')
    const valuePropBlocks = fixedBlocks.filter((b: any) => b._type === 'valueProposition')
    
    console.log('\n📊 SUMMARY:')
    console.log(`   - Total content blocks: ${fixedBlocks.length}`)
    console.log(`   - PageSection blocks with titles: ${pageBlocks.filter((b: any) => b.title).length}/${pageBlocks.length}`)
    console.log(`   - ValueProposition blocks fixed: ${valuePropBlocks.length}`)
    
    console.log('\n🎯 Next steps:')
    console.log('   1. Refresh Sanity Studio to see updated titles')
    console.log('   2. Check that validation errors are gone')
    console.log('   3. Verify all components display properly')
    
  } catch (error) {
    console.error('\n❌ Error applying fixes:', error)
  }
}

fixValidationErrors().catch(console.error)