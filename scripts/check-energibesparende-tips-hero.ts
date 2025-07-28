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

async function checkHeroSection() {
  try {
    // Fetch the page
    const page = await client.fetch(`*[_id == "I7aq0qw44tdJ3YglBpsP1G"][0]{
      title,
      slug,
      "heroBlock": contentBlocks[0]{
        _type,
        _key,
        headline,
        subheadline,
        image,
        alignment,
        variant,
        cta
      }
    }`)

    console.log('Page:', page?.title)
    console.log('Slug:', page?.slug?.current)
    console.log('\nCurrent hero block:')
    console.log(JSON.stringify(page?.heroBlock, null, 2))

  } catch (error) {
    console.error('Error fetching page:', error)
  }
}

checkHeroSection()