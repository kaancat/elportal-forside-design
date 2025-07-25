import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function listAllPages() {
  try {
    console.log('Listing all pages in Sanity...')
    
    const pages = await client.fetch(`
      *[_type == "page"] {
        _id,
        title,
        "slug": slug.current,
        _createdAt,
        _updatedAt
      } | order(_createdAt desc)
    `)
    
    console.log(`\nFound ${pages.length} pages:`)
    pages.forEach(page => {
      console.log(`\n- ${page.title}`)
      console.log(`  ID: ${page._id}`)
      console.log(`  Slug: ${page.slug}`)
      console.log(`  Created: ${new Date(page._createdAt).toLocaleString()}`)
    })

  } catch (error) {
    console.error('Error listing pages:', error)
  }
}

// Run the check
listAllPages()