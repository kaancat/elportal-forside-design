import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Sanity client configuration
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Fetch schema information to validate against
async function fetchSchemaInfo() {
  console.log('📚 Fetching schema information...')
  
  // Query to understand what's allowed in page contentBlocks
  const schemaQuery = `*[_type == "sanity.schema"] {
    name,
    type,
    "fields": select(
      name == "page" => fields[name == "contentBlocks"][0],
      null
    )
  }`
  
  try {
    // For now, we'll use known schema information
    const pageContentBlockTypes = [
      'hero',
      'pageSection',
      'featureList',
      'valueProposition',
      'providerList',
      'faqGroup',
      'callToActionSection',
      'livePriceGraph',
      'monthlyProductionChart',
      'renewableEnergyForecast',
      'co2EmissionsChart',
      'declarationProduction',
      'consumptionMap',
      'declarationGridmix',
      'applianceCalculator',
      'energyTipsSection',
      'chargingBoxShowcase',
      'realPriceComparisonTable',
      'videoSection',
      'richTextSection',
      'priceExampleTable'
    ]
    
    // Check if priceCalculatorWidget is in the allowed types
    const isPriceCalculatorAllowed = pageContentBlockTypes.includes('priceCalculatorWidget')
    
    return {
      allowedTypes: pageContentBlockTypes,
      priceCalculatorStatus: isPriceCalculatorAllowed ? 'not-allowed' : 'not-in-schema'
    }
  } catch (error) {
    console.error('Error fetching schema:', error)
    return null
  }
}

// Deep validation of document structure
async function deepValidateDocument(documentId: string) {
  console.log('\n🔍 Performing deep validation with Agent Actions approach')
  
  const document = await client.getDocument(documentId)
  const schemaInfo = await fetchSchemaInfo()
  
  const validationReport = {
    documentId,
    title: document.title,
    slug: document.slug?.current,
    issues: [] as any[],
    warnings: [] as any[],
    info: [] as any[]
  }
  
  // Validate each content block
  document.contentBlocks?.forEach((block: any, index: number) => {
    // Check if block type is allowed
    if (block._type === 'priceCalculatorWidget') {
      validationReport.issues.push({
        severity: 'error',
        path: `contentBlocks[${index}]`,
        component: block._type,
        message: 'priceCalculatorWidget is not allowed in page contentBlocks',
        fix: 'This component should be embedded within a pageSection content array, not as a direct contentBlock',
        action: 'move-to-pagesection'
      })
    }
    
    // Check for untitled sections
    if (block._type === 'pageSection') {
      if (!block.heading || block.heading.includes('Untitled')) {
        validationReport.warnings.push({
          severity: 'warning',
          path: `contentBlocks[${index}].heading`,
          component: block._type,
          message: `Page section is untitled: "${block.heading || 'null'}"`,
          fix: 'Add a descriptive heading',
          currentValue: block.heading
        })
      }
    }
    
    // Check for empty references
    if (block._type === 'providerList' && (!block.providers || block.providers.length === 0)) {
      validationReport.warnings.push({
        severity: 'warning',
        path: `contentBlocks[${index}].providers`,
        component: block._type,
        message: 'Provider list has no provider references',
        fix: 'Add provider document references',
        action: 'add-references'
      })
    }
    
    // Check value proposition
    if (block._type === 'valueProposition' && (!block.heading || block.heading === 'Untitled')) {
      validationReport.warnings.push({
        severity: 'warning',
        path: `contentBlocks[${index}].heading`,
        component: block._type,
        message: 'Value proposition has untitled heading',
        fix: 'Add a descriptive heading'
      })
    }
  })
  
  return validationReport
}

// Fix priceCalculatorWidget by moving it into a pageSection
async function fixPriceCalculatorWidget(document: any) {
  console.log('\n🔧 Fixing priceCalculatorWidget placement...')
  
  const contentBlocks = [...document.contentBlocks]
  const priceCalcIndex = contentBlocks.findIndex(b => b._type === 'priceCalculatorWidget')
  
  if (priceCalcIndex === -1) return contentBlocks
  
  // Extract the price calculator
  const priceCalc = contentBlocks[priceCalcIndex]
  
  // Create a new pageSection to wrap it
  const wrappedSection = {
    _type: 'pageSection',
    _key: Math.random().toString(36).substring(2, 15),
    heading: priceCalc.title || 'Beregn din potentielle besparelse',
    headerAlignment: 'center',
    content: [
      {
        _type: 'block',
        _key: Math.random().toString(36).substring(2, 15),
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: Math.random().toString(36).substring(2, 15),
            text: priceCalc.description || 'Se hvor meget du kan spare ved at vælge den rigtige el-leverandør',
            marks: []
          }
        ]
      },
      // Embed the calculator as inline content
      {
        _type: 'priceCalculator',
        _key: Math.random().toString(36).substring(2, 15),
        title: priceCalc.title || 'Beregn din besparelse'
      }
    ]
  }
  
  // Replace the standalone widget with the wrapped version
  contentBlocks[priceCalcIndex] = wrappedSection
  
  console.log('✅ Wrapped priceCalculatorWidget in pageSection')
  return contentBlocks
}

// Main execution
async function performDeepValidation() {
  console.log('🚀 Starting deep Agent Actions validation')
  
  const documentId = 'qgCxJyBbKpvhb2oGYqfgkp'
  
  try {
    // Perform validation
    const validationReport = await deepValidateDocument(documentId)
    
    // Display report
    console.log('\n📊 Validation Report:')
    console.log(`Document: ${validationReport.title}`)
    console.log(`Slug: ${validationReport.slug}`)
    
    if (validationReport.issues.length > 0) {
      console.log(`\n🔴 Critical Issues (${validationReport.issues.length}):`)
      validationReport.issues.forEach((issue, i) => {
        console.log(`\n${i + 1}. ${issue.component} - ${issue.message}`)
        console.log(`   Path: ${issue.path}`)
        console.log(`   Fix: ${issue.fix}`)
      })
    }
    
    if (validationReport.warnings.length > 0) {
      console.log(`\n🟡 Warnings (${validationReport.warnings.length}):`)
      validationReport.warnings.forEach((warning, i) => {
        console.log(`\n${i + 1}. ${warning.component} - ${warning.message}`)
        console.log(`   Path: ${warning.path}`)
        console.log(`   Fix: ${warning.fix}`)
      })
    }
    
    // Apply fixes for critical issues
    if (validationReport.issues.some(i => i.component === 'priceCalculatorWidget')) {
      console.log('\n🛠️  Applying automatic fixes...')
      
      const document = await client.getDocument(documentId)
      const fixedContentBlocks = await fixPriceCalculatorWidget(document)
      
      // Update document
      await client
        .patch(documentId)
        .set({ contentBlocks: fixedContentBlocks })
        .commit()
      
      console.log('✅ Automatic fixes applied!')
    }
    
    // Summary
    const totalIssues = validationReport.issues.length + validationReport.warnings.length
    console.log('\n📌 Summary:')
    console.log(`- Total issues found: ${totalIssues}`)
    console.log(`- Critical: ${validationReport.issues.length}`)
    console.log(`- Warnings: ${validationReport.warnings.length}`)
    console.log(`- Auto-fixed: ${validationReport.issues.filter(i => i.action).length}`)
    
    console.log(`\n🔗 View document: https://dinelportal.sanity.studio/structure/page;${documentId}`)
    
  } catch (error) {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  }
}

// Execute
performDeepValidation()