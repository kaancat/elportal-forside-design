import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

// Sanity client configuration
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

// Helper to generate unique keys
function generateKey() {
  return `key_${Math.random().toString(36).substr(2, 9)}`
}

async function updateEnergySavingTipsPage() {
  const pageId = 'I7aq0qw44tdJ3YglBpsP1G'
  
  try {
    // First, fetch the current page
    console.log('Fetching current page...')
    const currentPage = await client.getDocument(pageId)
    
    if (!currentPage) {
      throw new Error('Page not found')
    }

    console.log('Current page has', currentPage.contentBlocks?.length || 0, 'content blocks')

    // Find the positions of the API components that need updating
    let livePriceGraphIndex = -1
    let renewableEnergyForecastIndex = -1
    let co2EmissionsChartIndex = -1

    currentPage.contentBlocks?.forEach((block: any, index: number) => {
      if (block._type === 'livePriceGraph') {
        livePriceGraphIndex = index
        console.log(`Found livePriceGraph at index ${index}`)
      } else if (block._type === 'renewableEnergyForecast') {
        renewableEnergyForecastIndex = index
        console.log(`Found renewableEnergyForecast at index ${index}`)
      } else if (block._type === 'co2EmissionsChart') {
        co2EmissionsChartIndex = index
        console.log(`Found co2EmissionsChart at index ${index}`)
      }
    })

    // Create new content blocks array
    const updatedContentBlocks = [...currentPage.contentBlocks]

    // 1. Add SEO text BEFORE livePriceGraph (Block 8)
    if (livePriceGraphIndex > -1) {
      const livePriceGraphSeoText = {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Hold Øje med Elpriserne - Tid Dit Forbrug Optimalt',
        headerAlignment: 'left' as const,
        content: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'En af de mest effektive måder at spare penge på strøm er ved at bruge el, når den er billigst. Elprisen varierer time for time baseret på udbud og efterspørgsel, og forskellen kan være betydelig - særligt når vindmøllerne producerer meget strøm.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Med det interaktive prisdiagram nedenfor kan du:',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '⏰ ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Se præcist hvornår strømmen er billigst i dag og i morgen',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💡 ',
              },
              {
                _type: 'span',          
                _key: generateKey(),
                text: 'Planlægge energikrævende opgaver som vask og opladning til de billige timer',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '📊 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Sammenligne priser mellem DK1 (Jylland/Fyn) og DK2 (Sjælland)',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Tip: Download en app der sender push-beskeder når strømmen er billig, eller invester i smarte stikkontakter der automatisk tænder dine apparater på de rigtige tidspunkter.',
              }
            ]
          }
        ]
      }

      // Insert before livePriceGraph
      updatedContentBlocks.splice(livePriceGraphIndex, 0, livePriceGraphSeoText)
      livePriceGraphIndex++ // Update index after insertion
      renewableEnergyForecastIndex++
      co2EmissionsChartIndex++
    }

    // 2. Update livePriceGraph to have left alignment
    if (livePriceGraphIndex > -1) {
      updatedContentBlocks[livePriceGraphIndex] = {
        ...updatedContentBlocks[livePriceGraphIndex],
        headerAlignment: 'left'
      }
      console.log('Updated livePriceGraph alignment to left')
    }

    // 3. Add SEO text BEFORE renewableEnergyForecast (Block 10)
    if (renewableEnergyForecastIndex > -1) {
      const renewableEnergySeoText = {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Grøn Energi = Billigere Regninger',
        headerAlignment: 'left' as const,
        content: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Vidste du, at vedvarende energi som vind og sol nu er blandt de billigste energikilder i Danmark? Når vindmøllerne og solcellerne producerer meget strøm, falder elpriserne automatisk - og det kan du drage fordel af.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Prognosen nedenfor viser:',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '🌬️ ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Hvornår vindmøllerne producerer mest strøm',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '☀️ ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Hvilke timer solcellerne bidrager mest',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Hvornår du kan forvente de laveste elpriser',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Bonus: Ved at vælge et elselskab der leverer 100% grøn strøm, støtter du udbygget af endnu flere vindmøller og solceller - og dermed endnu billigere elpriser i fremtiden!',
              }
            ]
          }
        ]
      }

      // Insert before renewableEnergyForecast  
      updatedContentBlocks.splice(renewableEnergyForecastIndex, 0, renewableEnergySeoText)
      renewableEnergyForecastIndex++ // Update index after insertion
      co2EmissionsChartIndex++
    }

    // 4. Update renewableEnergyForecast to have left alignment
    if (renewableEnergyForecastIndex > -1) {
      updatedContentBlocks[renewableEnergyForecastIndex] = {
        ...updatedContentBlocks[renewableEnergyForecastIndex],
        headerAlignment: 'left'
      }
      console.log('Updated renewableEnergyForecast alignment to left')
    }

    // 5. Replace co2EmissionsChart with monthlyProductionChart + SEO text
    if (co2EmissionsChartIndex > -1) {
      // Add SEO text before the combined component
      const combinedDataSeoText = {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Forstå Danmarks Energimix - Miljø og Økonomi Går Hånd i Hånd',
        headerAlignment: 'left' as const,
        content: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Danmarks grønne omstilling påvirker både miljøet og din elregning. Jo mere ren energi vi producerer, jo mindre CO₂ udleder vi, og jo billigere bliver strømmen på lang sigt.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Diagrammet nedenfor viser sammenhængen mellem:',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '🏭 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'CO₂-intensitet: Hvor miljøvenlig din strøm er time for time',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '⚡ ',
              },
              {
                _type: 'span',   
                _key: generateKey(),
                text: 'Elproduktion: Hvor meget Danmarks kraftværker producerer',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '📈 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Prissammenhæng: Hvordan grøn energi påvirker elpriserne',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Når du bruger strøm i perioderne med lav CO₂-intensitet og høj vedvarende produktion, sparer du penge ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'og',
                marks: ['em']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' hjælper miljøet. Det er win-win!',
              }
            ]
          }
        ]
      }

      // Create the new monthlyProductionChart component
      const monthlyProductionChart = {
        _type: 'monthlyProductionChart',
        _key: generateKey(),
        heading: 'CO₂-Intensitet og Elproduktion i Realtid',
        headerAlignment: 'left' as const,
        description: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Følg Danmarks CO₂-udledning og elproduktion i realtid. Grønne perioder betyder billigere strøm og mindre miljøpåvirkning.',
              }
            ]
          }
        ],
        region: 'DK1' as const
      }

      // Replace co2EmissionsChart with SEO text + monthlyProductionChart
      updatedContentBlocks.splice(co2EmissionsChartIndex, 1, combinedDataSeoText, monthlyProductionChart)
      console.log('Replaced co2EmissionsChart with monthlyProductionChart + SEO text')
    }

    // 6. Ensure all other components have left alignment where applicable
    updatedContentBlocks.forEach((block: any, index: number) => {
      if (block._type === 'pageSection' || 
          block._type === 'livePriceGraph' || 
          block._type === 'renewableEnergyForecast' ||
          block._type === 'monthlyProductionChart' ||
          block._type === 'featureList' ||
          block._type === 'faqGroup' ||
          block._type === 'valueProposition') {
        if (!block.headerAlignment) {
          updatedContentBlocks[index] = {
            ...block,
            headerAlignment: 'left'
          }
        }
      }
    })

    // Update the page
    const updatedPage = {
      ...currentPage,
      contentBlocks: updatedContentBlocks
    }

    console.log('Updating page with', updatedContentBlocks.length, 'content blocks...')
    const result = await client.createOrReplace(updatedPage)
    
    console.log('✅ Successfully updated energibesparende-tips page:')
    console.log(`   - Added SEO text before livePriceGraph`)
    console.log(`   - Added SEO text before renewableEnergyForecast`) 
    console.log(`   - Replaced co2EmissionsChart with monthlyProductionChart + SEO text`)
    console.log(`   - Set all components to left alignment`)
    console.log(`   - Total blocks: ${updatedContentBlocks.length}`)
    console.log('\nView at: https://dinelportal.sanity.studio/structure/page;I7aq0qw44tdJ3YglBpsP1G')

  } catch (error) {
    console.error('❌ Error updating page:', error)
    throw error
  }
}

// Run the script
updateEnergySavingTipsPage()
.then(() => console.log('Script completed'))
.catch((error) => {
  console.error('Script failed:', error)
  process.exit(1)
})