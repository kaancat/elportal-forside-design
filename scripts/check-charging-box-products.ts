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

async function checkChargingBoxProducts() {
  try {
    console.log('🔍 Checking available charging box products...\n')
    
    const products = await client.fetch(`*[_type == "chargingBoxProduct"] {
      _id,
      name,
      category,
      power,
      price,
      features,
      description,
      "imageExists": defined(image)
    }`)
    
    if (!products || products.length === 0) {
      console.log('❌ No charging box products found in the system')
      console.log('\n💡 To add products:')
      console.log('1. Go to Sanity Studio')
      console.log('2. Create new "Ladeboks Produkt" documents')
      console.log('3. Add product details (name, price, features, etc.)')
      console.log('4. Then reference them in the showcase component')
      return
    }
    
    console.log(`✅ Found ${products.length} charging box products:\n`)
    
    products.forEach((product: any, index: number) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   - ID: ${product._id}`)
      console.log(`   - Category: ${product.category || 'Not specified'}`)
      console.log(`   - Power: ${product.power || 'Not specified'}`)
      console.log(`   - Price: ${product.price ? `${product.price} kr` : 'Not specified'}`)
      console.log(`   - Features: ${product.features?.length || 0} features`)
      console.log(`   - Has image: ${product.imageExists ? '✅' : '❌'}`)
      console.log()
    })
    
    // Create update script to add products to showcase
    if (products.length > 0) {
      console.log('📝 To add these products to the showcase, use this script:\n')
      console.log('```javascript')
      console.log(`const productRefs = [`)
      products.slice(0, 3).forEach((product: any) => {
        console.log(`  { _type: 'reference', _ref: '${product._id}', _key: '${generateKey()}' },`)
      })
      console.log(`]`)
      console.log('```')
    }
    
  } catch (error) {
    console.error('❌ Error checking products:', error)
  }
}

function generateKey() {
  return `key_${Math.random().toString(36).substr(2, 9)}`
}

checkChargingBoxProducts()