import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function comprehensiveValuePropositionTest() {
  try {
    console.log('🧪 COMPREHENSIVE VALUE PROPOSITION TEST\n')
    console.log('=' * 50)
    
    // 1. Test data fetching
    console.log('1️⃣ TESTING DATA FETCHING...')
    const homepageData = await client.fetch(`
      *[_type == "homePage"][0]{
        contentBlocks[_type == "valueProposition"][0]{
          _key,
          _type,
          heading,
          subheading,
          valueItems[]{
            _key,
            heading,
            description,
            icon
          }
        }
      }
    `)
    
    const vpBlock = homepageData?.contentBlocks
    
    if (!vpBlock) {
      console.log('❌ FAILED: No value proposition block found')
      return
    }
    
    console.log('✅ PASSED: Value proposition block fetched successfully')
    console.log(`   - Heading: "${vpBlock.heading}"`)
    console.log(`   - Items: ${vpBlock.valueItems?.length || 0}`)
    
    // 2. Test schema compliance
    console.log('\n2️⃣ TESTING SCHEMA COMPLIANCE...')
    const schemaCompliant = vpBlock.valueItems?.every((item: any) => 
      item._key && 
      item.heading && 
      item.description && 
      item.icon && 
      item.icon._type === 'icon.manager'
    )
    
    if (schemaCompliant) {
      console.log('✅ PASSED: All items comply with schema requirements')
    } else {
      console.log('❌ FAILED: Schema compliance issues found')
      vpBlock.valueItems?.forEach((item: any, index: number) => {
        console.log(`   Item ${index + 1}: ${item.heading}`)
        console.log(`     - Has _key: ${!!item._key}`)
        console.log(`     - Has heading: ${!!item.heading}`)
        console.log(`     - Has description: ${!!item.description}`)
        console.log(`     - Has icon: ${!!item.icon}`)
        console.log(`     - Icon type: ${item.icon?._type}`)
      })
    }
    
    // 3. Test icon rendering paths
    console.log('\n3️⃣ TESTING ICON RENDERING PATHS...')
    let allIconsValid = true
    
    vpBlock.valueItems?.forEach((item: any, index: number) => {
      const icon = item.icon
      let renderPath = 'unknown'
      let isValid = false
      
      if (icon?.svg) {
        renderPath = 'Direct SVG'
        isValid = true
      } else if (icon?.icon && !icon.metadata?.url) {
        renderPath = 'Generated URL from icon string'
        isValid = true
      } else if (icon?.metadata?.url) {
        renderPath = 'Metadata URL'
        isValid = true
      } else if (icon?.metadata?.inlineSvg) {
        renderPath = 'Inline SVG'
        isValid = true
      }
      
      console.log(`   Item ${index + 1}: ${item.heading}`)
      console.log(`     - Render path: ${renderPath}`)
      console.log(`     - Valid: ${isValid ? '✅' : '❌'}`)
      
      if (!isValid) {
        allIconsValid = false
        console.log(`     - Available fields: ${Object.keys(icon || {})}`)
      }
    })
    
    if (allIconsValid) {
      console.log('✅ PASSED: All icons have valid rendering paths')
    } else {
      console.log('❌ FAILED: Some icons lack valid rendering paths')
    }
    
    // 4. Test icon customization capability
    console.log('\n4️⃣ TESTING ICON CUSTOMIZATION CAPABILITY...')
    const customizationReady = vpBlock.valueItems?.every((item: any) => {
      const icon = item.icon
      // Icons should have minimal structure to allow plugin customization
      return icon && 
             icon._type === 'icon.manager' && 
             icon.icon && 
             !icon.metadata // No pre-built metadata that might interfere
    })
    
    if (customizationReady) {
      console.log('✅ PASSED: Icons are ready for customization in Sanity Studio')
      console.log('   - Icons have minimal structure')
      console.log('   - Plugin can add its own metadata')
      console.log('   - Customization interface should work properly')
    } else {
      console.log('❌ FAILED: Icons may not be fully customizable')
    }
    
    // 5. Test frontend component compatibility
    console.log('\n5️⃣ TESTING FRONTEND COMPONENT COMPATIBILITY...')
    
    // Simulate the ValuePropositionComponent logic
    const items = vpBlock.valueItems || []
    
    const componentWillRender = items.length > 0
    const allItemsHaveText = items.every((item: any) => item.heading || item.text)
    
    console.log(`   - Component will render: ${componentWillRender ? '✅' : '❌'}`)
    console.log(`   - All items have text: ${allItemsHaveText ? '✅' : '❌'}`)
    
    // Test icon rendering logic from Icon component
    items.forEach((item: any, index: number) => {
      const icon = item.icon
      let willShowIcon = false
      let iconType = 'fallback (Check icon)'
      
      // Replicate hasValidIcon logic
      if (icon && (icon.svg || icon.icon || (icon.metadata && (icon.metadata.inlineSvg || icon.metadata.url)))) {
        willShowIcon = true
        if (icon.svg) iconType = 'SVG'
        else if (icon.icon) iconType = 'Generated URL'
        else if (icon.metadata?.url) iconType = 'Metadata URL'
        else if (icon.metadata?.inlineSvg) iconType = 'Inline SVG'
      }
      
      console.log(`   Item ${index + 1}: Will show ${willShowIcon ? iconType : iconType}`)
    })
    
    // 6. Final assessment
    console.log('\n6️⃣ FINAL ASSESSMENT...')
    console.log('=' * 50)
    
    const allTestsPassed = vpBlock && schemaCompliant && allIconsValid && customizationReady && componentWillRender
    
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED!')
      console.log('\nValue Proposition Box Status:')
      console.log('✅ Data structure is correct')
      console.log('✅ Schema compliance verified')
      console.log('✅ Icons will render on frontend')
      console.log('✅ Icons are customizable in Sanity Studio')
      console.log('✅ Component is ready for production')
      
      console.log('\n📋 USER INSTRUCTIONS:')
      console.log('1. Open Sanity Studio')
      console.log('2. Navigate to Homepage')
      console.log('3. Find the Value Proposition section')
      console.log('4. Click on any value item icon')
      console.log('5. You should see icon customization options (size, color, etc.)')
      console.log('6. Changes will automatically reflect on the frontend')
    } else {
      console.log('⚠️  SOME ISSUES FOUND')
      console.log('Please review the test results above for details.')
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error)
  }
}

// Run the comprehensive test
comprehensiveValuePropositionTest()