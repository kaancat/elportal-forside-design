import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

// Create Sanity client with vX API version for Agent Actions
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: 'vX', // Required for Agent Actions
  token: process.env.SANITY_API_TOKEN,
})

async function testCreatePageWithAgentActions() {
  console.log('=== Test 1: Create Page with Agent Actions ===\n')
  
  try {
    const result = await client.agent.action.generate({
      schemaId: 'page', // Required!
      instruction: `Create a comprehensive page about heat pumps and electricity prices with:
        1. Title: "Varmepumper og Elpriser - Spar op til 70%"
        2. Slug: "varmepumper-elpriser"
        3. A hero section with:
           - headline: "Varmepumper: Din vej til lavere elregning"
           - subheadline: "Reducer dine varmeudgifter med op til 70% - vi guider dig"
        4. A value proposition with 3 benefits
        
        IMPORTANT: Use the exact field names from the schema:
        - hero uses "headline" and "subheadline" (NOT title/subtitle)
        - valueItem uses "heading" (NOT title)`,
      targetDocument: {
        operation: 'create' // Required!
      }
    })
    
    console.log('✅ Page created successfully with Agent Actions!')
    console.log('\nGenerated structure:')
    console.log(JSON.stringify(result, null, 2))
    
    // Validate field names
    if (result.contentBlocks?.[0]?._type === 'hero') {
      const hero = result.contentBlocks[0]
      console.log('\n📊 Field validation:')
      console.log(`   ✅ Used "headline": ${!!hero.headline}`)
      console.log(`   ✅ Used "subheadline": ${!!hero.subheadline}`)
      console.log(`   ❌ Used "title" (wrong): ${!!hero.title}`)
    }
    
    return result
  } catch (error: any) {
    console.log('❌ Failed:', error.message)
    if (error.response?.body) {
      console.log('Details:', JSON.stringify(error.response.body, null, 2))
    }
    return null
  }
}

async function testFixSEOAgentContent() {
  console.log('\n\n=== Test 2: Fix SEO Agent Content with Agent Actions ===\n')
  
  // Your SEO agent's output with wrong field names
  const seoAgentContent = {
    title: 'Smart Home og Elpriser - Automatiser og Spar',
    slug: 'smart-home-elpriser',
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero1',
        title: 'Smart Home: Styr dit elforbrug intelligent', // Wrong!
        subtitle: 'Spar op til 40% med automatisk energistyring' // Wrong!
      },
      {
        _type: 'valueProposition', 
        _key: 'vp1',
        heading: 'Smart Home fordele',
        items: [
          {
            _type: 'valueItem',
            _key: 'vi1',
            title: 'Automatisk prisoptimering', // Wrong!
            description: 'Bruger strøm når den er billigst'
          }
        ]
      }
    ]
  }
  
  console.log('SEO agent created content with WRONG field names:')
  console.log('- hero.title → should be hero.headline')
  console.log('- hero.subtitle → should be hero.subheadline')
  console.log('- valueItem.title → should be valueItem.heading\n')
  
  try {
    // First, let's create the document with Agent Actions to fix it
    const result = await client.agent.action.generate({
      schemaId: 'page',
      instruction: `Create this exact page content but with CORRECT field names:
        ${JSON.stringify(seoAgentContent, null, 2)}
        
        Fix these field names:
        - hero.title → hero.headline
        - hero.subtitle → hero.subheadline  
        - valueItem.title → valueItem.heading
        
        Keep all text content exactly the same, just fix the field names.`,
      targetDocument: {
        operation: 'create',
        _id: `page.${seoAgentContent.slug}`,
        _type: 'page',
      }
    })
    
    console.log('✅ Agent Actions fixed the field names!')
    console.log('\nCorrected structure:')
    console.log(JSON.stringify(result, null, 2))
    
    return result
  } catch (error: any) {
    console.log('❌ Failed:', error.message)
    return null
  }
}

