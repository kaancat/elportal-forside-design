import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function analyzeElprisberegnerPage() {
  const pageId = 'f7ecf92783e749828f7281a6e5829d52'
  
  console.log('🔍 Analyzing elprisberegner page schema requirements...\n')

  // Fetch the current page to see the structure
  const page = await client.fetch(`*[_id == $pageId][0]`, { pageId })
  
  if (!page) {
    console.error('❌ Page not found')
    return
  }

  console.log('📄 Page found:', page.title)
  console.log('🔗 Slug:', page.slug?.current)
  console.log('\n📦 Content blocks analysis:\n')

  // Analyze each content block
  page.contentBlocks?.forEach((block: any, index: number) => {
    console.log(`\n${index + 1}. ${block._type}`)
    console.log('   Fields present:', Object.keys(block).filter(k => !k.startsWith('_')).join(', '))
    
    // Check for specific issues
    if (block._type === 'livePriceGraph') {
      console.log('   ✅ Required fields: title, apiRegion')
      console.log('   📋 Optional fields: subtitle, headerAlignment')
      if (!block.title) console.log('   ⚠️  Missing required field: title')
      if (!block.apiRegion) console.log('   ⚠️  Missing required field: apiRegion')
    }

    if (block._type === 'energyTipsSection') {
      console.log('   ✅ Required fields: none (all optional)')
      console.log('   📋 Default values: title, subtitle, showCategories, displayMode, etc.')
      console.log('   ⚠️  Current subtitle:', block.subtitle || 'undefined')
    }

    if (block._type === 'faqGroup') {
      console.log('   ✅ Required fields: title, faqItems (min 1)')
      if (!block.title) console.log('   ⚠️  Missing required field: title')
      if (!block.faqItems || block.faqItems.length === 0) {
        console.log('   ⚠️  Missing required field: faqItems (minimum 1 required)')
      } else {
        console.log(`   📋 FAQ items count: ${block.faqItems.length}`)
      }
    }

    if (block._type === 'infoCardsSection') {
      console.log('   ✅ Required fields: cards[].title')
      console.log('   📋 Optional fields: title, subtitle, headerAlignment, leadingText, columns')
      if (block.cards) {
        block.cards.forEach((card: any, cardIndex: number) => {
          if (!card.title) {
            console.log(`   ⚠️  Card ${cardIndex + 1} missing required field: title`)
          }
        })
      }
    }

    if (block._type === 'callToActionSection') {
      console.log('   ✅ Required fields: title, buttonText, buttonUrl')
      if (!block.title) console.log('   ⚠️  Missing required field: title')
      if (!block.buttonText) console.log('   ⚠️  Missing required field: buttonText')
      if (!block.buttonUrl) console.log('   ⚠️  Missing required field: buttonUrl')
    }
  })

  console.log('\n\n📊 Schema Validation Report Summary:')
  console.log('=====================================\n')

  console.log('1. livePriceGraph:')
  console.log('   - Required: title (string), apiRegion (string - "DK1" or "DK2")')
  console.log('   - Optional: subtitle (string), headerAlignment (string - "left", "center", "right")')
  console.log('   - Default headerAlignment: "center"\n')

  console.log('2. energyTipsSection:')
  console.log('   - ALL fields are optional with defaults')
  console.log('   - title default: "Praktiske energispare tips"')
  console.log('   - subtitle default: "Følg disse simple råd for at reducere dit energiforbrug"')
  console.log('   - showCategories default: all categories')
  console.log('   - displayMode default: "tabs"')
  console.log('   - Note: If subtitle is undefined, it might be explicitly set to null\n')

  console.log('3. faqGroup:')
  console.log('   - Required: title (string), faqItems (array, min 1 item)')
  console.log('   - faqItems must be inline objects, NOT references')
  console.log('   - Each faqItem needs: question, answer\n')

  console.log('4. infoCardsSection:')
  console.log('   - Required for each card: title (string)')
  console.log('   - Optional: description (array of blocks), icon, iconColor, bgColor')
  console.log('   - Section optional: title, subtitle, headerAlignment, leadingText, columns\n')

  console.log('5. callToActionSection:')
  console.log('   - Required: title (string), buttonText (string), buttonUrl (string)')
  console.log('   - No optional fields\n')

  // Use Agent Actions API with prompt
  console.log('\n🤖 Using Sanity Agent Actions API for deeper analysis...\n')

  try {
    const response = await fetch(`https://${client.config().projectId}.api.sanity.io/v2025-01-01/data/mutate/${client.config().dataset}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${client.config().token}`
      },
      body: JSON.stringify({
        mutations: [],
        actions: [{
          actionType: 'sanity.action.document.duplicate',
          draftId: `drafts.${pageId}`,
          publishedId: pageId,
          // Using prompt to analyze schema requirements
          prompt: `Analyze the schema validation requirements for this page. For each content block type, list:
          1. All required fields and their types
          2. All optional fields with their default values
          3. Any validation rules or constraints
          4. Common issues that cause validation errors
          
          Specifically explain:
          - Why energyTipsSection might show subtitle as undefined
          - What is the minimum number of FAQ items required
          - What fields are mandatory for infoCardsSection cards
          - All required fields for callToActionSection`
        }]
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('Agent Actions API Response:', JSON.stringify(result, null, 2))
    } else {
      console.log('Agent Actions API Error:', response.status, await response.text())
    }
  } catch (error) {
    console.log('Error calling Agent Actions API:', error)
  }
}

analyzeElprisberegnerPage().catch(console.error)