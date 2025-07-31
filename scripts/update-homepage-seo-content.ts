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

async function updateHomepageWithSeoContent() {
  try {
    console.log('Updating homepage with rich SEO content...')
    
    // First, fetch the current homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    // Define sections 6-11 with rich SEO content
    const seoSections = [
      // Section 6: Elpriser Overview Section
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Aktuelle elpriser i Danmark',
        headerAlignment: 'center',
        content: [
          createRichTextBlock(
            'Elpriser i Danmark er en dynamisk størrelse, der påvirkes af mange faktorer - fra vejrforhold og vindmølleproduktion til internationale energimarkeder og forbrugsmønstre. Som forbruger kan du spare betydelige beløb ved at forstå, hvordan elpriserne svinger gennem døgnet og året.',
          ),
          createRichTextBlock(
            'Det danske elmarked er opdelt i to prisområder: DK1 (Jylland og Fyn) og DK2 (Sjælland og Bornholm). Priserne kan variere mellem disse områder på grund af forskelle i produktionskapacitet og transmissionsbegrænsninger. Spotpriser, som er timepriser på el, opdateres dagligt og danner grundlaget for din elregning sammen med dit elselskabs tillæg.',
          ),
          createBlockWithLink(
            'Ved at vælge det rigtige elselskab og den rigtige aftale kan en gennemsnitsfamilie spare op til 3.000 kr. årligt. Grøn strøm fra vindmøller og solceller presser ofte priserne ned, især i perioder med høj produktion. Se de aktuelle elpriser og find det bedste tilbud for dit forbrug.',
            'Se de aktuelle elpriser',
            '/elpriser'
          )
        ]
      },
      // Add ProviderList component after the text
      {
        _type: 'providerList',
        _key: generateKey(),
        title: 'Sammenlign elselskaber',
        subtitle: 'Find det bedste tilbud baseret på dit forbrug',
        headerAlignment: 'center'
      },
      
      // Section 7: Elselskaber Overview Section
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Etablerede elselskaber på det danske marked',
        headerAlignment: 'center',
        content: [
          createRichTextBlock(
            'Vi har samlet de største elselskaber på markedet og som også har været på markedet længst.',
            ['strong']
          ),
          createRichTextBlock(
            'Siden liberaliseringen af det danske elmarked i 2003 har forbrugere haft frit valg mellem elleverandører. Dette har skabt et konkurrencepræget marked, hvor elselskaber kæmper om at tilbyde de bedste priser og services. Vi fokuserer på etablerede strømudbydere, der har bevist deres stabilitet og pålidelighed gennem årene.',
          ),
          createRichTextBlock(
            'Stabiliteten hos de store elselskaber betyder tryghed for dig som forbruger. Du behøver ikke bekymre dig om pludselige konkurser eller dramatiske prisændringer. De etablerede selskaber har også de ressourcer, der skal til for at investere i grøn omstilling og innovative løsninger som fastprisaftaler og klimavenlige produkter.',
          ),
          createBlockWithLink(
            'Vores omfattende oversigt gør det nemt at sammenligne de forskellige elleverandører på markedet. Vi viser transparent information om priser, bindingsperioder og særlige fordele, så du kan træffe det valg, der passer bedst til dit forbrug og dine værdier. Se alle elselskaber og deres aktuelle tilbud.',
            'Se alle elselskaber',
            '/elselskaber'
          )
        ]
      },
      
      // Section 8: Video
      {
        _type: 'videoSection',
        _key: generateKey(),
        title: 'Se hvordan ElPortal fungerer',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // Placeholder - replace with actual video
      },
      
      // Section 9: Live Spot Prices
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Dagens spotpriser',
        headerAlignment: 'center',
        content: [
          createRichTextBlock(
            'Spotpriser er de timebaserede elpriser, der fastsættes på den nordiske elbørs Nord Pool. Disse priser afspejler det aktuelle forhold mellem udbud og efterspørgsel på elektricitet og opdateres hver dag kl. 13:00 for det kommende døgn. Data hentes direkte fra Energinet, som er den danske systemoperatør.',
          ),
          createRichTextBlock(
            'Som forbruger betaler du spotprisen plus dit elselskabs tillæg, netselskabets tariffer og afgifter. Ved at følge spotpriserne kan du tilpasse dit forbrug og spare penge - for eksempel ved at køre opvaskemaskine og vaskemaskine i de timer, hvor priserne er lavest. Mange moderne husholdningsapparater kan endda programmeres til automatisk at starte, når elpriserne falder.',
          ),
          createRichTextBlock(
            'Elpris i dag varierer typisk mellem 0 og 3 kr. per kWh, men kan i ekstreme situationer blive både negative (hvor du får penge for at bruge strøm) eller stige til over 10 kr. Ved høj vindproduktion og lavt forbrug falder priserne ofte markant, hvilket gør grøn energi både miljøvenlig og økonomisk fordelagtig.',
          ),
          {
            _type: 'livePriceGraph',
            _key: generateKey(),
            title: 'Aktuelle elpriser i dag',
            subtitle: 'Data hentet direkte fra Energinet',
            apiRegion: 'DK1',
            headerAlignment: 'center'
          }
        ]
      },
      
      // Section 10: Appliance Electricity Calculator
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Beregn dit elforbrug',
        headerAlignment: 'center',
        content: [
          createRichTextBlock(
            'At kende dit elforbrugs fordeling på forskellige apparater er første skridt mod en lavere elregning. Mange er overraskede over, hvor meget strøm almindelige husholdningsapparater bruger - især standby-forbrug og ældre apparater kan være store syndere i elregnskabet.',
          ),
          createRichTextBlock(
            'En moderne varmepumpe bruger typisk 3.000-5.000 kWh årligt, mens en elradiator kan bruge det dobbelte. Dit køleskab kører 24/7 og står for 10-15% af dit samlede strømforbrug. Ved at udskifte gamle apparater til energieffektive A+++ modeller kan en familie spare op til 2.000 kr. årligt på elregningen.',
          ),
          createBlockWithLink(
            'Brug vores beregner til at estimere præcist, hvad hvert apparat koster dig i strøm. Du kan indtaste dine egne apparater, deres watt-forbrug og brugstimer for at få et detaljeret overblik over dit elforbrug. Med denne viden kan du prioritere energibesparelser der, hvor det giver størst effekt. Prøv vores omfattende prisberegner.',
            'Prøv vores omfattende prisberegner',
            '/prisberegner'
          )
        ]
      },
      {
        _type: 'applianceCalculator',
        _key: generateKey(),
        title: 'Beregn dine apparaters elforbrug',
        subtitle: 'Find ud af hvad dine apparater koster i strøm'
      },
      
      // Section 11: Ladeboks (EV Charging)
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Ladeboks til elbil',
        headerAlignment: 'center',
        content: [
          createRichTextBlock(
            'Med den grønne omstilling og stigende antal elbiler på danske veje er en hjemmeladning blevet en nødvendighed for mange familier. En ladeboks til elbil gør det muligt at lade din bil sikkert og effektivt derhjemme - ofte til en brøkdel af prisen ved offentlige ladestandere.',
          ),
          createRichTextBlock(
            'Installation af ladeboks kræver typisk en autoriseret elektriker og muligvis forstærkning af din elinstallation. Prisen varierer fra 10.000-25.000 kr. afhængigt af ladeboksens funktioner og installationens kompleksitet. Staten yder tilskud på op til 7.500 kr. til private ladebokse gennem Ladeboks-ordningen, hvilket gør investeringen mere overkommelig.',
          ),
          createRichTextBlock(
            'Moderne ladebokse kan programmeres til at lade, når strømmen er billigst - typisk om natten eller i weekender med høj vindproduktion. Med smart opladning og grøn strøm kan du køre 100 km for under 20 kr. Mange ladebokse integrerer også med solcelleanlæg, så du kan lade din bil med egen produceret solenergi.',
          ),
          createBlockWithLink(
            'Vores guide til ladeboks dækker alt fra valg af den rigtige model til installation og daglig brug. Vi sammenligner de bedste ladebokse på markedet og forklarer, hvordan du får mest muligt ud af statens tilskud. Læs mere om ladeboks og få tilbud på installation.',
            'Læs mere om ladeboks',
            '/ladeboks'
          )
        ]
      }
    ]
    
    // Append new sections to existing content blocks
    const updatedContentBlocks = [...(homepage.contentBlocks || []), ...seoSections]
    
    // Update the homepage with new sections
    const result = await client.patch(homepage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ SEO content updated successfully!')
    console.log('Total content blocks:', result.contentBlocks.length)
    
    console.log('\n📝 Updated sections with rich SEO content:')
    console.log('- Section 6: Elpriser Overview (with link to /elpriser)')
    console.log('- Section 7: Elselskaber Overview (with link to /elselskaber)')
    console.log('- Section 9: Live Spot Prices explanation')
    console.log('- Section 10: Appliance Calculator (with link to /prisberegner)')
    console.log('- Section 11: Ladeboks/EV Charging (with link to /ladeboks)')
    
  } catch (error) {
    console.error('❌ Error updating SEO content:', error)
  }
}

// Run the script
updateHomepageWithSeoContent()