import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fixTextCutoff() {
  try {
    console.log('Fetching historiske-priser page...')
    
    // Fetch the page
    const page = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYjlhjr"][0]`)
    if (!page) {
      console.error('historiske-priser page not found')
      return
    }

    console.log('Found page, fixing text cutoff issues...')

    // Find and fix the conclusion section that appears to be cut off
    const conclusionIndex = page.contentBlocks.findIndex(
      (block: any) => block._key === 'conclusion'
    )

    if (conclusionIndex !== -1) {
      const conclusionSection = page.contentBlocks[conclusionIndex]
      
      // Update the content with full text
      const updatedContent = [
        {
          _type: 'block',
          _key: 'acd6im-full',
          children: [
            {
              _type: 'span',
              _key: 'lebkka-full',
              text: 'Historiske elpriser giver værdifuld indsigt i markedsdynamikken og hjælper dig med at træffe bedre beslutninger om dit elforbrug. Ved at forstå prismønstre, sæsonvariationer og daglige svingninger kan du optimere dit forbrug og spare betydelige beløb på din elregning.',
              marks: []
            }
          ],
          style: 'normal',
          markDefs: []
        },
        {
          _type: 'block',
          _key: 'z40qaw-full',
          children: [
            {
              _type: 'span',
              _key: 'vudpj-full',
              text: '',
              marks: []
            }
          ],
          style: 'normal',
          markDefs: []
        },
        {
          _type: 'block',
          _key: 'tz89hf-full',
          children: [
            {
              _type: 'span',
              _key: 'zmejd-full',
              text: 'Husk at elpriserne konstant udvikler sig med den grønne omstilling. Mere vindkraft og solenergi skaber større prisudsving men også flere muligheder for besparelser. Ved at vælge en elleverandør med fokus på vedvarende energi som Vindstød, støtter du ikke kun den grønne omstilling men får også adgang til nogle af markedets mest konkurrencedygtige priser.',
              marks: []
            }
          ],
          style: 'normal',
          markDefs: []
        },
        {
          _type: 'block',
          _key: 'ghrvtc-full',
          children: [
            {
              _type: 'span',
              _key: 'qnku5-full',
              text: '',
              marks: []
            }
          ],
          style: 'normal',
          markDefs: []
        },
        {
          _type: 'block',
          _key: 'ms1brd-full',
          children: [
            {
              _type: 'span',
              _key: 'd0e8r-full',
              text: 'Start med at analysere dit eget forbrugsmønster og overvej om du kan flytte noget af dit forbrug til billigere timer. Selv små ændringer i dine vaner kan give mærkbare besparelser over tid.',
              marks: []
            }
          ],
          style: 'normal',
          markDefs: []
        }
      ]

      // Update the contentBlocks
      const updatedContentBlocks = [...page.contentBlocks]
      updatedContentBlocks[conclusionIndex] = {
        ...conclusionSection,
        content: updatedContent,
        headerAlignment: 'left' // Also ensure proper alignment
      }

      // Update the page
      const result = await client
        .patch(page._id)
        .set({ contentBlocks: updatedContentBlocks })
        .commit()

      console.log('✅ Text cutoff issues fixed successfully!')
      console.log('- Updated conclusion section with full text')
      console.log('- Ensured proper paragraph breaks')
    } else {
      console.log('Conclusion section not found')
    }

  } catch (error) {
    console.error('Error fixing text cutoff:', error)
  }
}

// Run the update
fixTextCutoff()