import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Sanity client configuration
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to generate unique keys
function generateKey(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Page content structure
const pageContent = {
  _type: 'page',
  title: 'Energibesparende Tips - Reducer Dit Elforbrug',
  slug: {
    _type: 'slug',
    current: 'energibesparende-tips'
  },
  // SEO fields are flat at root level
  seoMetaTitle: 'Energibesparende Tips 2025 - Spar på Elregningen | Din Elportal',
  seoMetaDescription: 'Få praktiske energibesparende tips til hjemmet. Lær hvordan du reducerer dit elforbrug, sænker din elregning og hjælper miljøet. Start din energibesparelse i dag.',
  seoKeywords: ['energibesparelse', 'spare el', 'reducere elforbrug', 'energitips', 'elbesparelse', 'grøn energi', 'bæredygtighed', 'elregning', 'energiforbrug', 'miljøvenlig'],
  // Content blocks
  contentBlocks: [
    // Hero Section
    {
      _type: 'hero',
      _key: generateKey(),
      headline: 'Energibesparende Tips til Dit Hjem',
      subheadline: 'Reducer dit elforbrug og spar penge på elregningen',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Opdag praktiske og effektive måder at reducere dit energiforbrug på. Med stigende elpriser er det vigtigere end nogensinde at optimere dit elforbrug derhjemme.',
              marks: []
            }
          ]
        }
      ],
      variant: 'centered',
      showScrollIndicator: true
    },

    // Price Calculator Widget
    {
      _type: 'priceCalculatorWidget',
      _key: generateKey(),
      title: 'Beregn Din Potentielle Besparelse',
      description: 'Se hvor meget du kan spare ved at reducere dit elforbrug',
      showComparison: true,
      variant: 'standalone'
    },

    // Main Content Section - Hvorfor Spare Energi
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Hvorfor Er Energibesparelse Vigtig?',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Energibesparelse handler ikke kun om at spare penge - det handler også om at bidrage til en mere bæredygtig fremtid. Med de stigende elpriser og øget fokus på klimaforandringer er der mange gode grunde til at reducere dit energiforbrug.',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Økonomiske Fordele',
              marks: []
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
              text: 'Den gennemsnitlige danske husstand kan spare mellem 2.000-5.000 kr. årligt ved at implementere simple energibesparende tiltag. Med de nuværende elpriser kan selv små ændringer i dine vaner gøre en stor forskel på din årlige elregning.',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Miljømæssig Påvirkning',
              marks: []
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
              text: 'Når du reducerer dit elforbrug, bidrager du direkte til at mindske CO2-udledningen. Jo mindre el vi bruger, jo mindre pres er der på elnettet, hvilket betyder færre fossile brændstoffer og mere plads til vedvarende energikilder som vind- og solenergi.',
              marks: []
            }
          ]
        }
      ]
    },

    // Feature List - Quick Tips
    {
      _type: 'featureList',
      _key: generateKey(),
      title: 'Hurtige Energisparetips',
      subtitle: 'Simple ændringer med stor effekt',
      features: [
        {
          _type: 'featureItem',
          _key: generateKey(),
          title: 'LED-pærer',
          description: 'Skift til LED - bruger op til 80% mindre strøm',
          icon: {
            _type: 'icon.manager',
            name: 'lightbulb',
            provider: 'lucide',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>'
          }
        },
        {
          _type: 'featureItem',
          _key: generateKey(),
          title: 'Standby-forbrug',
          description: 'Sluk helt for apparater - spar op til 10% årligt',
          icon: {
            _type: 'icon.manager',
            name: 'power',
            provider: 'lucide',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/></svg>'
          }
        },
        {
          _type: 'featureItem',
          _key: generateKey(),
          title: 'Termostat',
          description: 'Sænk 1°C og spar 5% på varmeregningen',
          icon: {
            _type: 'icon.manager',
            name: 'thermometer',
            provider: 'lucide',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>'
          }
        }
      ]
    },

    // Detailed Tips Section - Køkken
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Energibesparelse i Køkkenet',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Køkkenet er ofte hjemmets største energiforbruger. Her er nogle effektive måder at reducere elforbruget på:',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Køleskab og Fryser',
              marks: []
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
              text: '• Hold køleskabet ved 5°C og fryseren ved -18°C',
              marks: []
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
              text: '• Afrim regelmæssigt - is reducerer effektiviteten',
              marks: []
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
              text: '• Tjek dørtætninger - utætte tætninger øger forbruget',
              marks: []
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
              text: '• Placer ikke varme madvarer direkte i køleskabet',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Opvaskemaskine',
              marks: []
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
              text: '• Kør kun med fuld maskine',
              marks: []
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
              text: '• Brug eco-program når muligt',
              marks: []
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
              text: '• Spring forskyl over - moderne maskiner klarer det uden',
              marks: []
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
              text: '• Lufttør i stedet for at bruge tørreprogrammet',
              marks: []
            }
          ]
        }
      ]
    },

    // Live Price Graph
    {
      _type: 'livePriceGraph',
      _key: generateKey(),
      title: 'Udnyt Timepriser til Din Fordel',
      subtitle: 'Planlæg energikrævende opgaver når priserne er lave',
      region: 'both',
      headerAlignment: 'center'
    },

    // Belysning Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Smart Belysning',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Belysning står for cirka 15% af en husstands elforbrug. Ved at optimere din belysning kan du opnå betydelige besparelser:',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'LED er Fremtiden',
              marks: []
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
              text: 'LED-pærer bruger op til 80% mindre strøm end traditionelle glødepærer og holder op til 25 gange længere. Selvom LED-pærer koster mere i indkøb, tjener de sig hurtigt ind gennem lavere elforbrug og længere levetid.',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Automatisk Styring',
              marks: []
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
              text: '• Installer bevægelsessensorer i gange og udeområder',
              marks: []
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
              text: '• Brug timere til udendørsbelysning',
              marks: []
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
              text: '• Overvej smart home løsninger til central styring',
              marks: []
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
              text: '• Udnyt dagslys maksimalt med lyse farver og spejle',
              marks: []
            }
          ]
        }
      ]
    },

    // Renewable Energy Forecast
    {
      _type: 'renewableEnergyForecast',
      _key: generateKey(),
      title: 'Grøn Energi Prognose',
      subtitle: 'Se hvornår strømmen er mest miljøvenlig',
      headerAlignment: 'center'
    },

    // Opvarmning Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Effektiv Opvarmning',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Opvarmning udgør ofte den største del af energiforbruget i danske hjem. Her er nogle måder at optimere varmeforbruget på:',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Temperaturregulering',
              marks: []
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
              text: 'En tommelfingerregel siger, at du kan spare 5% på varmeregningen for hver grad, du sænker temperaturen. Optimal temperatur er:',
              marks: []
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
              text: '• Stue: 20-21°C',
              marks: []
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
              text: '• Soveværelse: 16-18°C',
              marks: []
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
              text: '• Badeværelse: 22-24°C',
              marks: []
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
              text: '• Ubenyttede rum: 15-16°C',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Isolering og Tætning',
              marks: []
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
              text: 'God isolering kan reducere varmeforbruget med op til 30%. Fokuser på:',
              marks: []
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
              text: '• Tætning omkring vinduer og døre',
              marks: []
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
              text: '• Efterisolering af loft og hulmure',
              marks: []
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
              text: '• Isolering af varmerør i kolde rum',
              marks: []
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
              text: '• Installation af termoruder hvis du har enkeltglas',
              marks: []
            }
          ]
        }
      ]
    },

    // Value Proposition - Sammenlign og spar
    {
      _type: 'valueProposition',
      _key: generateKey(),
      heading: 'Kombiner Energibesparelse med Billig El',
      subheading: 'Maksimer din besparelse med det rigtige elselskab',
      description: 'Energibesparelse er første skridt - næste skridt er at sikre dig den bedste elpris',
      features: [
        {
          _type: 'valueItem',
          _key: generateKey(),
          heading: 'Grøn strøm',
          description: 'Vælg elselskaber med 100% vedvarende energi',
          icon: {
            _type: 'icon.manager',
            name: 'leaf',
            provider: 'lucide',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>'
          }
        },
        {
          _type: 'valueItem',
          _key: generateKey(),
          heading: 'Timepriser',
          description: 'Udnyt variable priser til at spare ekstra',
          icon: {
            _type: 'icon.manager',
            name: 'clock',
            provider: 'lucide',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
          }
        },
        {
          _type: 'valueItem',
          _key: generateKey(),
          heading: 'Gennemsigtighed',
          description: 'Ingen skjulte gebyrer eller bindinger',
          icon: {
            _type: 'icon.manager',
            name: 'eye',
            provider: 'lucide',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>'
          }
        }
      ]
    },

    // Provider List
    {
      _type: 'providerList',
      _key: generateKey(),
      title: 'Find Det Bedste Elselskab',
      subtitle: 'Sammenlign priser og vælg grøn energi',
      headerAlignment: 'center'
    },

    // Elektronik og Standby
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Elektronik og Standby-forbrug',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Standby-forbrug kan udgøre op til 10% af din elregning. Moderne elektronik forbruger ofte strøm, selv når de er slukket:',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Typisk Standby-forbrug',
              marks: []
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
              text: '• TV: 0,5-3 watt',
              marks: []
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
              text: '• Computer: 2-8 watt',
              marks: []
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
              text: '• Spillekonsol: 1-5 watt',
              marks: []
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
              text: '• Mikrobølgeovn: 2-4 watt',
              marks: []
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
              text: '• Kaffemaskine: 1-3 watt',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Løsninger',
              marks: []
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
              text: '• Brug kontakter med afbryder til grupper af apparater',
              marks: []
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
              text: '• Installer smart home stikkontakter med app-styring',
              marks: []
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
              text: '• Træk stikket ud når apparater ikke bruges i længere tid',
              marks: []
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
              text: '• Vælg apparater med lavt standby-forbrug (under 0,5W)',
              marks: []
            }
          ]
        }
      ]
    },

    // CO2 Emissions Chart
    {
      _type: 'co2EmissionsChart',
      _key: generateKey(),
      title: 'CO2-udledning i Realtid',
      subtitle: 'Se hvor klimavenlig strømmen er lige nu',
      headerAlignment: 'center'
    },

    // Vaskeri Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Energibesparelse i Vaskeriet',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Vask og tørring står for en betydelig del af husstandens elforbrug. Her er nogle tips til at reducere forbruget:',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Vaskemaskine',
              marks: []
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
              text: '• Vask ved lave temperaturer - 30°C er ofte nok',
              marks: []
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
              text: '• Fyld maskinen helt op før vask',
              marks: []
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
              text: '• Brug eco-programmer når muligt',
              marks: []
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
              text: '• Centrifuger ved høj hastighed for at reducere tørretid',
              marks: []
            }
          ]
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Tørretumbler',
              marks: []
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
              text: 'Tørretumbleren er en af de mest energikrævende apparater i hjemmet:',
              marks: []
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
              text: '• Lufttør når vejret tillader det',
              marks: []
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
              text: '• Rens fnugfilteret efter hver brug',
              marks: []
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
              text: '• Overfyld ikke - tøjet tørrer hurtigere med god luftcirkulation',
              marks: []
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
              text: '• Overvej en varmepumpetørretumbler ved udskiftning',
              marks: []
            }
          ]
        }
      ]
    },

    // FAQ Section
    {
      _type: 'faqGroup',
      _key: generateKey(),
      heading: 'Ofte Stillede Spørgsmål om Energibesparelse',
      items: [
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvor meget kan jeg realistisk spare på min elregning?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'En gennemsnitlig dansk husstand kan spare mellem 2.000-5.000 kr. årligt ved at implementere energibesparende tiltag. De største besparelser kommer typisk fra optimering af opvarmning (op til 30%), skift til LED-belysning (op til 80% på belysning) og reduktion af standby-forbrug (op til 10% af total forbrug).',
                  marks: []
                }
              ]
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvilke energibesparelser giver hurtigst tilbagebetaling?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'LED-pærer betaler sig typisk tilbage inden for 1-2 år. Tætningslister til døre og vinduer koster under 100 kr. og kan spare hundredvis af kroner årligt. Kontakter med afbryder til standby-apparater koster 50-200 kr. og sparer op til 500 kr. årligt. Smart termostat kan spare 10-20% på varmeregningen med tilbagebetaling på 2-3 år.',
                  marks: []
                }
              ]
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Er det bedre at vaske tøj om natten når strømmen er billigere?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Ja, hvis du har et elselskab med timeafregning. Elprisen er ofte 30-50% lavere om natten (kl. 23-06) og i weekender. Du kan spare 200-500 kr. årligt ved at flytte energikrævende opgaver som vask, opvask og opladning til disse tidspunkter. Brug vores live prisgraf til at se de bedste tidspunkter.',
                  marks: []
                }
              ]
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Skal jeg slukke helt for mine apparater eller er standby ok?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Moderne apparater med EU energimærke A eller bedre har meget lavt standby-forbrug (under 0,5W), så her er det acceptabelt. Ældre apparater kan bruge op til 10W i standby, hvilket koster omkring 175 kr. årligt per apparat. Brug kontakter med afbryder til grupper af apparater for nem styring.',
                  marks: []
                }
              ]
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvordan finder jeg ud af, hvilke apparater der bruger mest strøm?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Du kan købe en elmåler for 100-300 kr., som viser præcist forbrug for enkelte apparater. Generelt bruger apparater med varmeelementer mest: elkedel (2000W), hårtørrer (1500W), ovn (2000-3000W). Køleskab/fryser bruger 100-300W men kører konstant. Se efter energimærket ved køb af nye apparater.',
                  marks: []
                }
              ]
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Er det værd at investere i solceller for at spare på elregningen?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Solceller har en tilbagebetalingstid på 8-12 år afhængigt af forbrug og tagforhold. En typisk installation til 30.000-50.000 kr. kan spare 3.000-5.000 kr. årligt. Med stigende elpriser og faldende solcellepriser bliver investeringen mere attraktiv. Overvej også at vælge et elselskab med god afregning for overskudsproduktion.',
                  marks: []
                }
              ]
            }
          ]
        }
      ]
    },

    // Call to Action Section
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Start Din Energibesparelse i Dag',
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
              text: 'Energibesparelse handler ikke kun om at spare penge - det handler om at tage ansvar for vores fælles fremtid. Ved at reducere dit energiforbrug bidrager du til et mere bæredygtigt Danmark med større andel af vedvarende energi.',
              marks: []
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
              text: 'Start med de nemme tiltag: Skift til LED, sluk for standby-apparater, og sænk temperaturen med 1 grad. Når du har implementeret energibesparelserne, så sørg for at få den bedste elpris ved at sammenligne elselskaber.',
              marks: []
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
              text: 'Vælg et elselskab der matcher dine værdier - måske et med 100% vedvarende energi fra danske vindmøller. På den måde maksimerer du både din økonomiske besparelse og dit bidrag til den grønne omstilling.',
              marks: []
            }
          ]
        }
      ]
    }
  ]
}

