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

// Helper function to generate unique keys
function generateKey() {
  return `key_${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to clean undefined fields from objects
function cleanObject(obj: any): any {
  const cleaned = { ...obj }
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      delete cleaned[key]
    }
  })
  return cleaned
}

async function fixLadeboksPage() {
  try {
    console.log('Fetching Ladeboks page...')
    
    // First, let's fetch the raw document to see what we're working with
    const rawQuery = `*[_id == "page.ladeboks"][0]`
    const currentPage = await client.fetch(rawQuery)
    
    if (!currentPage) {
      console.error('Page not found!')
      return
    }
    
    console.log('Current page structure:')
    console.log(JSON.stringify(currentPage, null, 2))
    
    // Create a backup of the original
    const backup = JSON.parse(JSON.stringify(currentPage))
    
    // Fix the sections
    const fixedSections = currentPage.sections.map((section: any) => {
      // Ensure each section has a _key
      if (!section._key) {
        section._key = generateKey()
      }
      
      // Fix each section based on its _type
      switch (section._type) {
        case 'hero':
          return cleanObject({
            _key: section._key,
            _type: section._type,
            headline: section.heading || section.headline,
            subheadline: section.subheadline,
            image: section.image
          })
        
        case 'pageSection':
          return cleanObject({
            _key: section._key,
            _type: section._type,
            title: section.heading || section.title,
            content: section.content,
            headerAlignment: section.headerAlignment || 'center',
            image: section.image,
            imagePosition: section.imagePosition,
            cta: section.cta,
            settings: section.settings
          })
        
        case 'valueProposition':
          // Fix values -> items, ensuring proper structure
          let items = section.values || section.items || []
          // Ensure each item has a _key
          items = items.map((item: any) => {
            if (typeof item === 'string') {
              // Convert plain string to proper valueItem structure
              return {
                _key: generateKey(),
                _type: 'valueItem',
                text: item,
                icon: 'CheckmarkCircle' // Default icon
              }
            }
            return {
              ...item,
              _key: item._key || generateKey(),
              _type: item._type || 'valueItem'
            }
          })
          
          return cleanObject({
            _key: section._key,
            _type: section._type,
            title: section.heading || section.title,
            items: items
          })
        
        case 'livePriceGraph':
          return cleanObject({
            _key: section._key,
            _type: section._type,
            title: section.heading || section.title,
            subtitle: section.subtitle,
            apiRegion: section.apiRegion || 'DK1',
            headerAlignment: section.headerAlignment || 'center'
          })
        
        case 'faqGroup':
          // Fix faqs -> faqItems
          let faqItems = section.faqs || section.faqItems || []
          // Ensure each FAQ item has proper structure
          faqItems = faqItems.map((item: any) => ({
            ...item,
            _key: item._key || generateKey(),
            _type: item._type || 'faqItem'
          }))
          
          return cleanObject({
            _key: section._key,
            _type: section._type,
            title: section.heading || section.title,
            faqItems: faqItems
          })
        
        case 'featureList':
          return cleanObject({
            _key: section._key,
            _type: section._type,
            title: section.heading || section.title,
            features: section.features || []
          })
        
        case 'callToActionSection':
          return cleanObject({
            _key: section._key,
            _type: section._type,
            title: section.headline || section.heading || section.title,
            buttonText: section.buttonText,
            buttonUrl: section.buttonUrl
          })
        
        case 'richTextSection':
          // This only has content, no title
          return cleanObject({
            _key: section._key,
            _type: section._type,
            content: section.content
          })
        
        case 'chargingBoxShowcase':
          // This correctly uses 'heading'
          return cleanObject({
            _key: section._key,
            _type: section._type,
            heading: section.heading,
            description: section.description,
            products: section.products,
            headerAlignment: section.headerAlignment || 'center'
          })
        
        default:
          // For any unknown types, keep as-is but ensure _key
          return {
            ...section,
            _key: section._key || generateKey()
          }
      }
    })
    
    // Create the fixed page object
    const fixedPage = {
      _id: currentPage._id,
      _type: currentPage._type,
      _rev: currentPage._rev,
      title: currentPage.title,
      slug: currentPage.slug,
      seo: currentPage.seo,
      sections: fixedSections
    }
    
    console.log('\nFixed page structure:')
    console.log(JSON.stringify(fixedPage, null, 2))
    
    // Save backup to file
    const backupFilename = `ladeboks-backup-${new Date().toISOString().replace(/:/g, '-')}.json`
    console.log(`\nSaving backup to ${backupFilename}`)
    await require('fs').promises.writeFile(
      backupFilename,
      JSON.stringify(backup, null, 2)
    )
    
    // Update the page
    console.log('\nUpdating page in Sanity...')
    const result = await client
      .createOrReplace(fixedPage)
    
    console.log('✅ Page successfully updated!')
    console.log('Updated page ID:', result._id)
    console.log(`Backup saved as: ${backupFilename}`)
    
  } catch (error) {
    console.error('❌ Error fixing page:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      if ('details' in error) {
        console.error('Validation details:', JSON.stringify((error as any).details, null, 2))
      }
      if ('response' in error) {
        console.error('Response:', (error as any).response)
      }
    }
  }
}

// Run the fix
fixLadeboksPage()