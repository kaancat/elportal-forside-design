import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function replaceSections() {
  console.log('Replacing overly defensive security sections with better content...')

  // Get current page
  const currentPage = await client.fetch('*[_id == "f5IMbE4BjT3OYPNFYb8v2Z"][0]')
  
  if (!currentPage) {
    console.error('Page not found!')
    return
  }

  // Update content blocks - replace the two security sections with better content
  const updatedContentBlocks = currentPage.contentBlocks.map((block: any) => {
    // Replace the "Er Dine Data Sikre med Eloverblik?" section
    if (block._key === 'security-section') {
      return {
        _type: 'pageSection',
        _key: 'smart-consumption',
        title: 'Smart Elforbrug - Brug Strøm Når Det Er Billigst',
        headerAlignment: 'left',
        content: [
          {
            _type: 'block',
            _key: 'smart-1',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Med Forbrug Tracker får du indsigt i præcis hvornår du bruger strøm, og vigtigst af alt - hvornår det er dyrest. Danske elpriser kan variere med over 500% gennem døgnet, så timing betyder alt for din elregning.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'smart-2',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'De Dyreste Timer',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'smart-3',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Klokken 17-20 på hverdage er typisk de dyreste timer. Her kommer alle hjem fra arbejde, tænder for komfuret, sætter vaskemaskinen i gang og lader elbilen. Prisen kan nemt være 3-4 kr/kWh i disse timer. En enkelt opvask eller vask i disse timer kan koste 5-10 kr mere end hvis du venter til senere.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'smart-4',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'De Billigste Timer',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'smart-5',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Natten mellem kl. 2-5 og weekender med meget vind er ofte de billigste perioder. Prisen kan faktisk blive negativ, hvilket betyder at du får penge for at bruge strøm! Dette sker når vindmøllerne producerer mere end Danmark kan bruge.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'smart-6',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Automatisk Styring',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'smart-7',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Moderne hvidevarer har ofte tidsforsinkelse, så du kan fylde vaskemaskinen om aftenen og indstille den til at starte kl. 3 om natten. Elbiler kan programmeres til at lade når strømmen er billigst. Smart home stikkontakter kan automatisk tænde og slukke baseret på elpriserne.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'smart-8',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Typiske Besparelser',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'smart-9',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'En familie der flytter 30% af deres forbrug fra spidsbelastning til nattetimer kan spare 2.000-4.000 kr årligt. Med elbil kan besparelsen være endnu større - op til 8.000 kr årligt ved smart opladning.',
                marks: []
              }
            ]
          }
        ],
        settings: {
          _type: 'sectionSettings',
          backgroundColor: 'white',
          textColor: 'dark',
          paddingTop: 'large',
          paddingBottom: 'large'
        }
      }
    }
    
    // Replace the "Sådan Fungerer Eloverblik Integration" section
    if (block._key === 'how-eloverblik-works') {
      return {
        _type: 'pageSection',
        _key: 'appliance-consumption',
        title: 'Hvad Bruger Dine Apparater?',
        headerAlignment: 'left',
        content: [
          {
            _type: 'block',
            _key: 'app-1',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Når du kan se dit timeforbrug, bliver det tydeligt hvilke apparater der koster mest. Her er en guide til de største strømslugere i danske hjem.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'app-2',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Varmepumpe / Elvarme',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'app-3',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'En luft-til-luft varmepumpe bruger 3.000-6.000 kWh årligt. Ved en gennemsnitspris på 2,50 kr/kWh koster det 7.500-15.000 kr om året. Sænk temperaturen med 1 grad og spar 5-7% på varmeregningen. Sluk varmepumpen i rum du ikke bruger.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'app-4',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Elbil',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'app-5',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'En elbil der kører 15.000 km årligt bruger cirka 2.500-3.500 kWh. Det svarer til 6.250-8.750 kr ved normal opladning. Smart opladning om natten kan halvere denne udgift. En enkelt hurtigopladning kan koste 100-200 kr.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'app-6',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Tørretumbler',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'app-7',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'En tørretumbler bruger 2-4 kWh per vask, hvilket koster 5-10 kr. Med 3 vaske om ugen bliver det 780-1.560 kr årligt. En varmepumpetørretumbler bruger kun halvdelen og tjener sig hjem på 3-4 år.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'app-8',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Køleskab og Fryser',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'app-9',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Et moderne køleskab bruger 100-200 kWh årligt (250-500 kr), mens en fryser bruger 200-350 kWh (500-875 kr). Gamle modeller kan bruge det dobbelte. Hold 5°C i køleskabet og -18°C i fryseren. Hver grad koldere koster 5% mere.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'app-10',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Standby-forbrug',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'app-11',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'TV, spillekonsoller, computere og andet elektronik på standby kan samlet bruge 300-500 kWh årligt - det er 750-1.250 kr for strøm du ikke bruger! Invester i stikkontakter med afbryder eller smart home løsninger.',
                marks: []
              }
            ]
          }
        ],
        settings: {
          _type: 'sectionSettings',
          backgroundColor: 'lightGray',
          textColor: 'dark',
          paddingTop: 'large',
          paddingBottom: 'large'
        }
      }
    }
    
    // Update FAQ to include some of the useful technical info
    if (block._key === 'faq' && block.faqItems) {
      // Add technical info to existing FAQ items
      const updatedFaqItems = [...block.faqItems]
      
      // Update the first FAQ about security to be more matter-of-fact
      if (updatedFaqItems[0]) {
        updatedFaqItems[0] = {
          ...updatedFaqItems[0],
          answer: [
            {
              _type: 'block',
              _key: 'faq1-answer',
              style: 'normal',
              markDefs: [],
              children: [
                {
                  _type: 'span',
                  _key: 'faq1-span',
                  text: 'Ja. Du logger ind med MitID direkte på Eloverblik (ikke hos os), og giver derefter ElPortal tilladelse til at hente dine data. Forbindelsen er midlertidig og lukker automatisk efter 30 minutter. Vi gemmer ikke dine forbrugsdata - alt hentes direkte når du beder om det. Du kan trække tilladelsen tilbage når som helst på eloverblik.dk.',
                  marks: []
                }
              ]
            }
          ]
        }
      }
      
      // Add a new FAQ about the 18-digit meter ID
      updatedFaqItems.push({
        _type: 'faqItem',
        _key: 'faq11',
        question: 'Hvad er et målepunkt-ID?',
        answer: [
          {
            _type: 'block',
            _key: 'faq11-answer',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                _key: 'faq11-span',
                text: 'Dit målepunkt-ID er et unikt 18-cifret nummer som identificerer din elmåler. Alle danske elmålere har sådan et ID, som sikrer at dine data aldrig forveksles med andres. Du kan finde dit målepunkt-ID på din elregning eller ved at logge ind på eloverblik.dk.',
                marks: []
              }
            ]
          }
        ]
      })
      
      // Add FAQ about DataHub
      updatedFaqItems.push({
        _type: 'faqItem',
        _key: 'faq12',
        question: 'Hvad er DataHub og hvordan fungerer det?',
        answer: [
          {
            _type: 'block',
            _key: 'faq12-answer',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                _key: 'faq12-span',
                text: 'DataHub er Danmarks centrale database for alle elforbrugsdata, drevet af Energinet. Dit netselskab (f.eks. Radius, N1, Cerius) sender automatisk dit forbrug til DataHub hver time via fjernaflæste målere. Disse data bliver så tilgængelige gennem Eloverblik, hvor du kan give tredjeparter som ElPortal adgang til at se dem.',
                marks: []
              }
            ]
          }
        ]
      })
      
      return {
        ...block,
        faqItems: updatedFaqItems
      }
    }
    
    return block
  })

  try {
    const result = await client.patch('f5IMbE4BjT3OYPNFYb8v2Z')
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
      
    console.log('✅ Content sections replaced successfully!')
    console.log('   - Replaced defensive security section with "Smart Elforbrug" tips')
    console.log('   - Replaced technical integration section with "Hvad Bruger Dine Apparater?"')
    console.log('   - Added technical info to FAQ section')
    console.log(`   View in Studio: https://dinelportal.sanity.studio/structure/page;f5IMbE4BjT3OYPNFYb8v2Z`)
    
    return result
  } catch (error) {
    console.error('❌ Failed to replace sections:', error)
    throw error
  }
}

// Run the replacement
replaceSections()
  .then(() => {
    console.log('✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })