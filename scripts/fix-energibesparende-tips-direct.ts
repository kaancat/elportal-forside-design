import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

// Create Sanity client
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

const PAGE_ID = 'qgCxJyBbKpvhb2oGYpYKuf'

async function fixFaqGroupDirectly() {
  console.log('🔧 FIXING FAQ GROUP VALIDATION ERRORS DIRECTLY\n')
  console.log('=' .repeat(80))
  
  try {
    // Fetch the page document
    console.log('📄 Fetching page document...\n')
    
    const page = await client.getDocument(PAGE_ID)
    if (!page) {
      throw new Error('Page not found!')
    }
    
    console.log(`✅ Found page: ${page.title}`)
    console.log(`📊 Content blocks: ${page.contentBlocks?.length || 0}\n`)
    
    // Find the faqGroup block
    let faqGroupIndex = -1
    let faqBlock: any = null
    
    for (let i = 0; i < page.contentBlocks.length; i++) {
      if (page.contentBlocks[i]._type === 'faqGroup') {
        faqGroupIndex = i
        faqBlock = page.contentBlocks[i]
        break
      }
    }
    
    if (faqGroupIndex === -1) {
      console.log('❌ No faqGroup block found in the page!')
      return
    }
    
    console.log(`✅ Found faqGroup block at index ${faqGroupIndex}`)
    console.log('Current structure:')
    console.log(JSON.stringify(faqBlock, null, 2))
    console.log()
    
    // Check what's wrong with the FAQ block
    const issues: string[] = []
    if (!faqBlock.title) {
      issues.push('Missing title field')
    }
    if (!faqBlock.faqItems || !Array.isArray(faqBlock.faqItems)) {
      issues.push('Missing or invalid faqItems array')
    } else if (faqBlock.faqItems.length === 0) {
      issues.push('faqItems array is empty')
    }
    
    if (issues.length === 0) {
      console.log('✨ FAQ block appears to be valid already!')
      return
    }
    
    console.log('🔍 Issues found:')
    issues.forEach(issue => console.log(`   - ${issue}`))
    console.log()
    
    // Create the fixed FAQ block
    console.log('🔧 Creating fixed FAQ block...\n')
    
    const fixedFaqBlock = {
      ...faqBlock,
      _type: 'faqGroup',
      _key: faqBlock._key || `faq-group-${Date.now()}`,
      title: faqBlock.title || 'Ofte Stillede Spørgsmål om Energibesparelse',
      faqItems: [
        {
          _type: 'faqItem',
          _key: `faq-item-${Date.now()}-1`,
          question: 'Hvor meget kan jeg spare på min elregning med disse tips?',
          answer: [
            {
              _type: 'block',
              _key: `block-${Date.now()}-1`,
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: `span-${Date.now()}-1`,
                  text: 'Med vores energibesparende tips kan en gennemsnitlig husstand spare mellem 2.000-5.000 kr årligt på elregningen. De største besparelser kommer fra at reducere standby-forbrug (op til 1.350 kr/år), optimere brugen af varmepumpe og opvarmning (20-30% besparelse), og skifte til energieffektive apparater.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: `faq-item-${Date.now()}-2`,
          question: 'Hvilke apparater bruger mest strøm i hjemmet?',
          answer: [
            {
              _type: 'block',
              _key: `block-${Date.now()}-2`,
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: `span-${Date.now()}-2`,
                  text: 'De mest strømkrævende apparater er typisk: Varmepumpe/elvarme (30-50% af forbruget), varmtvandsbeholder (15-25%), køleskab og fryser (10-15%), vaskemaskine og tørretumbler (5-10%), samt underholdningselektronik på standby (op til 12%). Ved at optimere brugen af disse kan du opnå de største besparelser.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: `faq-item-${Date.now()}-3`,
          question: 'Hvornår på dagen er strømmen billigst?',
          answer: [
            {
              _type: 'block',
              _key: `block-${Date.now()}-3`,
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: `span-${Date.now()}-3`,
                  text: 'Strømmen er typisk billigst om natten (kl. 00-06) og i weekenden. De dyreste timer er normalt hverdage kl. 17-21, hvor efterspørgslen er højest. Ved at flytte energikrævende opgaver som vask og opvask til billige timer kan du spare 20-40% på disse aktiviteter. Brug vores live prisgraf ovenfor for at se dagens priser.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: `faq-item-${Date.now()}-4`,
          question: 'Skal jeg skifte til LED-pærer overalt?',
          answer: [
            {
              _type: 'block',
              _key: `block-${Date.now()}-4`,
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: `span-${Date.now()}-4`,
                  text: 'Ja, LED-pærer bruger 75-80% mindre strøm end traditionelle glødepærer og holder 15-25 gange længere. En LED-pære kan spare dig 50-100 kr årligt per pære. Start med de rum hvor lyset er tændt mest (stue, køkken, udendørs), og udskift gradvist resten. Investeringen er typisk tjent hjem på 1-2 år.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: `faq-item-${Date.now()}-5`,
          question: 'Kan jeg spare penge ved at skifte elleverandør?',
          answer: [
            {
              _type: 'block',
              _key: `block-${Date.now()}-5`,
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: `span-${Date.now()}-5`,
                  text: 'Absolut! Prisforskellen mellem elleverandører kan være betydelig. Ved at bruge vores prissammenligning ovenfor kan du se præcis hvor meget du kan spare. Mange danskere kan spare 1.000-3.000 kr årligt bare ved at skifte til en billigere leverandør. Vindstød tilbyder ofte nogle af markedets bedste priser på grøn strøm.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        }
      ]
    }
    
    // Remove any wrong field names
    if ('faqs' in fixedFaqBlock) {
      delete (fixedFaqBlock as any).faqs
    }
    
    console.log('Fixed FAQ block preview:')
    console.log(`Title: "${fixedFaqBlock.title}"`)
    console.log(`FAQ Items: ${fixedFaqBlock.faqItems.length} questions`)
    fixedFaqBlock.faqItems.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.question}`)
    })
    console.log()
    
    // Update the document
    console.log('💾 Updating the document...\n')
    
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[faqGroupIndex] = fixedFaqBlock
    
    const result = await client
      .patch(PAGE_ID)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Successfully fixed FAQ validation errors!')
    console.log()
    
    // Verify the fix
    console.log('🔍 Verifying the fix...\n')
    
    const updatedPage = await client.getDocument(PAGE_ID)
    const updatedFaqBlock = updatedPage.contentBlocks[faqGroupIndex]
    
    if (updatedFaqBlock.title && updatedFaqBlock.faqItems && updatedFaqBlock.faqItems.length > 0) {
      console.log('✨ Verification successful!')
      console.log(`   - Title: "${updatedFaqBlock.title}"`)
      console.log(`   - FAQ Items: ${updatedFaqBlock.faqItems.length} questions`)
      console.log()
      console.log('🎯 Next steps:')
      console.log('1. Run comprehensive-validation.ts to confirm all errors are fixed')
      console.log('2. Check the page in Sanity Studio')
      console.log('3. Verify the FAQ section renders correctly on the frontend')
      console.log()
      console.log('🔗 View in Sanity Studio:')
      console.log(`   https://dinelportal.sanity.studio/structure/page;${PAGE_ID}`)
    } else {
      console.log('⚠️  Fix may not have been applied correctly. Please check manually.')
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
  }
}

// Run the fix
fixFaqGroupDirectly().catch(console.error)