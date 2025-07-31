import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to generate unique keys
function generateKey() {
  return Math.random().toString(36).substring(2, 15)
}

async function updateHomepageStructure() {
  try {
    console.log('Starting homepage structure update...')
    
    // Define the new homepage structure
    const homepageContent = {
      _id: '084518ec-2f79-48e0-b23c-add29ee83e6d',
      _type: 'homePage',
      title: 'DinElPortal - Danmarks førende elprissider',
      seoMetaTitle: 'Find den bedste el-aftale | Sammenlign elpriser | DinElPortal.dk',
      seoMetaDescription: 'Sammenlign elpriser og find den bedste el-aftale baseret på dit forbrug. Vi sammenligner priser, vilkår og grøn strøm fra de største selskaber.',
      contentBlocks: [
        // Section 1: Hero with Price Calculator
        {
          _type: 'heroWithCalculator',
          _key: generateKey(),
          headline: 'Find den bedste el-aftale på få minutter',
          subheadline: 'Vi sammenligner priser, vilkår og grøn strøm fra de største selskaber – baseret på dit forbrug.',
          calculatorTitle: 'Start din sammenligning',
          showLivePrice: true,
          showProviderComparison: true,
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Vi har gjort det enkelt med kun tre steps!',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        
        // Section 2: Multi-column (Value Proposition)
        {
          _type: 'valueProposition',
          _key: generateKey(),
          heading: 'Sammenlign elpriser uforpligtende og find ud af, om du kan få en bedre pris baseret på dit forventede forbrug.',
          subheading: 'Vi har gjort processen enkel, så du nemt kan navigere blandt de mange muligheder og sammenligninger.',
          valueItems: [] // Keep existing columns as is
        },
        
        // Section 3: Sådan fungerer ElPortal
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'Sådan fungerer ElPortal',
          headerAlignment: 'center',
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'ElPortal.dk henter data fra både offentlige og kommercielle kilder for at give dig det mest præcise overblik over elmarkedet. Du starter med at få vist dagens spotpriser og prognoser. Herefter kan du justere dit forventede elforbrug ved hjælp af vores interaktive værktøjer og se, hvilke elselskaber der samlet set tilbyder de bedste priser – inklusive abonnement og eventuelle gebyrer. Vores mål er at gøre det enkelt og gennemsigtigt for dig at finde den el-aftale, der passer bedst til dine behov.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        
        // Section 4: Price Example Table with Disclaimer
        {
          _type: 'priceExampleTable',
          _key: generateKey(),
          title: 'Eksempel hvad koster strøm?',
          leadingText: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Se eksempler på strømpriser og hvordan de beregnes.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ],
          example1_title: 'Eksempel 1',
          example1_kwh_price: 2.5,
          example1_subscription: 30,
          example2_title: 'Eksempel 2',
          example2_kwh_price: 3.0,
          example2_subscription: 25,
          note: 'Priserne er vejledende og kan variere. For de nyeste og mest præcise oplysninger, henvises der til den enkelte leverandørs hjemmeside. Har du brug for hurtig kontakt, er du velkommen til at skrive til os her.'
        },
        
        // Section 5: Elproduktion i Danmark
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'Elproduktion i Danmark',
          headerAlignment: 'left',
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Er du nysgerrig på, hvor strømmen i stikkontakten egentlig kommer fra?',
                  marks: ['strong']
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Fra vindmøller, der snurrer majestætisk langs de danske kyster, til solceller, der glimter på tagene i by og land – Danmarks energilandskab er i rivende udvikling. Den grønne omstilling er ikke længere bare en vision, men en reel bevægelse båret frem af både teknologi, politiske beslutninger og økonomiske fordele.',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'De seneste år har budt på markante forandringer i, hvordan vi producerer strøm – og det kan mærkes både i CO₂-regnskabet og på energiregningen. Politisk er der kommet et langt stærkere fokus på den vedvarende energi, og det bærer frugt: Europa som helhed har taget store skridt frem. I 2022 kom 23 % af EU\'s energiforbrug fra vedvarende kilder – en stigning fra 21,8 % året før – og målet er hele 42,5 % i 2030. Danmark er endda helt i front: hele 45,6 % af vores energiforbrug i 2022 kom fra grønne kilder.',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Det er en grøn bevægelse i medvind – og vi er kun lige begyndt.',
                  marks: ['strong']
                }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Lad os dykke ned i tallene og se nærmere på, hvad der har drevet den danske elproduktion det seneste år – og hvordan det europæiske ambitionsniveau er med til at sætte turbo på udviklingen.',
                  marks: []
                }
              ],
              markDefs: []
            },
            {
              _type: 'monthlyProductionChart',
              _key: generateKey(),
              title: 'Dansk elproduktion sidste 12 måneder',
              leadingText: [],
              description: 'Se hvordan Danmarks elproduktion fordeler sig mellem vedvarende energi og traditionelle kilder.',
              headerAlignment: 'center'
            }
          ]
        }
      ]
    }
    
    // Update the homepage
    const result = await client.createOrReplace(homepageContent)
    console.log('Homepage structure updated successfully!')
    console.log('Document ID:', result._id)
    
    // Note: Sections 6-11 will be added by the SEO agent
    console.log('\nNext steps:')
    console.log('1. Run the SEO agent to generate content for sections 6-11')
    console.log('2. The SEO agent should add:')
    console.log('   - Section 6: Elpriser Overview with ProviderList')
    console.log('   - Section 7: Elselskaber Overview')
    console.log('   - Section 8: Video Section')
    console.log('   - Section 9: Live Spot Prices')
    console.log('   - Section 10: Appliance Calculator')
    console.log('   - Section 11: Ladeboks (EV Charging)')
    
  } catch (error) {
    console.error('Error updating homepage:', error)
  }
}

// Run the script
updateHomepageStructure()