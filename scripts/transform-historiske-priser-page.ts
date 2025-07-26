#!/usr/bin/env tsx
import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import chalk from 'chalk'

// Load environment variables
dotenv.config()

// Initialize Sanity client
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to create rich text blocks
function createRichText(text: string) {
  return [{
    _type: 'block',
    style: 'normal',
    children: [{ _type: 'span', text }]
  }]
}

// Helper function to create paragraph blocks with proper spacing
function createParagraphs(...paragraphs: string[]) {
  return paragraphs.map(text => ({
    _type: 'block',
    style: 'normal',
    children: [{ _type: 'span', text }]
  }))
}

async function transformHistoriskePriserPage() {
  const pageId = 'qgCxJyBbKpvhb2oGYjlhjr'
  
  console.log(chalk.blue('🔄 Starting transformation of historiske-priser page...'))
  
  try {
    // Fetch current page content
    console.log(chalk.yellow('📥 Fetching current page content...'))
    const currentPage = await client.getDocument(pageId)
    
    if (!currentPage) {
      throw new Error('Page not found')
    }
    
    console.log(chalk.green('✓ Page fetched successfully'))
    console.log(chalk.gray(`Current sections: ${currentPage.sections?.length || 0}`))
    
    // Debug: Log current sections
    if (currentPage.sections) {
      currentPage.sections.forEach((section: any, index: number) => {
        console.log(chalk.gray(`  Section ${index}: ${section._type} (key: ${section._key})`))
      })
    }
    
    // Find key sections from the current page
    const heroSection = currentPage.sections?.find((s: any) => s._type === 'heroSection')
    const monthlyProductionChart = currentPage.sections?.find((s: any) => s._type === 'monthlyProductionChart')
    const providerList = currentPage.sections?.find((s: any) => s._type === 'providerList')
    
    // Create new sections array with transformed content
    const transformedSections = []
    
    // Add hero section if it exists
    if (heroSection) {
      transformedSections.push(heroSection)
    }
    
    // Add monthly production chart if it exists
    if (monthlyProductionChart) {
      transformedSections.push(monthlyProductionChart)
    }
    
    // Add explanatory paragraph after the chart
    transformedSections.push({
      _type: 'pageSection',
      _key: 'intro-paragraph',
      headerAlignment: 'left',
      content: createParagraphs(
        'At forstå historiske elpriser er afgørende for at træffe informerede beslutninger om dit elforbrug og valg af elleverandør. De danske elpriser svinger konstant baseret på faktorer som vejrforhold, vindproduktion, forbrug og internationale energimarkeder.',
        'Ved at analysere mønstre i historiske priser kan du identificere de bedste tidspunkter at bruge el på, forstå sæsonvariationer og træffe bedre valg mellem faste og variable prisaftaler. Vores omfattende historiske data giver dig indsigt i både kortsigtede og langsigtede pristendenser.'
      )
    })
    
    // Add regional comparison component
    transformedSections.push({
      _type: 'regionalComparison',
      _key: 'regional-comparison',
      title: 'Regionale Prisforskelle: DK1 vs DK2',
      description: createRichText('Danmark er opdelt i to prisområder med forskellige prismønstre. Forstå forskellene mellem Vest- og Østdanmark for at optimere dit elforbrug.'),
      dk1Title: 'DK1 - Vestdanmark',
      dk1Description: 'Jylland og Fyn',
      dk1Points: [
        'Højere vindkraftkapacitet giver ofte lavere priser',
        'Tættere forbindelse til det tyske marked',
        'Større prisudsving ved høj/lav vindproduktion',
        'Gennemsnitligt 5-10% lavere priser end DK2'
      ],
      dk2Title: 'DK2 - Østdanmark', 
      dk2Description: 'Sjælland og Bornholm',
      dk2Points: [
        'Mindre lokal produktionskapacitet',
        'Stærkere forbindelse til Sverige og Norge',
        'Mere stabile priser gennem døgnet',
        'Påvirket af vandkraftsituationen i Norden'
      ],
      showPriceComparison: true,
      showProductionData: true
    })
    
    // Add connecting paragraph
    transformedSections.push({
      _type: 'pageSection',
      _key: 'pricing-intro',
      headerAlignment: 'center',
      content: createParagraphs(
        'Valget mellem fast og variabel pris er en af de vigtigste beslutninger, du skal træffe som elforbruger. Historiske data viser, at det rigtige valg afhænger af din risikovillighed, forbrugsmønster og evne til at tilpasse dit forbrug efter prissvingninger.'
      )
    })
    
    // Add pricing comparison component
    transformedSections.push({
      _type: 'pricingComparison',
      _key: 'pricing-comparison',
      title: 'Fast vs. Variabel Pris: Hvad Viser Historien?',
      description: createRichText('Analyser fordele og ulemper ved forskellige prismodeller baseret på historiske data og markedstendenser.'),
      fixedPriceTitle: 'Fast Pris',
      fixedPriceDescription: 'Stabil og forudsigelig',
      fixedPriceAdvantages: [
        'Budgetsikkerhed - samme pris hver måned',
        'Beskyttelse mod prisstigninger',
        'Ingen bekymringer om markedsudsving',
        'Velegnet til højt vinterforbrug'
      ],
      fixedPriceDisadvantages: [
        'Går glip af lave spotpriser',
        'Typisk 10-20% dyrere på årsbasis',
        'Bindingsperioder på 6-24 måneder',
        'Ingen fordel af grøn energiproduktion'
      ],
      variablePriceTitle: 'Variabel Pris (Spotpris)',
      variablePriceDescription: 'Følger markedsprisen time for time',
      variablePriceAdvantages: [
        'Laveste gennemsnitspris over tid',
        'Udnyt lave priser om natten og weekender',
        'Ingen binding - skift når som helst',
        'Belønning for fleksibelt forbrug'
      ],
      variablePriceDisadvantages: [
        'Uforudsigelige månedlige regninger',
        'Risiko for høje priser i kolde perioder',
        'Kræver aktiv overvågning',
        'Stress ved ekstreme prisudsving'
      ],
      showHistoricalComparison: true,
      showCalculator: true
    })
    
    // Add daily price timeline component
    transformedSections.push({
      _type: 'dailyPriceTimeline',
      _key: 'daily-timeline',
      title: 'Døgnets Prisvariationer',
      description: createRichText('Elprisen varierer betydeligt gennem døgnet. Se de typiske mønstre og lær hvornår det er billigst at bruge el.'),
      timeSlots: [
        {
          _type: 'timeSlot',
          _key: 'night',
          period: 'Nat (00:00 - 06:00)',
          priceLevel: 'low',
          description: 'Laveste priser - minimal efterspørgsel',
          tips: [
            'Kør opvaskemaskine og vaskemaskine',
            'Oplad elbil og batterier',
            'Varmepumper kan køre på fuld kraft'
          ]
        },
        {
          _type: 'timeSlot',
          _key: 'morning',
          period: 'Morgen (06:00 - 09:00)',
          priceLevel: 'high',
          description: 'Morgenpeak - høj efterspørgsel',
          tips: [
            'Undgå stort elforbrug hvis muligt',
            'Udskyd opvarmning til senere',
            'Brug timer-funktioner på apparater'
          ]
        },
        {
          _type: 'timeSlot',
          _key: 'midday',
          period: 'Middag (09:00 - 15:00)',
          priceLevel: 'medium',
          description: 'Moderate priser - især ved sol',
          tips: [
            'God tid til hjemmearbejde',
            'Udnyt solenergi hvis tilgængelig',
            'Almindeligt forbrug acceptabelt'
          ]
        },
        {
          _type: 'timeSlot',
          _key: 'afternoon',
          period: 'Eftermiddag (15:00 - 17:00)',
          priceLevel: 'medium',
          description: 'Stigende priser mod aften',
          tips: [
            'Forbered aftensmad tidligt',
            'Afslut energikrævende opgaver',
            'Tjek morgendagens priser'
          ]
        },
        {
          _type: 'timeSlot',
          _key: 'evening',
          period: 'Aften (17:00 - 20:00)',
          priceLevel: 'high',
          description: 'Aftenpeak - højeste priser',
          tips: [
            'Minimér elforbrug',
            'Udskyd vask og opvask',
            'Brug alternative energikilder'
          ]
        },
        {
          _type: 'timeSlot',
          _key: 'late-evening',
          period: 'Sen aften (20:00 - 24:00)',
          priceLevel: 'medium',
          description: 'Faldende priser mod nat',
          tips: [
            'Start tidsforsinkede programmer',
            'Forbered natopladning',
            'Tjek næste dags priser'
          ]
        }
      ],
      showLivePrice: true,
      showHistoricalPattern: true
    })
    
    // Add seasonal variations as info cards
    transformedSections.push({
      _type: 'infoCardsSection',
      _key: 'seasonal-info',
      title: 'Sæsonvariationer i Elpriser',
      description: createRichText('Elpriserne følger tydelige sæsonmønstre gennem året. Forstå disse variationer for at planlægge dit forbrug bedre.'),
      cards: [
        {
          _type: 'infoCard',
          _key: 'winter',
          title: 'Vinter (Dec-Feb)',
          icon: 'snowflake',
          content: createRichText('Højeste priser på året grundet øget varmebehov og reduceret sol- og vindproduktion. Priser kan være 50-100% højere end sommergennemsnit.'),
          highlight: true
        },
        {
          _type: 'infoCard',
          _key: 'spring',
          title: 'Forår (Mar-Maj)',
          icon: 'flower',
          content: createRichText('Faldende priser når varmebehovet aftager. Øget vindproduktion og længere dage reducerer priserne gradvist.'),
          highlight: false
        },
        {
          _type: 'infoCard',
          _key: 'summer',
          title: 'Sommer (Jun-Aug)',
          icon: 'sun',
          content: createRichText('Laveste priser på året. Minimalt varmebehov og maksimal solproduktion giver ofte negative priser i weekender.'),
          highlight: true
        },
        {
          _type: 'infoCard',
          _key: 'autumn',
          title: 'Efterår (Sep-Nov)',
          icon: 'leaf',
          content: createRichText('Stigende priser når varmebehovet vender tilbage. Kraftige efterårsstorme kan dog give perioder med meget lave priser.'),
          highlight: false
        }
      ],
      columns: 4,
      colorScheme: 'seasonal'
    })
    
    // Add section about factors affecting prices
    transformedSections.push({
      _type: 'pageSection',
      _key: 'price-factors',
      headerAlignment: 'center',
      title: 'Hvad Påvirker Elpriserne?',
      content: createParagraphs(
        'Elpriserne på det nordiske marked påvirkes af et komplekst samspil mellem mange faktorer. Vejret spiller en afgørende rolle - vindstyrke bestemmer vindmølleproduktionen, nedbør påvirker vandkraftproduktionen i Norge og Sverige, og temperaturen styrer efterspørgslen efter opvarmning.',
        'Internationale forhold har også stor betydning. Gaspriser, kulpriser og CO2-kvotepriser påvirker omkostningerne ved konventionel elproduktion. Samtidig kan tekniske problemer i atomkraftværker, vedligeholdelse af transmissionslinjer eller politiske beslutninger skabe pludselige prisændringer.',
        'På længere sigt påvirkes priserne af udbygningen med vedvarende energi, elektrificering af transportsektoren og udviklingen i energilagringsløsninger. Forståelse af disse faktorer hjælper dig med at forudsige pristrends og træffe bedre beslutninger om dit elforbrug.'
      )
    })
    
    // Add tips as info cards
    transformedSections.push({
      _type: 'infoCardsSection',
      _key: 'saving-tips',
      title: 'Sådan Udnytter Du Historiske Prismønstre',
      description: createRichText('Praktiske tips baseret på analyser af historiske elpriser og forbrugsmønstre.'),
      cards: [
        {
          _type: 'infoCard',
          _key: 'flexibility',
          title: 'Vær Fleksibel',
          icon: 'clock',
          content: createRichText('Flyt dit forbrug til timer med lave priser. Brug timere på vaskemaskine, opvaskemaskine og varmepumpe. Historisk data viser besparelser på 20-30%.'),
          highlight: false
        },
        {
          _type: 'infoCard',
          _key: 'monitor',
          title: 'Overvåg Priser',
          icon: 'chart',
          content: createRichText('Følg daglige og timevise prisudsving. Brug apps eller vores prisgraf til at se næste dags priser kl. 13:00. Planlæg stort forbrug efter prisfald.'),
          highlight: true
        },
        {
          _type: 'infoCard',
          _key: 'seasonal',
          title: 'Tænk Sæson',
          icon: 'calendar',
          content: createRichText('Overvej fast pris om vinteren hvis du har højt varmeforbrug. Skift til variabel pris om sommeren for at udnytte lave priser og negative perioder.'),
          highlight: false
        },
        {
          _type: 'infoCard',
          _key: 'invest',
          title: 'Invester Smart',
          icon: 'lightbulb',
          content: createRichText('Batterier, solceller og smart home-løsninger betaler sig hurtigere med varierende priser. Historisk data hjælper med at beregne tilbagebetalingstid.'),
          highlight: true
        }
      ],
      columns: 2,
      colorScheme: 'gradient'
    })
    
    // Add concluding section
    transformedSections.push({
      _type: 'pageSection',
      _key: 'conclusion',
      headerAlignment: 'center',
      content: createParagraphs(
        'Historiske elpriser giver værdifuld indsigt i markedsdynamikken og hjælper dig med at træffe bedre beslutninger om dit elforbrug. Ved at forstå prismønstre, sæsonvariationer og daglige svingninger kan du optimere dit forbrug og spare betydelige beløb på din elregning.',
        'Husk at elpriserne konstant udvikler sig med den grønne omstilling. Mere vindkraft og solenergi skaber større prisudsving men også flere muligheder for besparelser. Ved at vælge en elleverandør med fokus på vedvarende energi som Vindstød, støtter du ikke kun den grønne omstilling men får også adgang til nogle af markedets mest konkurrencedygtige priser.',
        'Start med at analysere dit eget forbrugsmønster og overvej om du kan flytte noget af dit forbrug til billigere timer. Selv små ændringer i dine vaner kan give mærkbare besparelser over tid.'
      )
    })
    
    // Add provider list at the end if it exists
    if (providerList) {
      transformedSections.push(providerList)
    }
    
    // Update the page
    console.log(chalk.yellow('📤 Updating page in Sanity...'))
    console.log(chalk.gray(`Sending ${transformedSections.length} sections`))
    
    const updatedPage = await client
      .patch(pageId)
      .set({ 
        sections: transformedSections,
        lastUpdated: new Date().toISOString()
      })
      .commit()
    
    console.log(chalk.green('✅ Page successfully transformed!'))
    console.log(chalk.blue(`\n📊 Summary:`))
    console.log(chalk.gray(`- Original sections: ${currentPage.sections?.length || 0}`))
    console.log(chalk.gray(`- Transformed sections: ${transformedSections.length}`))
    console.log(chalk.gray(`- Added components: regionalComparison, pricingComparison, dailyPriceTimeline, infoCardsSection (x2)`))
    console.log(chalk.gray(`- Added explanatory paragraphs: 3 sections`))
    
    console.log(chalk.blue('\n🔗 View the updated page at:'))
    console.log(chalk.cyan('https://elportal.dk/historiske-priser'))
    
  } catch (error) {
    console.error(chalk.red('❌ Error transforming page:'))
    console.error(error)
    process.exit(1)
  }
}

// Run the transformation
transformHistoriskePriserPage().catch(console.error)