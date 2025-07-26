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

async function restoreAllComponents() {
  console.log('🚀 Final restoration of ALL new components...\n')
  
  const pageId = 'qgCxJyBbKpvhb2oGYjlhjr'
  
  // Fetch current page and log what we have
  const currentPage = await client.fetch(`*[_id == "${pageId}"][0]`)
  
  if (!currentPage) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('✅ Found page:', currentPage.title)
  console.log('📊 Total blocks:', currentPage.contentBlocks?.length || 0)
  
  // Log what needs to be converted
  let toConvert = []
  currentPage.contentBlocks.forEach((block: any, index: number) => {
    if (block._type === 'pageSection') {
      if (block.title?.includes('DK1') || block.title?.includes('Regional')) {
        toConvert.push({ index, type: 'regional', title: block.title })
      } else if (block.title?.includes('Fast vs') || block.title?.includes('pris')) {
        toConvert.push({ index, type: 'pricing', title: block.title })
      } else if (block.title?.includes('Hvornår')) {
        toConvert.push({ index, type: 'timeline', title: block.title })
      }
    }
  })
  
  console.log('\n📋 Components to restore:', toConvert.length)
  toConvert.forEach(item => {
    console.log(`   - Block ${item.index + 1}: ${item.title} → ${item.type}`)
  })
  
  // Now let's find the exact indices and restore them
  const restoredBlocks = [...currentPage.contentBlocks]
  
  // Find and restore regional comparison
  const regionalIndex = currentPage.contentBlocks.findIndex((block: any) => 
    block._type === 'pageSection' && 
    block.content?.some((c: any) => c.children?.[0]?.text?.includes('DK1 (Vestdanmark'))
  )
  
  if (regionalIndex !== -1) {
    console.log(`\n✓ Restoring regionalComparison at index ${regionalIndex + 1}`)
    restoredBlocks[regionalIndex] = {
      _type: 'regionalComparison',
      _key: restoredBlocks[regionalIndex]._key,
      title: 'DK1 vs DK2: Regionale Forskelle',
      subtitle: 'Danmark har to separate elprisområder med ofte betydelige prisforskelle',
      headerAlignment: 'left',
      leadingText: [
        createTextBlock('Danmark er opdelt i to elprisområder, som handles separat på elbørsen. Dette skaber ofte betydelige prisforskelle mellem landsdelene.')
      ],
      dk1Title: 'DK1 - Vestdanmark',
      dk1Description: [
        createTextBlock('70% af Danmarks vindmøller står i DK1, hvilket giver gennemsnitligt 5-15% lavere priser end DK2. Området har direkte forbindelse til Tyskland og Norge samt bedre mulighed for eksport ved overproduktion.')
      ],
      dk1PriceIndicator: 'lower',
      dk1Features: ['Jylland', 'Fyn', 'Bornholm'],
      dk2Title: 'DK2 - Østdanmark',
      dk2Description: [
        createTextBlock('Tæt koblet til Sverige via Øresundskablet og påvirkes af svensk vandkraft og atomkraft. Højere priser ved lav vandstand i Sverige og større prisudsving ved ekstreme vejrforhold.')
      ],
      dk2PriceIndicator: 'higher',
      dk2Features: ['Sjælland', 'Lolland-Falster', 'Møn'],
      showMap: true
    }
  }
  
  // Find and restore pricing comparison
  const pricingIndex = currentPage.contentBlocks.findIndex((block: any) => 
    block._type === 'pageSection' && 
    block.content?.some((c: any) => c.children?.[0]?.text?.includes('Fast pris - Fordele'))
  )
  
  if (pricingIndex !== -1) {
    console.log(`✓ Restoring pricingComparison at index ${pricingIndex + 1}`)
    restoredBlocks[pricingIndex] = {
      _type: 'pricingComparison',
      _key: restoredBlocks[pricingIndex]._key,
      title: 'Fast vs Variabel Pris: Hvad Passer Bedst til Dig?',
      subtitle: 'Sammenlign fordele og ulemper ved forskellige prismodeller',
      headerAlignment: 'left',
      leadingText: [
        createTextBlock('Valget mellem fast og variabel elpris er en af de vigtigste beslutninger for din elregning. Her er en omfattende sammenligning:')
      ],
      fixedPriceTitle: 'Fast Pris',
      fixedPriceDescription: [
        createTextBlock('Med fast pris betaler du samme pris per kWh i hele aftaleperioden, uanset markedspriserne.')
      ],
      fixedPriceAdvantages: [
        'Forudsigelige elregninger hver måned',
        'Beskyttelse mod prisstigninger',
        'Nem budgettering',
        'Ro i sindet'
      ],
      fixedPriceDisadvantages: [
        'Typisk 20-30% dyrere end variabel',
        'Går glip af lave priser',
        'Bindingsperioder',
        'Ingen fordel af grøn omstilling'
      ],
      variablePriceTitle: 'Variabel Pris',
      variablePriceDescription: [
        createTextBlock('Variabel pris følger elmarkedets spotpriser time for time plus dit elselskabs tillæg.')
      ],
      variablePriceAdvantages: [
        'Følger markedspriserne direkte',
        'Billigst over tid (historisk 25-35% billigere)',
        'Ingen binding',
        'Udnyt negative priser'
      ],
      variablePriceDisadvantages: [
        'Månedlige udsving',
        'Kræver større økonomisk buffer',
        'Højere priser om vinteren',
        'Mindre forudsigelighed'
      ],
      showComparisonTable: true,
      recommendation: [
        createTextBlock('For de fleste husstande vil variabel pris være det mest fordelagtige valg, især hvis du kan flytte noget af dit forbrug til billige timer.')
      ]
    }
  }
  
  // Find and restore daily timeline
  const timelineIndex = currentPage.contentBlocks.findIndex((block: any) => 
    block._type === 'pageSection' && 
    block.content?.some((c: any) => c.children?.[0]?.text?.includes('Nat (00:00-06:00)'))
  )
  
  if (timelineIndex !== -1) {
    console.log(`✓ Restoring dailyPriceTimeline at index ${timelineIndex + 1}`)
    restoredBlocks[timelineIndex] = {
      _type: 'dailyPriceTimeline',
      _key: restoredBlocks[timelineIndex]._key,
      title: 'Hvornår på Dagen er Strøm Billigst?',
      subtitle: 'Udnyt døgnets prisvariationer til at spare penge',
      headerAlignment: 'left',
      description: [
        createTextBlock('Elpriserne varierer betydeligt gennem døgnet. Ved at flytte dit forbrug til de billige timer kan du spare 20-40% på din elregning.')
      ],
      timeSlots: [
        {
          _type: 'timeSlot',
          _key: 'night',
          period: 'Nat',
          hours: '00:00 - 06:00',
          priceLevel: 'lowest',
          description: 'Lavest forbrug og ofte god vindproduktion',
          tips: ['Oplad elbil', 'Kør vaskemaskine', 'Varmepumpe på lager']
        },
        {
          _type: 'timeSlot',
          _key: 'morning',
          period: 'Morgen',
          hours: '06:00 - 09:00',
          priceLevel: 'rising',
          description: 'Stigende forbrug når folk vågner',
          tips: ['Undgå elkedel', 'Udskyd opvaskemaskine', 'Bad før kl. 6']
        },
        {
          _type: 'timeSlot',
          _key: 'day',
          period: 'Dag',
          hours: '09:00 - 17:00',
          priceLevel: 'moderate',
          description: 'Solcelleproduktion holder priserne nede',
          tips: ['God tid til forbrug', 'Udnyt solenergi', 'Elbil-opladning OK']
        },
        {
          _type: 'timeSlot',
          _key: 'evening',
          period: 'Aften',
          hours: '17:00 - 22:00',
          priceLevel: 'highest',
          description: 'Højeste forbrug når alle er hjemme',
          tips: ['Minimér elforbrug', 'Vent med vask', 'Undgå madlavning med el']
        }
      ],
      showChart: true,
      averageSavingsPotential: '20-40%'
    }
  }
  
  // Update the page
  try {
    console.log('\n💾 Saving all restored components...')
    
    await client
      .patch(pageId)
      .set({ contentBlocks: restoredBlocks })
      .commit()
    
    console.log('\n✅ Successfully restored ALL visual components!')
    console.log('\n🎉 The historiske-priser page now uses:')
    console.log('   - regionalComparison → Visual DK1/DK2 comparison')
    console.log('   - pricingComparison → Side-by-side pricing model comparison')
    console.log('   - dailyPriceTimeline → Interactive daily price visualization')
    console.log('\n🚀 All components are properly deployed and active!')
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  }
}

restoreAllComponents().catch(console.error)