import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function checkElpriserPage() {
  try {
    // Fetch the elpriser page
    const page = await client.fetch(`*[_type == "page" && slug.current == "elpriser"][0]{
      _id,
      _type,
      title,
      slug,
      seoMetaTitle,
      seoMetaDescription,
      ogImage,
      seo,
      contentBlocks[]{
        _type,
        _key,
        ...,
        _type == "heroWithCalculator" => {
          _type,
          _key,
          title,
          subtitle,
          "allFields": @
        },
        _type == "valueProposition" => {
          _type,
          _key,
          title,
          heading,
          subheading,
          propositions,
          items[]{
            _key,
            text,
            heading,
            description,
            icon
          },
          "allFields": @
        }
      }
    }`)

    if (!page) {
      console.error('Elpriser page not found')
      return
    }

    console.log('=== ELPRISER PAGE DATA ===')
    console.log('\nPage ID:', page._id)
    console.log('Title:', page.title)
    console.log('SEO Title:', page.seoMetaTitle)
    console.log('SEO Description:', page.seoMetaDescription)
    console.log('\nOpenGraph Image:', page.ogImage)
    console.log('\nDeprecated SEO field:', page.seo)

    console.log('\n=== CONTENT BLOCKS ===')
    page.contentBlocks?.forEach((block: any, index: number) => {
      console.log(`\n[Block ${index + 1}] Type: ${block._type}`)
      
      if (block._type === 'heroWithCalculator') {
        console.log('Hero With Calculator:')
        console.log('- Title:', block.title)
        console.log('- Subtitle:', block.subtitle)
        console.log('- All fields:', JSON.stringify(block.allFields, null, 2))
      }
      
      if (block._type === 'valueProposition') {
        console.log('Value Proposition:')
        console.log('- Title:', block.title)
        console.log('- Heading:', block.heading)
        console.log('- Subheading:', block.subheading)
        console.log('- Propositions:', block.propositions)
        console.log('- Items count:', block.items?.length || 0)
        if (block.items) {
          block.items.forEach((item: any, i: number) => {
            console.log(`  Item ${i + 1}:`)
            console.log(`  - Heading: ${item.heading}`)
            console.log(`  - Description: ${item.description}`)
            console.log(`  - Icon type: ${item.icon?._type}`)
          })
        }
        console.log('- All fields:', JSON.stringify(block.allFields, null, 2))
      }
    })

  } catch (error) {
    console.error('Error:', error)
  }
}

checkElpriserPage()