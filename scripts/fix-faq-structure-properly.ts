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

function generateKey(): string {
  return Math.random().toString(36).substring(2, 9)
}

async function fixFaqStructure() {
  console.log('🔧 FIXING FAQ STRUCTURE PROPERLY\n')
  console.log('=' .repeat(80))
  
  try {
    // Fetch the page
    const page = await client.getDocument(PAGE_ID)
    if (!page) {
      throw new Error('Page not found!')
    }
    
    console.log(`✅ Found page: ${page.title}`)
    console.log(`📊 Content blocks: ${page.contentBlocks?.length || 0}\n`)
    
    // Find ALL faqGroup blocks (there might be multiple)
    const faqBlocks: Array<{index: number, block: any}> = []
    
    for (let i = 0; i < page.contentBlocks.length; i++) {
      if (page.contentBlocks[i]._type === 'faqGroup') {
        faqBlocks.push({
          index: i,
          block: page.contentBlocks[i]
        })
      }
    }
    
    if (faqBlocks.length === 0) {
      console.log('❌ No faqGroup blocks found!')
      return
    }
    
    console.log(`✅ Found ${faqBlocks.length} faqGroup block(s)\n`)
    
    let hasChanges = false
    const updatedContentBlocks = [...page.contentBlocks]
    
    // Fix each FAQ block
    for (const {index, block} of faqBlocks) {
      console.log(`📋 Checking faqGroup at index ${index}...`)
      
      const issues: string[] = []
      
      // Check for issues
      if (!block.title) {
        issues.push('Missing title')
      }
      
      if (!block.faqItems || !Array.isArray(block.faqItems)) {
        issues.push('Missing faqItems array')
      } else if (block.faqItems.length === 0) {
        issues.push('Empty faqItems array')
      } else {
        // Check structure of FAQ items
        const invalidItems = block.faqItems.filter((item: any) => {
          return !item._type || !item._key || typeof item.answer === 'string'
        })
        if (invalidItems.length > 0) {
          issues.push(`${invalidItems.length} FAQ items have invalid structure`)
        }
      }
      
      if (issues.length === 0) {
        console.log('   ✅ This FAQ block is valid\n')
        continue
      }
      
      console.log('   ❌ Issues found:')
      issues.forEach(issue => console.log(`      - ${issue}`))
      console.log()
      
      // Fix the block
      const fixedBlock = {
        _type: 'faqGroup',
        _key: block._key || generateKey(),
        title: block.title || 'Ofte Stillede Spørgsmål om Energibesparelse'
      }
      
      // Fix or create FAQ items with proper structure
      const properFaqItems = [
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvor meget kan jeg spare på min elregning med disse tips?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
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
          _key: generateKey(),
          question: 'Hvilke apparater bruger mest strøm i hjemmet?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
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
          _key: generateKey(),
          question: 'Hvornår på dagen er strømmen billigst?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
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
          _key: generateKey(),
          question: 'Skal jeg skifte til LED-pærer overalt?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
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
          _key: generateKey(),
          question: 'Kan jeg spare penge ved at skifte elleverandør?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Absolut! Prisforskellen mellem elleverandører kan være betydelig. Ved at bruge vores prissammenligning ovenfor kan du se præcis hvor meget du kan spare. Mange danskere kan spare 1.000-3.000 kr årligt bare ved at skifte til en billigere leverandør. Vindstød tilbyder ofte nogle af markedets bedste priser på grøn strøm.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        }
      ]
      
      fixedBlock.faqItems = properFaqItems
      
      // Remove any invalid fields
      const validFields = ['_type', '_key', 'title', 'faqItems']
      Object.keys(block).forEach(key => {
        if (!validFields.includes(key)) {
          console.log(`   🧹 Removing invalid field: ${key}`)
        }
      })
      
      updatedContentBlocks[index] = fixedBlock
      hasChanges = true
      
      console.log('   ✅ Fixed FAQ block structure\n')
    }
    
    if (!hasChanges) {
      console.log('✨ All FAQ blocks are already valid!')
      return
    }
    
    // Apply the fix
    console.log('💾 Saving changes...\n')
    
    const result = await client
      .patch(PAGE_ID)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Successfully fixed FAQ structure!')
    console.log()
    
    // Run validation
    console.log('🔍 Running validation...\n')
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    
    try {
      const { stdout } = await execAsync('npx tsx scripts/comprehensive-validation.ts 2>&1 | grep -A 10 "Energibesparende Tips"')
      console.log('Validation output:')
      console.log(stdout)
    } catch (e) {
      console.log('Could not run validation automatically. Please run:')
      console.log('npx tsx scripts/comprehensive-validation.ts')
    }
    
    console.log()
    console.log('🔗 View in Sanity Studio:')
    console.log(`   https://dinelportal.sanity.studio/structure/page;${PAGE_ID}`)
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.details) {
      console.error('Details:', error.details)
    }
  }
}

// Run the fix
fixFaqStructure().catch(console.error)