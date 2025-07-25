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

async function checkProductImages() {
  try {
    console.log('🔍 Checking product images...\n')
    
    // Get products with full details
    const products = await client.fetch(`*[_type == "chargingBoxProduct" && _id in ["chargingBoxProduct-easee-up", "chargingBoxProduct-zaptec-go", "chargingBoxProduct-defa-power"]] {
      _id,
      name,
      productImage {
        _type,
        asset->{
          _id,
          url
        }
      }
    }`)
    
    console.log('Product image status:')
    products.forEach((product: any) => {
      console.log(`\n${product.name}:`)
      if (product.productImage?.asset) {
        console.log(`   ✅ Has image: ${product.productImage.asset.url}`)
      } else if (product.productImage) {
        console.log(`   ⚠️ Image reference exists but asset not resolved`)
        console.log(`   Raw data:`, JSON.stringify(product.productImage, null, 2))
      } else {
        console.log(`   ❌ No image`)
      }
    })
    
    // Check if there are duplicate products with images
    console.log('\n\nChecking duplicate products with dots in IDs...')
    const dotProducts = await client.fetch(`*[_type == "chargingBoxProduct" && _id in ["chargingBoxProduct.easee-up", "chargingBoxProduct.zaptec-go", "chargingBoxProduct.defa-power"]] {
      _id,
      name,
      productImage {
        _type,
        asset->{
          _id,
          url
        }
      }
    }`)
    
    dotProducts.forEach((product: any) => {
      console.log(`\n${product.name} (${product._id}):`)
      if (product.productImage?.asset) {
        console.log(`   ✅ Has image: ${product.productImage.asset.url}`)
      } else {
        console.log(`   ❌ No image`)
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkProductImages()