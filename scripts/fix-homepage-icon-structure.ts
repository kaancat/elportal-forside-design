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

function generateKey(): string {
  return `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

async function fixHomepageIconStructure() {
  try {
    console.log('🔧 Fixing homepage value proposition icons...\n')
    
    // Define properly structured icons
    const properIcons = {
      piggyBank: {
        _type: 'icon.manager',
        name: 'piggy-bank',
        provider: 'lucide',
        metadata: {
          fill: 'none',
          height: 24,
          stroke: 'currentColor',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          version: '0.412.0',
          viewBox: '0 0 24 24',
          width: 24
        },
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h0"/></svg>'
      },
      eye: {
        _type: 'icon.manager',
        name: 'eye',
        provider: 'lucide',
        metadata: {
          fill: 'none',
          height: 24,
          stroke: 'currentColor',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          version: '0.412.0',
          viewBox: '0 0 24 24',
          width: 24
        },
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'
      },
      wind: {
        _type: 'icon.manager',
        name: 'wind',
        provider: 'lucide',
        metadata: {
          fill: 'none',
          height: 24,
          stroke: 'currentColor',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          version: '0.412.0',
          viewBox: '0 0 24 24',
          width: 24
        },
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>'
      },
      zap: {
        _type: 'icon.manager',
        name: 'zap',
        provider: 'lucide',
        metadata: {
          fill: 'none',
          height: 24,
          stroke: 'currentColor',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          version: '0.412.0',
          viewBox: '0 0 24 24',
          width: 24
        },
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 2-2 9h5l-2 9"/></svg>'
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
        console.log('Found value proposition box, fixing icons...')
        
        const updatedValueItems = block.valueItems.map((item: any, index: number) => {
          fixedCount++
          let iconToUse = properIcons.piggyBank // default
          
          // Match icon based on content
          if (item.heading?.toLowerCase().includes('spar')) {
            iconToUse = properIcons.piggyBank
          } else if (item.heading?.toLowerCase().includes('gennemsigtig') || item.heading?.toLowerCase().includes('pris')) {
            iconToUse = properIcons.eye
          } else if (item.heading?.toLowerCase().includes('grøn') || item.heading?.toLowerCase().includes('vind')) {
            iconToUse = properIcons.wind
          } else if (item.heading?.toLowerCase().includes('skift') || item.heading?.toLowerCase().includes('nemt')) {
            iconToUse = properIcons.zap
          }
          
          console.log(`   Fixing icon ${index + 1}: ${item.heading} -> ${iconToUse.name}`)
          
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
      
      console.log(`\n✅ Successfully fixed ${fixedCount} icons!`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
fixHomepageIconStructure()