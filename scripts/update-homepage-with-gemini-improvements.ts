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
function createBlockWithLink(text: string, linkText: string, href: string): any {
  const linkKey = generateKey()
  const textParts = text.split(linkText)
  
  return {
    _type: 'block',
    _key: generateKey(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text: textParts[0],
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
        text: textParts[1] || '',
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
function createListItem(text: string): any {
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

async function updateHomepageWithGeminiImprovements() {
  try {
    console.log('Updating homepage with Gemini-optimized content...')
    
    // First, fetch the current homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    // Find the indices of sections we need to update
    const contentBlocks = homepage.contentBlocks || []
    
    // Find Section 6 (Elpriser Overview) - should be around index 5
    const section6Index = contentBlocks.findIndex((block: any, index: number) => 
      index >= 5 && block._type === 'pageSection' && block.title === 'Aktuelle elpriser i Danmark'
    )
    
    // Find Section 7 (Elselskaber) - should be after providerList
    const section7Index = contentBlocks.findIndex((block: any, index: number) => 
      index >= 7 && block._type === 'pageSection' && block.title === 'Etablerede elselskaber på det danske marked'
    )
    
    if (section6Index === -1 || section7Index === -1) {
      console.error('Could not find sections to update')
      return
    }
    
    // Update Section 6 with Gemini's improved content
    contentBlocks[section6Index] = {
      _type: 'pageSection',
      _key: contentBlocks[section6Index]._key,
      title: 'Forstå Elpriserne og Spar Penge på Din Strøm',
      headerAlignment: 'center',
      content: [
        createRichTextBlock('Elpriser i Danmark ændrer sig time for time.', ['strong']),
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: ' At forstå disse svingninger er nøglen til en lavere elregning. Prisen på strøm påvirkes af alt fra vejret til udbud og efterspørgsel på den nordiske elbørs, Nord Pool.',
              marks: []
            }
          ],
          markDefs: []
        },
        createRichTextBlock('Din endelige strømpris består typisk af tre dele:', ['strong']),
        createListItem('Spotprisen: Den rå markedspris på el, som varierer konstant.'),
        createListItem('Dit elselskabs tillæg: Et mindre gebyr eller en margin for at håndtere dit kundeforhold.'),
        createListItem('Afgifter og transport: Skatter til staten og betaling for brug af elnettet.'),
        createHeadingBlock('Pro Tip: Sådan får du billig strøm', 'h3'),
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Med en elaftale baseret på ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'spotpriser',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ', kan du aktivt flytte dit forbrug til de billigste timer. Det er typisk om natten og midt på dagen, hvor der er masser af vind- og solenergi. Undgå så vidt muligt de dyre spidsbelastningstimer, som ofte ligger mellem kl. 17 og 20.',
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
              text: 'Klar til at se, hvad du kan spare? Sammenlign elselskaber og find den aftale, der bedst udnytter de lave ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'elpriser time for time',
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
        }
      ],
      cta: {
        text: 'Sammenlign Elpriser Nu',
        url: '/elpriser'
      }
    }
    
    // Update Section 7 with Gemini's strategic pivot
    contentBlocks[section7Index] = {
      _type: 'pageSection',
      _key: contentBlocks[section7Index]._key,
      title: 'Sådan Vælger Du det Rigtige Elselskab for Dig',
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
              text: 'At vælge det rigtige ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'elselskab',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ' kan virke uoverskueligt, men det behøver det ikke at være. Markedet er fyldt med dygtige ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'elleverandører',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ', og det bedste valg afhænger af, hvad du vægter højest. Her er de fire vigtigste faktorer, du bør overveje, når du skal ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'skifte elselskab',
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
        createHeadingBlock('1. Prismodel og Gennemsigtighed', 'h4'),
        createRichTextBlock('Gå efter en simpel prismodel. Nogle selskaber lokker med lave intropriser, men har høje faste gebyrer. Et godt elselskab har en gennemsigtig pris, hvor du tydeligt kan se, hvad der er ren spotpris, og hvad der er et mindre tillæg.'),
        createHeadingBlock('2. Klimaprofil og Grøn Energi', 'h4'),
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Er du optaget af den grønne omstilling? Se efter, om selskabet investerer i ny, vedvarende energi (som vindmøller og solceller) eller blot køber oprindelsescertifikater. Ægte ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'grøn strøm',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ' kommer fra selskaber, der aktivt bidrager til udbygningen af grøn energi i Danmark.',
              marks: []
            }
          ],
          markDefs: []
        },
        createHeadingBlock('3. Kundeanmeldelser og Service', 'h4'),
        createRichTextBlock('Hvad siger andre kunder? Tjek anmeldelser på Trustpilot. Et højt serviceniveau og en tilgængelig kundeservice er guld værd, hvis du har spørgsmål til din regning eller dit forbrug.'),
        createHeadingBlock('4. Digitale Værktøjer (App)', 'h4'),
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Moderne elselskaber tilbyder ofte en app, hvor du kan følge dit forbrug og ',
              marks: []
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: 'elpriserne time for time',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: '. Det er et stærkt værktøj til at tage kontrol over din elregning og bruge strømmen, når den er grønnest og billigst.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      cta: {
        text: 'Find det Bedste Elselskab for Dig',
        url: '/elselskaber'
      }
    }
    
    // Update the homepage
    const result = await client.patch(homepage._id)
      .set({ contentBlocks })
      .commit()
    
    console.log('✅ Homepage updated with Gemini-optimized content!')
    console.log('Updated sections:')
    console.log('- Section 6: Improved SEO and user value')
    console.log('- Section 7: Strategic pivot to favor modern providers')
    
  } catch (error) {
    console.error('❌ Error updating homepage:', error)
  }
}

// Run the script
updateHomepageWithGeminiImprovements()