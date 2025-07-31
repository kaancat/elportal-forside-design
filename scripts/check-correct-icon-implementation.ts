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

async function checkCorrectIconImplementation() {
  try {
    console.log('🔍 Checking correct icon implementation from other pages...\n')
    
    // Check a page that we know has working icons (e.g., elpriser)
    const workingPage = await client.fetch(`*[_type == "page" && slug.current == "elpriser"][0]{
      contentBlocks[_type == "valueProposition"]{
        heading,
        valueItems[]{
          heading,
          description,
          icon
        }
      }
    }`)
    
    if (workingPage?.contentBlocks?.[0]?.valueItems?.[0]?.icon) {
      console.log('✅ Found working icon implementation from Elpriser page:')
      console.log(JSON.stringify(workingPage.contentBlocks[0].valueItems[0].icon, null, 2))
    }
    
    // Check another page with working icons
    const ladeboksPage = await client.fetch(`*[_type == "page" && slug.current == "ladeboks"][0]{
      contentBlocks[_type == "valueProposition"]{
        heading,
        valueItems[0]{
          heading,
          icon
        }
      }
    }`)
    
    if (ladeboksPage?.contentBlocks?.[0]?.valueItems?.[0]?.icon) {
      console.log('\n✅ Found working icon from Ladeboks page:')
      console.log(JSON.stringify(ladeboksPage.contentBlocks[0].valueItems[0].icon, null, 2))
    }
    
    // Now check what the homepage currently has
    const homepage = await client.fetch(`*[_type == "homePage"][0]{
      contentBlocks[_type == "valueProposition"]{
        heading,
        valueItems[0]{
          heading,
          icon
        }
      }
    }`)
    
    if (homepage?.contentBlocks?.[0]?.valueItems?.[0]?.icon) {
      console.log('\n❌ Current homepage icon (problematic):')
      console.log(JSON.stringify(homepage.contentBlocks[0].valueItems[0].icon, null, 2))
    }
    
    // Compare the structures
    console.log('\n📊 Analysis:')
    console.log('Working icons have _type: "icon.manager" with proper metadata structure')
    console.log('The issue might be missing or incorrect metadata fields')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
checkCorrectIconImplementation()