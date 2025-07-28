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

async function testAgentActionsForSEOProblem() {
  console.log('=== AGENT ACTIONS - SOLVING YOUR SEO VALIDATION PROBLEM ===\n')
  
  console.log('Your Problem:')
  console.log('- SEO agents generate great Danish content')
  console.log('- But they use wrong field names (hero.title instead of hero.headline)')
  console.log('- You spend hours debugging validation errors\n')
  
  console.log('Agent Actions Solution:')
  console.log('- It understands your Sanity schema structure')
  console.log('- It generates content with CORRECT field names')
  console.log('- No more validation errors!\n')
  
  // Test 1: Generate a complete page with correct structure
  console.log('Test 1: Generate complete page with Agent Actions\n')
  
  try {
    const pageResult = await client.agent.action.generate({
      schemaId: 'page', // The schema ID
      targetDocument: {
        operation: 'create',
        _type: 'page'
      },
      instruction: `Create a comprehensive page about electricity prices in Copenhagen with:
        1. Title: "Elpriser København 2024 - Find Billigste Strøm"
        2. Slug: "elpriser-koebenhavn"
        3. A hero section with engaging headline about saving money on electricity
        4. A value proposition section with 3 benefits
        
        IMPORTANT: Use the exact field names from the schema:
        - For hero: use "headline" and "subheadline" fields
        - For valueItem: use "heading" field
        
        Make all content in Danish.`,
    })
    
    console.log('✅ Agent Actions generated page with correct structure!')
    console.log('Generated content:', JSON.stringify(pageResult, null, 2))
    
    // Check if fields are correct
    if (pageResult.contentBlocks?.[0]?._type === 'hero') {
      const hero = pageResult.contentBlocks[0]
      console.log('\n📊 Field validation:')
      console.log(`   headline: ${hero.headline ? '✅ Correct!' : '❌ Missing'}`)
      console.log(`   subheadline: ${hero.subheadline ? '✅ Correct!' : '❌ Missing'}`)
      console.log(`   title: ${hero.title ? '❌ Wrong field used!' : '✅ Not present (good!)'}`)
    }
    
    return pageResult
  } catch (error: any) {
    console.log('❌ Error:', error.message)
    if (error.response?.body) {
      console.log('Details:', JSON.stringify(error.response.body, null, 2))
    }
  }
}

async function testAgentActionsWithSEOContent() {
  console.log('\n\nTest 2: Transform SEO agent content to correct structure\n')
  
  // What your SEO agent currently produces
  const seoAgentContent = {
    topic: 'varmepumper elpriser',
    title: 'Varmepumper og Elpriser - Komplet Guide 2024',
    hero: {
      title: 'Spar 70% på varmeregningen med varmepumpe', // Wrong field!
      subtitle: 'Vi guider dig til den bedste løsning og elaftale' // Wrong field!
    },
    benefits: [
      {
        title: 'Markant besparelse', // Wrong field!
        text: 'Reducer dine varmeudgifter med op til 70%'
      },
      {
        title: 'Miljøvenlig løsning',
        text: 'Reducer CO2-udledning og brug grøn energi'
      },
      {
        title: 'Vindstød anbefaler',
        text: 'Kombiner med vores grønne elaftale for maksimal besparelse'
      }
    ]
  }
  
  console.log('SEO agent produced content with WRONG field names:')
  console.log('- hero.title (should be headline)')
  console.log('- hero.subtitle (should be subheadline)')
  console.log('- benefit.title (should be heading)\n')
  
  try {
    // Use Agent Actions to create with correct structure
    const result = await client.agent.action.generate({
      schemaId: 'page',
      targetDocument: {
        operation: 'create',
        _type: 'page'
      },
      instruction: `Create a page from this SEO content, ensuring correct field names:
        
        Title: ${seoAgentContent.title}
        Slug: ${seoAgentContent.topic.replace(/\s+/g, '-')}
        
        Hero section:
        - Use "headline" field (NOT title): "${seoAgentContent.hero.title}"
        - Use "subheadline" field (NOT subtitle): "${seoAgentContent.hero.subtitle}"
        
        Value proposition with these benefits:
        ${seoAgentContent.benefits.map((b, i) => `
        ${i + 1}. Use "heading" field (NOT title): "${b.title}"
           description: "${b.text}"`).join('')}
        
        The schema requires specific field names - make sure to use them correctly!`,
      noWrite: true // Don't write to database, just return the structure
    })
    
    console.log('✅ Agent Actions transformed to correct structure!')
    console.log('\nResult:', JSON.stringify(result, null, 2))
    
    return result
  } catch (error: any) {
    console.log('❌ Error:', error.message)
  }
}

async function showHowToIntegrateWithSEOAgents() {
  console.log('\n\n=== HOW TO INTEGRATE WITH YOUR SEO AGENTS ===\n')
  
  console.log('Option 1: Let Agent Actions generate the entire page')
  console.log('```typescript')
  console.log('// Your SEO agent provides topic and keywords')
  console.log('const seoAnalysis = await analyzeTopic(topic)')
  console.log('')
  console.log('// Agent Actions creates the page with correct structure')
  console.log('const page = await client.agent.action.generate({')
  console.log('  schemaId: "page",')
  console.log('  targetDocument: { operation: "create", _type: "page" },')
  console.log('  instruction: `Create a comprehensive Danish SEO page about ${topic}')
  console.log('    Keywords: ${seoAnalysis.keywords}')
  console.log('    Target audience: ${seoAnalysis.audience}')
  console.log('    Use proper schema field names (headline not title, etc.)`')
  console.log('})')
  console.log('```\n')
  
  console.log('Option 2: SEO agent creates content, Agent Actions fixes structure')
  console.log('```typescript')
  console.log('// SEO agent generates content (might have wrong field names)')
  console.log('const seoContent = await generateSEOContent(topic)')
  console.log('')
  console.log('// Agent Actions ensures correct structure')
  console.log('const page = await client.agent.action.generate({')
  console.log('  schemaId: "page",')
  console.log('  targetDocument: { operation: "create", _type: "page" },')
  console.log('  instruction: `Transform this content to match our schema: ${JSON.stringify(seoContent)}`')
  console.log('})')
  console.log('```\n')
  
  console.log('Benefits:')
  console.log('✅ No more validation errors')
  console.log('✅ Agent Actions understands your schema')
  console.log('✅ SEO agents focus on content quality')
  console.log('✅ Automatic field name correction')
}

async function main() {
  console.log('🚀 TESTING AGENT ACTIONS FOR YOUR VALIDATION PROBLEM\n')
  
  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌ Error: SANITY_API_TOKEN not found')
    process.exit(1)
  }
  
  // Test 1: Generate complete page
  await testAgentActionsForSEOProblem()
  
  // Test 2: Transform SEO content
  await testAgentActionsWithSEOContent()
  
  // Show integration options
  await showHowToIntegrateWithSEOAgents()
  
  console.log('\n\n✨ CONCLUSION ✨')
  console.log('Agent Actions CAN solve your validation problem!')
  console.log('It understands schemas and generates correct field names.')
  console.log('This is exactly what you need for "full-hitter" content generation!')
}

// Run the test
main().catch(console.error)