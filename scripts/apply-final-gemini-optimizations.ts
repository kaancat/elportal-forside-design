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

// Helper function to create rich text blocks
function createRichTextBlock(text: string, marks: string[] = []): any {
  return {
    _type: 'block',
    _key: generateKey(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text,
        marks
      }
    ],
    markDefs: []
  }
}

// Helper function to create heading blocks
function createHeadingBlock(text: string, style: 'h2' | 'h3' | 'h4' = 'h3'): any {
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

// Helper function to create block with link
function createBlockWithLink(beforeLink: string, linkText: string, afterLink: string, href: string): any {
  const linkKey = generateKey()
  
  return {
    _type: 'block',
    _key: generateKey(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text: beforeLink,
        marks: []
      },
      {
        _type: 'span',
        _key: generateKey(),
        text: linkText,
        marks: [linkKey]
      },
      {
        _type: 'span',
        _key: generateKey(),
        text: afterLink,
        marks: []
      }
    ],
    markDefs: [
      {
        _key: linkKey,
        _type: 'link',
        href
      }
    ]
  }
}

// Helper function to create list items
function createListItem(text: string, withBullet: string = '•'): any {
  return {
    _type: 'block',
    _key: generateKey(),
    style: 'normal',
    listItem: 'bullet',
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

// Helper function to create list item with strong start
function createListItemWithStrong(strongText: string, normalText: string): any {
  return {
    _type: 'block',
    _key: generateKey(),
    style: 'normal',
    listItem: 'bullet',
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text: strongText,
        marks: ['strong']
      },
      {
        _type: 'span',
        _key: generateKey(),
        text: normalText,
        marks: []
      }
    ],
    markDefs: []
  }
}

