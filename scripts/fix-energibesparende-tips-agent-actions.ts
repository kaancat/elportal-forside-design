import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

// Create Sanity client with agent actions support
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: 'vX', // Required for agent actions
  token: process.env.SANITY_API_TOKEN,
})

const PAGE_ID = 'qgCxJyBbKpvhb2oGYpYKuf' // energibesparende-tips page ID

async function fixValidationErrors() {
  console.log('🔍 FIXING VALIDATION ERRORS FOR ENERGIBESPARENDE TIPS PAGE\n')
  console.log('=' .repeat(80))
  
  try {
    // Step 1: Use prompt to analyze the document and identify issues
    console.log('📋 Step 1: Analyzing page for validation errors...\n')
    
    const validationAnalysis = await client.agent.action.prompt({
      instruction: `Analyze this page document for validation errors.
        
        Focus on these specific validation errors reported:
        1. faqGroup block is missing required title field
        2. faqGroup block is missing or has invalid faqItems array
        
        For the faqGroup block, check:
        - Does it have a title field?
        - Does it have a faqItems array (NOT faqs)?
        - Are the FAQ items inline objects or references?
        
        Return a JSON response with:
        {
          "hasErrors": boolean,
          "faqGroupIndex": number or null,
          "errors": [
            {
              "field": "title" or "faqItems",
              "issue": "description of the issue",
              "currentValue": "current value or null"
            }
          ],
          "suggestedFixes": {
            "title": "suggested title for FAQ section",
            "faqItems": [array of suggested FAQ items if missing]
          }
        }`,
      instructionParams: {
        document: {
          type: 'document',
          documentId: PAGE_ID
        }
      },
      format: 'json'
    })
    
    console.log('✅ Validation Analysis:')
    console.log(JSON.stringify(validationAnalysis, null, 2))
    console.log()
    
    if (!validationAnalysis.hasErrors) {
      console.log('✨ No validation errors found in the FAQ section!')
      return
    }
    
    // Step 2: Fetch the document to get the current structure
    console.log('📄 Step 2: Fetching document structure...\n')
    
    const page = await client.getDocument(PAGE_ID)
    if (!page) {
      throw new Error('Page not found!')
    }
    
    // Find the faqGroup block
    const faqGroupIndex = validationAnalysis.faqGroupIndex
    if (faqGroupIndex === null || faqGroupIndex === undefined) {
      throw new Error('Could not find faqGroup block in the page')
    }
    
    const faqBlock = page.contentBlocks[faqGroupIndex]
    console.log('Current FAQ block structure:')
    console.log(JSON.stringify(faqBlock, null, 2))
    console.log()
    
    // Step 3: Create the fixed FAQ block
    console.log('🔧 Step 3: Creating fixed FAQ block...\n')
    
    const fixedFaqBlock = {
      ...faqBlock,
      _type: 'faqGroup',
      title: validationAnalysis.suggestedFixes.title || 'Ofte Stillede Spørgsmål om Energibesparelse',
      faqItems: validationAnalysis.suggestedFixes.faqItems || [
        {
          _type: 'faqItem',
          _key: `faq-${Date.now()}-1`,
          question: 'Hvor meget kan jeg spare på min elregning?',
          answer: [
            {
              _type: 'block',
              _key: `block-${Date.now()}-1`,
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: `span-${Date.now()}-1`,
                  text: 'Med vores energibesparende tips kan du typisk spare 10-30% på din årlige elregning. Det svarer til 2.000-5.000 kr for en gennemsnitlig husstand.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: `faq-${Date.now()}-2`,
          question: 'Hvilke tips giver den største besparelse?',
          answer: [
            {
              _type: 'block',
              _key: `block-${Date.now()}-2`,
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: `span-${Date.now()}-2`,
                  text: 'De største besparelser kommer fra: 1) Reducere standby-forbrug (op til 1.350 kr/år), 2) Optimere opvarmning (20% besparelse), 3) Skifte til LED-pærer (75% mindre strømforbrug), og 4) Bruge apparater på de rigtige tidspunkter.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: `faq-${Date.now()}-3`,
          question: 'Skal jeg investere i nye apparater?',
          answer: [
            {
              _type: 'block',
              _key: `block-${Date.now()}-3`,
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: `span-${Date.now()}-3`,
                  text: 'Nye energieffektive apparater kan spare meget strøm, men start med de gratis tips først. Når du skal udskifte apparater alligevel, så vælg A+++ mærkede produkter som kan spare op til 50% strøm.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: `faq-${Date.now()}-4`,
          question: 'Hvordan ved jeg om mine tips virker?',
          answer: [
            {
              _type: 'block',
              _key: `block-${Date.now()}-4`,
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: `span-${Date.now()}-4`,
                  text: 'Følg dit elforbrug på din elmåler eller gennem din elleverandørs app. Sammenlign dit forbrug måned for måned og år for år. De fleste vil se en mærkbar forskel allerede efter første måned.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: `faq-${Date.now()}-5`,
          question: 'Kan jeg spare endnu mere ved at skifte elselskab?',
          answer: [
            {
              _type: 'block',
              _key: `block-${Date.now()}-5`,
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: `span-${Date.now()}-5`,
                  text: 'Ja! Udover at reducere dit forbrug kan du spare yderligere ved at vælge det rigtige elselskab. Brug vores prissammenligning ovenfor for at se, hvor meget du kan spare ved at skifte til en billigere leverandør som f.eks. Vindstød.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        }
      ]
    }
    
    // Remove any faqs field if it exists (wrong field name)
    if ('faqs' in fixedFaqBlock) {
      delete (fixedFaqBlock as any).faqs
    }
    
    console.log('Fixed FAQ block structure:')
    console.log(JSON.stringify(fixedFaqBlock, null, 2))
    console.log()
    
    // Step 4: Update the document
    console.log('💾 Step 4: Applying fix to the document...\n')
    
    // Create updated content blocks array
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[faqGroupIndex] = fixedFaqBlock
    
    // Apply the update
    const result = await client
      .patch(PAGE_ID)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Successfully fixed validation errors!')
    console.log()
    
    // Step 5: Verify the fix
    console.log('🔍 Step 5: Verifying the fix...\n')
    
    const verificationResult = await client.agent.action.prompt({
      instruction: `Verify that the faqGroup block now has:
        1. A title field with value
        2. A faqItems array with at least one FAQ item
        
        Return JSON: { "isValid": boolean, "title": "the title", "faqItemsCount": number }`,
      instructionParams: {
        document: {
          type: 'document',
          documentId: PAGE_ID
        }
      },
      format: 'json'
    })
    
    console.log('Verification Result:')
    console.log(JSON.stringify(verificationResult, null, 2))
    console.log()
    
    if (verificationResult.isValid) {
      console.log('✨ All validation errors have been fixed!')
      console.log('📊 Summary:')
      console.log(`   - FAQ Title: "${verificationResult.title}"`)
      console.log(`   - FAQ Items: ${verificationResult.faqItemsCount} questions added`)
      console.log()
      console.log('🔗 View in Sanity Studio:')
      console.log(`   https://dinelportal.sanity.studio/structure/page;${PAGE_ID}`)
    } else {
      console.log('⚠️  Some validation errors may still exist. Please check manually.')
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('Response details:', error.response)
    }
  }
}

// Run the fix
fixValidationErrors().catch(console.error)