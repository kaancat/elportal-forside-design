import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function removeOpengraphField() {
  console.log('🔧 Removing opengraph field from elpriser page...')

  // Fetch the page
  const page = await client.fetch(`*[_type == 'page' && slug.current == 'elpriser'][0]{ _id, opengraph }`)
  
  if (!page) {
    console.error('❌ Could not find elpriser page')
    return
  }

  console.log(`✅ Found page with ID: ${page._id}`)
  console.log(`📋 Current opengraph value: ${JSON.stringify(page.opengraph)}`)

  if (page.opengraph === null || page.opengraph !== undefined) {
    try {
      // Unset the opengraph field completely
      await client
        .patch(page._id)
        .unset(['opengraph'])
        .commit()

      console.log('✅ Successfully removed opengraph field!')
      
    } catch (error) {
      console.error('❌ Error updating page:', error)
    }
  } else {
    console.log('ℹ️  Opengraph field is already removed or undefined')
  }
}

// Run the fix
removeOpengraphField()