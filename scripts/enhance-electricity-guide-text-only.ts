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

// Enhance the electricity guide with expanded content
async function enhanceElectricityGuideText() {
  console.log('🚀 Enhancing electricity guide with expanded text content')
  
  const documentId = 'qgCxJyBbKpvhb2oGYqfgkp'
  
  try {
    const document = await client.getDocument(documentId)
    console.log(`\n📄 Enhancing: ${document.title}`)
    
    let enhancementCount = 0
    
    // Enhanced content blocks with expanded text
    const enhancedBlocks = document.contentBlocks.map((block: any, index: number) => {
      // Enhance hero with additional content
      if (block._type === 'hero' && index === 0) {
        console.log('📝 Expanding hero content')
        enhancementCount++
        return {
          ...block,
          content: [
            ...block.content || [],
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'I 2024 har danske forbrugere flere muligheder end nogensinde før. Med over 30 el-leverandører at vælge imellem, kan det være svært at navigere i markedet. Vores omfattende guide hjælper dig med at træffe det bedste valg baseret på dine behov, forbrug og værdier.',
                  marks: []
                }
              ]
            }
          ]
        }
      }
      
      // Enhance "Forstå markedet" section with expanded content
      if (block._type === 'pageSection' && block.title === 'Forstå markedet for el-leverandører i Danmark') {
        console.log('📝 Expanding market understanding section')
        enhancementCount++
        return {
          ...block,
          content: [
            ...block.content,
            {
              _type: 'block',
              _key: generateKey(),
              style: 'h3',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Sådan fungerer det danske elmarked i praksis',
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
                  text: 'Danmark har et af Europas mest velfungerende og liberaliserede elmarkeder. Siden åbningen i 2003 har forbrugere kunnet vælge frit mellem el-leverandører, hvilket har skabt sund konkurrence og innovation. I dag opererer over 30 el-leverandører i Danmark, fra store etablerede selskaber til nye, specialiserede aktører som Vindstød, der fokuserer 100% på vindenergi.',
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
                  text: 'Din el-regning består typisk af tre dele: selve elprisen (ca. 30%), nettariffer til dit lokale netselskab (ca. 20%), og afgifter til staten (ca. 50%). Kun el-leverandøren kan du vælge frit - de andre dele er faste uanset leverandør.',
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
                  text: 'Det er vigtigt at forstå, at selvom du skifter el-leverandør, får du stadig strøm fra samme ledninger og med samme leveringssikkerhed. Dit netselskab sørger fortsat for vedligeholdelse og strømforsyning - det eneste der ændrer sig er, hvem der sender dig regningen for selve elforbruget.',
                  marks: []
                }
              ]
            }
          ]
        }
      }
      
      // Enhance "Forstå forskellige prismodeller" with expanded spot price explanation
      if (block._type === 'pageSection' && block.title === 'Forstå forskellige prismodeller') {
        console.log('💰 Expanding price models section')
        enhancementCount++
        return {
          ...block,
          content: [
            ...block.content,
            {
              _type: 'block',
              _key: generateKey(),
              style: 'h3',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Sådan fungerer spotpriser time for time',
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
                  text: 'Spotprisen fastsættes hver dag kl. 13:00 for det næste døgn på Nord Pool elbørsen. Priserne varierer time for time baseret på udbud og efterspørgsel. Typisk er priserne lavest om natten (kl. 00-06) og højest i myldretiden (kl. 07-09 og 17-21). I weekender er priserne generelt lavere på grund af reduceret erhvervsforbrug.',
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
                  text: 'Med moderne teknologi kan du udnytte spotpriser optimalt. Smart home-løsninger kan automatisk flytte forbrug til billige timer - opvaskemaskiner, vaskemaskiner og elbiler kan programmeres til at køre, når strømmen er billigst. Dette kan typisk spare 20-30% på elregningen for en gennemsnitsfamilie.',
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
                  text: 'Vejret har stor indflydelse på spotprisen. Når det blæser meget, producerer vindmøllerne store mængder strøm, hvilket presser prisen ned - nogle gange endda til negative priser. Modsat stiger prisen, når det er vindstille og koldt, da efterspørgslen er høj og produktionen fra vedvarende kilder er lav.',
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
                  text: 'Hvornår passer hvilken prismodel bedst?',
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
                  text: 'Spotpris passer dig, hvis du: Er fleksibel med dit forbrug, har smart home eller elbil, kan tåle prisudsving, følger med i elmarkedet. Fastpris passer dig, hvis du: Ønsker budgetsikkerhed, har stramt budget, ikke kan flytte forbrug, foretrækker stabilitet frem for potentielle besparelser.',
                  marks: []
                }
              ]
            }
          ]
        }
      }
      
      // Enhance "Grøn energi" section with statistics
      if (block._type === 'pageSection' && block.title === 'Grøn energi og bæredygtighed') {
        console.log('🌱 Expanding green energy section')
        enhancementCount++
        return {
          ...block,
          content: [
            ...block.content,
            {
              _type: 'block',
              _key: generateKey(),
              style: 'h3',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: 'Danmarks position som grøn energi-leder',
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
                  text: 'Danmark er verdensførende inden for vindenergi. I 2023 kom hele 55% af Danmarks elforbrug fra vindkraft, og på særligt blæsende dage kan vindmøllerne producere over 100% af landets behov. De store havvindmølleparker som Horns Rev og Kriegers Flak leverer strøm svarende til millioner af husstandes årsforbrug.',
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
                  text: 'Certificering er afgørende for at sikre ægte grøn strøm. Oprindelsesgarantier (GO - Guarantees of Origin) dokumenterer, at strømmen kommer fra vedvarende kilder. Derudover findes "Grøn Strøm" mærket fra Forbrugerrådet Tænk, som stiller endnu strengere krav til bæredygtighed og gennemsigtighed.',
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
                  text: 'Dit valg gør en reel forskel: En gennemsnitsfamilie, der skifter fra konventionel el til vindstrøm, reducerer deres årlige CO2-udslip med cirka 1,6 ton. Det svarer til at køre 8.000 km mindre i bil. Med vindstrøm er CO2-udslippet kun 12g per kWh, sammenlignet med 820g for kulkraft.',
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
                  text: 'Fremtidens grønne energiløsninger',
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
                  text: 'Power-to-X teknologier vil revolutionere energisektoren de kommende år. Overskydende vindenergi kan omdannes til grøn brint, som kan lagres og bruges når vinden ikke blæser. Danmark investerer massivt i denne teknologi med projekter på Bornholm og i Nordjylland.',
                  marks: []
                }
              ]
            }
          ]
        }
      }
      
      // Enhance "Processen" section with more practical tips
      if (block._type === 'pageSection' && block.title === 'Processen: Fra research til skift') {
        console.log('📋 Expanding process section')
        enhancementCount++
        const enhancedContent = [...block.content]
        
        // Find phases and add tips
        const phase1Index = enhancedContent.findIndex((c: any) => 
          c.children?.[0]?.text?.includes('Fase 1: Forberedelse')
        )
        
        if (phase1Index !== -1) {
          // Add practical tips after each phase
          enhancedContent.splice(phase1Index + 5, 0,
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: '💡 Praktisk tip',
                  marks: ['strong']
                },
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: ': Find dit årsforbrug på din elregning under "Årsoversigt" eller kontakt dit nuværende selskab. Husk at notere hvilket netområde du tilhører (DK1 vest for Storebælt eller DK2 øst for Storebælt), da priserne kan variere mellem områderne.',
                  marks: []
                }
              ]
            }
          )
        }
        
        const phase2Index = enhancedContent.findIndex((c: any) => 
          c.children?.[0]?.text?.includes('Fase 2: Research og sammenligning')
        )
        
        if (phase2Index !== -1) {
          enhancedContent.splice(phase2Index + 5, 0,
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: '💡 Praktisk tip',
                  marks: ['strong']
                },
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: ': Lav et regneark hvor du sammenligner totalprisen inklusiv alle gebyrer. Husk at medregne: Abonnement, kWh-pris, betalingsgebyr, grøn afgift og moms. Vær særlig opmærksom på introduktionstilbud - hvad er prisen efter tilbudsperioden?',
                  marks: []
                }
              ]
            }
          )
        }
        
        const phase3Index = enhancedContent.findIndex((c: any) => 
          c.children?.[0]?.text?.includes('Fase 3: Beslutning og skift')
        )
        
        if (phase3Index !== -1) {
          enhancedContent.splice(phase3Index + 5, 0,
            {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: '💡 Praktisk tip',
                  marks: ['strong']
                },
                {
                  _type: 'span',
                  _key: generateKey(),
                  text: ': Du skal bruge følgende oplysninger til skiftet: CPR-nummer, adresse, måler-nummer (findes på din elregning), årligt forbrug. Skiftet sker altid den 1. i en måned, og din nye leverandør håndterer al kommunikation med den gamle.',
                  marks: []
                }
              ]
            }
          )
        }
        
        return {
          ...block,
          content: enhancedContent
        }
      }
      
      // Enhance "Faldgruber" section with concrete examples
      if (block._type === 'pageSection' && block.title === 'Almindelige faldgruber og hvordan du undgår dem') {
        console.log('⚠️  Expanding pitfalls section')
        enhancementCount++
        
        // Find where to add new pitfalls
        const lastPitfallIndex = block.content.findIndex((c: any, idx: number) => 
          c.children?.[0]?.text?.includes('Faldgrube 3:') && 
          !block.content[idx + 4]?.children?.[0]?.text?.includes('Faldgrube 4:')
        )
        
        const newPitfalls = [
          {
            _type: 'block',
            _key: generateKey(),
            style: 'h3',
            children: [
              {
                _type: 'span',
                _key: generateKey(),
                text: 'Faldgrube 4: At falde for aggressive telefonsælgere',
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
                text: ': Telefonsælgere bruger pressede salgsteknikker og lokkemidler',
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
                text: ': Sig altid "jeg ringer tilbage" og undersøg selskabet grundigt. Giv aldrig CPR-nummer over telefonen. Seriøse selskaber respekterer, at du vil tænke over tilbuddet.',
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
                text: 'Konkret eksempel: I 2023 oplevede mange forbrugere at blive ringet op med tilbud om "gratis strøm i 3 måneder". Realiteten var ofte høje abonnementsgebyrer og lange bindingsperioder, der gjorde den samlede pris dyrere end almindelige aftaler.',
                marks: ['em']
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
                text: 'Faldgrube 5: At tro på "gratis strøm" tilbud',
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
                text: ': Misvisende markedsføring lover gratis strøm',
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
                text: ': Læs det med småt - typisk er kun selve råstrømmen "gratis", mens du stadig betaler netafgifter, skatter og abonnement',
                marks: []
              }
            ]
          }
        ]
        
        // Insert new pitfalls
        const contentWithNewPitfalls = [...block.content]
        if (lastPitfallIndex !== -1) {
          contentWithNewPitfalls.splice(lastPitfallIndex + 4, 0, ...newPitfalls)
        } else {
          contentWithNewPitfalls.push(...newPitfalls)
        }
        
        return {
          ...block,
          content: contentWithNewPitfalls
        }
      }
      
      return block
    })
    
    // Update document
    console.log(`\n📝 Applying ${enhancementCount} content enhancements...`)
    await client
      .patch(documentId)
      .set({ contentBlocks: enhancedBlocks })
      .commit()
    
    console.log('✅ Page enhanced successfully with expanded text content!')
    console.log('\n📊 Enhancements applied:')
    console.log('- Hero content expanded')
    console.log('- Market understanding section: +3 paragraphs')
    console.log('- Price models section: +5 paragraphs')
    console.log('- Green energy section: +5 paragraphs')
    console.log('- Process section: +3 practical tips')
    console.log('- Pitfalls section: +2 new pitfalls with examples')
    
    console.log(`\n🔗 View enhanced page: https://dinelportal.sanity.studio/structure/page;${documentId}`)
    console.log('\n💡 Note: Images can be added manually in Sanity Studio using the image upload feature.')
    
  } catch (error) {
    console.error('❌ Error enhancing page:', error)
    process.exit(1)
  }
}

// Execute enhancement
enhanceElectricityGuideText()