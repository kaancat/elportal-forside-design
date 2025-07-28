import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import crypto from 'crypto'

// Load environment variables
dotenv.config()

// Generate unique keys for content blocks
const generateKey = () => crypto.randomBytes(8).toString('hex')

// Initialize Sanity client
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to create Portable Text blocks
function createTextBlock(text: string, style: string = 'normal'): any {
  return {
    _type: 'block',
    _key: generateKey(),
    style,
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text,
        marks: []
      }
    ],
    markDefs: []
  }
}

async function fixSchemaErrors() {
  try {
    console.log('🔍 Fetching elprisberegner page...')
    
    // Fetch the current page
    const page = await client.getDocument('f7ecf92783e749828f7281a6e5829d52')
    
    if (!page) {
      throw new Error('Page not found')
    }
    
    console.log('📋 Fixing schema validation errors...')
    
    // Fix content blocks with schema errors
    const fixedContentBlocks = page.contentBlocks.map((block: any) => {
      // Fix livePriceGraph - change 'region' to 'apiRegion'
      if (block._type === 'livePriceGraph') {
        console.log('🔧 Fixing livePriceGraph...')
        return {
          _type: 'livePriceGraph',
          _key: block._key,
          title: block.title || 'Elpriser Lige Nu - Døgnets Timepriser',
          subtitle: block.subtitle || 'Se hvordan elpriserne udvikler sig time for time',
          apiRegion: 'DK2', // Required field - was using 'region'
          headerAlignment: block.headerAlignment || 'left'
        }
      }
      
      // Fix energyTipsSection - ensure proper structure
      if (block._type === 'energyTipsSection') {
        console.log('🔧 Fixing energyTipsSection...')
        return {
          _type: 'energyTipsSection',
          _key: block._key,
          title: block.title || 'Spar På Elregningen - Praktiske Råd',
          subtitle: 'Sådan udnytter du elprisberegneren til at spare penge',
          showSavingsCalculator: true,
          headerAlignment: 'left'
        }
      }
      
      // Fix faqGroup - change 'faqs' to 'faqItems'
      if (block._type === 'faqGroup') {
        console.log('🔧 Fixing faqGroup...')
        const faqItems = [
          {
            _type: 'faqItem',
            _key: generateKey(),
            question: 'Hvor præcis er elprisberegneren?',
            answer: [
              createTextBlock('Vores elprisberegner er meget præcis, da den bruger realtidsdata fra flere kilder:'),
              createTextBlock('• Spotpriser opdateres hver time direkte fra Nord Pool'),
              createTextBlock('• Elselskabernes tillæg hentes dagligt fra deres hjemmesider'),
              createTextBlock('• Nettariffer og afgifter opdateres når de ændres'),
              createTextBlock('• Alle beregninger inkluderer moms og samtlige afgifter'),
              createTextBlock('Den eneste usikkerhed er dit fremtidige forbrug, som du selv estimerer.')
            ]
          },
          {
            _type: 'faqItem',
            _key: generateKey(),
            question: 'Hvilke omkostninger er inkluderet i beregningen?',
            answer: [
              createTextBlock('Elprisberegneren inkluderer ALLE omkostninger:'),
              createTextBlock('• Spotpris (rå elpris fra børsen)'),
              createTextBlock('• Elselskabets tillæg'),
              createTextBlock('• Nettarif til dit lokale netselskab'),
              createTextBlock('• Systemtarif til Energinet (19 øre/kWh)'),
              createTextBlock('• Elafgift til staten (90,4 øre/kWh)'),
              createTextBlock('• 25% moms på hele beløbet'),
              createTextBlock('Du får altså den faktiske pris du kommer til at betale per kWh.')
            ]
          },
          {
            _type: 'faqItem',
            _key: generateKey(),
            question: 'Hvordan finder jeg mit årlige elforbrug?',
            answer: [
              createTextBlock('Dit årlige elforbrug finder du lettest på følgende måder:'),
              createTextBlock('• Kig på din seneste årsopgørelse fra elselskabet'),
              createTextBlock('• Log ind på dit elselskabs hjemmeside eller app'),
              createTextBlock('• Kontakt dit elselskab telefonisk'),
              createTextBlock('• Check forbruget på din elmåler og gang med 12'),
              createTextBlock('Gennemsnitligt forbrug: Lejlighed 2.000 kWh, Rækkehus 3.000 kWh, Villa 4.000 kWh')
            ]
          },
          {
            _type: 'faqItem',
            _key: generateKey(),
            question: 'Kan jeg stole på sammenligningen af elselskaber?',
            answer: [
              createTextBlock('Ja, vores sammenligning er 100% uvildig og objektiv:'),
              createTextBlock('• Vi viser ALLE elselskaber på markedet'),
              createTextBlock('• Priser hentes automatisk og kan ikke manipuleres'),
              createTextBlock('• Samme beregningsmetode bruges for alle selskaber'),
              createTextBlock('• Vi modtager ingen kommission for at fremhæve bestemte selskaber'),
              createTextBlock('• Sorteringen er altid efter laveste pris først'),
              createTextBlock('Du kan derfor trygt bruge beregneren til at finde det billigste elselskab.')
            ]
          },
          {
            _type: 'faqItem',
            _key: generateKey(),
            question: 'Hvorfor varierer elpriserne så meget?',
            answer: [
              createTextBlock('Elpriserne varierer af flere årsager:'),
              createTextBlock('• Udbud og efterspørgsel ændrer sig konstant'),
              createTextBlock('• Vindkraft producerer forskelligt alt efter vejret'),
              createTextBlock('• Forbruget er højest morgen og aften'),
              createTextBlock('• Import/eksport påvirker priserne'),
              createTextBlock('• Forskellige elselskaber har forskellige tillæg'),
              createTextBlock('Brug beregneren til at se de aktuelle prisudsving og find de billigste tidspunkter.')
            ]
          }
        ]
        
        return {
          _type: 'faqGroup',
          _key: block._key,
          title: block.title || 'Ofte Stillede Spørgsmål om Elprisberegneren',
          faqItems: faqItems // Changed from 'faqs' to 'faqItems'
        }
      }
      
      // Fix infoCardsSection - ensure all cards have required fields
      if (block._type === 'infoCardsSection') {
        console.log('🔧 Fixing infoCardsSection...')
        return {
          _type: 'infoCardsSection',
          _key: block._key,
          title: block.title || 'Vigtig Information om Elpriser',
          cards: [
            {
              _type: 'infoCard',
              _key: generateKey(),
              title: 'Grøn strøm koster det samme',
              description: 'Vidste du at grøn strøm ikke behøver koste mere? Mange elselskaber tilbyder 100% vedvarende energi til samme pris som almindelig strøm.',
              icon: {
                _type: 'icon.manager',
                name: 'Leaf',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>'
              },
              linkText: 'Se grønne elselskaber',
              linkUrl: '/groen-energi'
            },
            {
              _type: 'infoCard',
              _key: generateKey(),
              title: 'Skift elselskab på 5 minutter',
              description: 'Det er nemt og gratis at skifte elselskab. Dit nye selskab klarer alt det praktiske, og du mister aldrig strømmen.',
              icon: {
                _type: 'icon.manager',
                name: 'ArrowRightLeft',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"></path><path d="M20 7H4"></path><path d="m8 21-4-4 4-4"></path><path d="M4 17h16"></path></svg>'
              },
              linkText: 'Læs skifteguide',
              linkUrl: '/skift-elselskab'
            },
            {
              _type: 'infoCard',
              _key: generateKey(),
              title: 'Tjek priser hver 3. måned',
              description: 'Elpriserne ændrer sig konstant. Ved at tjekke priser kvartalsvis sikrer du dig altid det bedste tilbud.',
              icon: {
                _type: 'icon.manager',
                name: 'Calendar',
                provider: 'lucide',
                svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
              }
            }
          ]
        }
      }
      
      // Fix callToActionSection - use correct field names
      if (block._type === 'callToActionSection') {
        console.log('🔧 Fixing callToActionSection...')
        return {
          _type: 'callToActionSection',
          _key: block._key,
          title: block.title || 'Start Din Besparelse Nu',
          description: 'Brug elprisberegneren til at finde det billigste elselskab og start din besparelse med det samme.',
          buttonText: 'Beregn Din Elpris Nu',
          buttonUrl: '#beregner'
        }
      }
      
      // Return other blocks unchanged
      return block
    })
    
    // Update the page
    console.log('\n📝 Updating page with fixed schema...')
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: fixedContentBlocks })
      .commit()
    
    console.log('✅ All schema errors fixed successfully!')
    
    // Log the updated components
    console.log('\n📋 Fixed components:')
    console.log('- livePriceGraph: region → apiRegion')
    console.log('- energyTipsSection: added subtitle')
    console.log('- faqGroup: faqs → faqItems with 5 items')
    console.log('- infoCardsSection: ensured all cards have required fields')
    console.log('- callToActionSection: primaryCta/secondaryCta → buttonText/buttonUrl')
    
  } catch (error) {
    console.error('❌ Error fixing schema errors:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    process.exit(1)
  }
}

// Run the fix
fixSchemaErrors()