// Validation function
function validatePageContent(content: any): boolean {
  try {
    // Check required fields
    if (!content._type || content._type !== 'page') {
      throw new Error('Invalid _type field')
    }
    if (!content.title || typeof content.title !== 'string') {
      throw new Error('Invalid title field')
    }
    if (!content.slug || !content.slug.current) {
      throw new Error('Invalid slug field')
    }
    if (!Array.isArray(content.contentBlocks)) {
      throw new Error('contentBlocks must be an array')
    }

    // Validate each content block
    content.contentBlocks.forEach((block: any, index: number) => {
      if (!block._type) {
        throw new Error(`Block at index ${index} missing _type`)
      }
      if (!block._key) {
        throw new Error(`Block at index ${index} missing _key`)
      }
    })

    console.log('✅ Content validation passed')
    return true
  } catch (error) {
    console.error('❌ Content validation failed:', error)
    return false
  }
}

// Deploy function
async function deployPage() {
  try {
    // Validate content before deployment
    if (!validatePageContent(pageContent)) {
      throw new Error('Content validation failed')
    }

    console.log('📄 Deploying page:', pageContent.title)
    console.log('🔗 Slug:', pageContent.slug.current)
    console.log('📊 Content blocks:', pageContent.contentBlocks.length)
    
    // Use create() to let Sanity generate a unique ID
    const result = await client.create(pageContent)
    
    console.log('✅ Page deployed successfully!')
    console.log('🆔 Page ID:', result._id)
    console.log('🎨 View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;' + result._id)
    console.log('🌐 Frontend URL will be: /' + pageContent.slug.current)
    console.log('\n📋 Next steps:')
    console.log('1. Check the page in Sanity Studio')
    console.log('2. Verify all content blocks are rendering correctly')
    console.log('3. Test the page on the frontend')
    console.log('4. Check mobile responsiveness')
    
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    process.exit(1)
  }
}

// Execute deployment
deployPage()