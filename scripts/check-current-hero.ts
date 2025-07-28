#!/usr/bin/env node
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

const PAGE_ID = 'I7aq0qw44tdJ3YglBpsP1G'

async function checkCurrentHero() {
  try {
    console.log('🔍 Checking current hero block structure...')
    
    const page = await client.fetch(`*[_id == "${PAGE_ID}"][0]{
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
    
    if (!page) {
      console.error('❌ Page not found')
      return
    }
    
    console.log('Page title:', page.title)
    console.log('Page slug:', page.slug?.current)
    console.log('\nCurrent hero block:')
    console.log(JSON.stringify(page.heroBlock, null, 2))
    
    if (page.heroBlock?.image) {
      console.log('\n✅ Hero already has an image')
    } else {
      console.log('\n❌ Hero does not have an image - we can add one')
    }
    
  } catch (error) {
    console.error('Error checking hero:', error)
  }
}

checkCurrentHero()