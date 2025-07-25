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

async function testPageFetch() {
  try {
    console.log('Testing page fetch mechanism...\n')
    
    // Test the exact GROQ query used in sanityService.ts
    const query = `*[_type == "page" && slug.current == $slug][0] {
      _id,
      _type,
      title,
      slug,
      seoMetaTitle,
      seoMetaDescription,
      contentBlocks[] {
        ...,
        _type == "pageSection" => {
          ...,
          theme->{ 
            "background": background.hex,
            "text": text.hex,
            "primary": primary.hex
          },
          settings,
          content[]{ 
            ...,
            _type == "chargingBoxShowcase" => {
              _key,
              _type,
              title,
              subtitle,
              description,
              products[]->{ 
                _id,
                name,
                category,
                power,
                features,
                price,
                image,
                description,
                specifications
              }
            }
          }
        },
        _type == "chargingBoxShowcase" => {
          _key,
          _type,
          title,
          subtitle,
          description,
          products[]->{ 
            _id,
            name,
            category,
            power,
            features,
            price,
            image,
            description,
            specifications
          }
        }
      }
    }`
    
    console.log('🔍 Fetching page with slug "ladeboks"...')
    const page = await client.fetch(query, { slug: 'ladeboks' })
    
    if (!page) {
      console.log('❌ No page returned!')
      return
    }
    
    console.log('✅ Page found:')
    console.log(`  - ID: ${page._id}`)
    console.log(`  - Title: ${page.title}`)
    console.log(`  - Slug: ${page.slug?.current}`)
    console.log(`  - Content blocks: ${page.contentBlocks?.length || 0}`)
    
    if (page.contentBlocks?.length > 0) {
      console.log('\n📦 Content blocks:')
      page.contentBlocks.forEach((block: any, index: number) => {
        console.log(`  ${index + 1}. ${block._type}`)
        if (block._type === 'chargingBoxShowcase') {
          console.log(`     - Title: ${block.title}`)
          console.log(`     - Products: ${block.products?.length || 0}`)
        }
      })
    }
    
    // Test a simple page that works (elpriser)
    console.log('\n🆚 Comparing with working page "elpriser"...')
    const workingPage = await client.fetch(query, { slug: 'elpriser' })
    
    if (workingPage) {
      console.log('✅ Elpriser page found:')
      console.log(`  - ID: ${workingPage._id}`)
      console.log(`  - Title: ${workingPage.title}`)
      console.log(`  - Content blocks: ${workingPage.contentBlocks?.length || 0}`)
    } else {
      console.log('❌ Elpriser page not found!')
    }

  } catch (error) {
    console.error('❌ Error testing page fetch:', error)
  }
}

testPageFetch()