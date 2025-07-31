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

async function fixDraftHomepageChart() {
  try {
    console.log('🔧 Fixing Monthly Production Chart in draft homepage...\n')
    
    const docId = 'drafts.084518ec-2f79-48e0-b23c-add29ee83e6d'
    
    // Fetch the draft homepage
    const homepage = await client.fetch(`*[_id == "${docId}"][0]`)
    
    if (!homepage) {
      console.error('Draft homepage not found')
      return
    }
    
    console.log('📄 Processing draft homepage content blocks...\n')
    
    const newContentBlocks: any[] = []
    let chartFixed = false
    
    // Process each content block
    homepage.contentBlocks.forEach((block: any, index: number) => {
      if (block._type === 'pageSection' && block.title === 'Elproduktion i Danmark' && block.content) {
        // Find and remove the chart from content
        const chartItem = block.content.find((item: any) => item._type === 'monthlyProductionChart')
        
        if (chartItem) {
          console.log(`Found Monthly Production Chart in section: "${block.title}"`)
          console.log(`  Chart title: "${chartItem.title}"`)
          console.log(`  leadingText type: ${Array.isArray(chartItem.leadingText) ? 'Array' : typeof chartItem.leadingText}`)
          
          // Remove chart from content array
          const updatedContent = block.content.filter((item: any) => item._type !== 'monthlyProductionChart')
          
          // Add updated section without the chart
          newContentBlocks.push({
            ...block,
            content: updatedContent
          })
          
          // Add chart as top-level block with string leadingText
          const fixedChart = {
            ...chartItem,
            _key: chartItem._key || generateKey(),
            leadingText: '' // Convert array to empty string
          }
          
          newContentBlocks.push(fixedChart)
          chartFixed = true
          
          console.log('  ✅ Moved chart to top-level and converted leadingText to string')
        } else {
          newContentBlocks.push(block)
        }
      } else {
        newContentBlocks.push(block)
      }
    })
    
    if (chartFixed) {
      console.log('\n📝 Updating draft homepage...')
      
      const result = await client.patch(docId)
        .set({ contentBlocks: newContentBlocks })
        .commit()
      
      console.log('\n✅ Successfully fixed Monthly Production Chart!')
      console.log('   - Moved out of pageSection content to top-level')
      console.log('   - Converted leadingText from Array to String')
    } else {
      console.log('\n✅ No Monthly Production Chart found to fix')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
fixDraftHomepageChart()