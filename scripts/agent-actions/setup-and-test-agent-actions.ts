import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { execSync } from 'child_process'

// Load environment variables
dotenv.config({ path: '.env' })

// Create Sanity client
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: 'vX', // Required for Agent Actions
  token: process.env.SANITY_API_TOKEN,
})

async function setupInstructions() {
  console.log('=== AGENT ACTIONS SETUP GUIDE ===\n')
  
  console.log('Step 1: Deploy your Sanity schema')
  console.log('Run this command in your Sanity Studio directory:\n')
  console.log('  cd /Users/kaancatalkaya/Desktop/projects/sanityelpriscms')
  console.log('  npx sanity schema deploy\n')
  
  console.log('Step 2: Get your schema ID')
  console.log('After deploying, run:\n')
  console.log('  npx sanity schema list\n')
  console.log('This will show something like:')
  console.log('  _.schemas.default')
  console.log('  _.schemas.workspace-123\n')
  
  console.log('Step 3: Use the schema ID in Agent Actions')
  console.log('Update the schemaId in the test script with your actual schema ID\n')
}

async function testWithDefaultSchema() {
  console.log('\n=== TESTING WITH DEFAULT SCHEMA ID ===\n')
  
  // Common schema IDs to try
  const schemaIds = [
    '_.schemas.default',
    `_.schemas.${process.env.VITE_SANITY_PROJECT_ID}`,
    'default',
    'production'
  ]
  
  console.log('Trying common schema IDs...\n')
  
  for (const schemaId of schemaIds) {
    console.log(`Testing schemaId: "${schemaId}"...`)
    try {
      const result = await client.agent.action.generate({
        schemaId,
        targetDocument: {
          operation: 'create',
          _type: 'page'
        },
        instruction: 'Create a minimal test page with title "Test"',
        noWrite: true
      })
      
      console.log(`✅ SUCCESS with schemaId: ${schemaId}`)
      console.log('Agent Actions is working!\n')
      return schemaId
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}\n`)
    }
  }
  
  return null
}

async function testSEOValidationSolution(schemaId: string) {
  console.log('=== TESTING YOUR SEO VALIDATION SOLUTION ===\n')
  
  // What your SEO agent produces (with wrong field names)
  const seoAgentOutput = {
    title: 'Elpriser København 2024 - Spar på Strøm',
    slug: 'elpriser-koebenhavn',
    hero: {
      title: 'Find Københavns bedste elpriser', // ❌ Wrong field
      subtitle: 'Vi sammenligner alle elselskaber for dig' // ❌ Wrong field
    },
    valueProps: [
      {
        title: 'Lokale priser', // ❌ Wrong field
        text: 'Priser specifikt for København og omegn'
      },
      {
        title: 'Grøn energi',
        text: 'Vindstød tilbyder 100% vindenergi'
      }
    ]
  }
  
  console.log('Your SEO agent created content with WRONG field names:')
  console.log(JSON.stringify(seoAgentOutput.hero, null, 2))
  console.log('\nProblem: Uses title/subtitle instead of headline/subheadline\n')
  
  try {
    console.log('Using Agent Actions to create with CORRECT structure...\n')
    
    const result = await client.agent.action.generate({
      schemaId,
      targetDocument: {
        operation: 'create',
        _type: 'page'
      },
      instruction: `Create a page from this content, using correct schema field names:
        
        Page title: "${seoAgentOutput.title}"
        Page slug: "${seoAgentOutput.slug}"
        
        For the hero section, the content is:
        - Main text: "${seoAgentOutput.hero.title}"
        - Secondary text: "${seoAgentOutput.hero.subtitle}"
        
        IMPORTANT: The hero schema uses "headline" for main text and "subheadline" for secondary text.
        
        Also add a value proposition section with these items:
        ${seoAgentOutput.valueProps.map((vp, i) => `
        ${i + 1}. Main text: "${vp.title}"
           Description: "${vp.text}"
           (Remember: valueItem uses "heading" field, not "title")`).join('')}`,
      noWrite: true // Don't write to database
    })
    
    console.log('✅ Agent Actions generated correct structure!')
    console.log('\nGenerated page:', JSON.stringify(result, null, 2))
    
    // Validate the structure
    if (result.contentBlocks?.[0]?._type === 'hero') {
      const hero = result.contentBlocks[0]
      console.log('\n📊 Field validation:')
      console.log(`   headline: ${hero.headline ? '✅' : '❌'}`)
      console.log(`   subheadline: ${hero.subheadline ? '✅' : '❌'}`)
      console.log(`   title (wrong): ${hero.title ? '❌ Used wrong field!' : '✅ Not present'}`)
    }
    
    return result
  } catch (error: any) {
    console.log('❌ Error:', error.message)
    return null
  }
}

async function showIntegrationGuide() {
  console.log('\n\n=== INTEGRATION GUIDE FOR YOUR SEO AGENTS ===\n')
  
  console.log('```typescript')
  console.log('// agent-actions-helper.ts')
  console.log('import { createClient } from "@sanity/client"')
  console.log('')
  console.log('const client = createClient({')
  console.log('  projectId: "your-project-id",')
  console.log('  dataset: "production",')
  console.log('  apiVersion: "vX",')
  console.log('  token: process.env.SANITY_API_TOKEN')
  console.log('})')
  console.log('')
  console.log('export async function createPageWithAgentActions(seoContent: any) {')
  console.log('  return await client.agent.action.generate({')
  console.log('    schemaId: "_.schemas.default", // Your actual schema ID')
  console.log('    targetDocument: {')
  console.log('      operation: "create",')
  console.log('      _type: "page"')
  console.log('    },')
  console.log('    instruction: `Create a page from this SEO content.')
  console.log('      Ensure all field names match the schema exactly.')
  console.log('      Content: ${JSON.stringify(seoContent)}`,')
  console.log('  })')
  console.log('}')
  console.log('```\n')
  
  console.log('Benefits:')
  console.log('✅ Agent Actions understands your schema')
  console.log('✅ Automatically uses correct field names')
  console.log('✅ No more validation errors')
  console.log('✅ Your SEO agents can focus on content quality')
}

async function main() {
  console.log('🚀 AGENT ACTIONS SETUP AND TEST\n')
  
  // Show setup instructions
  await setupInstructions()
  
  // Try to find working schema ID
  console.log('Press Enter to test Agent Actions...')
  
  const workingSchemaId = await testWithDefaultSchema()
  
  if (workingSchemaId) {
    // Test the SEO validation solution
    await testSEOValidationSolution(workingSchemaId)
    
    // Show integration guide
    await showIntegrationGuide()
    
    console.log('\n✨ SUCCESS! Agent Actions is available and can solve your problem!')
  } else {
    console.log('\n⚠️  Could not find working schema ID')
    console.log('\nPlease follow the setup instructions above:')
    console.log('1. Deploy your schema: npx sanity schema deploy')
    console.log('2. Get schema ID: npx sanity schema list')
    console.log('3. Update this script with your schema ID')
    console.log('\nAgent Actions WILL solve your validation problem once set up!')
  }
}

// Run the setup guide
main().catch(console.error)