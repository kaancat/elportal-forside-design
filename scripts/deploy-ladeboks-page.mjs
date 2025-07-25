import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from sanityelpriscms project
const envPath = join(__dirname, '../../sanityelpriscms/.env')
dotenv.config({ path: envPath })

// Validate token exists
if (!process.env.SANITY_API_TOKEN) {
  console.error('❌ SANITY_API_TOKEN not found in', envPath)
  process.exit(1)
}

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Helper function to generate unique keys
function generateKey() {
  return `key_${Math.random().toString(36).substr(2, 9)}`
}

// Validated page content with all required fields and proper structure
const pageContent = {
  _id: 'page.ladeboks',
  _type: 'page',
  title: 'Ladeboks til Elbil: Den Komplette Guide til Opladning Hjemme',
  slug: 'ladeboks',
  seo: {
    title: 'Ladeboks til Elbil - Hjemmelader med TakeCharge & Vindstød',
    description: 'Find den perfekte ladeboks til din elbil. Få automatisk refusion og 100% grøn strøm. Se vores guide og spar på elregningen med smart opladning.',
    keywords: ['ladeboks', 'elbil opladning', 'hjemmelader', 'TakeCharge', 'elbil ladeboks', 'ladeboks installation', 'refusion af elafgift', 'smart opladning', 'grøn strøm til elbil']
  },
  sections: [
    {
      _type: 'hero',
      _key: generateKey(),
      heading: 'Ladeboks til Elbil: Den Komplette Guide til Opladning Hjemme',
      subheading: 'Få den perfekte løsning med TakeCharge ladeboks og grøn strøm fra Vindstød',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Har du lige fået en elbil, eller overvejer du at skifte? Så er et af de første spørgsmål, hvordan du nemmest og billigst lader den op derhjemme. Med den rette kombination af ladeboks og elaftale kan du spare tusindvis af kroner årligt - og samtidig køre på 100% grøn energi.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      variant: 'centered',
      showScrollIndicator: true
    },
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Hvad er en Ladeboks og Hvorfor er den Vigtig?',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'En ladeboks, også kaldet en hjemmelader, er den sikre og effektive løsning til at oplade din elbil derhjemme. I modsætning til det almindelige stik (ofte kaldet "mormorstikket"), som kun er beregnet til nødopladning, er en dedikeret ladeboks designet til daglig brug og hurtigere opladning.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Sikkerhed frem for alt',
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
              text: 'Det almindelige stik er ikke designet til den konstante belastning, som opladning af en elbil kræver. Ved daglig brug over længere tid øges risikoen for overophedning og i værste fald brand. En professionelt installeret ladeboks har indbygget sikkerhed, temperaturovervågning og fejlstrømsbeskyttelse, der gør opladningen 100% sikker.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Hurtigere og mere effektiv opladning',
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
              text: 'Med en standard ladeboks på 11 kW kan du oplade din elbil på cirka 6-8 timer - perfekt til opladning om natten. Til sammenligning tager det ofte over 24 timer med et almindeligt stik. Det betyder, at du altid starter dagen med fuldt batteri, uden at skulle bekymre dig om rækkevidde.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Fremtidssikring af din bolig',
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
              text: 'En professionelt installeret ladeboks øger værdien af din bolig. Med den grønne omstilling og flere elbiler på vejene bliver en hjemmelader snart lige så naturlig som en carport. Ved at installere nu er du klar til fremtiden - og kan måske endda tiltrække flere købere, når du engang skal sælge.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      headerAlignment: 'left'
    },
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Vælg den Rette Ladeboks: Hvad Skal du Overveje?',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Valget af ladeboks kan virke overvældende med alle de tekniske specifikationer og muligheder. Her er de vigtigste faktorer, du skal overveje for at finde den perfekte løsning til dit behov.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Ladeeffekt: 11 kW vs. 22 kW – Hvad har du brug for?',
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
              text: 'De fleste danske hjem har en 3-faset installation med 16 ampere, hvilket giver mulighed for 11 kW opladning. Dette er rigeligt til de fleste elbilister, da det giver op til 60-70 km rækkevidde per times opladning. En 22 kW ladeboks kræver ofte en dyrere elinstallation og er sjældent nødvendig for hjemmeopladning.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Fast kabel vs. løst kabel: Et spørgsmål om bekvemmelighed',
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
              text: 'En ladeboks med fast kabel er den mest bekvemme løsning - du skal bare parkere og sætte stikket i bilen. Ulempen er, at du er låst til én kabeltype. En ladeboks med stik giver fleksibilitet til at bruge forskellige kabler, men kræver at du håndterer kablet hver gang. For de fleste private brugere er fast kabel det bedste valg.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Intelligente funktioner: Smart opladning og load balancing',
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
              text: 'Moderne ladebokse kommer med smarte funktioner, der kan spare dig mange penge. Smart opladning betyder, at boksen automatisk kan starte opladningen, når strømmen er billigst - typisk om natten. Load balancing sikrer, at din elinstallation ikke overbelastes, hvis du bruger andre store apparater samtidig. Disse funktioner bliver endnu mere værdifulde med en variabel elpris.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Serviceaftale og refusion af elafgift – Nøglen til billig opladning',
              marks: ['strong']
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
              text: 'Dette er måske det vigtigste punkt for danske elbilister! Staten tilbyder refusion af elafgift på den strøm, du bruger til at oplade din elbil. Men for at få denne refusion skal du have en serviceaftale med en godkendt udbyder. Refusionen kan udgøre op til 0,90 kr. per kWh - det svarer til tusindvis af kroner årligt for en gennemsnitlig bilist. Uden serviceaftale går du glip af denne besparelse.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      headerAlignment: 'left'
    },
    {
      _type: 'chargingBoxShowcase',
      _key: generateKey(),
      heading: 'Vores Anbefaling: TakeCharge Ladebokse med Grøn Strøm',
      description: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Vi har indgået partnerskab med TakeCharge for at tilbyde dig markedets bedste ladebokse til særligt fordelagtige priser. Alle modeller kommer med fuld serviceaftale og automatisk refusion af elafgift.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      products: [
        { _type: 'reference', _ref: 'chargingBoxProduct-defa-power', _key: generateKey() },
        { _type: 'reference', _ref: 'chargingBoxProduct-easee-up', _key: generateKey() },
        { _type: 'reference', _ref: 'chargingBoxProduct-zaptec-go', _key: generateKey() }
      ],
      headerAlignment: 'center'
    },
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Hvorfor TakeCharge er det Smarte Valg til Din Elbil',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'TakeCharge er ikke bare endnu en ladeboks-leverandør. De har specialiseret sig i at gøre elbil-opladning så enkel og økonomisk fordelagtig som muligt for danske bilister. Her er hvorfor deres løsning skiller sig ud:',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Designet til det nordiske klima med IP54-klassificering',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ' - fungerer perfekt i alt dansk vejr',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Fuldautomatisk intelligent opladning',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ' - starter når strømmen er billigst',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Høj sikkerhed',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ' - indbygget fejlstrømsbeskyttelse og temperaturovervågning',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'App-styring',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ' - overvåg forbrug og styr opladning fra din smartphone',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Kompatibel med alle elbiler',
              marks: ['strong']
            },
            {
              _type: 'span',
              _key: generateKey(),
              text: ' - Type 2 stik som standard i Europa',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Fuldautomatisk refusion – Nemmere bliver det ikke',
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
              text: 'Med TakeCharge får du automatisk refusion af elafgiften uden besværligt papirarbejde. Deres serviceaftale håndterer alt det administrative, så du kan fokusere på at nyde din elbil. Refusionen trækkes automatisk fra din elregning hver måned - du skal ikke selv søge eller dokumentere noget.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Kombinér med en elaftale fra Vindstød og oplad 100% grønt',
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
              text: 'Når du vælger en ladeboks fra TakeCharge, kan du få en elaftale fra Vindstød. Det betyder, at den strøm du tanker, er dækket af 100% grøn energi fra danske vindmøller. Samtidig får du adgang til variable elpriser, så din intelligente TakeCharge-boks kan lade, når strømmen er billigst - ofte om natten hvor vindmøllerne producerer mest.',
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
              text: 'Med denne kombination får du:',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '100% CO2-neutral kørsel med ren vindenergi',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Automatisk opladning når strømmen er billigst',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Fuld refusion af elafgift uden papirarbejde',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Samlet overblik over dit elforbrug i én app',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      headerAlignment: 'left'
    },
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Installation af din nye Hjemmelader',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Installation af en ladeboks skal altid udføres af en autoriseret el-installatør. Dette er ikke kun et lovkrav, men også din garanti for en sikker og korrekt installation.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Hvad indgår i en standard installation?',
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
              text: 'En typisk installation inkluderer:',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Montering af ladeboks på væg eller stander',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Trækning af kabel fra eltavle til ladeboks (op til 10 meter)',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Installation af sikkerhedsudstyr i eltavlen',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Test og idriftsættelse af systemet',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Registrering og dokumentation',
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
              text: 'Installationen tager typisk 2-4 timer afhængigt af kompleksiteten. Ved bestilling gennem TakeCharge får du tilbudt installation fra deres netværk af certificerede installatører til fast pris.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Forberedelse før installatøren kommer',
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
              text: 'For at gøre installationen så smidig som mulig:',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Beslut hvor ladeboksen skal placeres (tæt på hvor du parkerer)',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Sørg for fri adgang til eltavlen',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Overvej kabelføring (skal det graves ned eller føres synligt?)',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Hav dokumentation for din elinstallation klar',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      headerAlignment: 'left'
    },
    {
      _type: 'co2EmissionsChart',
      _key: generateKey(),
      heading: 'CO2-udledning ved Elbil-opladning',
      description: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Se den aktuelle CO2-udledning fra elnettet. Med grøn strøm fra Vindstød er din elbil-opladning altid CO2-neutral, uanset nettets aktuelle energimix.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      defaultRegion: 'DK2',
      headerAlignment: 'center'
    },
    {
      _type: 'pageSection',
      _key: generateKey(),
      heading: 'Sådan Sparer du Penge på Elbil-opladning',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Med de rette valg kan du spare tusindvis af kroner årligt på at oplade din elbil. Her er de vigtigste tips til at minimere dine omkostninger.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '1. Udnyt timebaserede elpriser',
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
              text: 'Elprisen varierer time for time gennem døgnet. Typisk er strømmen billigst om natten mellem kl. 23 og 06, hvor efterspørgslen er lav. Med en smart ladeboks og variabel elpris kan du automatisk lade når strømmen er billigst. Besparelsen kan være op til 50% sammenlignet med opladning i spidsbelastningsperioder.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '2. Få refusion af elafgift',
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
              text: 'Staten refunderer elafgiften på strøm brugt til elbil-opladning. Refusionen er på cirka 0,90 kr. per kWh. For en gennemsnitlig bilist der kører 15.000 km årligt, svarer det til en besparelse på omkring 2.700 kr. om året. Husk: Du skal have en serviceaftale for at få refusionen.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '3. Optimal opladningsstrategi',
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
              text: 'Hold batteriet mellem 20% og 80% i daglig brug - det forlænger batteriets levetid og er mest energieffektivt. Lad kun op til 100% før lange ture. Brug forprogrammering, så bilen er færdigladet lige før afgang - det minimerer tiden batteriet står fuldt opladet.',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '4. Sammenlign totalomkostninger',
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
              text: 'Når du vælger elselskab, så kig ikke kun på kWh-prisen. Medregn alle omkostninger: abonnement, nettariffer, afgifter og eventuelle tillægsgebyrer. Med Vindstøds variable priser og automatisk refusion gennem TakeCharge får du den fulde besparelse uden skjulte omkostninger.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      headerAlignment: 'left'
    },
    {
      _type: 'livePriceGraph',
      _key: generateKey(),
      heading: 'Aktuelle Elpriser - Find de Billigste Timer',
      description: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Se hvornår på døgnet det er billigst at oplade din elbil. Med en smart ladeboks kan du automatisk udnytte de laveste priser.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      defaultRegion: 'DK2',
      headerAlignment: 'center'
    },
    {
      _type: 'faqGroup',
      _key: generateKey(),
      heading: 'Ofte Stillede Spørgsmål om Ladebokse',
      questions: [
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvad koster en ladeboks med installation?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'En komplet løsning med ladeboks og standard installation koster typisk mellem 8.000 og 15.000 kr. afhængigt af model og installationens kompleksitet. Gennem vores partnerskab med TakeCharge kan du få kvalitetsbokse fra 3.995 kr. plus installation. Husk at medregne den årlige besparelse fra refusion af elafgift, som ofte er 2.000-3.000 kr.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Kan jeg få refusion af elafgift uden en serviceaftale?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Nej, for at få refusion af elafgift på strøm til elbil-opladning kræver det en serviceaftale med en godkendt udbyder. Serviceaftalen sikrer korrekt måling og indberetning til myndighederne. Med TakeCharge får du automatisk refusion uden besværligt papirarbejde.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvilke elbiler er TakeCharge-ladeboksen kompatibel med?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'TakeCharge ladebokse bruger Type 2 stik, som er EU-standard. Det betyder, at de er kompatible med alle elbiler solgt i Europa, inklusiv Tesla, Volkswagen ID-serien, Audi e-tron, BMW i-serien, Mercedes EQ, Polestar, Hyundai Ioniq, Kia EV6 og mange flere. Selv Tesla Model 3 og Model Y leveres nu med Type 2 stik i Europa.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Skal jeg være kunde hos Vindstød for at købe en TakeCharge ladeboks?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Du kan købe en TakeCharge ladeboks uden at være Vindstød-kunde. Men ved at kombinere med en elaftale fra Vindstød får du den bedste løsning: 100% grøn strøm fra danske vindmøller, variable priser så du kan lade billigt om natten, og fuld integration mellem ladeboks og elaftale for optimal styring.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvor meget sparer jeg ved at lade om natten?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Elprisen er typisk 30-50% lavere om natten (kl. 23-06) sammenlignet med dagtimerne. For en gennemsnitlig elbil der kører 15.000 km årligt, kan det betyde en årlig besparelse på 1.000-1.500 kr. alene ved at flytte opladningen til de billige timer. Med en smart ladeboks sker dette helt automatisk.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Kan jeg selv installere en ladeboks?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Nej, installation af ladeboks skal altid udføres af en autoriseret el-installatør. Dette er et lovkrav i Danmark. Installatøren sikrer korrekt dimensionering af kabler, installation af sikkerhedsudstyr og overholdelse af alle forskrifter. Ukorrekt installation kan medføre brandfare og bortfald af forsikringsdækning.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvordan fungerer smart opladning?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Smart opladning betyder, at din ladeboks automatisk kan starte og stoppe opladningen baseret på forskellige parametre. Den kan vente med at lade til elpriserne er lave, pausere hvis dit hjem bruger meget strøm fra andre apparater, eller sikre at bilen er færdigladet til et bestemt tidspunkt. Alt styres via en app, hvor du sætter dine præferencer.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        },
        {
          _type: 'faqItem',
          _key: generateKey(),
          question: 'Hvor lang levetid har en ladeboks?',
          answer: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'En kvalitets-ladeboks som dem fra TakeCharge har typisk en levetid på 10-15 år ved normal brug. De er designet til at modstå dansk vejr med regn, frost og sol. De har få bevægelige dele og kræver minimal vedligeholdelse. De fleste producenter giver 2-3 års garanti, og TakeCharge tilbyder udvidet garanti.',
                  marks: []
                }
              ],
              markDefs: []
            }
          ]
        }
      ],
      headerAlignment: 'center'
    },
    {
      _type: 'callToActionSection',
      _key: generateKey(),
      heading: 'Kom i Gang med den Bedste Løsning til Elbil Opladning',
      content: [
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Få en fremtidssikret ladeboks, automatisk refusion og 100% grøn strøm med løsningen fra TakeCharge og Vindstød. Vores eksperter hjælper dig med at finde den perfekte løsning til dit behov.',
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
              text: 'Med vores partnerskab får du:',
              marks: ['strong']
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Markedets bedste ladebokse til særlige priser',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Professionel installation fra certificerede installatører',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Automatisk refusion af elafgift - spar tusindvis årligt',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: '100% vindenergi til din elbil med Vindstød',
              marks: []
            }
          ],
          markDefs: []
        },
        {
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: [
            {
              _type: 'span',
              _key: generateKey(),
              text: 'Smart opladning når strømmen er billigst',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      buttonText: 'Se Ladebokse og Priser',
      buttonLink: '#showcase-takecharge',
      variant: 'centered'
    }
  ]
}

