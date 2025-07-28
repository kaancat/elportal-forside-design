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

const AGENT_ACTIONS_URL = 'https://yxesi03x.agent-api.sanity.io'

interface ValidationError {
  path: string
  message: string
  severity: 'error' | 'warning'
}

// Call Sanity Agent Actions API
async function callAgentActions(action: string, documents: any[]) {
  const headers = {
    'Authorization': `Bearer ${process.env.SANITY_API_TOKEN}`,
    'Content-Type': 'application/json'
  }

  const body = {
    action,
    documents,
    options: {
      validateOnly: true,
      returnValidation: true
    }
  }

  try {
    const response = await fetch(`${AGENT_ACTIONS_URL}/v1/actions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`Agent Actions API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error calling Agent Actions:', error)
    throw error
  }
}

// Fetch document for validation
async function fetchDocument(documentId: string) {
  try {
    console.log(`📄 Fetching document: ${documentId}`)
    const document = await client.getDocument(documentId)
    if (!document) {
      throw new Error('Document not found')
    }
    return document
  } catch (error) {
    console.error('❌ Error fetching document:', error)
    throw error
  }
}

// Validate document structure
function validateDocumentStructure(document: any): ValidationError[] {
  const errors: ValidationError[] = []
  
  // Check required fields
  if (!document._type) {
    errors.push({
      path: '_type',
      message: 'Document type is missing',
      severity: 'error'
    })
  }

  if (!document.title) {
    errors.push({
      path: 'title',
      message: 'Page title is missing',
      severity: 'error'
    })
  }

  if (!document.slug?.current) {
    errors.push({
      path: 'slug',
      message: 'Page slug is missing or invalid',
      severity: 'error'
    })
  }

  // Validate content blocks
  if (document.contentBlocks && Array.isArray(document.contentBlocks)) {
    document.contentBlocks.forEach((block: any, index: number) => {
      const blockErrors = validateContentBlock(block, `contentBlocks[${index}]`)
      errors.push(...blockErrors)
    })
  } else {
    errors.push({
      path: 'contentBlocks',
      message: 'Content blocks array is missing or invalid',
      severity: 'error'
    })
  }

  return errors
}

// Validate individual content block
function validateContentBlock(block: any, path: string): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!block._type) {
    errors.push({
      path: `${path}._type`,
      message: 'Block type is missing',
      severity: 'error'
    })
  }

  if (!block._key) {
    errors.push({
      path: `${path}._key`,
      message: 'Block key is missing',
      severity: 'error'
    })
  }

  // Type-specific validation
  switch (block._type) {
    case 'hero':
      if (!block.headline) {
        errors.push({
          path: `${path}.headline`,
          message: 'Hero headline is missing',
          severity: 'error'
        })
      }
      break
      
    case 'featureList':
      if (!block.features || !Array.isArray(block.features)) {
        errors.push({
          path: `${path}.features`,
          message: 'Feature list features array is missing',
          severity: 'error'
        })
      } else {
        block.features.forEach((feature: any, idx: number) => {
          if (!feature.title) {
            errors.push({
              path: `${path}.features[${idx}].title`,
              message: 'Feature title is missing',
              severity: 'error'
            })
          }
        })
      }
      break
      
    case 'valueProposition':
      if (!block.items || !Array.isArray(block.items)) {
        errors.push({
          path: `${path}.items`,
          message: 'Value proposition items array is missing',
          severity: 'error'
        })
      }
      break
      
    case 'faqGroup':
      if (!block.faqItems || !Array.isArray(block.faqItems)) {
        errors.push({
          path: `${path}.faqItems`,
          message: 'FAQ items array is missing',
          severity: 'error'
        })
      } else {
        block.faqItems.forEach((faq: any, idx: number) => {
          if (!faq.question) {
            errors.push({
              path: `${path}.faqItems[${idx}].question`,
              message: 'FAQ question is missing',
              severity: 'error'
            })
          }
          if (!faq.answer || !Array.isArray(faq.answer)) {
            errors.push({
              path: `${path}.faqItems[${idx}].answer`,
              message: 'FAQ answer is missing or not an array',
              severity: 'error'
            })
          }
        })
      }
      break
      
    case 'callToActionSection':
      if (!block.buttonText) {
        errors.push({
          path: `${path}.buttonText`,
          message: 'CTA button text is missing',
          severity: 'warning'
        })
      }
      if (!block.buttonUrl) {
        errors.push({
          path: `${path}.buttonUrl`,
          message: 'CTA button URL is missing',
          severity: 'warning'
        })
      }
      break
  }

  return errors
}

// Display validation results
function displayValidationResults(errors: ValidationError[]) {
  if (errors.length === 0) {
    console.log('✅ No validation errors found!')
    return
  }

  console.log(`\n⚠️  Found ${errors.length} validation issues:\n`)
  
  const errorCount = errors.filter(e => e.severity === 'error').length
  const warningCount = errors.filter(e => e.severity === 'warning').length
  
  console.log(`   🔴 Errors: ${errorCount}`)
  console.log(`   🟡 Warnings: ${warningCount}\n`)
  
  errors.forEach((error, index) => {
    const icon = error.severity === 'error' ? '🔴' : '🟡'
    console.log(`${index + 1}. ${icon} ${error.path}`)
    console.log(`   ${error.message}\n`)
  })
}

// Main validation function
async function validateElectricityGuide() {
  console.log('🔍 Starting validation of electricity provider guide')
  
  const documentId = 'qgCxJyBbKpvhb2oGYqfgkp'
  
  try {
    // Fetch the document
    const document = await fetchDocument(documentId)
    
    // Run structural validation
    console.log('\n📋 Running structural validation...')
    const structuralErrors = validateDocumentStructure(document)
    
    // Try to use Agent Actions for deeper validation
    console.log('\n🤖 Attempting Agent Actions validation...')
    try {
      const agentResult = await callAgentActions('validate', [document])
      console.log('Agent Actions response:', agentResult)
    } catch (agentError) {
      console.log('⚠️  Agent Actions API not available, using local validation only')
    }
    
    // Display results
    displayValidationResults(structuralErrors)
    
    if (structuralErrors.length === 0) {
      console.log('\n✅ Document is valid and ready for use!')
      console.log(`📌 View at: https://dinelportal.sanity.studio/structure/page;${documentId}`)
      console.log('📌 Frontend URL: /hvordan-vaelger-du-elleverandoer')
    } else {
      console.log('\n❌ Validation issues found. Please review and fix.')
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  }
}

// Execute validation
validateElectricityGuide()