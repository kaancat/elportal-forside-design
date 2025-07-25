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

async function copyProductData() {
  try {
    console.log('🔄 Copying product data from dot IDs to dash IDs...\n')
    
    // Get all product data from dot versions
    const dotProducts = await client.fetch(`*[_type == "chargingBoxProduct" && _id in ["chargingBoxProduct.easee-up", "chargingBoxProduct.zaptec-go", "chargingBoxProduct.defa-power"]] {
      _id,
      name,
      description,
      originalPrice,
      currentPrice,
      badge,
      features,
      productImage,
      ctaLink,
      ctaText
    }`)
    
    console.log(`Found ${dotProducts.length} products with dot IDs to copy from`)
    
    // Copy data to dash versions
    for (const dotProduct of dotProducts) {
      const dashId = dotProduct._id.replace('.', '-')
      console.log(`\nCopying ${dotProduct.name} from ${dotProduct._id} to ${dashId}...`)
      
      // Get existing dash product to preserve any unique data
      const existingDash = await client.getDocument(dashId)
      
      // Merge data, preferring dot product data for fields that have values
      const updatedProduct = {
        _id: dashId,
        _type: 'chargingBoxProduct',
        name: dotProduct.name,
        description: dotProduct.description || existingDash?.description,
        originalPrice: dotProduct.originalPrice || existingDash?.originalPrice,
        currentPrice: dotProduct.currentPrice || existingDash?.currentPrice,
        badge: dotProduct.badge || existingDash?.badge,
        features: dotProduct.features || existingDash?.features,
        productImage: dotProduct.productImage, // Always use dot version's image
        ctaLink: dotProduct.ctaLink || existingDash?.ctaLink,
        ctaText: dotProduct.ctaText || existingDash?.ctaText
      }
      
      const result = await client.createOrReplace(updatedProduct)
      console.log(`✅ Updated ${result.name}`)
    }
    
    console.log('\n✅ Successfully copied all product data!')
    
    // Verify the update
    console.log('\n🔍 Verifying updated products...')
    const updatedProducts = await client.fetch(`*[_type == "chargingBoxProduct" && _id in ["chargingBoxProduct-easee-up", "chargingBoxProduct-zaptec-go", "chargingBoxProduct-defa-power"]] {
      _id,
      name,
      currentPrice,
      "hasImage": defined(productImage.asset)
    }`)
    
    updatedProducts.forEach((product: any) => {
      console.log(`${product.name}: ${product.currentPrice} kr - Image: ${product.hasImage ? '✅' : '❌'}`)
    })
    
    // Optional: Delete the dot versions to avoid confusion
    console.log('\n⚠️ Duplicate products with dot IDs still exist.')
    console.log('Run the following command to delete them if desired:')
    console.log('npm run delete-dot-products')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

copyProductData()