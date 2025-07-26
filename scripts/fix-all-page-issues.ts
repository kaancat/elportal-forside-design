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

async function fixAllPageIssues() {
  console.log('🔧 Fixing ALL Historiske Priser Page Issues\n')
  console.log('=' .repeat(60))
  
  const pageId = 'qgCxJyBbKpvhb2oGYjlhjr'
  
  // Fetch the page
  const page = await client.fetch(`*[_id == "${pageId}"][0]`)
  
  if (!page) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('✅ Found page:', page.title)
  console.log(`📊 Current blocks: ${page.contentBlocks?.length || 0}`)
  
  // Process blocks
  let fixedBlocks = [...page.contentBlocks]
  let changesMade = []
  
  // 1. Remove duplicate regionalComparison (keep first one at index 7, remove one at index 18)
  console.log('\n🔧 FIX 1: Removing duplicate regionalComparison...')
  const regionalIndices: number[] = []
  fixedBlocks.forEach((block, idx) => {
    if (block._type === 'regionalComparison') {
      regionalIndices.push(idx)
    }
  })
  
  if (regionalIndices.length > 1) {
    // Remove the duplicate (keep the first one)
    fixedBlocks = fixedBlocks.filter((_, idx) => idx !== regionalIndices[1])
    changesMade.push(`Removed duplicate regionalComparison at index ${regionalIndices[1]}`)
    console.log(`   ✅ Removed duplicate at index ${regionalIndices[1]}`)
  }
  
  // 2. Fix icon URLs in featureList
  console.log('\n🔧 FIX 2: Fixing icon URLs...')
  fixedBlocks = fixedBlocks.map((block, idx) => {
    if (block._type === 'featureList' && block.features) {
      const hasIconIssues = block.features.some((f: any) => f.icon?.metadata?.url)
      
      if (hasIconIssues) {
        console.log(`   📋 Fixing icons in featureList at index ${idx}`)
        
        const fixedFeatures = block.features.map((feature: any) => {
          if (feature.icon?.metadata?.url) {
            // Remove the URL, keep only essential icon data
            return {
              ...feature,
              icon: {
                _type: 'icon.manager',
                icon: feature.icon.icon || feature.icon.metadata?.icon,
                metadata: {
                  icon: feature.icon.icon || feature.icon.metadata?.icon,
                  iconName: feature.icon.metadata?.iconName,
                  collectionId: feature.icon.metadata?.collectionId || 'lucide',
                  collectionName: feature.icon.metadata?.collectionName || 'Lucide'
                  // URL removed!
                }
              }
            }
          }
          return feature
        })
        
        changesMade.push(`Fixed icon URLs in featureList "${block.title}"`)
        return { ...block, features: fixedFeatures }
      }
    }
    return block
  })
  
  // 3. Ensure all blocks have unique keys
  console.log('\n🔧 FIX 3: Ensuring unique keys...')
  const usedKeys = new Set<string>()
  fixedBlocks = fixedBlocks.map((block, idx) => {
    if (!block._key || usedKeys.has(block._key)) {
      const newKey = `block-${idx}-${Math.random().toString(36).substring(7)}`
      console.log(`   🔑 Generated new key for block ${idx}: ${newKey}`)
      changesMade.push(`Generated new key for block ${idx}`)
      usedKeys.add(newKey)
      return { ...block, _key: newKey }
    }
    usedKeys.add(block._key)
    return block
  })
  
  // 4. Add missing required fields for new components
  console.log('\n🔧 FIX 4: Validating new component structures...')
  fixedBlocks = fixedBlocks.map((block, idx) => {
    // Fix dailyPriceTimeline timeSlots
    if (block._type === 'dailyPriceTimeline' && block.timeSlots) {
      const fixedTimeSlots = block.timeSlots.map((slot: any, slotIdx: number) => {
        if (!slot._type) {
          console.log(`   ⚡ Fixed timeSlot type at block ${idx}, slot ${slotIdx}`)
          return { ...slot, _type: 'timeSlot' }
        }
        return slot
      })
      return { ...block, timeSlots: fixedTimeSlots }
    }
    
    // Fix infoCardsSection cards
    if (block._type === 'infoCardsSection' && block.cards) {
      const fixedCards = block.cards.map((card: any, cardIdx: number) => {
        if (!card._type) {
          console.log(`   ⚡ Fixed card type at block ${idx}, card ${cardIdx}`)
          return { ...card, _type: 'infoCard' }
        }
        return card
      })
      return { ...block, cards: fixedCards }
    }
    
    return block
  })
  
  // 5. Save the fixed content
  if (changesMade.length > 0) {
    console.log('\n💾 Saving fixes to Sanity...')
    
    try {
      await client
        .patch(pageId)
        .set({ contentBlocks: fixedBlocks })
        .commit()
      
      console.log('\n✅ Successfully fixed all issues!')
      console.log('\n📝 Changes made:')
      changesMade.forEach(change => console.log(`   - ${change}`))
      
      console.log(`\n📊 Final block count: ${fixedBlocks.length}`)
      
      // Count component types
      const typeCounts: Record<string, number> = {}
      fixedBlocks.forEach(block => {
        typeCounts[block._type] = (typeCounts[block._type] || 0) + 1
      })
      
      console.log('\n📦 Component distribution:')
      Object.entries(typeCounts).sort().forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}`)
      })
      
    } catch (error) {
      console.error('\n❌ Error saving fixes:', error)
    }
  } else {
    console.log('\n✅ No fixes needed - page is already clean!')
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('🎯 Next step: Check the browser console for any remaining issues')
}

fixAllPageIssues().catch(console.error)