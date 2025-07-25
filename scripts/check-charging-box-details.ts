import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config({ path: resolve(process.cwd(), '.env') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2025-01-01'
})

async function checkChargingBoxDetails() {
  console.log('🔍 Fetching detailed information about charging box products...\n')
  
  // Get all charging box products with full details
  const products = await client.fetch(`
    *[_type == "chargingBoxProduct"] {
      _id,
      _type,
      title,
      brand,
      model,
      price,
      monthlyPrice,
      powerRating,
      chargingSpeed,
      features,
      description,
      "hasImage": defined(image),
      image {
        asset-> {
          _id,
          url
        }
      },
      specifications,
      pros,
      cons,
      bestFor
    } | order(_id asc)
  `)
  
  console.log(`Found ${products.length} charging box products:\n`)
  
  for (const product of products) {
    console.log(`📦 Product: ${product._id}`)
    console.log(`   Title: ${product.title || 'NOT SET'}`)
    console.log(`   Brand: ${product.brand || 'NOT SET'}`)
    console.log(`   Model: ${product.model || 'NOT SET'}`)
    console.log(`   Price: ${product.price || 'NOT SET'}`)
    console.log(`   Monthly Price: ${product.monthlyPrice || 'NOT SET'}`)
    console.log(`   Power Rating: ${product.powerRating || 'NOT SET'}`)
    console.log(`   Charging Speed: ${product.chargingSpeed || 'NOT SET'}`)
    console.log(`   Features: ${product.features?.length || 0} items`)
    console.log(`   Has Image: ${product.hasImage}`)
    console.log(`   Has Description: ${!!product.description}`)
    console.log(`   Has Specifications: ${!!product.specifications}`)
    console.log(`   Has Pros: ${product.pros?.length > 0}`)
    console.log(`   Has Cons: ${product.cons?.length > 0}`)
    console.log(`   Has BestFor: ${!!product.bestFor}`)
    console.log('')
  }
  
  // Check for pages that reference charging box products
  console.log('\n🔍 Checking pages that reference charging box products...\n')
  
  const pagesWithChargingBoxes = await client.fetch(`
    *[_type == "page" && defined(contentBlocks)] {
      _id,
      title,
      slug,
      "hasChargingBoxComparison": count(contentBlocks[_type == "chargingBoxComparison"]) > 0,
      "chargingBoxBlocks": contentBlocks[_type == "chargingBoxComparison"] {
        _type,
        title,
        subtitle,
        "productCount": count(products),
        "productRefs": products[]._ref
      }
    }[hasChargingBoxComparison == true]
  `)
  
  if (pagesWithChargingBoxes.length > 0) {
    console.log(`Found ${pagesWithChargingBoxes.length} page(s) with charging box comparison blocks:\n`)
    
    for (const page of pagesWithChargingBoxes) {
      console.log(`📄 Page: ${page.title} (${page.slug.current})`)
      console.log(`   ID: ${page._id}`)
      
      for (const block of page.chargingBoxBlocks) {
        console.log(`   - Comparison Block:`)
        console.log(`     Title: ${block.title || 'NOT SET'}`)
        console.log(`     Product Count: ${block.productCount}`)
        console.log(`     Product Refs: ${JSON.stringify(block.productRefs)}`)
      }
      console.log('')
    }
  } else {
    console.log('No pages found with charging box comparison blocks.')
  }
  
  // Check if any products need fixing
  console.log('\n📊 Summary:\n')
  
  const incompleteProducts = products.filter(p => 
    !p.title || !p.price || !p.brand || !p.model
  )
  
  if (incompleteProducts.length > 0) {
    console.log(`⚠️  ${incompleteProducts.length} products have missing required fields:`)
    incompleteProducts.forEach(p => {
      console.log(`   - ${p._id}: Missing ${[
        !p.title && 'title',
        !p.price && 'price',
        !p.brand && 'brand',
        !p.model && 'model'
      ].filter(Boolean).join(', ')}`)
    })
  } else {
    console.log('✅ All products have required fields set.')
  }
  
  // Suggest correct IDs for references
  console.log('\n💡 Correct product IDs for references:')
  products.forEach(p => {
    console.log(`   - ${p._id}`)
  })
}

checkChargingBoxDetails().catch(console.error)