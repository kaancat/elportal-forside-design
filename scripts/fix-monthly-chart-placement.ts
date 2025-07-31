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

async function fixMonthlyChartPlacement() {
  try {
    console.log('🔧 Fixing Monthly Production Chart placement...\n')
    
    // Fetch the homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    console.log('📄 Processing homepage content blocks...\n')
    
    const newContentBlocks: any[] = []
    let chartsMoved = 0
    
    // Process each content block
    homepage.contentBlocks.forEach((block: any, index: number) => {
      if (block._type === 'pageSection' && block.content) {
        // Check if this section contains a monthly production chart
        const hasChart = block.content.some((item: any) => item._type === 'monthlyProductionChart')
        
        if (hasChart) {
          console.log(`Found Monthly Production Chart in section: "${block.title}"`)
          
          // Extract text content and chart
          const textContent = block.content.filter((item: any) => item._type !== 'monthlyProductionChart')
          const chartContent = block.content.filter((item: any) => item._type === 'monthlyProductionChart')
          
          // Create updated page section with only text content
          const updatedSection = {
            ...block,
            content: textContent
          }
          
          // Add the updated section
          newContentBlocks.push(updatedSection)
          
          // Add each chart as a top-level block
          chartContent.forEach((chart: any) => {
            chartsMoved++
            const topLevelChart = {
              ...chart,
              _key: chart._key || generateKey()
            }
            newContentBlocks.push(topLevelChart)
            console.log(`  ✅ Moved chart "${chart.title}" to top-level`)
          })
        } else {
          // Keep the block as is
          newContentBlocks.push(block)
        }
      } else {
        // Keep non-pageSection blocks as is
        newContentBlocks.push(block)
      }
    })
    
    if (chartsMoved > 0) {
      console.log(`\n📝 Updating homepage with ${chartsMoved} chart(s) moved to top-level...`)
      
      const result = await client.patch(homepage._id)
        .set({ contentBlocks: newContentBlocks })
        .commit()
      
      console.log('\n✅ Successfully moved Monthly Production Charts out of pageSection content!')
    } else {
      console.log('\n✅ No Monthly Production Charts found inside pageSection content.')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
fixMonthlyChartPlacement()