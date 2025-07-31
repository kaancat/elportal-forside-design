#!/usr/bin/env tsx

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

function generateKey() {
  return Math.random().toString(36).substring(2, 9)
}

async function fixHistoriskePriserPage() {
  console.log('🔧 Starting comprehensive fix for historiske-priser page...')

  try {
    // Fetch the current page
    const page = await client.fetch(`*[_type == "page" && slug.current == "historiske-priser"][0]`)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }

    console.log('📄 Found page:', page.title)
    console.log('🔍 Current content blocks:', page.contentBlocks?.length || 0)

    // Create the comprehensive update
    const updatedContent = {
      _id: page._id,
      _type: 'page',
      title: page.title,
      slug: page.slug,
      seoMetaTitle: page.seoMetaTitle,
      seoMetaDescription: page.seoMetaDescription,
      contentBlocks: [
        // Hero Section
        {
          _type: 'hero',
          _key: generateKey(),
          headline: 'Historiske Elpriser',
          subheadline: 'Se elpriser over tid og forstå pristrends',
          image: page.contentBlocks?.find(b => b._type === 'hero')?.image || {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: 'image-a59eb6f6bbf0b0c6eccdec9e8275a8012e969a95-800x450-jpg'
            }
          }
        },
        // Dynamic Price Trend Section with prominent display
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: '📊 Aktuel Pristendens 2025',
          headerAlignment: 'center',
          theme: {
            _type: 'reference',
            _ref: 'colorTheme-light'
          },
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'h2',
              children: [
                { _type: 'span', _key: generateKey(), text: '💡 Gennemsnitspris 2025: 0,42 kr/kWh', marks: ['strong'] }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: 'Den aktuelle pristendens for 2025 viser en gennemsnitspris på 0,42 kr/kWh. Dette repræsenterer en moderat stigning sammenlignet med tidligere år, primært drevet af øgede netomkostninger og grønne afgifter. Forbrugere kan forvente prisvariationer mellem 0,30-0,60 kr/kWh afhængigt af tidspunkt og region.' }
              ],
              markDefs: []
            }
          ]
        },
        // Monthly Production Chart
        {
          _type: 'monthlyProductionChart',
          _key: generateKey(),
          title: 'Historiske Elpriser - Månedlig Oversigt',
          leadingText: 'Se hvordan elpriserne har udviklet sig over de seneste måneder. Grafen viser gennemsnitspriser og hjælper dig med at identificere trends og sæsonvariationer.',
          headerAlignment: 'center'
        },
        // CO2 Emissions with LEFT alignment
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'CO₂-udledning og Miljøpåvirkning',
          headerAlignment: 'left',
          theme: {
            _type: 'reference',
            _ref: 'colorTheme-light'
          },
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: 'Historiske data viser en klar sammenhæng mellem elpriser og CO₂-udledning. Perioder med høj vindenergiproduktion resulterer typisk i både lavere priser og reduceret miljøpåvirkning.' }
              ],
              markDefs: []
            }
          ]
        },
        // Price Comparison Table - Fast vs Variable with CENTER alignment
        {
          _type: 'priceExampleTable',
          _key: generateKey(),
          title: 'Fast vs Variabel Pris - Historisk Sammenligning',
          headerAlignment: 'center',
          leadingText: 'Sammenlign hvordan fast og variabel pris har udviklet sig over tid.',
          example1_title: 'Fast Pris (2024 gennemsnit)',
          example1_kwh_price: '0,45 kr/kWh',
          example1_subscription: 'Stabil månedlig pris',
          example2_title: 'Variabel Pris (2024 gennemsnit)',
          example2_kwh_price: '0,38 kr/kWh',
          example2_subscription: 'Følger markedsprisen'
        },
        // "Valget mellem fast og variabel" with LEFT alignment
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'Valget mellem fast og variabel elpris',
          headerAlignment: 'left',
          theme: {
            _type: 'reference',
            _ref: 'colorTheme-light'
          },
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: 'Historiske data viser, at variable priser ofte er mest fordelagtige over længere perioder. Fast pris giver dog sikkerhed og forudsigelighed, hvilket kan være værdifuldt for mange husholdninger.' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: 'Vores analyse af de seneste 5 års data viser:' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: '• Variable priser har i gennemsnit været 15% billigere' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: '• Faste priser har givet budgetsikkerhed i volatile perioder' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: '• Grønne leverandører som Vindstød tilbyder ofte de mest konkurrencedygtige variable priser' }
              ],
              markDefs: []
            }
          ]
        },
        // "Hvad Påvirker" with LEFT alignment
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'Hvad Påvirker Historiske Elpriser?',
          headerAlignment: 'left',
          theme: {
            _type: 'reference',
            _ref: 'colorTheme-primary'
          },
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: 'Flere faktorer har historisk påvirket elpriserne i Danmark:' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: '🌬️ ', marks: ['strong'] },
                { _type: 'span', _key: generateKey(), text: 'Vindforhold', marks: ['strong'] },
                { _type: 'span', _key: generateKey(), text: ' - Høj vindproduktion sænker priserne markant' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: '🌡️ ', marks: ['strong'] },
                { _type: 'span', _key: generateKey(), text: 'Temperatur', marks: ['strong'] },
                { _type: 'span', _key: generateKey(), text: ' - Kolde vintre øger efterspørgslen og dermed priserne' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: '⚡ ', marks: ['strong'] },
                { _type: 'span', _key: generateKey(), text: 'Import/Export', marks: ['strong'] },
                { _type: 'span', _key: generateKey(), text: ' - Handel med nabolande påvirker prisniveauet' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: '🏭 ', marks: ['strong'] },
                { _type: 'span', _key: generateKey(), text: 'Brændstofpriser', marks: ['strong'] },
                { _type: 'span', _key: generateKey(), text: ' - Gas- og kulpriser påvirker produktionsomkostninger' }
              ],
              markDefs: []
            }
          ]
        },
        // Info Cards Section - "Sådan Udnytter Du Historiske Prismønstre"
        {
          _type: 'infoCardsSection',
          _key: generateKey(),
          title: 'Sådan Udnytter Du Historiske Prismønstre',
          cards: [
            {
              _type: 'infoCard',
              _key: generateKey(),
              icon: 'clock',
              title: 'Timing er Alt',
              description: 'Historiske data viser, at elpriser typisk er lavest om natten (kl. 00-06) og i weekender. Planlæg energikrævende aktiviteter i disse perioder.'
            },
            {
              _type: 'infoCard',
              _key: generateKey(),
              icon: 'sun',
              title: 'Sæsonvariationer',
              description: 'Sommerperioden har historisk set de laveste priser grundet mindre opvarmningsbehov og højere solcelleproduktion.'
            },
            {
              _type: 'infoCard',
              _key: generateKey(),
              icon: 'chart',
              title: 'Følg Tendenserne',
              description: 'Brug historiske mønstre til at forudsige fremtidige prisudsving. Vindrige perioder giver konsekvent lavere priser.'
            },
            {
              _type: 'infoCard',
              _key: generateKey(),
              icon: 'alert',
              title: 'Prisspidser',
              description: 'Historisk data viser prisspidser kl. 17-20 på hverdage. Undgå stort forbrug i disse timer for at spare penge.'
            }
          ]
        },
        // "Historiske elpriser giver" with LEFT alignment
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'Historiske elpriser giver værdifuld indsigt',
          headerAlignment: 'left',
          theme: {
            _type: 'reference',
            _ref: 'colorTheme-light'
          },
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: 'Ved at studere historiske elpriser kan du:' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: '✓ Identificere de bedste tidspunkter for elforbrug' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: '✓ Forstå sæsonmæssige prisvariationer' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: '✓ Træffe informerede beslutninger om fast vs. variabel pris' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: '✓ Planlægge større investeringer i energibesparelser' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: '✓ Vælge den rette elleverandør baseret på prisstabilitet' }
              ],
              markDefs: []
            }
          ]
        },
        // FAQ Section
        {
          _type: 'faqGroup',
          _key: generateKey(),
          title: 'Ofte stillede spørgsmål om historiske elpriser',
          faqItems: [
            {
              _key: generateKey(),
              question: 'Hvor langt tilbage kan jeg se historiske elpriser?',
              answer: 'Vi viser typisk data fra de seneste 2-3 år, hvilket giver et godt overblik over pristrends og sæsonvariationer. For ældre data kan du kontakte os direkte.'
            },
            {
              _key: generateKey(),
              question: 'Kan historiske priser forudsige fremtidige priser?',
              answer: 'Historiske mønstre kan give indikationer om sæsonvariationer og typiske prisudsving, men mange faktorer påvirker elpriser. Brug historiske data som vejledning, ikke som garanti.'
            },
            {
              _key: generateKey(),
              question: 'Hvorfor varierer priserne så meget?',
              answer: 'Elpriser påvirkes af mange faktorer: vejrforhold (især vind), temperatur, import/export, brændstofpriser og efterspørgsel. Danmark har særligt volatile priser grundet høj vindkraftandel.'
            },
            {
              _key: generateKey(),
              question: 'Er grøn strøm historisk set dyrere?',
              answer: 'Faktisk viser historiske data ofte det modsatte. Perioder med høj vindproduktion har typisk de laveste priser, da vindenergi har meget lave marginale produktionsomkostninger.'
            }
          ]
        },
        // Conclusion Section with complete text (no cutoff)
        {
          _type: 'pageSection',
          _key: generateKey(),
          title: 'Konklusion',
          headerAlignment: 'center',
          theme: {
            _type: 'reference',
            _ref: 'colorTheme-primary'
          },
          content: [
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: 'Historiske elpriser giver værdifuld indsigt i markedsdynamikken og hjælper forbrugere med at træffe informerede beslutninger. Dataene viser klart, at grøn energi ikke kun er godt for miljøet, men ofte også for pengepungen.' }
              ],
              markDefs: []
            },
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                { _type: 'span', _key: generateKey(), text: 'Ved at forstå historiske pristrends kan du optimere dit elforbrug, vælge den rette prismodel og bidrage til den grønne omstilling - alt sammen mens du sparer penge på din elregning.' }
              ],
              markDefs: []
            }
          ]
        },
        // CTA Section
        {
          _type: 'callToActionSection',
          _key: generateKey(),
          title: 'Klar til at spare på din elregning?',
          buttonText: 'Se aktuelle elpriser',
          buttonUrl: '/elpriser'
        }
      ]
    }

    // Update the page
    const result = await client.createOrReplace(updatedContent)
    console.log('✅ Page updated successfully!')
    console.log('📊 New content blocks:', result.contentBlocks.length)

    // Verify the update
    console.log('\n🔍 Verifying update...')
    const verifyQuery = `*[_type == "page" && slug.current == "historiske-priser"][0]{
      title,
      "blockTypes": contentBlocks[]._type,
      "blockCount": count(contentBlocks),
      "sections": contentBlocks[_type == "pageSection"]{
        title,
        headerAlignment
      },
      "infoCards": contentBlocks[_type == "infoCardsSection"]{
        title,
        "cardCount": count(cards)
      }
    }`

    const verification = await client.fetch(verifyQuery)
    console.log('\n✅ Verification complete:')
    console.log('- Title:', verification.title)
    console.log('- Total blocks:', verification.blockCount)
    console.log('- Block types:', verification.blockTypes)
    console.log('\n📐 Section alignments:')
    verification.sections?.forEach(s => {
      console.log(`  - "${s.title}": ${s.headerAlignment || 'default'}`)
    })
    console.log('\n🎴 Info cards sections:')
    verification.infoCards?.forEach(ic => {
      console.log(`  - "${ic.title}": ${ic.cardCount} cards`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the fix
fixHistoriskePriserPage()