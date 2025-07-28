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

async function deployEnhancements() {
  console.log('🚀 Deploying prognoser page enhancements...\n')
  
  try {
    // Fetch current page
    const currentPage = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYkdQx3"][0]`)
    
    if (!currentPage) {
      console.error('❌ Prognoser page not found!')
      return
    }
    
    // New content sections to add
    const renewableIntro = {
      _type: 'pageSection',
      _key: 'renewable-energy-intro',
      title: 'Forstå Grøn Energi Prognoser',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: 'intro-1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Når vinden blæser kraftigt, og solen skinner, falder elpriserne ofte markant. Det skyldes, at vindmøller og solceller producerer el uden brændstofomkostninger. Jo mere grøn energi i elnettet, desto lavere bliver prisen typisk.',
              _key: 'span1'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'intro-2',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Vores 7-dages prognose viser dig, hvornår Danmark forventes at have høj produktion af vedvarende energi. Denne viden kan hjælpe dig med at planlægge dit elforbrug smartere og spare penge på elregningen.',
              _key: 'span2'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'section-1',
          style: 'h3',
          children: [
            {
              _type: 'span',
              text: 'Sådan Bruger Du Prognosen',
              _key: 'span3'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'usage-1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Se efter perioder med høj vindproduktion (over 60%) eller solproduktion i dagtimerne. Dette er de bedste tidspunkter at oplade din elbil, køre vaskemaskine og opvaskemaskine, varme vand op i varmtvandsbeholderen, og lade batterier og enheder op.',
              _key: 'span4'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'section-2',
          style: 'h3',
          children: [
            {
              _type: 'span',
              text: 'Grøn Energi = Lavere Priser',
              _key: 'span5'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'price-1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Når vindmøllerne kører for fuld kraft, kan elprisen falde til få øre per kWh - eller endda blive negativ. Det betyder, at du reelt kan blive betalt for at bruge strøm! Dette sker typisk på vindrige nætter med lavt forbrug.',
              _key: 'span6'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'price-2',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Omvendt stiger priserne ofte, når det er vindstille, og solen ikke skinner. Derfor kan du spare betydelige beløb ved at flytte dit forbrug til de grønne timer.',
              _key: 'span7'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'tip-1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: '💡 ',
              marks: ['strong'],
              _key: 'span8'
            },
            {
              _type: 'span',
              text: 'Praktisk tip:',
              marks: ['strong'],
              _key: 'span9'
            },
            {
              _type: 'span',
              text: ' Brug prognosen sammen med vores prisvisning til at identificere de billigste timer i den kommende uge. Ved at vælge et elselskab med timeafregning kan du maksimere din besparelse.',
              _key: 'span10'
            }
          ]
        }
      ]
    }

    const productionIntro = {
      _type: 'pageSection',
      _key: 'historical-production-intro',
      title: 'Sådan påvirker årstiderne din elpris',
      headerAlignment: 'center',
      content: [
        {
          _type: 'block',
          _key: 'intro-paragraph-1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Har du nogensinde undret dig over, hvorfor din elregning svinger i løbet af året? Svaret ligger i Danmarks unikke energimix og det vejr, der former vores hverdag. At forstå de historiske mønstre i elproduktionen er den bedste måde at forudsige fremtidige priser og finde de billigste timer at bruge strøm på.',
              _key: 'span1'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'intro-paragraph-2',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Prisen på strøm styres af udbud og efterspørgsel. Når der er masser af billig, grøn strøm til rådighed, falder prisen. Når produktionen er lav, og vi skal bruge dyrere energikilder, stiger den. I Danmark spiller vindmøller og solceller hovedrollerne i dette samspil.',
              _key: 'span2'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'seasons-heading',
          style: 'h3',
          children: [
            {
              _type: 'span',
              text: 'Årstidernes dans med energikilderne',
              _key: 'span3'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'autumn-winter',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Efterår og Vinter:',
              marks: ['strong'],
              _key: 'span4'
            },
            {
              _type: 'span',
              text: ' Disse måneder er typisk blæsende. Vores mange vindmøller kører på fuld kapacitet og producerer enorme mængder billig strøm. Selvom vores forbrug til varme og lys er højt, betyder den massive vindproduktion ofte, at priserne er lavere, især om natten.',
              _key: 'span5'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'spring-summer',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Forår og Sommer:',
              marks: ['strong'],
              _key: 'span6'
            },
            {
              _type: 'span',
              text: ' Her tager solen over. På lange, solrige dage producerer solcellerne store mængder strøm midt på dagen. Samtidig er vores samlede energiforbrug lavere. Denne kombination kan føre til ekstremt lave priser.',
              _key: 'span7'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'savings-paragraph',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Ved at kende disse sæsonmønstre kan du bedre forudsige, hvornår strømmen sandsynligvis vil være billigst. I grafen nedenfor kan du selv gå på opdagelse i de historiske data.',
              _key: 'span8'
            }
          ]
        }
      ]
    }

    const co2Intro = {
      _type: 'pageSection',
      _key: 'co2-explanation-section',
      title: 'Forstå sammenhængen mellem CO2 og elpriser',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: 'block1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Danmarks elproduktion og CO2-udledning hænger tæt sammen med elpriserne. Når vindmøller og solceller producerer meget strøm, falder både CO2-udledningen og elpriserne markant. Dette skaber en unik mulighed for at spare penge og samtidig reducere din klimapåvirkning.',
              _key: 'span1'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block2',
          style: 'h3',
          children: [
            {
              _type: 'span',
              text: 'Hvorfor betyder lav CO2 ofte lave priser?',
              _key: 'span2'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block3',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Vedvarende energikilder som vind og sol har næsten ingen driftsomkostninger. Når vinden blæser kraftigt eller solen skinner, produceres strømmen billigt og uden CO2-udledning. Fossile kraftværker, der udleder CO2, er derimod dyrere at drive og bruges primært, når den grønne produktion ikke kan dække efterspørgslen.',
              _key: 'span3'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block4',
          style: 'h3',
          children: [
            {
              _type: 'span',
              text: 'Grønne timer - en fordel for miljø og økonomi',
              _key: 'span4'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block5',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Ved at flytte dit elforbrug til timer med lav CO2-intensitet kan du opnå betydelige besparelser. Opvaskemaskiner, vaskemaskiner og elbiler kan nemt programmeres til at køre, når strømmen er grønnest og billigst. En gennemsnitlig dansk husstand kan spare 15-25% på elregningen ved bevidst forbrugsflytning.',
              _key: 'span5'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block6',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Danmark har ambitiøse mål om 70% CO2-reduktion i 2030 og klimaneutralitet i 2050. Ved at bruge de grønne prognoser aktivt bliver du del af Danmarks grønne omstilling, hvor hver kilowatt-time tæller i kampen mod klimaforandringer.',
              _key: 'span6'
            }
          ]
        }
      ]
    }

    // Update the education section to remove bullet points
    const updatedEducationSection = {
      _key: 'education-1',
      _type: 'pageSection',
      title: 'Hvordan Dannes Elpriser i Danmark?',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: 'block1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Elpriser i Danmark fastsættes dagligt på ',
              _key: 'span1'
            },
            {
              _type: 'span',
              text: 'Nord Pool elbørsen',
              _key: 'span2',
              marks: ['strong']
            },
            {
              _type: 'span',
              text: ', Nordeuropas største elmarked. Hver dag kl. 13:00 offentliggøres næste dags spotpriser baseret på forventet udbud og efterspørgsel.',
              _key: 'span3'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block2',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Priserne påvirkes af flere faktorer, hvor ',
              _key: 'span4'
            },
            {
              _type: 'span',
              text: 'vindproduktionen',
              _key: 'span5',
              marks: ['strong']
            },
            {
              _type: 'span',
              text: ' spiller en afgørende rolle. Når det blæser kraftigt, falder priserne markant, og Danmark har faktisk nogle af Europas laveste elpriser takket være vores omfattende vindmøllekapacitet. Dette gør vindkraft til en win-win situation - både for klimaet og din pengepung.',
              _key: 'span6'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block3',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Ud over vindkraften bidrager ',
              _key: 'span7'
            },
            {
              _type: 'span',
              text: 'solenergi',
              _key: 'span8',
              marks: ['strong']
            },
            {
              _type: 'span',
              text: ' også til at holde priserne nede, særligt om sommeren hvor solcellerne producerer mest energi i middagstimerne. Denne grønne energiproduktion arbejder sammen med det traditionelle ',
              _key: 'span9'
            },
            {
              _type: 'span',
              text: 'forbrugsmønster',
              _key: 'span10',
              marks: ['strong']
            },
            {
              _type: 'span',
              text: ', hvor vi typisk ser de højeste priser om morgenen og aftenen, når danskerne kommer hjem fra arbejde og efterspørgslen stiger.',
              _key: 'span11'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block4',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Danmarks geografiske placering giver os også en unik fordel gennem vores ',
              _key: 'span12'
            },
            {
              _type: 'span',
              text: 'import- og eksportforbindelser',
              _key: 'span13',
              marks: ['strong']
            },
            {
              _type: 'span',
              text: ' til Tyskland, Norge og Sverige. Disse forbindelser fungerer som en slags prismæssig buffer - når vi har overskud af billig vindenergi, kan vi eksportere den, og når vinden ligger stille, kan vi importere fra vores nabolande.',
              _key: 'span14'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block5',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Vores elpris prognose analyserer alle disse faktorer for at give dig det bedste overblik over kommende priser, så du kan planlægge dit forbrug og spare penge på elregningen.',
              _key: 'span15'
            }
          ]
        }
      ]
    }

    // Build new content blocks array with enhancements
    const enhancedBlocks = []
    
    currentPage.contentBlocks.forEach((block, index) => {
      // Replace education section
      if (block._key === 'education-1') {
        enhancedBlocks.push(updatedEducationSection)
      }
      // Add intro before renewable energy forecast
      else if (block._type === 'renewableEnergyForecast') {
        enhancedBlocks.push(renewableIntro)
        enhancedBlocks.push(block)
      }
      // Add intro before monthly production
      else if (block._type === 'monthlyProductionChart') {
        enhancedBlocks.push(productionIntro)
        enhancedBlocks.push(block)
      }
      // Add intro before CO2 chart
      else if (block._type === 'co2EmissionsChart') {
        enhancedBlocks.push(co2Intro)
        enhancedBlocks.push(block)
      }
      // Update regional comparison alignment
      else if (block._type === 'regionalComparison') {
        enhancedBlocks.push({
          ...block,
          headerAlignment: 'center',
          leadingText: [
            {
              _type: 'block',
              _key: 'regional-lead',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Danmark er opdelt i to elprisområder baseret på transmissionsnettet. DK1 omfatter Jylland og Fyn, mens DK2 dækker Sjælland og Bornholm. Prisforskellene opstår på grund af forskellige produktionsforhold og internationale forbindelser. Generelt har DK1 lavere priser takket være større vindmøllekapacitet.',
                  _key: 'regional-span'
                }
              ]
            }
          ]
        })
      }
      // Keep other blocks as is
      else {
        enhancedBlocks.push(block)
      }
    })

    // Update the page
    console.log('📝 Updating page with enhanced content...')
    const result = await client
      .patch(currentPage._id)
      .set({ contentBlocks: enhancedBlocks })
      .commit()

    console.log('✅ Page enhanced successfully!')
    console.log(`📋 Total content blocks: ${enhancedBlocks.length}`)
    console.log('🔗 View at: https://elportal-forside-design.vercel.app/prognoser')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run deployment
deployEnhancements()
  .then(() => {
    console.log('\n🎉 All enhancements deployed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })