import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fetchPage() {
  const query = `*[_type == "page" && slug.current == "elprisberegner"][0] {
    _id,
    title,
    slug,
    seo,
    contentBlocks[] {
      _type,
      _key,
      ...,
      // Expand features for featureList
      _type == "featureList" => {
        title,
        features[] {
          _key,
          title,
          description,
          icon
        }
      }
    }
  }`

  try {
    const page = await client.fetch(query)
    
    if (!page) {
      console.log('Page not found')
      return
    }

    console.log('Page found:', page.title)
    console.log('\nSearching for featureList blocks...\n')
    
    const featureLists = page.contentBlocks.filter((block: any) => block._type === 'featureList')
    
    if (featureLists.length === 0) {
      console.log('No featureList blocks found')
    } else {
      featureLists.forEach((list: any, index: number) => {
        console.log(`\nFeatureList ${index + 1}:`)
        console.log(`Title: ${list.title || '(no title)'}`)
        console.log(`Number of features: ${list.features?.length || 0}`)
        
        if (list.features) {
          list.features.forEach((feature: any, fIndex: number) => {
            console.log(`\n  Feature ${fIndex + 1}:`)
            console.log(`    Title: ${feature.title}`)
            console.log(`    Description: ${feature.description}`)
            console.log(`    Has icon: ${!!feature.icon}`)
            if (feature.icon) {
              console.log(`    Icon data:`, JSON.stringify(feature.icon, null, 2))
            }
          })
        }
      })
    }

    // Save full page data for reference
    const fs = require('fs')
    fs.writeFileSync('elprisberegner-page-data.json', JSON.stringify(page, null, 2))
    console.log('\n\nFull page data saved to elprisberegner-page-data.json')

  } catch (error) {
    console.error('Error fetching page:', error)
  }
}

fetchPage()