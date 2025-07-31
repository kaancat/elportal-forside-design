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

async function verifyIconFix() {
  try {
    const icon = await client.fetch(`*[_type == "homePage"][0].contentBlocks[_type == "valueProposition"][0].valueItems[0].icon`)
    
    console.log('=== FIXED HOMEPAGE ICON STRUCTURE ===')
    console.log(JSON.stringify(icon, null, 2))
    
    console.log('\n=== VERIFICATION ===')
    console.log('Has nested size object:', Boolean(icon?.metadata?.size))
    console.log('Width in size object:', icon?.metadata?.size?.width)
    console.log('Height in size object:', icon?.metadata?.size?.height)
    console.log('Correct icon format:', icon?.icon)
    console.log('Icon type:', icon?._type)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

verifyIconFix()