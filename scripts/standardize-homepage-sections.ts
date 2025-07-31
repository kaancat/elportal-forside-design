import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

function generateKey(): string {
  return `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

async function standardizeHomepageSections() {
  try {
    console.log('🔧 Standardizing homepage section formatting...\n')
    
    // Fetch homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    let updatedSections = 0
    
    const updatedContentBlocks = homepage.contentBlocks.map((block: any) => {
      // Section 1: "Live Elpriser Time for Time"
      if (block._type === 'pageSection' && block.title === 'Live Elpriser Time for Time: Se Dagens Spotpriser Nu') {
        updatedSections++
        console.log('📝 Updating "Live Elpriser" section...')
        
        const newContent = [
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: [],
              text: 'Følg elpriserne i realtid og udnyt de billigste timer. Grafen ovenfor viser spotpriserne time for time, så du kan planlægge dit forbrug optimalt.'
            }],
            markDefs: [],
            style: 'normal'
          },
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: ['strong'],
              text: 'Sådan Bruger Du Grafen til at Spare Penge'
            }],
            markDefs: [],
            style: 'h3'
          },
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: [],
              text: 'Som grafen viser, er strømpriserne typisk lavest om natten og midt på dagen, når vindmøller og solceller producerer mest. Planlæg dit forbrug smart:'
            }],
            markDefs: [],
            style: 'normal'
          },
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: ['strong'],
              text: 'Start vaskemaskinen eller opvaskeren'
            }, {
              _key: generateKey(),
              _type: 'span',
              marks: [],
              text: ', når du går i seng. Se præcis hvad det koster at køre med vores forbrugsberegner nedenfor.'
            }],
            markDefs: [],
            style: 'normal'
          },
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: ['strong'],
              text: 'Oplad din elbil'
            }, {
              _key: generateKey(),
              _type: 'span',
              marks: [],
              text: ' i de billige nattetimer. Læs mere om den optimale ladeboks-løsning længere nede.'
            }],
            markDefs: [],
            style: 'normal'
          },
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: ['strong'],
              text: 'Undgå spidsbelastning'
            }, {
              _key: generateKey(),
              _type: 'span',
              marks: [],
              text: ': Begræns brugen af ovn og tørretumbler mellem kl. 17 og 20, hvor strømmen er dyrest.'
            }],
            markDefs: [],
            style: 'normal'
          },
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: [],
              text: 'Når du vælger en elaftale med variabel pris, får du direkte gavn af de lave timepriser, du ser her.'
            }],
            markDefs: [],
            style: 'normal'
          }
        ]
        
        return {
          ...block,
          content: newContent
        }
      }
      
      // Section 2: "Hvad Koster Strømmen?"
      if (block._type === 'pageSection' && block.title === 'Hvad Koster Strømmen? Beregn Dit Elforbrug Her') {
        updatedSections++
        console.log('📝 Updating "Hvad Koster Strømmen" section...')
        
        const newContent = [
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: [],
              text: 'Brug vores beregner til at få et præcist overblik over dine elomkostninger. Indtast dit forbrug, og se hvad du betaler hos forskellige elselskaber.'
            }],
            markDefs: [],
            style: 'normal'
          },
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: [],
              text: 'Beregneren tager højde for spotpriser, elselskabets tillæg, netafgifter og moms, så du får den fulde pris. Find ud af, om du kan spare penge ved at skifte elselskab.'
            }],
            markDefs: [],
            style: 'normal'
          }
        ]
        
        return {
          ...block,
          content: newContent
        }
      }
      
      // Section 3: "Få en Ladeboks"
      if (block._type === 'pageSection' && block.title === 'Få en Ladeboks og Oplad Din Elbil Billigere og Grønnere') {
        updatedSections++
        console.log('📝 Updating "Få en Ladeboks" section...')
        
        const newContent = [
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: [],
              text: 'Har du elbil eller overvejer at købe en? En hjemmeladeboks er nøglen til billig og bekvem opladning. Oplad når strømmen er billigst og mest grøn.'
            }],
            markDefs: [],
            style: 'normal'
          },
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: ['strong'],
              text: 'Fordele ved hjemmeopladning'
            }],
            markDefs: [],
            style: 'h3'
          },
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: ['strong'],
              text: 'Spar 50-70% på opladning'
            }, {
              _key: generateKey(),
              _type: 'span',
              marks: [],
              text: ' sammenlignet med offentlige lynladere. Oplad typisk for 2-3 kr/kWh derhjemme mod 5-8 kr/kWh ude.'
            }],
            markDefs: [],
            style: 'normal'
          },
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: ['strong'],
              text: 'Smart opladning'
            }, {
              _key: generateKey(),
              _type: 'span',
              marks: [],
              text: ' med timer-funktion, så du automatisk oplader i de billigste timer om natten.'
            }],
            markDefs: [],
            style: 'normal'
          },
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: ['strong'],
              text: 'Øg boligens værdi'
            }, {
              _key: generateKey(),
              _type: 'span',
              marks: [],
              text: ' med en professionelt installeret ladeboks. Et attraktivt salgsargument i fremtiden.'
            }],
            markDefs: [],
            style: 'normal'
          },
          {
            _key: generateKey(),
            _type: 'block',
            children: [{
              _key: generateKey(),
              _type: 'span',
              marks: [],
              text: 'Læs mere om ladeboks-løsninger og find den bedste til dit behov nedenfor.'
            }],
            markDefs: [],
            style: 'normal'
          }
        ]
        
        return {
          ...block,
          content: newContent
        }
      }
      
      return block
    })
    
    if (updatedSections > 0) {
      // Update the document
      const result = await client.patch(homepage._id)
        .set({ contentBlocks: updatedContentBlocks })
        .commit()
      
      console.log(`\n✅ Successfully standardized ${updatedSections} sections!`)
    } else {
      console.log('\n✅ No sections needed updating')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
standardizeHomepageSections()