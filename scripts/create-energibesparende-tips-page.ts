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
  token: process.env.SANITY_API_TOKEN,
})

// Helper to generate unique keys
function generateKey() {
  return `key_${Math.random().toString(36).substr(2, 9)}`
}

// Create the comprehensive energy saving tips page
async function createEnergySavingTipsPage() {
  const slug = 'energibesparende-tips'
  const pageId = `page.${slug}`

  const pageContent = {
    _id: pageId,
    _type: 'page',
    title: 'Energibesparende Tips (2025): Den Komplette Guide til en Lavere Elregning',
    slug: {
      _type: 'slug',
      current: slug,
    },
    seoMetaTitle: 'Energibesparende Tips 2025 • Spar Tusindvis på Din Elregning',
    seoMetaDescription: 'Få 50+ praktiske energibesparende tips og spar op til 5.000 kr årligt på din elregning. Se også om du betaler for meget for strøm.',
    seoKeywords: [
      'energibesparende tips',
      'spar på strømmen',
      'sænk elregning',
      'billigere el',
      'gode råd elbesparelse',
      'spare strøm hjemme',
      'energispare råd',
      'reducere elforbrug'
    ],
    contentBlocks: [
      // Hero Section
      {
        _type: 'hero',
        _key: generateKey(),
        headline: 'Spar Tusindvis på Strøm: 50+ Effektive Tips & Det Ene Trick Alle Overser',
        subheadline: 'Den komplette guide til at sænke din elregning markant - både gennem smart forbrug og det rigtige valg af elselskab',
        // Image will be added manually in Sanity Studio
      },

      // Introduction Section
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Hvorfor Betaler Danskerne Mere End Nødvendigt?',
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
                text: 'Med stigende elpriser leder flere og flere danskere efter måder at skære ned på forbruget. Men vidste du, at den gennemsnitlige danske familie kunne spare op til ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: '5.000 kr. årligt',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' på elregningen gennem en kombination af energibesparende vaner og det rigtige valg af elselskab?',
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
                text: 'Denne guide giver dig alt, hvad du behøver for at opnå maksimal besparelse:',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '🏠 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: '50+ Praktiske Råd:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Konkrete tips til hver eneste del af din bolig',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '⏰ ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Timing er Alt:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Lær at bruge strøm når den er billigst',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💡 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Den Største Besparelse:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Find ud af om du betaler for meget pr. kWh',
              }
            ]
          }
        ]
      },

      // Appliance Calculator Section
      {
        _type: 'applianceCalculator',
        _key: generateKey(),
        title: 'Beregn Dit Apparats Strømforbrug',
        subtitle: 'Find ud af præcis hvor meget dine elektriske apparater koster at køre - og hvor meget du kan spare'
      },

      // Kitchen Energy Saving Tips
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'I Køkkenet: Fra Køleskab til Kaffemaskine',
        headerAlignment: 'left',
        content: [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'h3',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Køleskab & Fryser - De Store Strømslugere',
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
                text: 'Dit køleskab kører 24/7 og står for op til 20% af din elregning. Her er de vigtigste tips:',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 300 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Hold køleskabet på 5°C og fryseren på -18°C. Hver grad koldere koster 5% mere strøm.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 200 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Afriming af fryseren regelmæssigt. Kun 5mm is øger forbruget med 30%.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 150 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Hold køleskabets bagside ren og sørg for god ventilation.',
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
                text: 'Komfur & Ovn - Smarte Madlavningstips',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 400 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Brug låg på gryder - det reducerer energiforbruget med op til 70%.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 250 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Sluk ovnen 5-10 minutter før tiden og udnyt eftervarmen.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 300 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Brug elkedel frem for kogepladen til at koge vand.',
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
                text: 'Opvaskemaskine - Kør Smart',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 600 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Kør kun med fuld maskine og brug eco-program.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 200 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Spring forskylning over - moderne maskiner klarer det fint uden.',
              }
            ]
          }
        ]
      },

      // Living Room Energy Tips
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'I Stuen: Stop Spild fra TV og Elektronik',
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
                text: 'Underholdningselektronik står for op til 15% af en husstands elforbrug - meget af det i standby!',
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
                text: 'TV & Underholdning',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 500 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Sluk helt for TV\'et i stedet for standby. Moderne TV\'er bruger op til 20W i standby.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 300 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Juster lysstyrken på TV\'et - fabriksindstillinger er ofte for lyse.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 400 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Brug kontakter med tænd/sluk til spillekonsoller, tv-bokse og andet tilbehør.',
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
                text: 'Belysning - LED er Vejen Frem',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 800 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Skift alle pærer til LED - de bruger 80% mindre strøm og holder 25 gange længere.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 200 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Installer bevægelsessensorer i gange og udeområder.',
              }
            ]
          }
        ]
      },

      // Laundry Energy Tips
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Vask & Tørring: De Store Strømslugere',
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
                text: 'Vaskemaskine og tørretumbler står tilsammen for op til 25% af elforbruget i mange hjem.',
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
                text: 'Vaskemaskinen - Hver Grad Tæller',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 600 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Vask ved 30°C i stedet for 40°C - moderne vaskemidler er lige så effektive.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 400 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Fyld maskinen helt op - halvfyldte vask koster næsten det samme.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 300 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Brug høj centrifugering - det reducerer tørretiden markant.',
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
                text: 'Tørretumbleren - Den Værste Synder',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 1.200 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Tørr tøjet naturligt når muligt - tørretumbleren bruger enormt meget strøm.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 400 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Rens filteret efter hver tørring - et tilstoppet filter øger forbruget med 30%.',
              }
            ]
          }
        ]
      },

      // Heating and Cooling Tips
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Opvarmning & Køling: Hold på Komforten',
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
                text: 'Selvom de fleste danskere har fjernvarme, bruger mange stadig el til supplerende varme og køling.',
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
                text: 'Varmepumper & El-radiatorer',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 1.500 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Sænk temperaturen med 1°C - det reducerer varmeforbruget med 5%.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 800 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Brug tidsstyring til at sænke temperaturen om natten og når I ikke er hjemme.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 600 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Hold døre lukket mellem opvarmede og uopvarmede rum.',
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
                text: 'Aircondition & Ventilation',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 700 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Indstil aircondition til 24-26°C om sommeren - hver grad koldere koster 10% mere.',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💰 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Spar 400 kr./år:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Rengør filtre månedligt - snavsede filtre øger forbruget markant.',
              }
            ]
          }
        ]
      },

      // Smart Timing Section
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Når Dine Vaner Ikke Er Nok: Forstå Din Elpris',
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
                text: 'Du har nu lært at optimere dit ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'forbrug',
                marks: ['em']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' (kWh). Men hvad med ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'prisen',
                marks: ['em']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' du betaler pr. kWh? Dette er den faktor, de fleste glemmer, og hvor den største besparelse ofte ligger gemt.',
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
                text: 'Brug Strømmen, Når Den Er Billigst',
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
                text: 'Elprisen varierer time for time. Ved at flytte dit forbrug til de billige timer kan du spare yderligere:',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '🌙 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Nat og tidlig morgen:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Typisk de billigste timer (kl. 00-06)',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '🌅 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Weekender:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Ofte billigere end hverdage',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '💨 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Blæsende dage:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Vindmøllerne producerer billig, grøn strøm',
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
                text: 'Du kan følge timepriserne live på Energinet.dk eller bruge smarte stikkontakter der automatisk tænder når strømmen er billig.',
              }
            ]
          }
        ]
      },

      // Live Price Graph
      {
        _type: 'livePriceGraph',
        _key: generateKey(),
        title: 'Aktuelle Elpriser Time for Time',
        subtitle: 'Se hvornår strømmen er billigst i dag og i morgen',
        showBothRegions: true,
      },

      // The Big Reveal Section
      {
        _type: 'pageSection',
        _key: generateKey(),
        title: 'Det Sidste, Vigtige Skridt: Vælger du det Rigtige Elselskab?',
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
                text: 'Selv hvis du følger alle sparetips og bruger strøm på de billigste tidspunkter, kan du stadig betale for meget, hvis dit elselskab har høje tillæg eller en ufordelagtig aftale.',
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
                text: '🚨 ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Vidste du at:',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' Forskellen mellem det dyreste og billigste elselskab kan være op til ',
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: '3.000 kr. årligt',
                marks: ['strong']
              },
              {
                _type: 'span',
                _key: generateKey(),
                text: ' for en gennemsnitlig familie?',
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
                text: 'Den eneste måde at vide sig sikker på, er ved at sammenligne markedet. Med ElPortals gratis sammenligningstjeneste kan du på under 2 minutter se:',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '✓ Præcis hvor meget du kan spare ved at skifte',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '✓ Hvilke selskaber der tilbyder grøn strøm fra vindmøller',
              }
            ]
          },
          {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: 'bullet',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: '✓ Gennemsigtige priser uden skjulte gebyrer',
              }
            ]
          }
        ],
        cta: {
          text: 'Sammenlign Elpriser og Find Din Besparelse',
          url: '#provider-comparison'
        }
      },

      // Provider Comparison List
      {
        _type: 'providerList',
        _key: generateKey(),
        title: 'Sammenlign de Mest Populære Elselskaber',
        // Providers will be fetched dynamically based on availability
        providers: []
      },

      // Additional Tips Section
      {
        _type: 'featureList',
        _key: generateKey(),
        title: 'Bonus: Hurtige Energisparetips',
        subtitle: 'Små ændringer der giver stor effekt',
        features: [
          {
            _type: 'featureItem',
            _key: generateKey(),
            icon: {
              _type: 'icon.manager',
              icon: 'ri:lightbulb-line',
              metadata: {
                icon: 'ri:lightbulb-line',
                iconName: 'Lightbulb',
                collectionId: 'remix-icon',
                collectionName: 'Remix Icon'
              }
            },
            title: 'Sluk Lyset',
            description: 'Husk at slukke lyset når du forlader et rum - det kan spare op til 200 kr/år'
          },
          {
            _type: 'featureItem',
            _key: generateKey(),
            icon: {
              _type: 'icon.manager',
              icon: 'ri:temp-cold-line',
              metadata: {
                icon: 'ri:temp-cold-line',
                iconName: 'Temperature Cold',
                collectionId: 'remix-icon',
                collectionName: 'Remix Icon'
              }
            },
            title: 'Luk for Radiatorer',
            description: 'Luk for radiatorer i rum du ikke bruger og spar op til 500 kr/år'
          },
          {
            _type: 'featureItem',
            _key: generateKey(),
            icon: {
              _type: 'icon.manager',
              icon: 'ri:plug-line',
              metadata: {
                icon: 'ri:plug-line',
                iconName: 'Plug',
                collectionId: 'remix-icon',
                collectionName: 'Remix Icon'
              }
            },
            title: 'Træk Stikket Ud',
            description: 'Elektronik på standby koster op til 800 kr/år - brug kontakter med afbryder'
          }
        ]
      },

      // FAQ Section
      {
        _type: 'faqGroup',
        _key: generateKey(),
        title: 'Ofte Stillede Spørgsmål om Elbesparelser',
        faqItems: [
          {
            _type: 'faqItem',
            _key: generateKey(),
            question: 'Kan det betale sig at skifte elselskab?',
            answer: [
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'Ja, for de fleste danske husstande kan der være mange penge at spare. Forskellen på den dyreste og billigste elaftale kan løbe op i flere tusinde kroner om året. Den bedste måde at finde ud af din potentielle besparelse er ved at bruge en uafhængig sammenligningstjeneste som ElPortal, hvor du kan se præcise priser fra alle elselskaber.',
                  }
                ]
              }
            ]
          },
          {
            _type: 'faqItem',
            _key: generateKey(),
            question: 'Hvad bruger mest strøm i hjemmet?',
            answer: [
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'De største strømslugere i en typisk dansk bolig er:',
                  }
                ]
              },
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                listItem: 'bullet',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'Tørretumbler (2-3 kWh pr. tørring)',
                  }
                ]
              },
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                listItem: 'bullet',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'El-radiatorer og varmepumper',
                  }
                ]
              },
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                listItem: 'bullet',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'Køleskab og fryser (kører 24/7)',
                  }
                ]
              },
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                listItem: 'bullet',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'Vaskemaskine (især ved høje temperaturer)',
                  }
                ]
              },
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                listItem: 'bullet',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'Opvaskemaskine',
                  }
                ]
              }
            ]
          },
          {
            _type: 'faqItem',
            _key: generateKey(),
            question: 'Hvornår er strøm billigst i Danmark?',
            answer: [
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'Strømmen er typisk billigst:',
                  }
                ]
              },
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                listItem: 'bullet',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'Om natten mellem kl. 00:00 og 06:00',
                  }
                ]
              },
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                listItem: 'bullet',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'I weekender og på helligdage',
                  }
                ]
              },
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                listItem: 'bullet',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'På blæsende dage med meget vindenergi',
                  }
                ]
              },
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                listItem: 'bullet',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'Midt på dagen når solcellerne producerer',
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
                    text: 'Priserne kan variere meget fra dag til dag, så tjek altid de aktuelle timepriser.',
                  }
                ]
              }
            ]
          },
          {
            _type: 'faqItem',
            _key: generateKey(),
            question: 'Hvordan ved jeg, om jeg har en god elaftale?',
            answer: [
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'En god elaftale kendetegnes ved:',
                  }
                ]
              },
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                listItem: 'bullet',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'Lave tillæg til spotprisen (helst under 2 øre/kWh)',
                  }
                ]
              },
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                listItem: 'bullet',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'Ingen eller lave faste gebyrer',
                  }
                ]
              },
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                listItem: 'bullet',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'Grøn strøm fra vedvarende kilder',
                  }
                ]
              },
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                listItem: 'bullet',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'Ingen binding eller kort opsigelse',
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
                    text: 'Sammenlign din nuværende aftale med markedet på ElPortal for at se om du kan spare penge.',
                  }
                ]
              }
            ]
          },
          {
            _type: 'faqItem',
            _key: generateKey(),
            question: 'Er grøn strøm dyrere?',
            answer: [
              {
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: 'Nej, grøn strøm behøver ikke være dyrere! Faktisk er nogle af de billigste elselskaber også dem, der leverer 100% vedvarende energi fra vindmøller og solceller. Dette skyldes at vedvarende energi nu er blevet billigere at producere end fossil energi. Ved at vælge et grønt elselskab støtter du omstillingen til vedvarende energi uden at betale ekstra.',
                  }
                ]
              }
            ]
          }
        ]
      },

      // Final CTA Section
      {
        _type: 'callToActionSection',
        _key: generateKey(),
        title: 'Klar til at Spare på Din Elregning?',
        description: 'Start med det nemmeste: Tjek om du betaler for meget for din strøm. Det tager kun 2 minutter.',
        buttonText: 'Sammenlign Elpriser Nu',
        buttonUrl: '/',
        variant: 'primary',
      }
    ]
  }

  try {
    console.log('Creating energy saving tips page...')
    const result = await client.createOrReplace(pageContent)
    console.log('✅ Successfully created energy saving tips page:', result._id)
    console.log('View at: https://dinelportal.sanity.studio/structure/page;page.energibesparende-tips')
  } catch (error) {
    console.error('❌ Error creating page:', error)
    throw error
  }
}

// Run the script
createEnergySavingTipsPage()