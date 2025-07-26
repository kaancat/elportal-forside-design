import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fixOgImage() {
  try {
    // Fetch the elselskaber page
    const query = `*[_type == "page" && slug.current == "elselskaber"][0]`
    const page = await client.fetch(query)
    
    if (!page) {
      console.error('Elselskaber page not found')
      return
    }

    console.log('Current page ID:', page._id)
    console.log('Current ogImage value:', page.ogImage)
    
    // Unset the ogImage field if it's null
    const result = await client
      .patch(page._id)
      .unset(['ogImage'])
      .commit()

    console.log('Successfully removed null ogImage field:', result._id)
    console.log('The page will now use the default OpenGraph image settings')
    
  } catch (error) {
    console.error('Error fixing ogImage:', error)
  }
}

// Run the fix
console.log('Fixing ogImage field on elselskaber page...')
fixOgImage()