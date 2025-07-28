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

// Updated content sections with expanded text
const expandedContentSections = {
  // Expanded Price Models Section
  priceModelsSection: {
    _type: 'pageSection',
    _key: generateKey(),
    heading: 'Forstå forskellige prismodeller',
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
            text: 'Prisen er ofte den afgørende faktor for de fleste forbrugere. Men det handler ikke kun om at finde den laveste pris - det handler om at forstå forskellige prismodeller:',
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
            text: 'Spotpris (variabel pris)',
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
            text: '• Følger markedets timepriser',
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
            text: '• Potentielt laveste pris over tid',
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
            text: '• Kræver risikovillighed og fleksibilitet',
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
            text: '• Perfekt til forbrugere der kan flytte forbrug',
            marks: []
          }
        ]
      },
      // NEW: Expanded content about how spot prices work hour by hour
      {
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: generateKey(),
            text: 'Spotprisen fastsættes dagligt kl. 13:00 for det kommende døgn på Nord Pool elbørsen. Priserne varierer time for time baseret på udbud og efterspørgsel. I praksis betyder det, at prisen typisk er lavest om natten (kl. 00-06) hvor efterspørgslen er minimal, og højest i morgentimerne (kl. 07-09) og om aftenen (kl. 17-21) hvor de fleste danskere bruger mest strøm. Prisforskellene kan være betydelige - ofte ser vi priser på 0,50 kr/kWh om natten og op til 3-4 kr/kWh i spidsbelastningsperioder.',
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
            text: 'For at udnytte spotprisen optimalt bør du programmere energikrævende apparater som vaskemaskine, opvaskemaskine og elbil-opladning til at køre om natten. Moderne smart home-løsninger kan automatisere dette for dig. En typisk familie kan spare 20-30% på elregningen ved aktivt at flytte 30-40% af deres forbrug til billige timer. Dette kræver dog en vis planlægning og villighed til at ændre vaner.',
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
            text: 'Vejrforhold spiller også en stor rolle for spotprisen. Når det blæser meget, producerer de danske vindmøller store mængder strøm, hvilket ofte resulterer i meget lave priser - nogle gange endda negative priser, hvor du får penge for at bruge strøm! Omvendt kan vindstille perioder kombineret med høj efterspørgsel drive priserne markant op. Apps som "Elforbrug" og din el-leverandørs app viser typisk timepriserne 1-2 dage frem, så du kan planlægge dit forbrug.',
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
            text: 'Fastpris',
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
            text: '• Garanteret pris i kontraktperioden',
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
            text: '• Beskyttelse mod prisstigninger',
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
            text: '• Typisk højere gennemsnitspris',
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
            text: '• Giver budgetsikkerhed',
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
            text: 'Hybrid-modeller',
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
            text: '• Kombination af spot og fast',
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
            text: '• Balance mellem sikkerhed og besparelse',
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
            text: '• Ofte med prisloft eller garantier',
            marks: []
          }
        ]
      }
    ]
  },

  // Expanded Green Energy Section
  greenEnergySection: {
    _type: 'pageSection',
    _key: generateKey(),
    heading: 'Grøn energi og bæredygtighed',
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
            text: 'Miljøhensyn spiller en stadig større rolle for danske forbrugere. Når du vælger en grøn el-leverandør, bidrager du aktivt til den grønne omstilling.',
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
            text: 'Vindstrøm',
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
            text: '• 100% vedvarende energi fra vindmøller',
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
            text: '• Ofte fra danske vindmølleparker',
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
            text: '• Certificeret grøn strøm',
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
            text: '• Støtter den grønne omstilling',
            marks: []
          }
        ]
      },
      // NEW: Danish renewable energy statistics and certifications
      {
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: generateKey(),
            text: 'Danmark er verdensførende inden for vindenergi, og i 2023 kom hele 55% af vores elforbrug fra vindmøller. På særligt blæsende dage producerer vi faktisk mere vindstrøm, end vi kan bruge, og eksporterer overskuddet til vores nabolande. De danske havvindmølleparker som Horns Rev og Kriegers Flak er blandt verdens mest effektive, og nye projekter som energiøen i Nordsøen vil yderligere styrke Danmarks position som grøn energi-eksportør.',
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
            text: 'Når du vælger certificeret grøn strøm, skal du kigge efter oprindelsesgarantier (Guarantees of Origin - GO). Dette er det officielle europæiske system, der sikrer, at den mængde grøn strøm, du køber, rent faktisk er produceret fra vedvarende kilder. I Danmark udstedes disse certifikater af Energinet, og seriøse el-leverandører kan dokumentere deres grønne profil gennem disse. Derudover kan du kigge efter leverandører, der er certificeret gennem ordninger som "Grøn Strøm" mærket fra Forbrugerrådet Tænk, som stiller ekstra krav til bæredygtighed.',
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
            text: 'Det er værd at bemærke, at dansk produceret vindstrøm typisk har en CO2-udledning på kun 12 gram per kWh gennem hele livscyklussen (inklusiv produktion og opstilling af vindmøller), sammenlignet med 820 gram for kulkraft. Ved at vælge 100% vindstrøm kan en gennemsnitlig dansk husstand reducere sin årlige CO2-udledning med omkring 1,6 ton - svarende til at køre 8.000 km mindre i bil.',
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
            text: 'Solenergi',
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
            text: '• Voksende andel af energimixet',
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
            text: '• Ofte kombineret med andre vedvarende kilder',
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
            text: '• Særligt relevant for husstande med solceller',
            marks: []
          }
        ]
      }
    ]
  },

  // Expanded Process Section
  processSection: {
    _type: 'pageSection',
    _key: generateKey(),
    heading: 'Processen: Fra research til skift',
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
            text: 'Fase 1: Forberedelse (1-2 uger før)',
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
            text: '1. Saml dine elregninger',
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
            text: '2. Notér nuværende leverandør og vilkår',
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
            text: '3. Beregn årsforbrug',
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
            text: '4. Definer behov og ønsker',
            marks: []
          }
        ]
      },
      // NEW: Practical tips for preparation phase
      {
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: generateKey(),
            text: 'Start med at finde dit årsforbrug, som typisk står på din årsopgørelse fra netselskabet. Hvis du ikke har denne, kan du logge ind på din nuværende el-leverandørs hjemmeside eller app, hvor du ofte kan se dit forbrug måned for måned. Alternativt kan du kontakte dit netselskab (f.eks. Radius, N1, eller Cerius) som har alle dine forbrugsdata. Noter også hvilket prisområde du tilhører (DK1 vest for Storebælt eller DK2 øst for Storebælt), da priserne kan variere mellem områderne.',
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
            text: 'Undersøg din nuværende kontrakt grundigt. Kig især efter bindingsperiode, opsigelsesvarsel og eventuelle opsigelsesgebyrer. Mange er overraskede over at opdage, at de betaler for tillægsydelser som "grønt tillæg" eller "klimapakke", som de ikke var klar over. Tag screenshots eller gem PDF\'er af alle vigtige dokumenter - dette gør det nemmere at sammenligne med nye tilbud og sikrer, at du har dokumentation, hvis der skulle opstå uenigheder.',
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
            text: 'Fase 2: Research og sammenligning (1 uge)',
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
            text: '1. Brug ElPortals sammenligningsværktøj',
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
            text: '2. Indhent tilbud fra 3-5 leverandører',
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
            text: '3. Sammenlign totalomkostninger',
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
            text: '4. Læs anmeldelser og erfaringer',
            marks: []
          }
        ]
      },
      // NEW: Tips for effective comparison
      {
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: generateKey(),
            text: 'Når du sammenligner tilbud, så lav et regneark hvor du noterer ALLE omkostninger for hvert selskab: kWh-pris, abonnement, indbetalingsgebyr, betalingsgebyr og eventuelle andre tillæg. Beregn den samlede årlige omkostning baseret på dit faktiske forbrug. Husk at nogle selskaber lokker med lave kWh-priser men har høje faste gebyrer, hvilket kan gøre dem dyre for lavforbrugere. Omvendt kan selskaber med lidt højere kWh-priser men lave faste omkostninger være billigere for storforbrugere.',
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
            text: 'Fase 3: Beslutning og skift (1-3 dage)',
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
            text: '1. Vælg din nye leverandør',
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
            text: '2. Underskriv kontrakt online',
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
            text: '3. Leverandøren håndterer skiftet',
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
            text: '4. Modtag bekræftelse',
            marks: []
          }
        ]
      },
      // NEW: What to expect during the switch
      {
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: generateKey(),
            text: 'Når du har valgt ny leverandør, foregår tilmeldingen typisk online med NemID/MitID. Du skal bruge dit CPR-nummer, din adresse og dit målenummer (findes på din elregning eller ved at kontakte netselskabet). Den nye leverandør overtager automatisk kontakten til din gamle leverandør og sørger for opsigelsen. Du vil modtage en slutafregning fra din gamle leverandør cirka 6 uger efter skiftet. Vigtig detalje: Skiftet sker altid den 1. i en måned, så timing kan betyde noget hvis du er i binding.',
            marks: []
          }
        ]
      }
    ]
  },

  // Expanded Common Pitfalls Section
  pitfallsSection: {
    _type: 'pageSection',
    _key: generateKey(),
    heading: 'Almindelige faldgruber og hvordan du undgår dem',
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
            text: 'Faldgrube 1: Kun at fokusere på kWh-prisen',
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
            text: 'Problem',
            marks: ['strong']
          },
          {
            _type: 'span',
            _key: generateKey(),
            text: ': Mange ser kun på den annoncerede kWh-pris',
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
            text: 'Løsning',
            marks: ['strong']
          },
          {
            _type: 'span',
            _key: generateKey(),
            text: ': Beregn altid totalomkostninger inkl. alle gebyrer',
            marks: []
          }
        ]
      },
      // NEW: Real-world example
      {
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: generateKey(),
            text: 'Eksempel: Leverandør A tilbyder spotpris + 0,04 kr/kWh men har et månedligt abonnement på 39 kr plus betalingsgebyr på 9,50 kr. Leverandør B tilbyder spotpris + 0,08 kr/kWh uden abonnement og gebyrfrit ved betaling via Betalingsservice. For en husstand med årsforbrug på 2.000 kWh vil Leverandør A koste 80 kr mere i kWh-pris men 582 kr mindre i faste omkostninger - altså en årlig besparelse på 502 kr ved at vælge den "dyrere" kWh-pris!',
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
            text: 'Faldgrube 2: At ignorere bindingsperioder',
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
            text: 'Problem',
            marks: ['strong']
          },
          {
            _type: 'span',
            _key: generateKey(),
            text: ': Låst fast i dårlige aftaler',
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
            text: 'Løsning',
            marks: ['strong']
          },
          {
            _type: 'span',
            _key: generateKey(),
            text: ': Vælg fleksible løsninger medmindre prisen er exceptionel',
            marks: []
          }
        ]
      },
      // NEW: Binding period considerations
      {
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: generateKey(),
            text: 'Mange forbrugere lokkes af "introduktionstilbud" med lave priser de første 3-6 måneder, men overser at de samtidig binder sig for 12-24 måneder. Efter introduktionsperioden stiger prisen ofte markant. Eksempel: En kunde bandt sig til 24 måneders fastprisaftale i sommeren 2022 til 2,50 kr/kWh. Da elpriserne faldt markant i 2023, sad kunden fast med en pris der var dobbelt så høj som markedsprisen. Tommelfingerregel: Acceptér kun binding hvis den garanterede pris er mindst 20% lavere end gennemsnittet de seneste 12 måneder.',
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
            text: 'Faldgrube 3: At glemme den grønne profil',
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
            text: 'Problem',
            marks: ['strong']
          },
          {
            _type: 'span',
            _key: generateKey(),
            text: ': Vælger billigst uden hensyn til miljø',
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
            text: 'Løsning',
            marks: ['strong']
          },
          {
            _type: 'span',
            _key: generateKey(),
            text: ': Overvej langsigtet værdi af grøn energi',
            marks: []
          }
        ]
      },
      // NEW: Additional pitfalls
      {
        _type: 'block',
        _key: generateKey(),
        style: 'h3',
        children: [
          {
            _type: 'span',
            _key: generateKey(),
            text: 'Faldgrube 4: At falde for telefonsælgere',
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
            text: 'Aggressive telefonsælgere bruger ofte pres-taktikker som "tilbuddet gælder kun i dag" eller vildledende påstande om at din nuværende leverandør er ved at lukke. Giv ALDRIG dit CPR-nummer eller andre personlige oplysninger over telefonen. Seriøse leverandører giver dig altid betænkningstid og sender skriftlig dokumentation. Hvis du bliver ringet op, så bed om at få tilbuddet på email og sig, at du vil tænke over det. En leverandør der ikke respekterer dette, bør du holde dig fra.',
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
            text: 'Faldgrube 5: At misforstå "gratis strøm" tilbud',
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
            text: 'Nogle leverandører lokker med "gratis strøm om natten" eller lignende. Læs ALTID det med småt! Ofte er det kun selve råvareprisen (spotprisen) der er gratis, mens du stadig skal betale nettariffer, afgifter og moms - som udgør op til 80% af din elpris. Desuden kan dag-priserne være tilsvarende højere for at kompensere. Beregn altid den samlede månedlige omkostning baseret på dit faktiske forbrugsmønster før du lader dig friste.',
            marks: []
          }
        ]
      }
    ]
  }
}

