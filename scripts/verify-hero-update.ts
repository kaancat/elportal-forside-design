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

async function verifyHeroUpdate() {
  try {
    console.log('Verifying hero content update...')
    
    const pageId = '1BrgDwXdqxJ08rMIoYfLjP'
    
    // Fetch the current page with more detail
    const page = await client.fetch(`*[_id == "${pageId}"][0]{
      _id,
      _rev,
      contentBlocks[_type == "heroWithCalculator"][0]{
        _key,
        _type,
        headline,
        subheadline,
        content,
        calculatorTitle,
        showLivePrice,
        showProviderComparison,
        stats
      }
    }`)
    
    if (!page) {
      console.error('Page not found')
      return
    }
    
    console.log('Page revision:', page._rev)
    console.log('\nHero block content:')
    console.log(JSON.stringify(page.contentBlocks, null, 2))
    
    // Try a more direct patch approach
    console.log('\nAttempting direct patch update...')
    
    const result = await client
      .patch(pageId)
      .set({
        'contentBlocks[_key=="hero-1"].headline': 'Elpriser - Find og sammenlign elpriser',
        'contentBlocks[_key=="hero-1"].subheadline': 'Sammenlign elpriser og se, om du kan finde en bedre elpris ud fra dit estimerede forbrug.',
        'contentBlocks[_key=="hero-1"].calculatorTitle': 'Beregn dit forbrug',
        'contentBlocks[_key=="hero-1"].showLivePrice': true,
        'contentBlocks[_key=="hero-1"].showProviderComparison': true
      })
      .commit()
    
    console.log('✅ Direct patch update completed')
    console.log('New revision:', result._rev)
    
    // Verify the update
    const updatedPage = await client.fetch(`*[_id == "${pageId}"][0]{
      contentBlocks[_type == "heroWithCalculator"][0]{
        headline,
        subheadline,
        calculatorTitle
      }
    }`)
    
    console.log('\nVerified content after update:')
    console.log(JSON.stringify(updatedPage.contentBlocks, null, 2))
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the script
verifyHeroUpdate()