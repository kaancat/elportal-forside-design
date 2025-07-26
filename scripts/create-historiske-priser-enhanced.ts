import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

// Helper function to create a Portable Text block
const createTextBlock = (text: string, style: string = 'normal') => ({
  _type: 'block',
  _key: Math.random().toString(36).substring(7),
  style,
  markDefs: [],
  children: [
    {
      _type: 'span',
      _key: Math.random().toString(36).substring(7),
      text,
      marks: [],
    },
  ],
})

const createBoldText = (text: string) => ({
  _type: 'block',
  _key: Math.random().toString(36).substring(7),
  style: 'normal',
  markDefs: [],
  children: [
    {
      _type: 'span',
      _key: Math.random().toString(36).substring(7),
      text,
      marks: ['strong'],
    },
  ],
})

// Create an enhanced historical prices page with better structure
const enhancedPageContent = {
  _id: 'page.historiske-priser-v2',
  _type: 'page',
  title: 'Historiske Elpriser Danmark - Analyser Prisudviklingen 2022-2025',
  slug: 'historiske-priser-v2',
  seo: {
    title: 'Historiske Elpriser Danmark 2022-2025 | Prisudvikling & Trends',
    description: 'Dybdegående analyse af danske elpriser. Se historisk prisudvikling, forstå energikrisen 2022, sammenlign DK1/DK2 og træf bedre beslutninger om din elaftale.',
    keywords: [
      'historiske elpriser',
      'elpriser historik',
      'strømpriser historik',
      'elpris udvikling',
      'elpriser 2022',
      'elpriser 2023',
      'elpriser 2024',
      'energikrise 2022',
      'elpriser dk1 historik',
      'elpriser dk2 historik',
      'spotpris historik',
      'fast eller variabel elpris',
      'månedlig elpris historik',
      'hvornår er strøm billigst',
      'negative elpriser'
    ]
  },
  sections: [
    // Enhanced Hero with Calculator
    {
      _type: 'heroWithCalculator',
      _key: 'hero-calculator',
      title: 'Historiske Elpriser i Danmark',
      subtitle: 'Analyser prisudviklingen og find den bedste elaftale',
      buttonText: 'Se aktuelle priser',
      buttonLink: '#aktuelle-priser',
      statistics: [
        {
          _type: 'statistic',
          _key: 'stat1',
          label: 'Gns. pris 2024',
          value: '0,42 kr/kWh',
        },
        {
          _type: 'statistic',
          _key: 'stat2',
          label: 'Laveste pris nogensinde',
          value: '-0,15 kr/kWh',
        },
        {
          _type: 'statistic',
          _key: 'stat3',
          label: 'Højeste pris 2022',
          value: '5,82 kr/kWh',
        },
      ],
    },

    // Executive Summary with Key Insights
    {
      _type: 'pageSection',
      _key: 'executive-summary',
      title: 'Hovedindsigter fra Historiske Elpriser',
      subtitle: 'Det vigtigste du skal vide',
      content: [
        createBoldText('📊 Prisudvikling 2022-2024:'),
        createTextBlock('Efter rekordhøje priser i 2022 (gennemsnit 2,31 kr/kWh) er priserne faldet markant. I 2024 ligger gennemsnittet på 0,42 kr/kWh - et fald på 82%.'),
        createTextBlock(''),
        createBoldText('🌍 Årsager til normaliseringen:'),
        createTextBlock('• Fyldte gaslagre i Europa (over 95% kapacitet)'),
        createTextBlock('• Rekordhøj vindkraftproduktion i 2023-2024'),
        createTextBlock('• Genopretning af fransk atomkraft'),
        createTextBlock('• Milde vintre har reduceret energiforbruget'),
        createTextBlock(''),
        createBoldText('💡 Vigtige læringer:'),
        createTextBlock('• Variabel pris har over tid været 25-35% billigere end fastpris'),
        createTextBlock('• DK1 (Vestdanmark) har konsistent lavere priser end DK2'),
        createTextBlock('• Negative priser forekommer nu regelmæssigt (over 300 timer i 2024)'),
        createTextBlock('• Grøn omstilling driver priserne ned i vindrige perioder'),
      ],
      alignment: 'left',
      headerAlignment: 'center',
      colorTheme: 'brand'
    },

    // Interactive Timeline of Major Events
    {
      _type: 'pageSection',
      _key: 'tidslinje-events',
      title: 'Tidslinje: Vigtige Begivenheder i Elmarkedet',
      content: [
        createBoldText('Februar 2022: Ruslands invasion af Ukraine'),
        createTextBlock('Elpriser stiger fra 0,80 kr/kWh til over 2 kr/kWh på få uger.'),
        createTextBlock(''),
        createBoldText('August 2022: Energikrisens højdepunkt'),
        createTextBlock('Spotpriser når 5,82 kr/kWh. Mange danskere får elregninger på over 5.000 kr/måned.'),
        createTextBlock(''),
        createBoldText('September 2022: EU krisepakke'),
        createTextBlock('Loft over gaspriser og støtte til forbrugere annonceres.'),
        createTextBlock(''),
        createBoldText('Januar 2023: Mild vinter og fyldte gaslagre'),
        createTextBlock('Priser falder til under 1 kr/kWh for første gang siden krisen.'),
        createTextBlock(''),
        createBoldText('Juni 2023: Første negative priser'),
        createTextBlock('Rekord vindproduktion fører til negative spotpriser i 47 timer.'),
        createTextBlock(''),
        createBoldText('December 2023: Ny normalitet'),
        createTextBlock('Årsgennemsnit på 0,67 kr/kWh - tilbage på 2021-niveau.'),
        createTextBlock(''),
        createBoldText('2024: Grøn acceleration'),
        createTextBlock('Over 65% af dansk el kommer nu fra vind. Priser stabiliseres omkring 0,30-0,50 kr/kWh.'),
      ],
      alignment: 'left',
      headerAlignment: 'left',
      colorTheme: 'light'
    },

    // Main Historical Graph with Enhanced Description
    {
      _type: 'pageSection',
      _key: 'graf-introduktion',
      title: 'Interaktiv Prishistorik',
      subtitle: 'Udforsk prisudviklingen time for time',
      content: [
        createTextBlock('Brug vores interaktive graf til at analysere elprisernes udvikling. Du kan:'),
        createTextBlock('• Skifte mellem DK1 (Jylland/Fyn) og DK2 (Sjælland)'),
        createTextBlock('• Zoome ind på specifikke perioder (3 måneder til 5 år)'),
        createTextBlock('• Se både spotpriser og gennemsnitspriser'),
        createTextBlock('• Identificere mønstre og trends'),
        createTextBlock('Bemærk: Priserne viser rå spotpriser før afgifter, nettarif og moms.'),
      ],
      alignment: 'left',
      headerAlignment: 'left'
    },

    {
      _type: 'livePriceGraph',
      _key: 'historisk-hovedgraf',
      title: 'Spotprisudvikling 2022-2024',
      showRegionToggle: true,
      defaultRegion: 'DK1',
      graphType: 'line',
      showLegend: true,
      height: 500,
      annotations: [
        {
          _type: 'annotation',
          _key: 'ann1',
          date: '2022-08-26',
          label: 'Højeste pris: 5,82 kr/kWh',
        },
        {
          _type: 'annotation', 
          _key: 'ann2',
          date: '2024-06-15',
          label: 'Laveste pris: -0,15 kr/kWh',
        },
      ],
    },

    // Deep Dive: Understanding Price Components
    {
      _type: 'pageSection',
      _key: 'priskomponenter',
      title: 'Hvad Din Elregning Virkelig Består Af',
      subtitle: 'Fra spotpris til din endelige regning',
      content: [
        createTextBlock('Mange forstår ikke hvorfor deres elregning er så høj, når spotprisen er lav. Her er den fulde forklaring:'),
      ],
      alignment: 'center',
      headerAlignment: 'center',
      colorTheme: 'light'
    },

    // Price breakdown table
    {
      _type: 'priceExampleTable',
      _key: 'pris-opdeling',
      title: 'Eksempel: Din Pris ved Spotpris på 0,30 kr/kWh',
      examples: [
        {
          _type: 'priceExample',
          _key: 'ex1',
          label: 'Spotpris (rå elpris)',
          price: 0.30,
          unit: 'kr/kWh',
        },
        {
          _type: 'priceExample',
          _key: 'ex2',
          label: 'Elselskabets tillæg',
          price: 0.10,
          unit: 'kr/kWh',
        },
        {
          _type: 'priceExample',
          _key: 'ex3',
          label: 'Transport (nettarif)',
          price: 0.35,
          unit: 'kr/kWh',
        },
        {
          _type: 'priceExample',
          _key: 'ex4',
          label: 'Elafgift til staten',
          price: 0.90,
          unit: 'kr/kWh',
        },
        {
          _type: 'priceExample',
          _key: 'ex5',
          label: 'Subtotal før moms',
          price: 1.65,
          unit: 'kr/kWh',
        },
        {
          _type: 'priceExample',
          _key: 'ex6',
          label: 'Moms (25%)',
          price: 0.41,
          unit: 'kr/kWh',
        },
        {
          _type: 'priceExample',
          _key: 'ex7',
          label: 'Total pris',
          price: 2.06,
          unit: 'kr/kWh',
          highlight: true,
        },
      ],
    },

    // Monthly Patterns Analysis
    {
      _type: 'pageSection',
      _key: 'månedsmønstre-intro',
      title: 'Månedlige Prismønstre',
      subtitle: 'Hvornår på året er el billigst?',
      content: [
        createTextBlock('Baseret på 3 års data kan vi se klare sæsonmønstre i elpriserne:'),
      ],
      alignment: 'left',
      headerAlignment: 'left'
    },

    {
      _type: 'monthlyProductionChart',
      _key: 'månedspris-analyse',
      title: 'Gennemsnitlige Månedspriser 2022-2024',
      description: 'Spotpriser i øre/kWh per måned',
      chartType: 'bar',
      dataType: 'price',
      showTrend: true,
      showComparison: true
    },

    // Seasonal Deep Dive
    {
      _type: 'pageSection',
      _key: 'sæson-dybdeanalyse',
      title: 'Sæsonanalyse: Hvorfor Varierer Priserne?',
      content: [
        createBoldText('🌸 Forår (marts-maj): Faldende priser'),
        createTextBlock('• Stigende solproduktion reducerer dagtimepriserne'),
        createTextBlock('• Mindre opvarmningsbehov frigør kapacitet'),
        createTextBlock('• Ofte gode vindforhold i marts-april'),
        createTextBlock('• Gennemsnitspriser: 25-35 øre/kWh (2024)'),
        createTextBlock(''),
        createBoldText('☀️ Sommer (juni-august): Årets laveste priser'),
        createTextBlock('• Maksimal solcelleproduktion midt på dagen'),
        createTextBlock('• Lavt forbrug pga. ferie og ingen opvarmning'),
        createTextBlock('• Negative priser forekommer ofte i weekender'),
        createTextBlock('• Gennemsnitspriser: 20-30 øre/kWh (2024)'),
        createTextBlock(''),
        createBoldText('🍂 Efterår (september-november): Stigende priser'),
        createTextBlock('• Faldende solproduktion øger afhængighed af vind'),
        createTextBlock('• Opvarmningssæson starter i oktober'),
        createTextBlock('• Vindstille perioder kan give prisstigninger'),
        createTextBlock('• Gennemsnitspriser: 35-50 øre/kWh (2024)'),
        createTextBlock(''),
        createBoldText('❄️ Vinter (december-februar): Højeste priser'),
        createTextBlock('• Minimal solproduktion (kun 3-4 timer dagslys)'),
        createTextBlock('• Højt varmeforbrug presser kapaciteten'),
        createTextBlock('• Kuldeperioder kan tredoble priserne'),
        createTextBlock('• Gennemsnitspriser: 45-70 øre/kWh (2024)'),
      ],
      alignment: 'left',
      headerAlignment: 'left',
      colorTheme: 'light'
    },

    // Regional Comparison with Map
    {
      _type: 'pageSection',
      _key: 'regional-analyse',
      title: 'DK1 vs DK2: Regionale Forskelle Forklaret',
      content: [
        createTextBlock('Danmark har to separate elprisområder med ofte betydelige prisforskelle:'),
        createTextBlock(''),
        createBoldText('DK1 (Vestdanmark - Jylland/Fyn):'),
        createTextBlock('• 70% af Danmarks vindmøller står her'),
        createTextBlock('• Direkte forbindelse til Tyskland og Norge'),
        createTextBlock('• Gennemsnitligt 5-15% lavere priser end DK2'),
        createTextBlock('• Bedre mulighed for eksport ved overproduktion'),
        createTextBlock(''),
        createBoldText('DK2 (Østdanmark - Sjælland/Øerne):'),
        createTextBlock('• Tæt koblet til Sverige via Øresundskablet'),
        createTextBlock('• Påvirkes af svensk vandkraft og atomkraft'),
        createTextBlock('• Højere priser ved lav vandstand i Sverige'),
        createTextBlock('• Større prisudsving ved ekstreme vejrforhold'),
      ],
      alignment: 'left',
      headerAlignment: 'left'
    },

    // Advanced Price Comparison - Fixed vs Variable
    {
      _type: 'pageSection',
      _key: 'avanceret-sammenligning',
      title: 'Fast vs Variabel: Hvad Viser Historien?',
      subtitle: 'Baseret på faktiske priser 2022-2024',
      content: [
        createTextBlock('Vi har analyseret hvad forskellige kundetyper ville have betalt med fast kontra variabel pris:'),
      ],
      alignment: 'center',
      headerAlignment: 'center'
    },

    {
      _type: 'realPriceComparisonTable',
      _key: 'kunde-sammenligning',
      title: 'Årlig Besparelse ved Variabel Pris',
      leadingText: 'Beregnet for forskellige forbrugstyper over 24 måneder'
    },

    {
      _type: 'pageSection',
      _key: 'valg-analyse',
      title: 'Hvem Bør Vælge Hvad?',
      content: [
        createBoldText('Variabel pris passer dig hvis:'),
        createTextBlock('✓ Du kan tåle udsving i din månedlige elregning'),
        createTextBlock('✓ Du vil have fordel af lave priser når det blæser'),
        createTextBlock('✓ Du kan flytte forbrug til billige timer'),
        createTextBlock('✓ Du ønsker at støtte grøn omstilling (bruger mest grøn strøm når den er billigst)'),
        createTextBlock(''),
        createBoldText('Fast pris passer dig hvis:'),
        createTextBlock('✓ Du har et stramt budget og vil undgå overraskelser'),
        createTextBlock('✓ Du har højt forbrug i vinterhalvåret'),
        createTextBlock('✓ Du ikke kan/vil bekymre dig om at flytte forbrug'),
        createTextBlock('✓ Tryghed er vigtigere end potentielle besparelser'),
        createTextBlock(''),
        createBoldText('Hybrid-løsning (delvist fast/variabel):'),
        createTextBlock('Nogle selskaber tilbyder nu hybrid-løsninger hvor en del af dit forbrug er til fast pris (f.eks. 50%) og resten til variabel. Dette giver både sikkerhed og mulighed for besparelser.'),
      ],
      alignment: 'left',
      headerAlignment: 'left',
      colorTheme: 'light'
    },

    // Wind Power Impact
    {
      _type: 'pageSection',
      _key: 'vindkraft-indflydelse',
      title: 'Vindkraftens Indflydelse på Priserne',
      subtitle: 'Hvorfor blæsevejr giver billig strøm',
      content: [
        createTextBlock('Danmark er verdensledende inden for vindkraft, og det har direkte indflydelse på dine elpriser:'),
      ],
      alignment: 'left',
      headerAlignment: 'left'
    },

    {
      _type: 'renewableEnergyForecast',
      _key: 'vindkraft-prognose',
      title: 'Vindproduktion og Prispåvirkning',
      description: '48-timers prognose for vindkraft og forventet prispåvirkning',
      showWindSpeed: true,
      showPriceImpact: true
    },

    {
      _type: 'pageSection',
      _key: 'vindkraft-fakta',
      title: 'Vindkraftens Betydning i Tal',
      content: [
        createTextBlock('• Ved vindstyrke over 10 m/s falder spotprisen typisk med 40-60%'),
        createTextBlock('• I 2024 kom 67% af dansk el fra vind (ny rekord)'),
        createTextBlock('• Ved storm kan Danmark producere 3x det nationale forbrug'),
        createTextBlock('• Negative priser opstår oftest ved vindstyrke over 15 m/s i weekender'),
        createTextBlock('• Vindstød leverer 100% vindstrøm - perfekt match til det danske marked'),
      ],
      alignment: 'left',
      headerAlignment: 'left',
      colorTheme: 'brand'
    },

    // CO2 and Green Transition
    {
      _type: 'pageSection',
      _key: 'grøn-omstilling-intro',
      title: 'Den Grønne Omstilling og Elpriserne',
      subtitle: 'Hvordan CO2-neutral el påvirker din økonomi',
      content: [
        createTextBlock('Der er en direkte sammenhæng mellem grøn strøm og lave priser. Jo mere vedvarende energi i nettet, jo lavere bliver både prisen og CO2-udledningen.'),
      ],
      alignment: 'center',
      headerAlignment: 'center'
    },

    {
      _type: 'co2EmissionsChart',
      _key: 'co2-udvikling',
      title: 'CO2-Intensitet vs Elpris',
      description: 'Se sammenhængen mellem grøn produktion og priser',
      defaultRegion: 'DK1',
      showRegionToggle: true,
      showCorrelation: true
    },

    {
      _type: 'declarationProduction',
      _key: 'produktion-mix',
      title: 'Produktionsmix Time for Time',
      description: 'Se hvilke energikilder der leverer strømmen lige nu',
      showHistorical: true,
      defaultView: '24h'
    },

    // Smart Consumption Tips
    {
      _type: 'pageSection',
      _key: 'smarte-forbrugstips',
      title: '10 Tips til at Udnytte Lave Elpriser',
      content: [
        createBoldText('1. Installer en smart elmåler app'),
        createTextBlock('Apps som "Watts" eller "True Energy" viser timepriser og sender notifikationer ved lave priser.'),
        createTextBlock(''),
        createBoldText('2. Oplad elbilen om natten'),
        createTextBlock('Programmér opladning til kl. 01:00-05:00 hvor priserne typisk er 40% lavere.'),
        createTextBlock(''),
        createBoldText('3. Brug timer på vaskemaskine og opvaskemaskine'),
        createTextBlock('De fleste moderne maskiner kan startes forsinket - udnyt det!'),
        createTextBlock(''),
        createBoldText('4. Varmepumpe med intelligent styring'),
        createTextBlock('Nye varmepumper kan time opvarmning efter elpriser og spare 20-30%.'),
        createTextBlock(''),
        createBoldText('5. Undgå forbrug kl. 17-20'),
        createTextBlock('Dette er næsten altid dagens dyreste timer - vent med energikrævende aktiviteter.'),
        createTextBlock(''),
        createBoldText('6. Udnyt negative priser'),
        createTextBlock('Ved negative priser (ofte søndage med meget vind) kør alt hvad du kan!'),
        createTextBlock(''),
        createBoldText('7. Overvej hjemmebatteri'),
        createTextBlock('Lad op når strøm er billig, brug når den er dyr. ROI på 7-10 år.'),
        createTextBlock(''),
        createBoldText('8. Skift til LED og energieffektive apparater'),
        createTextBlock('Mindre forbrug = mindre følsomhed over for prisudsving.'),
        createTextBlock(''),
        createBoldText('9. Isolér din bolig bedre'),
        createTextBlock('Mindre varmeforbrug er den bedste beskyttelse mod høje vinterpriser.'),
        createTextBlock(''),
        createBoldText('10. Vælg et elselskab med transparente priser'),
        createTextBlock('Undgå skjulte gebyrer - vælg selskaber som Vindstød med simple, fair priser.'),
      ],
      alignment: 'left',
      headerAlignment: 'left',
      colorTheme: 'light'
    },

    // Price Calculator Integration
    {
      _type: 'pageSection',
      _key: 'beregn-besparelse-intro',
      title: 'Beregn Din Potentielle Besparelse',
      subtitle: 'Se hvad du kunne spare med variabel pris',
      content: [
        createTextBlock('Brug vores beregner til at se, hvad du kunne have sparet de seneste 12 måneder med en variabel prisaftale sammenlignet med fast pris.'),
      ],
      alignment: 'center',
      headerAlignment: 'center'
    },

    {
      _type: 'priceCalculator',
      _key: 'besparelses-beregner',
      title: 'Besparelsesberegner',
      showHistoricalComparison: true,
      defaultConsumption: 4000,
      comparisonMode: 'fixed-vs-variable'
    },

    // Provider Comparison with Focus
    {
      _type: 'pageSection',
      _key: 'find-bedste-aftale',
      title: 'Fra Analyse til Handling',
      subtitle: 'Find den rette elaftale baseret på historiske data',
      content: [
        createTextBlock('Nu hvor du forstår elprisernes udvikling og mønstre, er det tid til at finde den bedste aftale. Vores anbefalinger baseret på historisk analyse:'),
        createTextBlock(''),
        createBoldText('🌱 Vil du have grøn strøm og lave priser?'),
        createTextBlock('Vindstød tilbyder 100% dansk vindstrøm til nogle af markedets laveste priser. Perfekt hvis du ønsker at støtte grøn omstilling uden at betale overpris.'),
        createTextBlock(''),
        createBoldText('💰 Ønsker du maksimal fleksibilitet?'),
        createTextBlock('Vælg et selskab med timeprisaftale og ingen bindingsperiode. Du kan så altid skifte hvis markedet ændrer sig.'),
        createTextBlock(''),
        createBoldText('🛡️ Prioriterer du tryghed?'),
        createTextBlock('Overvej en hybrid-løsning eller kort fastprisaftale (3-6 måneder) hvis du er bekymret for prisudsving.'),
      ],
      alignment: 'center',
      headerAlignment: 'center',
      colorTheme: 'brand'
    },

    {
      _type: 'providerList',
      _key: 'aktuelle-priser',
      title: 'Sammenlign Aktuelle Elpriser',
      description: 'Opdateret dagligt med de nyeste priser og tilbud',
      showDetailedView: true,
      highlightCheapest: true,
      defaultSortBy: 'price',
      showGreenEnergy: true,
      showPriceGuarantee: true
    },

    // Comprehensive FAQ
    {
      _type: 'faqGroup',
      _key: 'omfattende-faq',
      title: 'Alt du Skal Vide om Historiske Elpriser',
      items: [
        {
          _type: 'faqItem',
          _key: 'faq-negative',
          question: 'Hvordan kan elpriser være negative?',
          answer: [
            createTextBlock('Negative elpriser opstår når produktionen overstiger forbruget markant, typisk når:'),
            createTextBlock('• Der er meget vind og sol samtidig (ofte søndage i sommermånederne)'),
            createTextBlock('• Industriforbruget er lavt (weekender og helligdage)'),
            createTextBlock('• Nabolande også har overproduktion'),
            createTextBlock('Producenterne betaler faktisk for at komme af med strømmen, da det kan være dyrere at lukke vindmøller ned end at betale for afsætning. Som forbruger får du dog sjældent penge tilbage, da transport og afgifter stadig skal betales.'),
          ],
        },
        {
          _type: 'faqItem',
          _key: 'faq-prognose',
          question: 'Kan man forudsige fremtidige elpriser?',
          answer: [
            createTextBlock('Kortsigtede prognoser (1-7 dage) er ret præcise og baseres på:'),
            createTextBlock('• Vejrudsigter (vind og sol)'),
            createTextBlock('• Planlagt produktion og forbrug'),
            createTextBlock('• Kendte vedligeholdelser af kraftværker'),
            createTextBlock(''),
            createTextBlock('Langsigtede prognoser (måneder/år) er meget usikre og afhænger af:'),
            createTextBlock('• Vejret (kolde vintre, varme somre)'),
            createTextBlock('• Geopolitiske forhold'),
            createTextBlock('• Udbygning af vedvarende energi'),
            createTextBlock('• Økonomisk udvikling'),
            createTextBlock('Generelt forventes priser at falde på lang sigt pga. mere vedvarende energi.'),
          ],
        },
        {
          _type: 'faqItem',
          _key: 'faq-europa',
          question: 'Hvorfor påvirkes danske priser af resten af Europa?',
          answer: [
            createTextBlock('Danmark er del af det nordeuropæiske elmarked fordi:'),
            createTextBlock('• Vi har kabler til Tyskland, Norge, Sverige og Holland'),
            createTextBlock('• El handles frit over grænserne hvor der er billigst'),
            createTextBlock('• Vi eksporterer ved overproduktion og importerer ved mangel'),
            createTextBlock('• Priser udlignes delvist mellem lande (men ikke helt pga. begrænsninger i kabler)'),
            createTextBlock('Dette er en fordel da det giver forsyningssikkerhed og mulighed for at sælge overskudsproduktion.'),
          ],
        },
        {
          _type: 'faqItem',
          _key: 'faq-grøn-strøm',
          question: 'Er grøn strøm dyrere end almindelig strøm?',
          answer: [
            createTextBlock('Nej, tværtimod! Historiske data viser at:'),
            createTextBlock('• Vindstrøm er nu den billigste produktionsform'),
            createTextBlock('• Priser er lavest når der er meget vind og sol'),
            createTextBlock('• Grønne elselskaber som Vindstød har ofte lavere priser'),
            createTextBlock('• Fossile brændstoffer (gas/kul) er blevet dyrere pga. CO2-afgifter'),
            createTextBlock('Myten om dyr grøn strøm stammer fra subsidierne i 00erne, men i dag er vedvarende energi konkurrencedygtig uden støtte.'),
          ],
        },
        {
          _type: 'faqItem',
          _key: 'faq-ladeboks',
          question: 'Hvordan påvirker elbiler elpriserne?',
          answer: [
            createTextBlock('Elbiler har både positive og negative effekter:'),
            createTextBlock(''),
            createTextBlock('Positive effekter:'),
            createTextBlock('• Smart opladning kan udnytte billig natstrøm'),
            createTextBlock('• Vehicle-to-Grid kan stabilisere nettet'),
            createTextBlock('• Øget forbrug giver bedre økonomi i vindmøller'),
            createTextBlock(''),
            createTextBlock('Udfordringer:'),
            createTextBlock('• Hvis alle lader kl. 17-19 kan det presse priserne op'),
            createTextBlock('• Kræver udbygning af elnettet nogle steder'),
            createTextBlock(''),
            createTextBlock('Samlet set forventes elbiler at stabilisere priserne ved at give mere fleksibelt forbrug.'),
          ],
        },
        {
          _type: 'faqItem',
          _key: 'faq-historisk-data',
          question: 'Hvor langt tilbage kan man se historiske elpriser?',
          answer: [
            createTextBlock('• Nord Pool har timepriser tilbage til 2000'),
            createTextBlock('• Detaljerede DK1/DK2 priser fra 2007'),
            createTextBlock('• Kvaliteten af ældre data er lavere'),
            createTextBlock('• ElPortal viser primært data fra 2020 og frem'),
            createTextBlock('• De seneste 2-3 år er mest relevante pga. markedsændringer'),
          ],
        },
      ],
    },

    // Technical Appendix
    {
      _type: 'pageSection',
      _key: 'teknisk-appendiks',
      title: 'Teknisk Information om Data',
      content: [
        createBoldText('Datakilder:'),
        createTextBlock('• Spotpriser: Nord Pool (opdateres dagligt kl. 13:00)'),
        createTextBlock('• CO2-data: Energinet (realtidsdata hvert 5. minut)'),
        createTextBlock('• Produktionsdata: Energinet DataHub'),
        createTextBlock('• Prognoser: Energinet og DMI'),
        createTextBlock(''),
        createBoldText('Beregningsmetoder:'),
        createTextBlock('• Alle priser vises ekskl. moms medmindre andet er angivet'),
        createTextBlock('• Gennemsnit beregnes som simpelt aritmetisk gennemsnit'),
        createTextBlock('• Sæsondata normaliseres for at kompensere for skudår'),
        createTextBlock('• Regional sammenligning justeres for transmissionstab'),
        createTextBlock(''),
        createBoldText('Opdateringsfrekvens:'),
        createTextBlock('• Spotpriser: Dagligt kl. 14:00 for næste døgn'),
        createTextBlock('• Historiske grafer: Hver nat kl. 02:00'),
        createTextBlock('• Statistikker: Hver time'),
        createTextBlock('• Prognoser: Hver 6. time'),
      ],
      alignment: 'left',
      headerAlignment: 'left',
      colorTheme: 'light'
    },

    // Final CTA
    {
      _type: 'callToActionSection',
      _key: 'final-cta',
      title: 'Klar til at Spare på Din Elregning?',
      description: 'Start med at sammenligne priser og find den bedste aftale til dit forbrug',
      primaryButton: {
        text: 'Sammenlign Elpriser Nu',
        link: '/sammenlign-elpriser',
      },
      secondaryButton: {
        text: 'Læs om Vindstød',
        link: '/elselskaber/vindstod',
      },
      backgroundColor: 'brand',
    },
  ],
}

async function createEnhancedPage() {
  try {
    console.log('Creating enhanced historiske priser page...')
    const result = await client.createOrReplace(enhancedPageContent)
    console.log('Enhanced page created successfully!')
    console.log('Page ID:', result._id)
    console.log('View at: https://dinelportal.sanity.studio/structure/page;page.historiske-priser-v2')
  } catch (error) {
    console.error('Error creating enhanced page:', error)
    if (error.response) {
      console.error('Response:', error.response.body)
    }
  }
}

createEnhancedPage()