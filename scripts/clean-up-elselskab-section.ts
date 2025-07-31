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

async function cleanUpElselskabSection() {
  try {
    console.log('🔧 Cleaning up Elselskab section formatting...\n')
    
    // Fetch homepage
    const homepageIds = [
      '084518ec-2f79-48e0-b23c-add29ee83e6d',
      'drafts.084518ec-2f79-48e0-b23c-add29ee83e6d'
    ]
    
    for (const docId of homepageIds) {
      console.log(`\n📄 Processing ${docId.includes('drafts') ? 'draft' : 'published'} homepage...`)
      
      const homepage = await client.fetch(`*[_id == "${docId}"][0]`)
      
      if (!homepage) {
        console.log('   Not found, skipping...')
        continue
      }
      
      // Find the section "Sådan Vælger Du det Rigtige Elselskab for Dig"
      let sectionFound = false
      const updatedContentBlocks = homepage.contentBlocks.map((block: any) => {
        if (block._type === 'pageSection' && block.title === 'Sådan Vælger Du det Rigtige Elselskab for Dig') {
          sectionFound = true
          console.log('   Found section to clean up')
          
          // Create better structured content
          const cleanContent = [
            {
              _key: generateKey(),
              _type: 'block',
              children: [{
                _key: generateKey(),
                _type: 'span',
                marks: [],
                text: 'At vælge det rigtige '
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: ['strong'],
                text: 'elselskab'
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: [],
                text: ' kan virke uoverskueligt, men det behøver det ikke at være. Markedet er fyldt med dygtige '
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: ['strong'],
                text: 'elleverandører'
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: [],
                text: ', og det bedste valg afhænger af, hvad du vægter højest. Her er de fire vigtigste faktorer, du bør overveje, når du skal '
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: ['strong'],
                text: 'skifte elselskab'
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: [],
                text: '.'
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
                text: '1. Prismodel og Gennemsigtighed'
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
                text: 'Gå efter en simpel prismodel. Nogle selskaber lokker med lave intropriser, men har høje faste gebyrer. Et godt elselskab har en gennemsigtig pris, hvor du tydeligt kan se, hvad der er ren spotpris, og hvad der er et mindre tillæg.'
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
                text: '2. Klimaprofil og Grøn Energi'
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
                text: 'Er du optaget af den grønne omstilling? Se efter, om selskabet investerer i ny, vedvarende energi (som vindmøller og solceller) eller blot køber oprindelsescertifikater. '
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: ['strong'],
                text: 'Ægte grøn strøm'
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: [],
                text: ' kommer fra selskaber, der aktivt bidrager til udbygningen af grøn energi i Danmark.'
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
                text: '3. Kundeanmeldelser og Service'
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
                text: 'Hvad siger andre kunder? Tjek anmeldelser på Trustpilot. Et højt serviceniveau og en tilgængelig kundeservice er guld værd, hvis du har spørgsmål til din regning eller dit forbrug.'
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
                text: '4. Digitale Værktøjer (App)'
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
                text: 'Moderne elselskaber tilbyder ofte en app, hvor du kan følge dit forbrug og '
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: ['strong'],
                text: 'elpriserne time for time'
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: [],
                text: '. Det er et stærkt værktøj til at tage kontrol over din elregning og bruge strømmen, når den er grønnest og billigst.'
              }],
              markDefs: [],
              style: 'normal'
            }
          ]
          
          return {
            ...block,
            content: cleanContent
          }
        }
        return block
      })
      
      if (sectionFound) {
        // Update the document
        const result = await client.patch(docId)
          .set({ contentBlocks: updatedContentBlocks })
          .commit()
        
        console.log('   ✅ Successfully cleaned up section formatting!')
      } else {
        console.log('   Section not found')
      }
    }
    
    console.log('\n✅ Section formatting cleanup completed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
cleanUpElselskabSection()