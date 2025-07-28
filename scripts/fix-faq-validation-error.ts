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

// Fetch document
async function fetchDocument(documentId: string) {
  try {
    console.log(`📄 Fetching document: ${documentId}`)
    const document = await client.getDocument(documentId)
    if (!document) {
      throw new Error('Document not found')
    }
    return document
  } catch (error) {
    console.error('❌ Error fetching document:', error)
    throw error
  }
}

// Fix FAQ validation error
async function fixFaqValidationError() {
  console.log('🔧 Fixing FAQ validation error')
  
  const documentId = 'qgCxJyBbKpvhb2oGYqfgkp'
  
  try {
    // Fetch the document
    const document = await fetchDocument(documentId)
    
    // Check and fix content blocks
    const fixedContentBlocks = document.contentBlocks.map((block: any, index: number) => {
      if (block._type === 'faqGroup' && !block.faqItems) {
        console.log(`📝 Fixing faqGroup at index ${index}`)
        
        // The faqGroup should have had items but they're missing
        // Based on the deployment script, this should have FAQ items
        return {
          ...block,
          heading: block.heading || block.title || 'Ofte stillede spørgsmål',
          faqItems: [
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Hvor lang tid tager det at skifte el-leverandør?',
              answer: [
                {
                  _type: 'block',
                  _key: generateKey(),
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      _key: generateKey(),
                      text: 'Selve skifteprocessen tager typisk 1-3 hverdage at registrere. Den nye leverandør overtager ved næste månedsskifte, og du skal ikke selv kontakte din gamle leverandør.',
                      marks: []
                    }
                  ]
                }
              ]
            },
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Kan jeg skifte selvom jeg har binding?',
              answer: [
                {
                  _type: 'block',
                  _key: generateKey(),
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      _key: generateKey(),
                      text: 'Ja, men det kan koste et gebyr. Check dine nuværende kontraktvilkår for omkostninger ved opsigelse før tid.',
                      marks: []
                    }
                  ]
                }
              ]
            },
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Hvad er forskellen på netselskab og el-leverandør?',
              answer: [
                {
                  _type: 'block',
                  _key: generateKey(),
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      _key: generateKey(),
                      text: 'Netselskabet ejer og vedligeholder ledningsnettet - det kan du ikke vælge. El-leverandøren sælger strømmen - her har du frit valg.',
                      marks: []
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
                      text: 'Ikke nødvendigvis. Mange grønne leverandører er konkurrencedygtige på pris, og nogle er endda blandt de billigste.',
                      marks: []
                    }
                  ]
                }
              ]
            },
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Hvad sker der hvis min el-leverandør går konkurs?',
              answer: [
                {
                  _type: 'block',
                  _key: generateKey(),
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      _key: generateKey(),
                      text: 'Du mister aldrig strømmen. Netselskabet sikrer forsyning, og du flyttes automatisk til en forsyningspligtig leverandør.',
                      marks: []
                    }
                  ]
                }
              ]
            },
            {
              _type: 'faqItem',
              _key: generateKey(),
              question: 'Hvordan ved jeg om en leverandør er pålidelig?',
              answer: [
                {
                  _type: 'block',
                  _key: generateKey(),
                  style: 'normal',
                  children: [
                    {
                      _type: 'span',
                      _key: generateKey(),
                      text: 'Check virksomhedens historik, læs anmeldelser, verificér CVR-nummer og se efter branchegodkendelser.',
                      marks: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
      return block
    })
    
    // Update the document
    console.log('📝 Updating document with fixed FAQ')
    const result = await client
      .patch(documentId)
      .set({ contentBlocks: fixedContentBlocks })
      .commit()
    
    console.log('✅ FAQ validation error fixed successfully!')
    console.log(`📌 View at: https://dinelportal.sanity.studio/structure/page;${documentId}`)
    
  } catch (error) {
    console.error('❌ Error fixing FAQ:', error)
    process.exit(1)
  }
}

// Execute fix
fixFaqValidationError()