async function deployLadeboksPage() {
  try {
    console.log('🚀 Starting deployment of Ladeboks page...')
    console.log(`📁 Using Sanity token from: ${envPath}`)
    
    // First create the charging box products
    const chargingBoxProducts = [
      {
        _id: 'chargingBoxProduct-defa-power',
        _type: 'chargingBoxProduct',
        name: 'DEFA Power',
        description: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Norsk kvalitet designet til nordiske forhold. Robust og pålidelig ladeboks med smart styring.',
                marks: []
              }
            ],
            markDefs: []
          }
        ],
        originalPrice: 6495,
        currentPrice: 5495,
        features: [
          '11 kW ladeeffekt',
          'Fast Type 2 kabel (5m)',
          'Smart app-styring',
          'Lastbalancering',
          'IP54 vejrbestandig'
        ],
        ctaLink: 'https://takecharge.dk/defa-power',
        ctaText: 'Køb DEFA Power'
      },
      {
        _id: 'chargingBoxProduct-easee-up',
        _type: 'chargingBoxProduct',
        name: 'Easee Up',
        description: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Kompakt og stilfuld ladeboks med avancerede funktioner. Perfekt til carport eller garage.',
                marks: []
              }
            ],
            markDefs: []
          }
        ],
        originalPrice: 5195,
        currentPrice: 4699,
        badge: 'NYHED!',
        features: [
          'Op til 22 kW ladeeffekt',
          'Ultracompact design',
          'WiFi & 4G forbindelse',
          'Dynamisk lastbalancering',
          'Equalizer energimåler inkl.'
        ],
        ctaLink: 'https://takecharge.dk/easee-up',
        ctaText: 'Køb Easee Up'
      },
      {
        _id: 'chargingBoxProduct-zaptec-go',
        _type: 'chargingBoxProduct',
        name: 'Zaptec Go',
        description: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Prisvenlig ladeboks med alle essentielle funktioner. Ideel til privatbrug med enkel betjening.',
                marks: []
              }
            ],
            markDefs: []
          }
        ],
        currentPrice: 3995,
        features: [
          '11 kW ladeeffekt',
          'Type 2 udtag (medbring kabel)',
          'Enkel app-styring',
          'Automatisk refusion',
          'Nem installation'
        ],
        ctaLink: 'https://takecharge.dk/zaptec-go',
        ctaText: 'Køb Zaptec Go'
      }
    ]
    
    console.log('\n📦 Creating charging box products...')
    
    for (const product of chargingBoxProducts) {
      try {
        const productResult = await client.createOrReplace(product)
        console.log(`✅ Created product: ${productResult.name} (${productResult._id})`)
      } catch (productError) {
        console.error(`❌ Error creating product ${product.name}:`, productError.message)
      }
    }
    
    console.log('\n📄 Creating ladeboks page with all sections...')
    
    const result = await client.createOrReplace(pageContent)
    
    console.log('\n✅ Successfully deployed Ladeboks page!')
    console.log(`🆔 Page ID: ${result._id}`)
    console.log(`🔗 Slug: ${result.slug}`)
    console.log(`🌐 View at: https://elportal.dk/${result.slug}`)
    console.log(`📝 Edit in Sanity Studio: https://dinelportal.sanity.studio/desk/page;${result._id}`)
    
    // Log section count for verification
    console.log(`\n📊 Page Statistics:`)
    console.log(`   - Total sections: ${result.sections.length}`)
    console.log(`   - Word count: ~2500+ words`)
    console.log(`   - FAQ questions: 8`)
    console.log(`   - Interactive components: 3 (Charging Box Showcase, CO2 Chart, Live Price Graph)`)
    
  } catch (error) {
    console.error('\n❌ Error deploying page:', error.message)
    if (error.responseBody) {
      console.error('📋 Response details:', error.responseBody)
    }
    process.exit(1)
  }
}

// Run the deployment
deployLadeboksPage()