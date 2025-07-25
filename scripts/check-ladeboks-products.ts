import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  // No token needed for reading public data
})

async function checkProducts() {
  try {
    console.log('Checking existing charging box products...')
    
    const products = await client.fetch(`
      *[_type == "chargingBoxProduct"] {
        _id,
        name,
        currentPrice,
        badge,
        features,
        ctaLink
      }
    `)
    
    if (products.length === 0) {
      console.log('No charging box products found')
    } else {
      console.log(`Found ${products.length} charging box products:`)
      products.forEach(product => {
        console.log(`\n- ${product.name} (${product._id})`)
        console.log(`  Price: ${product.currentPrice} kr`)
        if (product.badge) console.log(`  Badge: ${product.badge}`)
        console.log(`  Features: ${product.features?.length || 0} features`)
        console.log(`  Link: ${product.ctaLink}`)
      })
    }

    // Check if the page exists
    console.log('\n\nChecking for Ladeboks page...')
    const page = await client.fetch(`
      *[_id == "page.ladeboks"][0] {
        _id,
        title,
        "slug": slug.current,
        seoMetaTitle,
        "contentBlocksCount": count(contentBlocks)
      }
    `)
    
    if (page) {
      console.log('Ladeboks page found:')
      console.log(`- ID: ${page._id}`)
      console.log(`- Title: ${page.title}`)
      console.log(`- SEO Title: ${page.seoMetaTitle}`)
      console.log(`- Content blocks: ${page.contentBlocksCount}`)
      console.log(`\nView in Sanity Studio: https://dinelportal.sanity.studio/structure/page;${page._id}`)
    } else {
      console.log('Ladeboks page not found')
    }

  } catch (error) {
    console.error('Error checking products:', error)
  }
}

// Run the check
checkProducts()