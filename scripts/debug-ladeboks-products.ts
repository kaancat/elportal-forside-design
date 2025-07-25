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

async function debugLadeboksProducts() {
  try {
    console.log('🔍 Debugging Ladeboks page products...\n')
    
    // First, check if charging box products exist
    const products = await client.fetch(`*[_type == "chargingBoxProduct"]{ _id, name }`)
    console.log('Available products:', products)
    
    // Get the page with the showcase
    const page = await client.fetch(`*[_id == "Ldbn1aqxfi6rpqe9dn"][0]{
      contentBlocks[_type == "chargingBoxShowcase"]{
        _type,
        _key,
        heading,
        products
      }
    }`)
    
    console.log('\nPage showcase data:', JSON.stringify(page, null, 2))
    
    // Get the page with expanded product references
    const pageWithProducts = await client.fetch(`*[_id == "Ldbn1aqxfi6rpqe9dn"][0]{
      contentBlocks[_type == "chargingBoxShowcase"]{
        _type,
        _key,
        heading,
        products[]->{
          _id,
          name,
          badge,
          currentPrice,
          originalPrice,
          features,
          productImage,
          ctaLink,
          ctaText
        }
      }
    }`)
    
    console.log('\nPage with expanded products:', JSON.stringify(pageWithProducts, null, 2))
    
    // Check specific showcase block
    const showcaseBlock = await client.fetch(`*[_id == "Ldbn1aqxfi6rpqe9dn"][0].contentBlocks[_type == "chargingBoxShowcase"][0]`)
    console.log('\nShowcase block raw:', JSON.stringify(showcaseBlock, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugLadeboksProducts()