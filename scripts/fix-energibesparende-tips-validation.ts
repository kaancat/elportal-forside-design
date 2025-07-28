import { mutationClient, createTextBlock } from '../src/lib/sanity-helpers'
import dotenv from 'dotenv'

dotenv.config()

const PAGE_ID = 'I7aq0qw44tdJ3YglBpsP1G'

function generateUniqueKey(): string {
  return Math.random().toString(36).substr(2, 9)
}

function createDeclarationProductionBlock() {
  return {
    _type: 'declarationProduction',
    _key: generateUniqueKey(),
    title: 'Elproduktion og CO₂-udledning',
    subtitle: 'Realtids opdeling af elproduktion og CO₂-intensitet',
    leadingText: [
      createTextBlock('Se hvordan Danmarks elproduktion fordeler sig på forskellige energikilder og følg CO₂-intensiteten i realtid. Denne graf viser både produktion og miljøpåvirkning time for time.')
    ],
    showProductionBreakdown: true,
    showCO2Intensity: true,
    showRenewableShare: true,
    defaultView: '24h',
    headerAlignment: 'left'
  }
}

async function fixValidationErrors() {
  console.log('🔧 Fixing validation errors and replacing components for page:', PAGE_ID)
  console.log('=' .repeat(80))
  
  try {
    // Fetch the page document
    const page = await mutationClient.fetch(`*[_id == "${PAGE_ID}"][0]`)
    
    if (!page) {
      console.error('❌ Page not found')
      return
    }
    
    console.log('✅ Page found:', page.title)
    console.log('📊 Current content blocks:', page.contentBlocks?.length || 0)
    
    // Find monthlyProductionChart
    const monthlyProductionIndex = page.contentBlocks?.findIndex(
      (block: any) => block._type === 'monthlyProductionChart'
    )
    
    if (monthlyProductionIndex !== -1) {
      console.log(`\n🔄 Found monthlyProductionChart at index ${monthlyProductionIndex}, replacing with declarationProduction...`)
      page.contentBlocks[monthlyProductionIndex] = createDeclarationProductionBlock()
    } else {
      console.log('\n➕ monthlyProductionChart not found, adding declarationProduction...')
      if (!page.contentBlocks) page.contentBlocks = []
      page.contentBlocks.push(createDeclarationProductionBlock())
    }
    
    // Fix validation issues by ensuring all blocks have required fields
    console.log('\n🔧 Fixing common validation issues...')
    
    if (page.contentBlocks) {
      page.contentBlocks = page.contentBlocks.map((block: any, index: number) => {
        // Ensure all blocks have _key
        if (!block._key) {
          console.log(`  ➕ Adding missing _key to block ${index} (${block._type})`)
          block._key = generateUniqueKey()
        }
        
        // Fix headerAlignment for components that support it
        if (['hero', 'pageSection', 'valueProposition', 'featureList', 'declarationProduction'].includes(block._type)) {
          if (!block.headerAlignment) {
            console.log(`  ➕ Adding headerAlignment to ${block._type} block`)
            block.headerAlignment = 'left'
          }
        }
        
        // Fix rich text fields
        if (block.leadingText && Array.isArray(block.leadingText)) {
          block.leadingText = block.leadingText.map((textBlock: any) => {
            if (textBlock._type === 'block' && !textBlock._key) {
              textBlock._key = generateUniqueKey()
            }
            if (textBlock.children) {
              textBlock.children = textBlock.children.map((child: any) => {
                if (!child._key) {
                  child._key = generateUniqueKey()
                }
                return child
              })
            }
            return textBlock
          })
        }
        
        return block
      })
    }
    
    // Ensure required page fields
    if (!page.seoMetaTitle) {
      console.log('  ➕ Adding missing seoMetaTitle')
      page.seoMetaTitle = page.title || 'Energibesparende Tips'
    }
    
    if (!page.seoMetaDescription) {
      console.log('  ➕ Adding missing seoMetaDescription')
      page.seoMetaDescription = 'Lær hvordan du kan spare på din elregning med praktiske energibesparende tips og tricks.'
    }
    
    if (!page.seoKeywords || page.seoKeywords.length === 0) {
      console.log('  ➕ Adding missing seoKeywords')
      page.seoKeywords = ['energibesparende tips', 'spar på strøm', 'elregning', 'energi']
    }
    
    if (!page.slug || !page.slug.current) {
      console.log('  ➕ Adding missing slug')
      page.slug = {
        _type: 'slug',
        current: 'energibesparende-tips'
      }
    }
    
    
    // Update the page
    console.log('\n💾 Saving changes to Sanity...')
    const result = await mutationClient
      .createOrReplace({
        _id: PAGE_ID,
        _type: 'page',
        ...page
      })
    
    console.log('✅ Page updated successfully!')
    
    // Verify the changes
    console.log('\n🔍 Verifying changes...')
    const verification = await mutationClient.fetch(`
      *[_id == "${PAGE_ID}"][0]{
        title,
        "blockCount": count(contentBlocks),
        "hasDeclarationProduction": count(contentBlocks[_type == "declarationProduction"]) > 0,
        "hasMonthlyProduction": count(contentBlocks[_type == "monthlyProductionChart"]) > 0
      }
    `)
    
    console.log('\n📊 Verification results:')
    console.log(`  - Page: ${verification.title}`)
    console.log(`  - Total blocks: ${verification.blockCount}`)
    console.log(`  - Has declarationProduction: ${verification.hasDeclarationProduction}`)
    console.log(`  - Has monthlyProductionChart: ${verification.hasMonthlyProduction}`)
    
    if (verification.hasDeclarationProduction && !verification.hasMonthlyProduction) {
      console.log('\n🎉 Success! Component replacement completed successfully!')
      console.log('   ✅ declarationProduction shows both CO₂ AND electricity production data')
    } else if (verification.hasDeclarationProduction) {
      console.log('\n⚠️  declarationProduction added, but monthlyProductionChart may still exist')
    }
    
    console.log('\n🔗 View updated page:')
    console.log(`   https://dinelportal.sanity.studio/structure/page;${PAGE_ID}`)
    
  } catch (error) {
    console.error('❌ Error fixing validation:', error)
    throw error
  }
}

// Run the fix
fixValidationErrors()