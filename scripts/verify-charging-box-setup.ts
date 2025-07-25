import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })
dotenv.config({ path: resolve(process.cwd(), '.env') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: true, // Use CDN for public read access
  apiVersion: '2025-01-01'
  // No token needed for public read operations
})

interface VerificationResult {
  success: boolean
  message: string
  details?: any
}

async function verifyChargingBoxProducts(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = []
  
  // Expected charging box product IDs
  const expectedProducts = [
    'chargingBoxProduct.defa-power',
    'chargingBoxProduct.easee-up',
    'chargingBoxProduct.zaptec-go'
  ]
  
  console.log('🔍 Verifying charging box products...\n')
  
  // 1. Check if charging box products exist
  for (const productId of expectedProducts) {
    try {
      const product = await client.getDocument(productId)
      
      if (product) {
        results.push({
          success: true,
          message: `✅ Product ${productId} exists`,
          details: {
            title: product.title,
            price: product.price,
            features: product.features?.length || 0,
            hasImage: !!product.image
          }
        })
      } else {
        results.push({
          success: false,
          message: `❌ Product ${productId} not found`
        })
      }
    } catch (error) {
      results.push({
        success: false,
        message: `❌ Error fetching ${productId}: ${error.message}`
      })
    }
  }
  
  // 2. Check Ladeboks page
  console.log('\n🔍 Verifying Ladeboks page...\n')
  
  try {
    const ladeboksPage = await client.getDocument('page.ladeboks')
    
    if (ladeboksPage) {
      results.push({
        success: true,
        message: '✅ Ladeboks page exists',
        details: {
          title: ladeboksPage.title,
          contentBlocks: ladeboksPage.contentBlocks?.length || 0
        }
      })
      
      // Check if page contains chargingBoxComparison block
      const hasComparisonBlock = ladeboksPage.contentBlocks?.some(
        block => block._type === 'chargingBoxComparison'
      )
      
      if (hasComparisonBlock) {
        results.push({
          success: true,
          message: '✅ Ladeboks page contains chargingBoxComparison block'
        })
        
        // Get the comparison block details
        const comparisonBlock = ladeboksPage.contentBlocks.find(
          block => block._type === 'chargingBoxComparison'
        )
        
        // Check if products are referenced
        const referencedProducts = comparisonBlock?.products?.map(ref => ref._ref) || []
        
        for (const expectedId of expectedProducts) {
          if (referencedProducts.includes(expectedId)) {
            results.push({
              success: true,
              message: `✅ Product ${expectedId} is referenced in comparison block`
            })
          } else {
            results.push({
              success: false,
              message: `❌ Product ${expectedId} is NOT referenced in comparison block`
            })
          }
        }
      } else {
        results.push({
          success: false,
          message: '❌ Ladeboks page does not contain chargingBoxComparison block'
        })
      }
    } else {
      results.push({
        success: false,
        message: '❌ Ladeboks page not found'
      })
    }
  } catch (error) {
    results.push({
      success: false,
      message: `❌ Error fetching Ladeboks page: ${error.message}`
    })
  }
  
  // 3. Check for any charging box products in the system
  console.log('\n🔍 Checking all charging box products in the system...\n')
  
  try {
    const allChargingBoxProducts = await client.fetch(`
      *[_type == "chargingBoxProduct"] {
        _id,
        title,
        price,
        "hasImage": defined(image),
        "featuresCount": count(features)
      }
    `)
    
    if (allChargingBoxProducts.length > 0) {
      results.push({
        success: true,
        message: `✅ Found ${allChargingBoxProducts.length} charging box products in total`,
        details: allChargingBoxProducts
      })
    } else {
      results.push({
        success: false,
        message: '❌ No charging box products found in the system'
      })
    }
  } catch (error) {
    results.push({
      success: false,
      message: `❌ Error querying charging box products: ${error.message}`
    })
  }
  
  // 4. Validate schema references
  console.log('\n🔍 Validating schema references...\n')
  
  try {
    // Check if chargingBoxComparison blocks have valid product references
    const comparisonBlocks = await client.fetch(`
      *[_type == "page" && defined(contentBlocks)] {
        "comparisonBlocks": contentBlocks[_type == "chargingBoxComparison"] {
          _type,
          "productRefs": products[]._ref,
          "resolvedProducts": products[]-> {
            _id,
            title
          }
        }
      }[defined(comparisonBlocks) && count(comparisonBlocks) > 0]
    `)
    
    if (comparisonBlocks.length > 0) {
      for (const page of comparisonBlocks) {
        for (const block of page.comparisonBlocks) {
          if (block.resolvedProducts && block.resolvedProducts.length > 0) {
            results.push({
              success: true,
              message: '✅ ChargingBoxComparison block has valid product references',
              details: block.resolvedProducts
            })
          } else {
            results.push({
              success: false,
              message: '❌ ChargingBoxComparison block has invalid or missing product references',
              details: block.productRefs
            })
          }
        }
      }
    }
  } catch (error) {
    results.push({
      success: false,
      message: `❌ Error validating references: ${error.message}`
    })
  }
  
  return results
}

async function main() {
  console.log('🚀 Starting charging box setup verification...\n')
  console.log('📌 Using public API access (read-only)\n')
  
  const results = await verifyChargingBoxProducts()
  
  // Summary
  console.log('\n📊 Verification Summary:\n')
  
  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length
  
  // Print all results
  for (const result of results) {
    console.log(result.message)
    if (result.details) {
      console.log('  Details:', JSON.stringify(result.details, null, 2))
    }
  }
  
  console.log(`\n✅ Successful checks: ${successCount}`)
  console.log(`❌ Failed checks: ${failureCount}`)
  
  if (failureCount > 0) {
    console.log('\n⚠️  Some checks failed. Please review the errors above.')
    process.exit(1)
  } else {
    console.log('\n🎉 All checks passed! Charging box setup is valid.')
  }
}

main().catch(console.error)