// Function to find and update specific sections in the page
async function updatePageContent() {
  try {
    console.log('Fetching current page content...')
    
    // First, fetch the current page to get its structure
    const query = `*[_type == "page" && slug.current == "hvordan-vaelger-du-elleverandoer"][0]`
    const currentPage = await client.fetch(query)
    
    if (!currentPage) {
      console.error('❌ Page not found!')
      process.exit(1)
    }
    
    console.log('✅ Found page:', currentPage._id)
    console.log('Current content blocks:', currentPage.contentBlocks.length)
    
    // Create updated contentBlocks array by replacing specific sections
    const updatedContentBlocks = currentPage.contentBlocks.map((block: any) => {
      // Update Price Models Section
      if (block._type === 'pageSection' && block.heading === 'Forstå forskellige prismodeller') {
        console.log('📝 Updating Price Models section...')
        return expandedContentSections.priceModelsSection
      }
      
      // Update Green Energy Section
      if (block._type === 'pageSection' && block.heading === 'Grøn energi og bæredygtighed') {
        console.log('📝 Updating Green Energy section...')
        return expandedContentSections.greenEnergySection
      }
      
      // Update Process Section
      if (block._type === 'pageSection' && block.heading === 'Processen: Fra research til skift') {
        console.log('📝 Updating Process section...')
        return expandedContentSections.processSection
      }
      
      // Update Pitfalls Section
      if (block._type === 'pageSection' && block.heading === 'Almindelige faldgruber og hvordan du undgår dem') {
        console.log('📝 Updating Pitfalls section...')
        return expandedContentSections.pitfallsSection
      }
      
      // Keep all other blocks unchanged
      return block
    })
    
    // Update the page with new content
    const result = await client
      .patch(currentPage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()
    
    console.log('✅ Page updated successfully!')
    console.log('Updated content blocks:', result.contentBlocks.length)
    console.log('View at: https://dinelportal.sanity.studio/structure/page;' + result._id)
    console.log('Frontend URL: /hvordan-vaelger-du-elleverandoer')
    
  } catch (error) {
    console.error('❌ Update failed:', error)
    if (error.response) {
      console.error('Response:', error.response.body)
    }
    process.exit(1)
  }
}

// Execute update
updatePageContent()