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

async function checkExistingIcons() {
  // Query pages with feature lists that have icons
  const query = `*[_type == "page"] {
    title,
    "featureLists": contentBlocks[_type == "featureList"] {
      title,
      features[] {
        title,
        icon
      }
    }
  }[count(featureLists) > 0]`

  try {
    const results = await client.fetch(query)
    
    console.log('Pages with feature lists and icons:\n')
    
    results.forEach((page: any) => {
      console.log(`Page: ${page.title}`)
      page.featureLists.forEach((list: any) => {
        console.log(`  Feature List: ${list.title || '(no title)'}`)
        list.features.forEach((feature: any) => {
          console.log(`    - ${feature.title}`)
          if (feature.icon) {
            console.log(`      Icon details:`)
            console.log(`        name: ${feature.icon.name}`)
            console.log(`        provider: ${feature.icon.provider}`)
            console.log(`        has svg: ${!!feature.icon.svg}`)
            console.log(`        has metadata: ${!!feature.icon.metadata}`)
            if (feature.icon.metadata) {
              console.log(`        metadata.iconName: ${feature.icon.metadata.iconName}`)
              console.log(`        metadata.inlineSvg: ${!!feature.icon.metadata.inlineSvg}`)
              console.log(`        metadata.url: ${feature.icon.metadata.url ? 'present' : 'missing'}`)
            }
          } else {
            console.log(`      No icon`)
          }
        })
      })
      console.log('')
    })
    
    // Also check value propositions for icon patterns
    const vpQuery = `*[_type == "valueProposition"][0..2] {
      title,
      items[] {
        heading,
        icon
      }
    }`
    
    const vpResults = await client.fetch(vpQuery)
    console.log('\nValue Propositions with icons:')
    
    vpResults.forEach((vp: any) => {
      console.log(`\nValue Proposition: ${vp.title || '(no title)'}`)
      vp.items?.forEach((item: any, i: number) => {
        if (item.icon) {
          console.log(`  Item ${i + 1}: ${item.heading}`)
          console.log(`    Icon: ${item.icon.name} (${item.icon.provider})`)
          console.log(`    Full icon object:`, JSON.stringify(item.icon, null, 2))
        }
      })
    })
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkExistingIcons()