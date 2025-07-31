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

async function fixIconStructureCorrect() {
  try {
    console.log('🔧 Fixing homepage value proposition icon structures...\n')
    
    // Define properly structured icons matching the working format
    const correctIcons = {
      piggyBank: {
        _type: 'icon.manager',
        icon: 'lucide:piggy-bank',
        metadata: {
          collectionId: 'lucide',
          collectionName: 'Lucide',
          icon: 'piggy-bank',
          iconName: 'Piggy Bank',
          inlineSvg: null,
          size: {
            height: 24,
            width: 24
          },
          url: 'https://api.iconify.design/lucide:piggy-bank.svg?color=%2384db41'
        }
      },
      eye: {
        _type: 'icon.manager',
        icon: 'lucide:eye',
        metadata: {
          collectionId: 'lucide',
          collectionName: 'Lucide',
          icon: 'eye',
          iconName: 'Eye',
          inlineSvg: null,
          size: {
            height: 24,
            width: 24
          },
          url: 'https://api.iconify.design/lucide:eye.svg?color=%2384db41'
        }
      },
      wind: {
        _type: 'icon.manager',
        icon: 'lucide:wind',
        metadata: {
          collectionId: 'lucide',
          collectionName: 'Lucide',
          icon: 'wind',
          iconName: 'Wind',
          inlineSvg: null,
          size: {
            height: 24,
            width: 24
          },
          url: 'https://api.iconify.design/lucide:wind.svg?color=%2384db41'
        }
      },
      zap: {
        _type: 'icon.manager',
        icon: 'lucide:zap',
        metadata: {
          collectionId: 'lucide',
          collectionName: 'Lucide',
          icon: 'zap',
          iconName: 'Zap',
          inlineSvg: null,
          size: {
            height: 24,
            width: 24
          },
          url: 'https://api.iconify.design/lucide:zap.svg?color=%2384db41'
        }
      }
    }
    
    // Fetch homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    let fixedCount = 0
    
    // Update content blocks
    const updatedContentBlocks = homepage.contentBlocks.map((block: any) => {
      if (block._type === 'valueProposition' && block.valueItems) {
        console.log('Found value proposition box, fixing icon structures...')
        
        const updatedValueItems = block.valueItems.map((item: any, index: number) => {
          fixedCount++
          let iconToUse = correctIcons.piggyBank // default
          
          // Match icon based on content
          if (item.heading?.toLowerCase().includes('spar')) {
            iconToUse = correctIcons.piggyBank
          } else if (item.heading?.toLowerCase().includes('gennemsigtig') || item.heading?.toLowerCase().includes('pris')) {
            iconToUse = correctIcons.eye
          } else if (item.heading?.toLowerCase().includes('grøn') || item.heading?.toLowerCase().includes('vind')) {
            iconToUse = correctIcons.wind
          } else if (item.heading?.toLowerCase().includes('skift') || item.heading?.toLowerCase().includes('nemt')) {
            iconToUse = correctIcons.zap
          }
          
          console.log(`   Fixing icon ${index + 1}: "${item.heading}" → ${iconToUse.icon}`)
          
          return {
            ...item,
            icon: iconToUse
          }
        })
        
        return {
          ...block,
          valueItems: updatedValueItems
        }
      }
      return block
    })
    
    if (fixedCount > 0) {
      // Update the document
      const result = await client.patch(homepage._id)
        .set({ contentBlocks: updatedContentBlocks })
        .commit()
      
      console.log(`\n✅ Successfully fixed ${fixedCount} icon structures!`)
      console.log('Icons now use the correct format with nested size objects')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
fixIconStructureCorrect()