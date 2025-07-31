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

// Known fields that should be strings
const stringFields = [
  'title',
  'subtitle',
  'description',
  'leadingText',
  'label',
  'value',
  'text',
  'url',
  'headline',
  'subheadline',
  'heading',
  'name'
]

function checkForArrayStringErrors(obj: any, path: string = ''): void {
  if (!obj || typeof obj !== 'object') return
  
  Object.entries(obj).forEach(([key, value]) => {
    const currentPath = path ? `${path}.${key}` : key
    
    // Check if this field should be a string but is an array
    if (stringFields.includes(key) && Array.isArray(value)) {
      console.log(`\n❌ FOUND ARRAY WHERE STRING EXPECTED:`)
      console.log(`   Path: ${currentPath}`)
      console.log(`   Field: ${key}`)
      console.log(`   Value:`, JSON.stringify(value, null, 2))
      
      // If it's a Portable Text array, extract the text
      if (value.length > 0 && value[0]._type === 'block') {
        const text = value[0].children?.map((child: any) => child.text).join('') || ''
        console.log(`   Extracted text: "${text}"`)
      }
    }
    
    // Recurse into objects and arrays
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        checkForArrayStringErrors(item, `${currentPath}[${index}]`)
      })
    } else if (typeof value === 'object' && value !== null) {
      checkForArrayStringErrors(value, currentPath)
    }
  })
}

async function findArrayStringErrors() {
  try {
    console.log('🔍 Searching for Array/String type mismatches...\n')
    
    // Fetch the homepage
    const homepage = await client.fetch(`*[_type == "homePage"][0]`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    console.log('Checking entire homepage structure...')
    checkForArrayStringErrors(homepage)
    
    console.log('\n\n🔍 Specifically checking "Elproduktion i Danmark" related blocks:')
    
    // Find all blocks related to Elproduktion
    homepage.contentBlocks.forEach((block: any, index: number) => {
      if (block.title === 'Elproduktion i Danmark' || 
          (block._type === 'monthlyProductionChart' && index <= 6)) {
        console.log(`\n📊 Block ${index}: ${block._type}`)
        if (block.title) console.log(`   Title: "${block.title}"`)
        checkForArrayStringErrors(block, `contentBlocks[${index}]`)
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
findArrayStringErrors()