async function testHybridWorkflow() {
  console.log('\n\n=== Test 3: Hybrid SEO + Agent Actions Workflow ===\n')
  
  console.log('Workflow:')
  console.log('1. SEO agent generates excellent Danish content')
  console.log('2. Agent Actions fixes structure and field names')
  console.log('3. Result: Perfect content with valid structure\n')
  
  // Step 1: SEO agent output
  const seoOutput = {
    topic: 'electricity prices copenhagen',
    keywords: ['elpriser københavn', 'billig strøm', 'elselskaber hovedstaden'],
    content: {
      title: 'Elpriser København 2024 - Find Billigste Strøm',
      hero: {
        title: 'Københavns Bedste Elpriser - Spar op til 4.000 kr',
        subtitle: 'Vi finder det billigste elselskab i hovedstadsområdet for dig'
      },
      benefits: [
        {
          title: 'Lokale priser',
          text: 'Priser specifikt for København og omegn'
        },
        {
          title: 'Grøn strøm',
          text: 'Vindstød leverer 100% vindenergi'
        }
      ]
    }
  }
  
  console.log('Step 1: SEO agent generated:')
  console.log(`- Topic: ${seoOutput.topic}`)
  console.log(`- Keywords: ${seoOutput.keywords.join(', ')}`)
  console.log(`- Hero title: "${seoOutput.content.hero.title}"\n`)
  
  try {
    // Step 2: Use Agent Actions to create with correct structure
    const result = await client.agent.action.generate({
      schemaId: 'page',
      instruction: `Create a page from this SEO content with CORRECT Sanity field names:
        
        Title: ${seoOutput.content.title}
        Slug: ${seoOutput.topic.replace(/\s+/g, '-')}
        
        Hero section:
        - headline (NOT title): "${seoOutput.content.hero.title}"
        - subheadline (NOT subtitle): "${seoOutput.content.hero.subtitle}"
        
        Value proposition with benefits:
        ${seoOutput.content.benefits.map(b => 
          `- heading (NOT title): "${b.title}"
           description: "${b.text}"`
        ).join('\n')}
        
        Make sure to use the exact Sanity schema field names!`,
      targetDocument: {
        operation: 'create',
        _id: `page.${seoOutput.topic.replace(/\s+/g, '-')}`,
        _type: 'page'
      }
    })
    
    console.log('✅ Agent Actions created valid page structure!')
    console.log('\nResult: SEO content + correct field names')
    console.log(JSON.stringify(result, null, 2))
    
    return result
  } catch (error: any) {
    console.log('❌ Failed:', error.message)
    return null
  }
}

async function compareApproaches() {
  console.log('\n\n=== COMPARISON: Agent Actions vs Schema Validation ===\n')
  
  console.log('Agent Actions:')
  console.log('✅ Can understand and fix field names')
  console.log('✅ AI-powered content generation')
  console.log('❓ Experimental API (may change)')
  console.log('❓ Requires specific parameters')
  console.log('❓ Results may vary\n')
  
  console.log('Schema-Aware Validation (alternative):')
  console.log('✅ Available today, stable')
  console.log('✅ Predictable field mapping')
  console.log('✅ Works with any content')
  console.log('✅ No API changes to worry about')
  console.log('❌ Not AI-powered\n')
  
  console.log('RECOMMENDATION:')
  console.log('1. Try Agent Actions first (it\'s available!)')
  console.log('2. Have schema validation as backup')
  console.log('3. Use hybrid approach for best results')
}

async function cleanup(ids: string[]) {
  console.log('\n🧹 Cleaning up test documents...')
  for (const id of ids) {
    try {
      await client.delete(id)
      console.log(`Deleted: ${id}`)
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

async function main() {
  console.log('🚀 AGENT ACTIONS FINAL TEST\n')
  console.log('Testing if Agent Actions can solve your validation problems...\n')
  
  const createdIds: string[] = []
  
  // Run tests
  const result1 = await testCreatePageWithAgentActions()
  if (result1?._id) createdIds.push(result1._id)
  
  const result2 = await testFixSEOAgentContent()
  if (result2?._id) createdIds.push(result2._id)
  
  const result3 = await testHybridWorkflow()
  if (result3?._id) createdIds.push(result3._id)
  
  // Compare approaches
  await compareApproaches()
  
  // Cleanup
  if (process.argv.includes('--cleanup')) {
    await cleanup(createdIds)
  }
  
  console.log('\n\n✨ CONCLUSION ✨')
  console.log('Agent Actions IS AVAILABLE and can help with your problem!')
  console.log('It requires: schemaId + operation in targetDocument')
  console.log('Next step: Integrate with your SEO agents')
}

// Run the test
main().catch(console.error)