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

async function deployLadeboksPage() {
  try {
    console.log('Starting Ladeboks page deployment...')

    // Step 1: Update Easee Home with complete data
    console.log('Updating Easee Home product...')
    await client.createOrReplace({
      _id: 'chargingBoxProduct.easee-home',
      _type: 'chargingBoxProduct',
      name: 'Easee Home',
      description: [
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Fremtidens ladeboks til din elbil. Kompakt design med intelligent ladestyring og app-kontrol.'
            }
          ]
        }
      ],
      originalPrice: 8499,
      currentPrice: 6999,
      badge: 'TILBUD',
      features: [
        'Op til 22 kW ladeeffekt',
        'Automatisk lastbalancering',
        'Solcelle-integration',
        'App styring og overvågning',
        '5 års garanti',
        'Vejrbestandig (IP54)'
      ],
      productImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: 'image-placeholder-easee-home'
        }
      },
      ctaLink: 'https://easee.com/dk/home-charging/',
      ctaText: 'Se mere'
    })

    // Step 2: Update Zaptec Go
    console.log('Updating Zaptec Go product...')
    await client.createOrReplace({
      _id: 'chargingBoxProduct.zaptec-go',
      _type: 'chargingBoxProduct',
      name: 'Zaptec Go',
      description: [
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Prisvenlig og pålidelig ladeboks med alle essentielle funktioner til hjemmeopladning.'
            }
          ]
        }
      ],
      currentPrice: 4999,
      features: [
        'Op til 22 kW ladeeffekt',
        'Integreret jordafledning',
        'Dynamisk lastbalancering',
        'RFID adgangskontrol',
        '3 års garanti',
        'Nem installation'
      ],
      productImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: 'image-placeholder-zaptec-go'
        }
      },
      ctaLink: 'https://zaptec.com/dk/products/zaptec-go/',
      ctaText: 'Læs mere'
    })

    // Step 3: Update Clever Home Box
    console.log('Updating Clever Home Box product...')
    await client.createOrReplace({
      _id: 'chargingBoxProduct.clever-home-box',
      _type: 'chargingBoxProduct',
      name: 'Clever Home Box',
      description: [
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Danmarks mest populære ladeboks med adgang til Clevers omfattende ladenetværk.'
            }
          ]
        }
      ],
      originalPrice: 7999,
      currentPrice: 5999,
      badge: 'BESTSELLER',
      features: [
        'Op til 11 kW ladeeffekt',
        'Inkl. Clever abonnement',
        'Adgang til 4000+ ladere',
        'Gratis installation tilbud',
        'Smart opladning med app',
        'Dansk support 24/7'
      ],
      productImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: 'image-placeholder-clever-home'
        }
      },
      ctaLink: 'https://clever.dk/produkter/hjemmeladere/',
      ctaText: 'Bestil nu'
    })

    console.log('All products updated successfully!')

    // Step 4: Create the Ladeboks page with correct schema
    console.log('Creating Ladeboks page...')
    
    const ladeboksPage = {
      _id: 'page.ladeboks',
      _type: 'page',
      title: 'Ladeboks til Elbil - Find den Bedste Hjemmelader',
      slug: {
        _type: 'slug',
        current: 'ladeboks'
      },
      // Flat SEO fields at root level
      seoMetaTitle: 'Ladeboks til Elbil 2025 - Sammenlign Priser & Modeller',
      seoMetaDescription: 'Find den perfekte ladeboks til din elbil. Vi sammenligner Easee, Zaptec, Clever og andre populære ladeløsninger. Se priser, funktioner og få gratis installationstilbud.',
      seoKeywords: [
        'ladeboks',
        'elbil lader',
        'hjemmelader',
        'ladeboks pris',
        'easee home',
        'zaptec go',
        'clever ladeboks',
        'elbil opladning hjemme',
        'ladeboks installation',
        'bedste ladeboks'
      ],
      contentBlocks: [
        // Hero Section
        {
          _type: 'hero',
          _key: 'hero-ladeboks',
          heading: 'Find den Perfekte Ladeboks til Din Elbil',
          subheading: 'Sammenlign Danmarks mest populære ladeløsninger og få det bedste tilbud på installation',
          backgroundImage: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: 'image-hero-ladeboks'
            }
          },
          ctaText: 'Se ladebokse',
          ctaLink: '#ladeboks-showcase'
        },

        // Introduction Section
        {
          _type: 'pageSection',
          _key: 'intro-section',
          heading: 'Hvorfor Investere i en Hjemmelader?',
          headerAlignment: 'center',
          content: [
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Med en ladeboks derhjemme får du fuld kontrol over din elbils opladning. Du kan lade op om natten når strømmen er billigst, spare tid på ikke at skulle køre til offentlige ladere, og øge værdien af din bolig.'
                }
              ]
            },
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'En hjemmelader giver dig mulighed for at udnytte spotpriser på el, integrere med solceller, og sikre optimal opladning tilpasset din elbils behov. Med smart styring kan du spare op til 50% på dine ladeomkostninger sammenlignet med offentlig ladning.'
                }
              ]
            }
          ]
        },

        // Charging Box Showcase
        {
          _type: 'chargingBoxShowcase',
          _key: 'ladeboks-showcase',
          heading: 'Populære Ladebokse til Hjemmet',
          headerAlignment: 'center',
          description: [
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Vi har samlet Danmarks mest populære og pålidelige ladebokse. Alle modeller er testet og godkendt til danske forhold.'
                }
              ]
            }
          ],
          products: [
            {
              _type: 'reference',
              _ref: 'chargingBoxProduct.easee-home',
              _key: 'ref-easee'
            },
            {
              _type: 'reference',
              _ref: 'chargingBoxProduct.zaptec-go',
              _key: 'ref-zaptec'
            },
            {
              _type: 'reference',
              _ref: 'chargingBoxProduct.clever-home-box',
              _key: 'ref-clever'
            }
          ]
        },

        // Benefits Section
        {
          _type: 'valueProposition',
          _key: 'benefits-section',
          heading: 'Fordele ved Hjemmeopladning',
          headerAlignment: 'center',
          values: [
            {
              _type: 'valueItem',
              _key: 'benefit-1',
              icon: 'CheckCircle',
              heading: 'Spar op til 50% på ladning',
              description: 'Udnyt billige nattetimer og spotpriser'
            },
            {
              _type: 'valueItem',
              _key: 'benefit-2',
              icon: 'Home',
              heading: 'Bekvemmelighed',
              description: 'Lad op mens du sover - klar hver morgen'
            },
            {
              _type: 'valueItem',
              _key: 'benefit-3',
              icon: 'Zap',
              heading: 'Hurtig opladning',
              description: 'Op til 22 kW med 3-faset installation'
            },
            {
              _type: 'valueItem',
              _key: 'benefit-4',
              icon: 'Sun',
              heading: 'Solcelle integration',
              description: 'Lad op med din egen grønne energi'
            },
            {
              _type: 'valueItem',
              _key: 'benefit-5',
              icon: 'Shield',
              heading: 'Øget boligværdi',
              description: 'En moderne ladeboks øger husets værdi'
            },
            {
              _type: 'valueItem',
              _key: 'benefit-6',
              icon: 'Phone',
              heading: 'Smart styring',
              description: 'Kontroller alt fra din smartphone'
            }
          ]
        },

        // Installation Guide
        {
          _type: 'pageSection',
          _key: 'installation-guide',
          heading: 'Installation af Ladeboks - Sådan Foregår Det',
          headerAlignment: 'left',
          content: [
            {
              _type: 'block',
              style: 'h3',
              children: [
                {
                  _type: 'span',
                  text: '1. Tjek din el-installation'
                }
              ]
            },
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Før du køber en ladeboks, skal du sikre dig at din el-installation kan håndtere den ekstra belastning. De fleste moderne huse har 3-faset strøm (400V), hvilket giver mulighed for hurtigladning op til 22 kW. Ældre huse har ofte kun 1-faset strøm (230V), som begrænser ladeeffekten til max 7,4 kW.'
                }
              ]
            },
            {
              _type: 'block',
              style: 'h3',
              children: [
                {
                  _type: 'span',
                  text: '2. Vælg den rette ladeboks'
                }
              ]
            },
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Overvej følgende når du vælger ladeboks: Hvor hurtigt skal din bil kunne lade? Har du brug for smart styring og app-kontrol? Skal ladeboksen kunne integreres med solceller? Hvor vigtig er garantien for dig? Vælg en model der matcher både dine nuværende og fremtidige behov.'
                }
              ]
            },
            {
              _type: 'block',
              style: 'h3',
              children: [
                {
                  _type: 'span',
                  text: '3. Book autoriseret elektriker'
                }
              ]
            },
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Installation af ladeboks skal altid udføres af en autoriseret el-installatør. Mange ladeboks-leverandører tilbyder pakkeløsninger med installation inkluderet. Elektrikeren vil sikre korrekt installation, opsætning af sikringer og RCD-relæ, samt anmelde installationen til netselskabet.'
                }
              ]
            },
            {
              _type: 'block',
              style: 'h3',
              children: [
                {
                  _type: 'span',
                  text: '4. Aktivering og opsætning'
                }
              ]
            },
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Efter installation skal ladeboksen aktiveres og konfigureres. Dette inkluderer opsætning af WiFi-forbindelse, download af app, oprettelse af brugerprofil, og eventuel integration med dit elselskab for smart opladning. De fleste moderne ladebokse har brugervenlige apps der guider dig gennem processen.'
                }
              ]
            }
          ]
        },

        // CO2 Emissions Chart
        {
          _type: 'co2EmissionsChart',
          _key: 'co2-chart',
          heading: 'Lad Op Når Strømmen er Grønnest',
          headerAlignment: 'center',
          description: [
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Med en smart ladeboks kan du time opladningen til perioder med lav CO2-udledning. Se de aktuelle CO2-tal for det danske elnet og planlæg din opladning derefter.'
                }
              ]
            }
          ],
          showForecast: true,
          defaultView: 'both'
        },

        // Price Graph
        {
          _type: 'livePriceGraph',
          _key: 'price-graph',
          heading: 'Udnyt Lave Elpriser til Opladning',
          headerAlignment: 'center',
          description: [
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Smart opladning giver dig mulighed for automatisk at lade når elpriserne er lavest. Se dagens og morgendagens elpriser og spar penge på hver opladning.'
                }
              ]
            }
          ],
          showRegionSelector: true,
          showPriceBreakdown: true,
          defaultView: 'today'
        },

        // Technical Comparison
        {
          _type: 'pageSection',
          _key: 'technical-comparison',
          heading: 'Teknisk Sammenligning af Ladebokse',
          headerAlignment: 'left',
          content: [
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Når du skal vælge ladeboks, er der flere tekniske specifikationer du bør være opmærksom på:'
                }
              ]
            },
            {
              _type: 'block',
              style: 'h3',
              children: [
                {
                  _type: 'span',
                  text: 'Ladeeffekt og hastighed'
                }
              ]
            },
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Ladeeffekten måles i kilowatt (kW) og bestemmer hvor hurtigt din bil kan lade. Med 11 kW kan en typisk elbil med 60 kWh batteri fuldt oplades på cirka 5-6 timer. Med 22 kW halveres ladetiden. Husk at din bils ombordlader også sætter en grænse - mange elbiler kan kun modtage 11 kW uanset ladeboksens kapacitet.'
                }
              ]
            },
            {
              _type: 'block',
              style: 'h3',
              children: [
                {
                  _type: 'span',
                  text: 'Lastbalancering og sikkerhed'
                }
              ]
            },
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Dynamisk lastbalancering sikrer at din hovedsikring ikke overbelastes når du lader. Ladeboksen overvåger husets samlede elforbrug og justerer automatisk ladeeffekten. Dette er især vigtigt hvis du har begrænsset kapacitet i din el-installation eller hvis flere biler skal lade samtidigt.'
                }
              ]
            },
            {
              _type: 'block',
              style: 'h3',
              children: [
                {
                  _type: 'span',
                  text: 'Smart funktioner og integration'
                }
              ]
            },
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Moderne ladebokse tilbyder omfattende smart-funktioner: App-styring for fjernkontrol og overvågning, integration med spotpriser for automatisk billig opladning, solcelle-integration for grøn opladning, adgangskontrol med RFID eller app, og detaljeret statistik over forbrug og omkostninger.'
                }
              ]
            }
          ]
        },

        // FAQ Section
        {
          _type: 'faqGroup',
          _key: 'faq-section',
          heading: 'Ofte Stillede Spørgsmål om Ladebokse',
          headerAlignment: 'center',
          faqs: [
            {
              _type: 'faqItem',
              _key: 'faq-1',
              question: 'Hvor meget koster det at installere en ladeboks?',
              answer: [
                {
                  _type: 'block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Den samlede pris for ladeboks med installation ligger typisk mellem 10.000-20.000 kr. Selve ladeboksen koster 5.000-10.000 kr, mens installation varierer fra 5.000-10.000 kr afhængigt af kompleksitet. Prisen påvirkes af afstand fra eltavle, behov for gravearbejde, og om der skal opgraderes sikringer.'
                    }
                  ]
                }
              ]
            },
            {
              _type: 'faqItem',
              _key: 'faq-2',
              question: 'Kan jeg få tilskud til min ladeboks?',
              answer: [
                {
                  _type: 'block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Ja, flere kommuner og boligforeninger tilbyder tilskud til installation af ladebokse. Tjek med din kommune om lokale tilskudsordninger. Nogle elselskaber tilbyder også rabatter eller favorable finansieringsordninger. Virksomheder kan ofte få fradrag for installation af ladebokse til medarbejdere.'
                    }
                  ]
                }
              ]
            },
            {
              _type: 'faqItem',
              _key: 'faq-3',
              question: 'Skal jeg have 1-faset eller 3-faset ladeboks?',
              answer: [
                {
                  _type: 'block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: '3-faset ladeboks anbefales hvis din installation understøtter det. Med 3-faser kan du lade op til 22 kW, mens 1-fase er begrænset til 7,4 kW. Tjek din eltavle eller spørg en elektriker. Selv hvis du kun har 1-fase nu, kan en 3-faset ladeboks være fremtidssikring hvis du senere opgraderer din el-installation.'
                    }
                  ]
                }
              ]
            },
            {
              _type: 'faqItem',
              _key: 'faq-4',
              question: 'Hvordan integrerer jeg ladeboksen med mine solceller?',
              answer: [
                {
                  _type: 'block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Mange moderne ladebokse har indbygget solcelle-integration. De kan automatisk justere ladeeffekten baseret på din solcelleproduktion, så du primært lader med egen produceret strøm. Dette kræver typisk en smart energimåler og kompatibel ladeboks. Kontakt din installatør for at sikre kompatibilitet.'
                    }
                  ]
                }
              ]
            },
            {
              _type: 'faqItem',
              _key: 'faq-5',
              question: 'Er det sikkert at lade i regnvejr?',
              answer: [
                {
                  _type: 'block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'Ja, det er helt sikkert. Alle godkendte ladebokse har minimum IP54 klassificering, hvilket betyder de er beskyttet mod støv og vandstænk fra alle vinkler. Ladekablet har også vandtætte forbindelser. Ladeboksen afbryder automatisk strømmen hvis der opstår fejl, så du kan trygt lade i alt slags vejr.'
                    }
                  ]
                }
              ]
            },
            {
              _type: 'faqItem',
              _key: 'faq-6',
              question: 'Hvor lang garanti er der på ladebokse?',
              answer: [
                {
                  _type: 'block',
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      text: 'De fleste kvalitets-ladebokse kommer med 2-5 års garanti fra producenten. Easee tilbyder 5 års garanti, mens Zaptec og Clever typisk giver 3 års garanti. Garantien dækker produktionsfejl og defekter, men ikke skader fra forkert installation eller brug. Vælg altid autoriseret installation for at bevare garantien.'
                    }
                  ]
                }
              ]
            }
          ]
        },

        // CTA Section
        {
          _type: 'callToActionSection',
          _key: 'cta-section',
          heading: 'Klar til at Installere Din Ladeboks?',
          description: 'Få gratis og uforpligtende tilbud fra certificerede installatører i dit område',
          primaryCta: {
            text: 'Få tilbud nu',
            link: '/kontakt'
          },
          secondaryCta: {
            text: 'Ring til os',
            link: 'tel:+4570707070'
          },
          variant: 'centered'
        }
      ]
    }

    const result = await client.createOrReplace(ladeboksPage)
    console.log('Ladeboks page created successfully!')
    console.log('Page ID:', result._id)
    console.log('View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;page.ladeboks')

  } catch (error) {
    console.error('Error deploying Ladeboks page:', error)
    if (error.response) {
      console.error('Response details:', error.response.body)
    }
  }
}

// Run the deployment
deployLadeboksPage()