import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

// Helper to create text blocks
const createTextBlock = (text: string, style: string = 'normal') => ({
  _type: 'block',
  _key: Math.random().toString(36).substring(7),
  style,
  markDefs: [],
  children: [
    {
      _type: 'span',
      _key: Math.random().toString(36).substring(7),
      text,
      marks: [],
    },
  ],
})

const createBoldText = (text: string) => ({
  _type: 'block',
  _key: Math.random().toString(36).substring(7),
  style: 'normal',
  markDefs: [],
  children: [
    {
      _type: 'span',
      _key: Math.random().toString(36).substring(7),
      text,
      marks: ['strong'],
    },
  ],
})

async function fixHistoriskePriserComponents() {
  console.log('🔧 Fixing Historiske Priser component issues...\n')
  
  const pageId = 'qgCxJyBbKpvhb2oGYjlhjr'
  
  // Fetch current page
  const currentPage = await client.fetch(`*[_id == "${pageId}"][0]`)
  
  if (!currentPage) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('✅ Found page:', currentPage.title)
  console.log(`📊 Current blocks: ${currentPage.contentBlocks?.length || 0}`)
  
  // Filter out the problematic new component types and replace with pageSection
  const fixedBlocks = currentPage.contentBlocks.map((block: any) => {
    // Regional Comparison - convert to pageSection
    if (block._type === 'regionalComparison') {
      console.log('  - Converting regionalComparison to pageSection')
      return {
        _type: 'pageSection',
        _key: block._key,
        title: block.title || 'DK1 vs DK2: Regionale Forskelle',
        subtitle: block.subtitle || 'Danmark har to separate elprisområder med ofte betydelige prisforskelle',
        headerAlignment: 'left',
        content: [
          createBoldText('DK1 (Vestdanmark - Jylland/Fyn):'),
          createTextBlock('70% af Danmarks vindmøller står her, hvilket giver gennemsnitligt 5-15% lavere priser end DK2. Området har direkte forbindelse til Tyskland og Norge samt bedre mulighed for eksport ved overproduktion. Omfatter: Jylland, Fyn og Bornholm.'),
          createTextBlock(''),
          createBoldText('DK2 (Østdanmark - Sjælland/Øerne):'),
          createTextBlock('Tæt koblet til Sverige via Øresundskablet og påvirkes af svensk vandkraft og atomkraft. Højere priser ved lav vandstand i Sverige og større prisudsving ved ekstreme vejrforhold. Omfatter: Sjælland, Lolland-Falster og Møn.'),
        ],
        colorTheme: 'subtle'
      }
    }
    
    // Pricing Comparison - convert to pageSection with comparison table feel
    if (block._type === 'pricingComparison') {
      console.log('  - Converting pricingComparison to pageSection')
      return {
        _type: 'pageSection',
        _key: block._key,
        title: block.title || 'Fast vs Variabel Pris',
        subtitle: block.subtitle || 'Hvad passer bedst til dig?',
        headerAlignment: 'left',
        content: [
          createBoldText('Fast pris - Fordele:'),
          createTextBlock('• Forudsigelige elregninger hver måned'),
          createTextBlock('• Beskyttelse mod prisstigninger'),
          createTextBlock('• Nem budgettering'),
          createTextBlock('• Ro i sindet'),
          createTextBlock(''),
          createBoldText('Fast pris - Ulemper:'),
          createTextBlock('• Typisk 20-30% dyrere end variabel'),
          createTextBlock('• Går glip af lave priser'),
          createTextBlock('• Bindingsperioder'),
          createTextBlock(''),
          createBoldText('Variabel pris - Fordele:'),
          createTextBlock('• Følger markedspriserne direkte'),
          createTextBlock('• Billigst over tid (historisk 25-35% billigere)'),
          createTextBlock('• Ingen binding'),
          createTextBlock('• Udnyt negative priser'),
          createTextBlock(''),
          createBoldText('Variabel pris - Ulemper:'),
          createTextBlock('• Månedlige udsving'),
          createTextBlock('• Kræver større økonomisk buffer'),
          createTextBlock('• Højere priser om vinteren'),
        ],
        colorTheme: 'light'
      }
    }
    
    // Daily Price Timeline - convert to pageSection
    if (block._type === 'dailyPriceTimeline') {
      console.log('  - Converting dailyPriceTimeline to pageSection')
      return {
        _type: 'pageSection',
        _key: block._key,
        title: block.title || 'Hvornår er Strøm Billigst?',
        subtitle: block.subtitle || 'Daglige prisvariationer',
        headerAlignment: 'left',
        content: [
          createTextBlock('Elpriserne varierer betydeligt gennem døgnet baseret på forbrug og produktion:'),
          createTextBlock(''),
          createBoldText('🌙 Nat (00:00-06:00): Billigst'),
          createTextBlock('Lavest forbrug og ofte god vindproduktion. Gennemsnitligt 20-40% billigere end dagtimer.'),
          createTextBlock(''),
          createBoldText('☕ Morgen (06:00-09:00): Stigende priser'),
          createTextBlock('Forbruget stiger når folk vågner. Priserne stiger typisk 30-50% fra natteniveau.'),
          createTextBlock(''),
          createBoldText('☀️ Dag (09:00-17:00): Moderat'),
          createTextBlock('Solcelleproduktion holder priserne nede. Dog højt erhvervsforbrug.'),
          createTextBlock(''),
          createBoldText('🏠 Aften (17:00-22:00): Dyrest'),
          createTextBlock('Højeste forbrug når alle er hjemme. Priserne kan være 50-100% højere end nat.'),
          createTextBlock(''),
          createBoldText('💡 Spar penge ved at:'),
          createTextBlock('• Oplade elbil om natten'),
          createTextBlock('• Køre vaskemaskine og opvaskemaskine efter kl. 22'),
          createTextBlock('• Bruge tidsindstilling på større apparater'),
        ],
        colorTheme: 'accent'
      }
    }
    
    // Info Cards Section - convert to valueProposition
    if (block._type === 'infoCardsSection') {
      console.log('  - Converting infoCardsSection to valueProposition')
      
      // If it's the seasonal one, keep as featureList (which works)
      if (block.title?.includes('Sæson')) {
        return block // Keep as is since featureList works
      }
      
      // Otherwise convert to valueProposition
      return {
        _type: 'valueProposition',
        _key: block._key,
        title: block.title || 'Vigtige Informationer',
        items: (block.cards || []).map((card: any) => ({
          _type: 'valueItem',
          _key: card._key || Math.random().toString(36).substring(7),
          icon: card.icon || {
            _type: 'icon.manager',
            icon: 'info',
            metadata: {
              icon: 'info',
              iconName: 'Info',
              collectionId: 'lucide',
              collectionName: 'Lucide',
              url: 'https://lucide.dev/icons/info'
            }
          },
          title: card.title || 'Information',
          description: card.description || 'Beskrivelse'
        }))
      }
    }
    
    // Keep all other blocks as is
    return block
  })
  
  // Update the page
  try {
    console.log('\n💾 Saving fixed content...')
    
    await client
      .patch(pageId)
      .set({ contentBlocks: fixedBlocks })
      .commit()
    
    console.log('\n✅ Successfully fixed the page!')
    console.log('📝 Changes made:')
    console.log('   - regionalComparison → pageSection with structured content')
    console.log('   - pricingComparison → pageSection with pros/cons lists')
    console.log('   - dailyPriceTimeline → pageSection with time-based content')
    console.log('   - infoCardsSection → valueProposition (for non-seasonal)')
    
    console.log('\n🎯 Next steps:')
    console.log('   1. Refresh the page - it should now display without errors')
    console.log('   2. The Sanity schemas need to be rebuilt for the new components')
    console.log('   3. Run: cd ../sanityelpriscms && npm run build')
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  }
}

fixHistoriskePriserComponents().catch(console.error)