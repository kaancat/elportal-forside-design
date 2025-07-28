import { createPageWithValidation } from './create-seo-page-with-validation'
import SEOPageCreatorAgent from './seo-page-creator-agent'

/**
 * Example: Creating SEO pages with automatic validation
 */

async function example1_SimplePageWithValidation() {
  console.log('=== Example 1: Simple Page with Validation ===\n')
  
  // This content might have wrong field names
  const pageContent = {
    _id: 'page.elbil-opladning',
    _type: 'page',
    title: 'Elbil Opladning - Spar på Strømmen',
    slug: { current: 'elbil-opladning' },
    seoTitle: 'Elbil Opladning Guide 2024 | ElPortal',
    seoDescription: 'Alt om elbil opladning hjemme. Spar penge med smart opladning og grøn strøm.',
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero1',
        // These are WRONG field names
        title: 'Elbil Opladning - Din Guide', // Should be 'headline'
        subtitle: 'Spar tusindvis med smart opladning' // Should be 'subheadline'
      }
    ]
  }
  
  // Create with automatic validation and correction
  const result = await createPageWithValidation(pageContent)
  
  if (result.success) {
    console.log('\n✅ Page created successfully with automatic field correction!')
  }
}

async function example2_FullSEOAgent() {
  console.log('\n\n=== Example 2: Full SEO Agent Workflow ===\n')
  
  const agent = new SEOPageCreatorAgent()
  
  // Create a comprehensive page about heat pumps
  const result = await agent.createSEOPage(
    'Varmepumper og Elpriser - Komplet Guide',
    'varmepumper-elpriser-guide',
    ['varmepumpe', 'elpriser', 'spare el', 'grøn energi', 'vindstød'],
    {
      research: true,
      analyze: true
    }
  )
  
  if (result.success) {
    console.log('\n🎉 SEO page created successfully!')
    console.log(`   View at: https://dinelportal.dk${result.url}`)
  }
}

async function example3_BatchCreation() {
  console.log('\n\n=== Example 3: Batch SEO Page Creation ===\n')
  
  const agent = new SEOPageCreatorAgent()
  
  const topics = [
    {
      topic: 'Solceller og Elpriser',
      slug: 'solceller-elpriser',
      keywords: ['solceller', 'solenergi', 'elpriser', 'grøn strøm']
    },
    {
      topic: 'Elpriser København',
      slug: 'elpriser-koebenhavn',
      keywords: ['elpriser københavn', 'billig el hovedstaden', 'elselskaber københavn']
    },
    {
      topic: 'Grøn Strøm og Vindenergi',
      slug: 'groen-stroem-vindenergi',
      keywords: ['grøn strøm', 'vindenergi', 'vedvarende energi', 'vindstød']
    }
  ]
  
  for (const page of topics) {
    console.log(`\n📝 Creating: ${page.topic}`)
    
    try {
      const result = await agent.createSEOPage(
        page.topic,
        page.slug,
        page.keywords
      )
      
      if (result.success) {
        console.log(`✅ Created: /${page.slug}`)
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`)
    }
    
    // Wait between creations to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}

async function example4_FixExistingContent() {
  console.log('\n\n=== Example 4: Fix Existing Content ===\n')
  
  // Content with multiple validation errors
  const brokenContent = {
    _type: 'page',
    title: 'Smart Home og Elpriser',
    slug: { current: 'smart-home-elpriser' },
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'h1',
        title: 'Smart Home Guide', // Wrong!
        subtitle: 'Spar på elregningen' // Wrong!
      },
      {
        _type: 'valueProposition',
        _key: 'vp1',
        heading: 'Fordele',
        items: [
          {
            _type: 'valueItem',
            _key: 'vi1',
            title: 'Automatisering', // Wrong!
            description: 'Styr dit forbrug automatisk'
          }
        ]
      },
      {
        _type: 'featureList',
        _key: 'fl1',
        heading: 'Smart Home Enheder',
        features: [
          {
            _type: 'featureItem',
            _key: 'fi1',
            name: 'Smart Termostater', // Wrong!
            description: 'Intelligent varmestyring'
          }
        ]
      }
    ]
  }
  
  console.log('Content has 4 field name errors:')
  console.log('- hero.title → headline')
  console.log('- hero.subtitle → subheadline')
  console.log('- valueItem.title → heading')
  console.log('- featureItem.name → title\n')
  
  // Fix with validation
  const result = await createPageWithValidation(brokenContent)
  
  if (result.success) {
    console.log('\n✅ All errors automatically fixed and page created!')
  }
}

// Main execution
async function main() {
  console.log('🌟 SEO Page Creation Examples with Agent Actions\n')
  
  // Run examples
  await example1_SimplePageWithValidation()
  // await example2_FullSEOAgent()
  // await example3_BatchCreation()
  // await example4_FixExistingContent()
  
  console.log('\n\n✨ With Agent Actions, no more validation errors!')
  console.log('Your SEO agents now create "full-hitter" pages every time! 🎯')
}

// Run examples
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}