async function applyFinalGeminiOptimizations() {
  try {
    console.log('Applying final Gemini optimizations to homepage...')
    
    // First, fetch the current homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    // Get current content blocks
    const contentBlocks = homepage.contentBlocks || []
    
    // Find indices for sections 9, 10, and 11
    let section9Index = -1, section10Index = -1, section11Index = -1
    
    contentBlocks.forEach((block: any, index: number) => {
      if (block._type === 'pageSection') {
        if (block.title === 'Dagens spotpriser') {
          section9Index = index
        } else if (block.title === 'Beregn dit elforbrug') {
          section10Index = index
        } else if (block.title === 'Ladeboks til elbil') {
          section11Index = index
        }
      }
    })
    
    if (section9Index === -1 || section10Index === -1 || section11Index === -1) {
      console.error('Could not find all sections to update')
      return
    }
    
    // Update Section 9 (Live Spot Prices)
    contentBlocks[section9Index] = {
      _type: 'pageSection',
      _key: contentBlocks[section9Index]._key,
      title: 'Live Elpriser Time for Time: Se Dagens Spotpriser Nu',
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
              text: 'Her ser du de ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'live elpriser',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ' direkte fra den nordiske elbørs, Nord Pool. Grafen viser den rå ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'spotpris på el',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ', som er fundamentet for din elregning. Ved at følge med her, kan du se præcis, hvornår strømmen er billigst.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'livePriceGraph',
          _key: generateKey(),
          title: 'Aktuelle elpriser i dag',
          subtitle: 'Data hentet direkte fra Nord Pool',
          apiRegion: 'DK1',
          headerAlignment: 'center'
        },
        createHeadingBlock('Sådan Bruger Du Grafen til at Spare Penge', 'h3'),
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Som grafen viser, er ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'strømpriserne',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ' typisk lavest om natten og midt på dagen, når vindmøller og solceller producerer mest. Planlæg dit forbrug smart:',
              marks: []
            }
          ],
          markDefs: []
        },
        createListItem('✅ Start vaskemaskinen eller opvaskeren, når du går i seng. Se præcis hvad de koster at køre med vores forbrugsberegner nedenfor.'),
        createListItem('✅ Oplad din elbil i de billige nattetimer. Læs mere om den optimale ladeboks-løsning længere nede.'),
        createListItem('❌ Undgå spidsbelastning: Begræns brugen af ovn og tørretumbler mellem kl. 17 og 20, hvor strømmen er dyrest.'),
        createRichTextBlock('Når du vælger en elaftale med variabel pris, får du direkte gavn af de lave timepriser, du ser her.')
      ]
    }
    
    // Update Section 10 (Appliance Calculator)
    contentBlocks[section10Index] = {
      _type: 'pageSection',
      _key: contentBlocks[section10Index]._key,
      title: 'Hvad Koster Strømmen? Beregn Dit Elforbrug Her',
      headerAlignment: 'center',
      content: [
        createBlockWithLink(
          'Find de skjulte strømslugere i dit hjem. Vores beregner viser dig præcis, hvad dine apparater koster i kroner og øre, baseret på de ',
          'aktuelle elpriser',
          '. Indtast dit apparat nedenfor og få svaret med det samme.',
          '#live-elpriser'
        )
      ]
    }
    
    // Insert the appliance calculator after the section content
    const applianceCalculatorIndex = section10Index + 1
    contentBlocks.splice(applianceCalculatorIndex, 0, {
      _type: 'applianceCalculator',
      _key: contentBlocks[section10Index + 1]?._key || generateKey(),
      title: 'Beregn dine apparaters elforbrug',
      subtitle: 'Find ud af hvad dine apparater koster i strøm'
    })
    
    // Add the benefits list after the calculator
    const benefitsSection = {
      _type: 'pageSection',
      _key: generateKey(),
      title: '',
      headerAlignment: 'left',
      content: [
        createHeadingBlock('Brug Beregneren til at:', 'h3'),
        createListItemWithStrong('Finde besparelser:', ' Identificér hvilke apparater der koster mest at have kørende.'),
        createListItemWithStrong('Sammenligne modeller:', ' Se den reelle økonomiske forskel på et gammelt køleskab og en ny, energieffektiv model.'),
        createListItemWithStrong('Planlægge dit forbrug:', ' Forstå omkostningen ved at bruge tørretumbleren i de dyre eller billige timer.'),
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'At kende dit ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'strømforbrug',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ' er det første, afgørende skridt mod en lavere elregning.',
              marks: []
            }
          ],
          markDefs: []
        }
      ]
    }
    contentBlocks.splice(applianceCalculatorIndex + 1, 0, benefitsSection)
    
    // Update Section 11 (Ladeboks) - need to adjust index after insertions
    const adjustedSection11Index = section11Index + 2
    contentBlocks[adjustedSection11Index] = {
      _type: 'pageSection',
      _key: contentBlocks[adjustedSection11Index]._key,
      title: 'Få en Ladeboks og Oplad Din Elbil Billigere og Grønnere',
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
              text: 'Med en ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'ladeboks',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ' derhjemme tager du fuld kontrol over din elbils opladning. Du kan lade, når strømmen er billigst, og du kan opnå markante besparelser via ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'refusion af elafgiften',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ' – en af de største fordele ved ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'hjemmeladning',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: '.',
              marks: []
            }
          ],
          markDefs: []
        },
        createHeadingBlock('Derfor er en Ladeboks en God Investering:', 'h3'),
        createListItemWithStrong('Markant Lavere Pris:', ' Oplad om natten til en brøkdel af prisen på offentlige ladere.'),
        createListItemWithStrong('Få Penge Tilbage:', ' Med en serviceaftale får du elafgiften refunderet for den strøm, du bruger til opladning. Det sparer dig for tusindvis af kroner hvert år.'),
        createListItemWithStrong('Intelligent Opladning:', ' Vælg et elselskab, der tilbyder "intelligent opladning". Så starter din bil automatisk med at lade, når elprisen er lavest, uden du behøver at gøre noget.'),
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Mange moderne elselskaber tilbyder en samlet pakkeløsning med både ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'installation af ladeboks',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ' og en serviceaftale, der sikrer dig fuld refusion. Det er den nemmeste og smarteste vej til billig, grøn transport.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      cta: {
        text: 'Find den Bedste Ladeboks-løsning',
        url: '/ladeboks'
      }
    }
    
    // Update the homepage
    const result = await client.patch(homepage._id)
      .set({ contentBlocks })
      .commit()
    
    console.log('✅ Final Gemini optimizations applied successfully!')
    console.log('Updated sections:')
    console.log('- Section 9: Live Spot Prices with enhanced keywords and action items')
    console.log('- Section 10: Appliance Calculator with benefit-driven copy')
    console.log('- Section 11: Ladeboks with critical "refusion" keyword and strategic positioning')
    
  } catch (error) {
    console.error('❌ Error applying optimizations:', error)
  }
}

// Run the script
applyFinalGeminiOptimizations()