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

async function updateForbrugTrackerPage() {
  console.log('Updating Forbrug Tracker page with comprehensive SEO content...')

  const pageContent = {
    _id: 'f5IMbE4BjT3OYPNFYb8v2Z',
    _type: 'page',
    title: 'Forbrug Tracker',
    slug: {
      _type: 'slug',
      current: 'forbrug-tracker'
    },
    seo: {
      _type: 'seo',
      metaTitle: 'Forbrug Tracker - Dit Personlige Elforbrug i Realtid | DinElPortal',
      metaDescription: 'Forbind sikkert med Eloverblik via MitID. Se dit faktiske elforbrug time for time, beregn præcise omkostninger og find besparelser hos forskellige elleverandører.',
      keywords: 'elforbrug tracker, eloverblik integration, strømforbrug måler, elregning beregner, faktisk elforbrug, spar på elregningen, grøn energi forbrug, vindstrøm priser, MitID eloverblik, energiforbrug analyse'
    },
    contentBlocks: [
      // 1. Hero Section
      {
        _type: 'hero',
        _key: 'hero-forbrug-tracker',
        headline: 'Dit Personlige Elforbrug - Følg Med i Realtid',
        subheadline: 'Forbind sikkert med Eloverblik og få fuld kontrol over dit strømforbrug og omkostninger. Log ind med MitID og se præcis hvor meget strøm du bruger.'
      },
      
      // 2. Forbrug Tracker Widget (Main focal point)
      {
        _type: 'forbrugTracker',
        _key: 'forbrug-tracker-main',
        title: 'Start Din Forbrug Tracker Nu',
        description: 'Log ind med MitID og se dit faktiske elforbrug time for time. Få øjeblikkelig adgang til dine forbrugsdata.',
        connectButtonText: 'Forbind med Eloverblik',
        connectedText: 'Forbundet med Eloverblik',
        showBenefits: true,
        headerAlignment: 'center'
      },

      // 3. Value Proposition
      {
        _type: 'valueProposition',
        _key: 'benefits',
        heading: 'Hvorfor Bruge DinElPortals Forbrug Tracker?',
        subheading: 'Få fuld kontrol over dit elforbrug med markedets mest sikre og præcise løsning',
        valueItems: [
          {
            _type: 'valueItem',
            _key: 'vi1',
            icon: {
              _type: 'icon',
              name: 'Shield',
              provider: 'lucide'
            },
            title: '100% Sikker med MitID',
            description: 'Dine data hentes direkte fra Eloverblik og gemmes aldrig på vores servere. Forbindelsen lukkes automatisk efter 30 minutter.'
          },
          {
            _type: 'valueItem',
            _key: 'vi2',
            icon: {
              _type: 'icon',
              name: 'BarChart3',
              provider: 'lucide'
            },
            title: 'Realtidsdata Time for Time',
            description: 'Se dit faktiske forbrug opdelt på timer, dage og måneder. Ingen estimater - kun præcise målinger fra din elmåler.'
          },
          {
            _type: 'valueItem',
            _key: 'vi3',
            icon: {
              _type: 'icon',
              name: 'Calculator',
              provider: 'lucide'
            },
            title: 'Præcise Omkostningsberegninger',
            description: 'Beregn dine faktiske elomkostninger baseret på aktuelle spotpriser og dit reelle forbrug.'
          },
          {
            _type: 'valueItem',
            _key: 'vi4',
            icon: {
              _type: 'icon',
              name: 'TrendingDown',
              provider: 'lucide'
            },
            title: 'Find Din Besparelse',
            description: 'Sammenlign priser hos alle danske elleverandører baseret på dit faktiske forbrug - ikke bare gennemsnit.'
          }
        ]
      },

      // 4. Eloverblik Security & Privacy Section
      {
        _type: 'pageSection',
        _key: 'security-section',
        title: 'Er Dine Data Sikre med Eloverblik?',
        headerAlignment: 'left',
        content: [
          {
            _type: 'block',
            _key: 'sec-1',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Når du bruger DinElPortals Forbrug Tracker, er sikkerheden i højsædet. Vi forstår, at dine elforbrugsdata er personlige, og derfor har vi implementeret markedets strengeste sikkerhedsforanstaltninger.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'sec-2',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'OAuth 2.0 Token-baseret Autentificering',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'sec-3',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Eloverblik bruger OAuth 2.0 standarden - den samme sikkerhedsprotokol som anvendes af Google, Facebook og banker. Når du logger ind med MitID, genereres en sikker token, der kun giver adgang til de data, du specifikt har godkendt. Denne token udløber automatisk efter 30 minutter, hvilket sikrer, at ingen kan få uautoriseret adgang til dine data.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'sec-4',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'GDPR og Dansk Databeskyttelseslov',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'sec-5',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'DinElPortal (mondaybrew ApS) overholder fuldt ud GDPR og den danske databeskyttelseslov. Vi er registreret som databehandler hos Datatilsynet og følger alle krav om databeskyttelse. Energinet, som driver Eloverblik og DataHub, er underlagt strenge sikkerhedskrav fra den danske stat og EU\'s energiregulering.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'sec-6',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Ingen Lokal Lagring af Dine Data',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'sec-7',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Vi gemmer ALDRIG dine forbrugsdata på vores servere. Når du bruger Forbrug Tracker, hentes data direkte fra Eloverblik\'s API og vises kun i din browser. Så snart du lukker siden eller sessionen udløber, er dine data væk fra vores system. Den eneste information vi midlertidigt cacher er aggregerede prisdata for at reducere belastningen på Eloverblik\'s servere.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'sec-8',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Du Har Fuld Kontrol',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'sec-9',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Via Eloverblik kan du til enhver tid se hvilke tredjeparter der har adgang til dine data, og du kan trække tilladelsen tilbage med øjeblikkelig virkning. Log ind på eloverblik.dk under "Fuldmagter" for at administrere dine tilladelser. DinElPortal fremgår som "mondaybrew ApS" i listen over godkendte tredjeparter.',
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
      },

      // 5. How Eloverblik Works
      {
        _type: 'pageSection',
        _key: 'how-eloverblik-works',
        title: 'Sådan Fungerer Eloverblik Integration',
        headerAlignment: 'left',
        content: [
          {
            _type: 'block',
            _key: 'how-1',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Eloverblik er Danmarks nationale platform for elforbrugsdata, drevet af Energinet - den statsejede virksomhed som har ansvar for den danske el-infrastruktur.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'how-2',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'DataHub - Danmarks Centrale Datacentral',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'how-3',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Alle elmålere i Danmark sender automatisk data til DataHub, som er den centrale database for alle danske elforbrugsdata. Din netselskab (f.eks. Radius, N1, Cerius) indrapporterer dit forbrug time for time via fjernaflæste målere. Disse data bliver derefter tilgængelige gennem Eloverblik\'s API.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'how-4',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Dit Unikke Målepunkt-ID',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'how-5',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Hver elmåler i Danmark har et unikt 18-cifret målepunkt-ID. Dette ID sikrer, at dine data aldrig kan forveksles med andres. Når du giver DinElPortal adgang gennem Eloverblik, får vi kun adgang til data fra dine specifikke målepunkter - intet andet.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'how-6',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Realtidsdata vs. Historiske Data',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'how-7',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Forbrugsdata er typisk tilgængelige med 1-2 timers forsinkelse. Det betyder, at du kan se dit forbrug næsten i realtid. Historiske data går tilbage til 2021 for de fleste målere, så du kan analysere dit forbrug over længere perioder og identificere mønstre i din elforbrugsadfærd.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'how-8',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'API Begrænsninger og Caching',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'how-9',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'For at beskytte Eloverblik\'s servere mod overbelastning, er der begrænsninger på hvor ofte data kan hentes. DinElPortal bruger intelligent caching for at sikre hurtig respons uden at overbelaste systemet. Vi cacher kun aggregerede data (aldrig personlige forbrugsdata) i op til 5 minutter for at give dig den bedste brugeroplevelse.',
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
      },

      // 6. Live Price Graph
      {
        _type: 'livePriceGraph',
        _key: 'live-prices',
        title: 'Aktuelle Elpriser Time for Time',
        subtitle: 'Se hvordan elpriserne udvikler sig gennem døgnet',
        apiRegion: 'DK2',
        headerAlignment: 'center'
      },

      // 7. Understanding Your Consumption
      {
        _type: 'pageSection',
        _key: 'understanding-consumption',
        title: 'Forstå Dit Elforbrug og Spar Penge',
        headerAlignment: 'left',
        content: [
          {
            _type: 'block',
            _key: 'uc-1',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'At forstå dit elforbrug er første skridt mod lavere elregninger. Med DinElPortals Forbrug Tracker får du ikke bare tal - du får indsigt i dine forbrugsmønstre og konkrete sparemuligheder.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'uc-2',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Spids- og Lavlastperioder',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'uc-3',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Elprisen varierer gennem døgnet. Typisk er strømmen dyrest mellem kl. 17-20 på hverdage, når alle kommer hjem fra arbejde. De billigste timer er ofte mellem kl. 2-5 om natten og i weekenderne. Ved at flytte energitungt forbrug som vaskemaskine, opvaskemaskine og elbil-opladning til billige timer, kan en gennemsnitsfamilie spare 1.500-3.000 kr. årligt.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'uc-4',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Sæsonvariationer i Dit Forbrug',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'uc-5',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'En dansk husstand bruger typisk 30-40% mere strøm om vinteren end om sommeren. Dette skyldes primært øget belysning, men også varmepumper, elradiatorer og øget brug af tørretumbler. Vinterforbruget kan optimeres ved at skifte til LED-pærer, installere bevægelsessensorer og sikre god isolering.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'uc-6',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Typiske Forbrugsmønstre',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'uc-7',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'En 1-persons lejlighed bruger typisk 1.500-2.000 kWh årligt. Et parcelhus med 4 personer ligger på 4.000-5.000 kWh uden elvarmepumpe. Med varmepumpe kan forbruget stige til 8.000-12.000 kWh. Elbiler tilføjer typisk 2.500-4.000 kWh årligt afhængigt af kørselsbehov.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'uc-8',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Konkrete Sparetips',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'uc-9',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Start med de nemme besparelser: Sluk standby-forbrug (sparer 500-800 kr./år), brug tørresnor i stedet for tørretumbler (sparer 600-1.200 kr./år), og sænk temperaturen med 1 grad hvis du har elvarmepumpe (sparer 5-7% på varmeregningen). Brug vores Forbrug Tracker til at måle effekten af dine spareinitiativer måned for måned.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'uc-10',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Smart Home og Automatisering',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'uc-11',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Moderne smart home-løsninger kan automatisk flytte dit forbrug til billige timer. Smart stikkontakter kan tænde og slukke apparater baseret på elprisen, og smarte termostater kan optimere opvarmningen. Investeringen tjener sig typisk hjem på 2-3 år gennem lavere elforbrug.',
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
      },

      // 8. Provider List
      {
        _type: 'providerList',
        _key: 'provider-comparison',
        title: 'Sammenlign Elselskaber Baseret på Dit Faktiske Forbrug',
        subtitle: 'Se præcis hvad du ville betale hos forskellige leverandører med dit nuværende forbrugsmønster',
        headerAlignment: 'center',
        providers: [
          { _type: 'reference', _ref: 'uLkO5gatk1xjPxgoNhryXW' }, // Vindstød first
          { _type: 'reference', _ref: 'uLkO5gatk1xjPxgoOEqDTi' }, // EWII
          { _type: 'reference', _ref: 'dJd7V3L7y66kzAn91riNRR' }, // Velkommen
          { _type: 'reference', _ref: 'dJd7V3L7y66kzAn91rHvS3' }, // NRGi
          { _type: 'reference', _ref: 'uLkO5gatk1xjPxgoOF0vwU' }, // Energi Viborg
          { _type: 'reference', _ref: 'uLkO5gatk1xjPxgoOEvHTa' }, // DCC Energi
          { _type: 'reference', _ref: 'uLkO5gatk1xjPxgoOEY23K' }, // Energi Fyn
          { _type: 'reference', _ref: 'dJd7V3L7y66kzAn91qRGNo' }, // Norlys
          { _type: 'reference', _ref: 'dJd7V3L7y66kzAn91s3uwA' }, // Verdo
          { _type: 'reference', _ref: 'uLkO5gatk1xjPxgoOEHUgQ' }  // Andel Energi
        ]
      },

      // 9. Green Energy Benefits
      {
        _type: 'pageSection',
        _key: 'green-energy',
        title: 'Grøn Energi og Dit CO2-Aftryk',
        headerAlignment: 'left',
        content: [
          {
            _type: 'block',
            _key: 'green-1',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Danmark er førende inden for grøn energi, og som forbruger kan du være med til at gøre en forskel. Ved at vælge den rigtige elleverandør og det rigtige produkt, kan du reducere dit CO2-aftryk markant.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'green-2',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Vindkraftens Rolle i Danmark',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'green-3',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Over 80% af Danmarks elproduktion kommer fra vedvarende kilder, primært vindkraft. På vindrige dage producerer Danmark faktisk mere strøm, end vi kan bruge, og eksporterer overskuddet til vores nabolande. Leverandører som Vindstød, der fokuserer på 100% dansk vindenergi, sikrer at din el kommer fra de mest bæredygtige kilder.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'green-4',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Oprindelsesgarantier og Grønne Certifikater',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'green-5',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Når du vælger et grønt elprodukt, køber din leverandør oprindelsesgarantier svarende til dit forbrug. Disse certifikater dokumenterer, at der er produceret grøn strøm svarende til dit forbrug. Jo flere der vælger grøn strøm, jo større bliver efterspørgslen på vedvarende energi, hvilket driver investeringer i nye vindmøller og solceller.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'green-6',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Dit Personlige CO2-Regnskab',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'green-7',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Med DinElPortals CO2-tracker kan du se din elforbrugs klimapåvirkning time for time. En gennemsnitsfamilie kan reducere deres CO2-udledning med op til 2 tons årligt ved at skifte til 100% grøn strøm. Det svarer til at plante 100 træer eller undlade at køre 10.000 km i bil.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'green-8',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Danmarks Klimamål 2030',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'green-9',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Danmark har sat ambitiøse mål om 70% CO2-reduktion i 2030. Som elforbruger kan du bidrage ved at vælge grøn strøm, flytte forbrug til timer med meget vindenergi, og generelt reducere dit elforbrug. Hver kWh tæller i den grønne omstilling.',
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
      },

      // 10. CO2 Emissions Chart
      {
        _type: 'co2EmissionsChart',
        _key: 'co2-chart',
        title: 'CO₂-udledning fra Elforbrug Lige Nu',
        subtitle: 'Se hvor grøn strømmen er i dette øjeblik',
        headerAlignment: 'center',
        showGauge: true,
        leadingText: [
          {
            _type: 'block',
            _key: 'co2-lead-1',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'CO2-intensiteten varierer gennem døgnet afhængigt af hvor meget vindkraft der produceres. Når det blæser meget, er strømmen næsten CO2-neutral.',
                marks: []
              }
            ]
          }
        ]
      },

      // 11. Regional Differences
      {
        _type: 'pageSection',
        _key: 'regional-differences',
        title: 'DK1 vs DK2: Prisforskelle i Danmark',
        headerAlignment: 'left',
        content: [
          {
            _type: 'block',
            _key: 'region-1',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Danmark er opdelt i to elprisområder: DK1 vest for Storebælt (Jylland og Fyn) og DK2 øst for Storebælt (Sjælland og øerne). Prisforskellene kan være betydelige.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'region-2',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Hvorfor Er Der Prisforskel?',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'region-3',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'DK1 har størst vindkraftkapacitet og er tættere forbundet til det tyske og norske elmarked. DK2 er forbundet til Sverige og har mindre vindkraftproduktion. Når det blæser kraftigt i Vestjylland, kan DK1-priserne være markant lavere end DK2. Omvendt kan DK2 nyde godt af billig vandkraft fra Sverige i perioder med meget nedbør.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'region-4',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Typiske Prisforskelle',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'region-5',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'I gennemsnit ligger prisforskellen på 2-5 øre/kWh, men i ekstreme situationer kan forskellen være over 50 øre/kWh. På årsbasis kan en familie i det "forkerte" område betale 500-1.000 kr. mere for samme forbrug.',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'region-6',
            style: 'h3',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Netselskaber og Tariffer',
                marks: []
              }
            ]
          },
          {
            _type: 'block',
            _key: 'region-7',
            style: 'normal',
            markDefs: [],
            children: [
              {
                _type: 'span',
                text: 'Ud over områdepriser er der også forskel på nettariffer. Radius (København-området) har typisk højere tariffer end f.eks. N1 (Nordjylland). Disse forskelle kan udgøre 10-20 øre/kWh og er uafhængige af hvilken elleverandør du vælger.',
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
      },

      // 12. Expanded FAQ
      {
        _type: 'faqGroup',
        _key: 'faq',
        title: 'Ofte Stillede Spørgsmål om Forbrug Tracker',
        faqItems: [
          {
            _type: 'faqItem',
            _key: 'faq1',
            question: 'Er mine data virkelig sikre når jeg bruger Forbrug Tracker?',
            answer: 'Ja, absolut. Vi gemmer aldrig dine forbrugsdata på vores servere. Alt foregår gennem sikre, krypterede forbindelser direkte til Eloverblik\'s API. Du logger ind med MitID, som er Danmarks mest sikre login-system, og forbindelsen lukkes automatisk efter 30 minutter. Du kan til enhver tid trække din tilladelse tilbage via eloverblik.dk.'
          },
          {
            _type: 'faqItem',
            _key: 'faq2',
            question: 'Hvordan giver jeg DinElPortal adgang til mine data?',
            answer: 'Klik på "Forbind med Eloverblik" og du bliver sendt til Eloverblik\'s sikre login-side. Log ind med MitID og godkend at mondaybrew ApS (DinElPortals juridiske navn) må se dine forbrugsdata. Processen tager under 2 minutter og du kan trække tilladelsen tilbage når som helst.'
          },
          {
            _type: 'faqItem',
            _key: 'faq3',
            question: 'Hvilke data kan jeg se i Forbrug Tracker?',
            answer: 'Du kan se dit timeforbrug, dagsforbrug, månedsforbrug og årsforbrug. Vi viser også dine omkostninger baseret på aktuelle elpriser, CO2-udledning, og du kan sammenligne med forskellige elleverandører. Data går tilbage til 2021 for de fleste målere.'
          },
          {
            _type: 'faqItem',
            _key: 'faq4',
            question: 'Koster det noget at bruge Forbrug Tracker?',
            answer: 'Nej, Forbrug Tracker er helt gratis at bruge. Vi tjener kun penge hvis du vælger at skifte elleverandør gennem os. Der er ingen skjulte gebyrer eller abonnementer.'
          },
          {
            _type: 'faqItem',
            _key: 'faq5',
            question: 'Hvorfor viser min tracker "for mange forespørgsler"?',
            answer: 'Eloverblik har begrænsninger på hvor ofte data kan hentes for at beskytte deres servere. Hvis du ser denne besked, vent 60 sekunder og prøv igen. Vi arbejder konstant på at optimere vores system for at minimere disse situationer.'
          },
          {
            _type: 'faqItem',
            _key: 'faq6',
            question: 'Kan jeg se hvad jeg ville spare hos andre elleverandører?',
            answer: 'Ja! Når du har hentet dine forbrugsdata, kan vores system beregne præcis hvad du ville betale hos alle danske elleverandører baseret på dit faktiske forbrug. Dette giver et meget mere præcist billede end generiske prissammenligninger.'
          },
          {
            _type: 'faqItem',
            _key: 'faq7',
            question: 'Hvorfor skal jeg logge ind med MitID?',
            answer: 'MitID er Danmarks nationale digitale ID og den eneste måde at få sikker adgang til Eloverblik. Dette sikrer at kun du kan give tilladelse til at se dine personlige forbrugsdata. Det er samme sikkerhedsniveau som din netbank.'
          },
          {
            _type: 'faqItem',
            _key: 'faq8',
            question: 'Kan jeg bruge Forbrug Tracker hvis jeg bor til leje?',
            answer: 'Ja, hvis du har din egen elmåler og elregning. Hvis el er inkluderet i huslejen og du ikke har egen måler, har du desværre ikke adgang til forbrugsdata gennem Eloverblik.'
          },
          {
            _type: 'faqItem',
            _key: 'faq9',
            question: 'Hvor ofte opdateres mine forbrugsdata?',
            answer: 'Dit netselskab sender typisk data til Eloverblik hver time. Data er normalt tilgængelige med 1-2 timers forsinkelse. Nogle ældre målere sender kun data en gang i døgnet.'
          },
          {
            _type: 'faqItem',
            _key: 'faq10',
            question: 'Kan jeg eksportere mine data?',
            answer: 'Gennem Eloverblik kan du downloade dine rådata som CSV-filer. I DinElPortals Forbrug Tracker fokuserer vi på visualisering og analyse direkte i browseren.'
          }
        ]
      }
    ]
  }

  try {
    const result = await client.createOrReplace(pageContent)
    console.log('✅ Forbrug Tracker page updated successfully!')
    console.log(`   ID: ${result._id}`)
    console.log(`   Slug: /forbrug-tracker`)
    console.log(`   View in Studio: https://dinelportal.sanity.studio/structure/page;${result._id}`)
    console.log(`   View on site: https://www.dinelportal.dk/forbrug-tracker`)
    return result
  } catch (error) {
    console.error('❌ Failed to update page:', error)
    throw error
  }
}

// Run the script
updateForbrugTrackerPage()
  .then(() => {
    console.log('✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })