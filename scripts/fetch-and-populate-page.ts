import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to generate unique keys
function generateKey(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Helper function to create portable text blocks
function createPortableTextBlock(text: string, style: string = 'normal') {
  return {
    _type: 'block',
    _key: generateKey(),
    style,
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text,
        marks: []
      }
    ]
  }
}

async function fetchAndPopulatePage() {
  try {
    const pageId = 'I7aq0qw44tdJ3YglBpsP1G'
    
    console.log('🔍 Fetching current page content...')
    
    // Fetch the current page structure
    const currentPage = await client.fetch(`
      *[_id == $pageId][0]{
        _id,
        _type,
        title,
        slug,
        seo,
        contentBlocks[]{
          _type,
          _key,
          headline,
          subheadline,
          image,
          calculatorType,
          heading,
          headerAlignment,
          content,
          faqs,
          items
        }
      }
    `, { pageId })

    if (!currentPage) {
      console.error('❌ Page not found')
      return
    }

    console.log(`✅ Found page: ${currentPage.title}`)
    console.log(`📦 Content blocks: ${currentPage.contentBlocks?.length || 0}`)

    // Create comprehensive Danish content following Gemini's strategic approach
    const updatedContentBlocks = currentPage.contentBlocks?.map((block: any, index: number) => {
      console.log(`\n🔧 Processing block ${index + 1}: ${block._type}`)
      
      if (block._type === 'pageSection') {
        let heading = block.heading
        let content = block.content || []

        // Strategic content population based on position and Gemini recommendations
        if (!heading || heading === 'Untitled' || !content.length) {
          switch (index) {
            case 1: // After Live Price Graph - explain what it means
              heading = 'Hvad Betyder Spotprisen for Dig?'
              content = [
                createPortableTextBlock('Grafen ovenfor viser den aktuelle spotpris - det er den "rå elpris" som handles på Nord Pool elbørsen time for time.'),
                createPortableTextBlock('Prisen følger simpel økonomi: Når produktionen er høj (mange vindmøller kører) og forbruget er lavt (fx om natten), falder prisen. Når der er lille produktion og stort forbrug, stiger prisen.'),
                createPortableTextBlock('Som forbruger kan du udnytte disse prisfald ved at vælge en elaftale med variabel pris. Det giver dig mulighed for at betale den reelle markedspris time for time.'),
                createPortableTextBlock('Mange danskere sparer allerede 2.000-4.000 kr. årligt ved at følge spotprisen og tilpasse deres forbrug til de billigste timer.')
              ]
              break
            
            case 2: // Alongside Declaration Production Chart
              heading = 'Danmarks Grønne Energimix Lige Nu'
              content = [
                createPortableTextBlock('Som du kan se i grafen nedenfor, kommer en stor del af vores strøm lige nu fra vedvarende energikilder som vind- og solkraft.'),
                createPortableTextBlock('Når andelen af vindkraft er høj, er elprisen typisk lavest. Det er den grønne omstilling i praksis - miljøvenlig energi er også den billigste.'),
                createPortableTextBlock('Danmarks position som verdens førende vindkraftnation betyder, at vi ofte har de laveste elpriser i Europa på vindfulde dage.'),
                createPortableTextBlock('Ved at vælge en grøn elleverandør støtter du ikke kun miljøet - du sikrer også, at dine penge investeres i fremtidens billige energikilder.')
              ]
              break
            
            case 3: // Actionable savings tips
              heading = 'Spar Penge med Smart Elforbrug'
              content = [
                createPortableTextBlock('Med timepriser kan du opnå betydelige besparelser ved at flytte dit energiforbrug til de rigtige tidspunkter:'),
                createPortableTextBlock('• Start vaskemaskinen eller opvaskemaskinen om natten (kl. 23-06), når strømmen typisk er billigst'),
                createPortableTextBlock('• Oplad din elbil i de timer, hvor vindkraften producerer mest - mange ladebokse kan automatiseres til dette'),
                createPortableTextBlock('• Brug strømkrævende apparater som tørretumbler og elvarme midt på dagen, når solceller producerer mest'),
                createPortableTextBlock('For at udnytte disse prisfald fuldt ud skal du have en elaftale med variabel pris. Det giver dig direkte adgang til markedets laveste priser, når vindkraften leverer billig, ren energi.')
              ]
              break
            
            case 4: // Understanding the market
              heading = 'Forstå det Danske Elmarked - Fra Monopol til Fri Konkurrence'
              content = [
                createPortableTextBlock('Danmark har Europas mest gennemsigtige elmarked. Alle forbrugere har nu adgang til de samme prisdata som store industrielle kunder - i realtid.'),
                createPortableTextBlock('Denne gennemsigtighed betyder, at du selv kan følge med i, hvornår strømmen er billigst, og planlægge dit forbrug derefter.'),
                createPortableTextBlock('De traditionelle elleverandører med faste priser fungerer som "forsikringsselskaber" - de opkræver en præmie for at beskytte dig mod prissvingninger.'),
                createPortableTextBlock('Men hvis du er komfortabel med at følge markedet, kan du spare betydeligt ved at vælge variabel pris og udnytte de lave priser på vindfulde dage.'),
                createPortableTextBlock('Moderne apps og smarte styresystemer gør det nemt at automatisere dit forbrug, så du får de laveste priser uden besvær.')
              ]
              break
            
            case 5: // Technology and future perspective  
              heading = 'Fremtidens Elforbrugere er Aktive Markedsdeltagere'
              content = [
                createPortableTextBlock('Med live prisgrafer, automatiske advarsler og intelligente styresystemer kan enhver dansker nu optimere sin elregning som en professionel energihandler.'),
                createPortableTextBlock('Fremtidens elnet bliver endnu mere intelligent med smart home-teknologi, der automatisk flytter forbrug til de billigste timer.'),
                createPortableTextBlock('Elbiler bliver ikke bare transportmidler - de bliver mobile batterier, der kan lagre billig vindkraftsstrøm og sælge den tilbage til nettet, når priserne er høje.'),
                createPortableTextBlock('Danskere, der vælger grønne leverandører med variabel pris i dag, positionerer sig optimalt til fremtidens energisystem.')
              ]
              break
            
            default:
              heading = 'Elpriser og Spotpriser i Danmark'
              content = [
                createPortableTextBlock('følg de aktuelle elpriser og forstå, hvordan spotprisen påvirker din elregning.'),
                createPortableTextBlock('Danmarks grønne energimix betyder, at vindkraft ofte driver priserne ned på de mest miljøvenlige tidspunkter.')
              ]
              break
          }
        }

        return {
          ...block,
          heading,
          headerAlignment: block.headerAlignment || 'left',
          content
        }
      
      } else if (block._type === 'faqGroup') {
        // Strategic FAQ content based on Gemini recommendations
        const faqs = [
          {
            _key: generateKey(),
            question: 'Hvad er forskellen på fast og variabel elpris?',
            answer: [
              createPortableTextBlock('Variabel pris følger spotprisen på elbørsen time for time. Det betyder, at du betaler den reelle markedspris og kan udnytte lave priser når vindkraften producerer meget. Fast pris er en form for forsikring mod prissvingninger, men du mister muligheden for at spare penge på vindfulde dage. Historisk set har variabel pris været billigst over tid.')
            ]
          },
          {
            _key: generateKey(),
            question: 'Er grøn strøm dyrere end almindelig strøm?',
            answer: [
              createPortableTextBlock('Nej, selve elprisen er den samme - den fastsættes af markedet på elbørsen. Ved at vælge en grøn leverandør sikrer du, at dine penge støtter investering i vedvarende energi gennem oprindelsesgarantier. Grønne leverandører har ofte lavere omkostninger, da de ikke betaler CO2-afgifter, og vindkraft er Danmarks billigste energikilde.')
            ]
          },
          {
            _key: generateKey(),
            question: 'Hvornår på dagen er elprisen lavest?',
            answer: [
              createPortableTextBlock('Det varierer med vejret og årstiden. Generelt er priserne lavest om natten (kl. 23-06) når forbruget er lavt, og midt på dagen (kl. 10-16) når solceller producerer mest. Men på vindfulde dage kan priserne være lave hele døgnet. Følg live prisgrafen for at finde de bedste tidspunkter.')
            ]
          },
          {
            _key: generateKey(),
            question: 'Hvad betyder DK1 og DK2 for mine elpriser?',
            answer: [
              createPortableTextBlock('Danmark er delt i to prisområder: DK1 (Jylland og Fyn) og DK2 (Sjælland, Lolland-Falster og Bornholm). Priserne kan variere mellem områderne afhængig af produktion og forbrug. DK1 har flere vindmøller, så priserne er ofte lavere her på vindfulde dage. DK2 har flere kabelførbindelser til nabolande, hvilket kan påvirke priserne.')
            ]
          },
          {
            _key: generateKey(),
            question: 'Hvordan skifter jeg elselskab til variabel pris?',
            answer: [
              createPortableTextBlock('Det er en simpel proces, som dit nye elselskab håndterer for dig. Du skal blot vælge en leverandør med variabel pris og grønne værdier. Selskaber som specialiserer sig i markedsbaserede priser og vindkraft gør skiftet nemt og problemfrit. Du behøver ikke kontakte dit gamle selskab - det sker automatisk.')
            ]
          },
          {
            _key: generateKey(),
            question: 'Kan jeg virkelig spare penge med variabel pris?',
            answer: [
              createPortableTextBlock('Ja, især hvis du er fleksibel med dit forbrug. Mange danske familier sparer 2.000-5.000 kr. årligt ved at flytte energikrævende aktiviteter til de billigste timer. Med smart home-teknologi kan dette automatiseres, så du får besparelserne uden besvær. Jo mere vindkraft Danmark får, jo større bliver besparelsespotentialet.')
            ]
          }
        ]

        return {
          ...block,
          heading: block.heading || 'Ofte Stillede Spørgsmål om Elpriser og Spotpriser',
          faqs
        }
      }

      return block
    }) || []

    console.log('\n🚀 Updating page content with strategic Danish content...')

    // Update the page in Sanity
    const result = await client
      .patch(pageId)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('✅ Page updated successfully!')
    console.log(`📄 Updated page: ${result._id}`)
    console.log('🎉 All content populated following strategic "Aha!" journey approach')
    console.log('💡 Content optimized with Danish keywords: spotpris, vindkraft, grøn strøm, variabel pris')
    console.log('🌱 Subtle Vindstød positioning integrated throughout')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fetchAndPopulatePage()