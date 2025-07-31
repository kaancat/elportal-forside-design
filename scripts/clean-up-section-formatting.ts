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

async function cleanUpSectionFormatting() {
  try {
    console.log('🔧 Cleaning up section formatting...\n')
    
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
      
      // Find the section "Forstå Elpriserne og Spar Penge på Din Strøm"
      let sectionFound = false
      const updatedContentBlocks = homepage.contentBlocks.map((block: any) => {
        if (block._type === 'pageSection' && block.title === 'Forstå Elpriserne og Spar Penge på Din Strøm') {
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
                marks: ['strong'],
                text: 'Elpriser i Danmark ændrer sig time for time.'
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
                text: 'At forstå disse svingninger er nøglen til en lavere elregning. Prisen på strøm påvirkes af alt fra vejret til udbud og efterspørgsel på den nordiske elbørs, Nord Pool.'
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
                text: 'Din endelige strømpris består typisk af tre dele:'
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
                text: '1. Spotprisen:'
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: [],
                text: ' Den rå markedspris på el, som varierer konstant.'
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
                text: '2. Dit elselskabs tillæg:'
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: [],
                text: ' Et mindre gebyr eller en margin for at håndtere dit kundeforhold.'
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
                text: '3. Afgifter og transport:'
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: [],
                text: ' Skatter til staten og betaling for brug af elnettet.'
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
                text: 'Pro Tip: Sådan får du billig strøm'
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
                text: 'Med en elaftale baseret på '
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: ['strong'],
                text: 'spotpriser'
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: [],
                text: ', kan du aktivt flytte dit forbrug til de billigste timer. Det er typisk om natten og midt på dagen, hvor der er masser af vind- og solenergi. Undgå så vidt muligt de dyre spidsbelastningstimer, som ofte ligger mellem kl. 17 og 20.'
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
                text: 'Klar til at se, hvad du kan spare? Sammenlign elselskaber og find den aftale, der bedst udnytter de lave '
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: ['strong'],
                text: 'elpriser time for time'
              }, {
                _key: generateKey(),
                _type: 'span',
                marks: [],
                text: '.'
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
cleanUpSectionFormatting()