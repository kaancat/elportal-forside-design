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

async function analyzeHistoriskePriserPage() {
  try {
    // Fetch the page by ID
    const page = await client.fetch(`
      *[_id == "qgCxJyBbKpvhb2oGYjlhjr"][0] {
        _id,
        _type,
        title,
        slug,
        metaTitle,
        metaDescription,
        "contentBlocks": contentBlocks[] {
          _type,
          _key,
          ...,
          "content": content[] {
            ...,
            _type == "block" => {
              ...,
              children[] {
                ...,
                _type == "span" => {
                  text,
                  marks
                }
              }
            }
          },
          "textContent": textContent[] {
            ...,
            _type == "block" => {
              ...,
              children[] {
                ...,
                _type == "span" => {
                  text,
                  marks
                }
              }
            }
          }
        }
      }
    `)

    if (!page) {
      console.log('Page not found!')
      return
    }

    console.log('=== HISTORISKE PRISER PAGE ANALYSIS ===\n')
    console.log(`Page ID: ${page._id}`)
    console.log(`Title: ${page.title}`)
    console.log(`Slug: ${page.slug?.current || 'N/A'}`)
    console.log(`\nTotal content blocks: ${page.contentBlocks?.length || 0}\n`)

    // Analyze each content block
    page.contentBlocks?.forEach((block: any, index: number) => {
      console.log(`\n--- Block ${index + 1} ---`)
      console.log(`Type: ${block._type}`)
      console.log(`Key: ${block._key}`)
      
      // Check for alignment settings
      if (block.headerAlignment) {
        console.log(`Header Alignment: ${block.headerAlignment}`)
      }
      
      // Extract text content
      if (block.title) {
        console.log(`Title: ${block.title}`)
      }
      
      if (block.subtitle) {
        console.log(`Subtitle: ${block.subtitle}`)
      }
      
      // Check for content/textContent fields
      const contentField = block.content || block.textContent
      if (contentField && Array.isArray(contentField)) {
        console.log('\nText Content:')
        contentField.forEach((contentBlock: any) => {
          if (contentBlock._type === 'block') {
            // Check list type
            if (contentBlock.listItem) {
              console.log(`  List Type: ${contentBlock.listItem}`)
            }
            
            // Extract text
            const text = contentBlock.children
              ?.map((child: any) => child.text)
              .join('')
            
            if (text) {
              if (contentBlock.listItem) {
                console.log(`  • ${text}`)
              } else {
                console.log(`  ${text}`)
              }
              
              // Check for specific mentions
              if (text.includes('30 dage') || text.includes('30 days')) {
                console.log('  ⚠️  FOUND: "30 days" mention')
              }
              if (text.includes('3 år') || text.includes('3 years')) {
                console.log('  ⚠️  FOUND: "3 years" mention')
              }
            }
          }
        })
      }
      
      // Special handling for specific component types
      if (block._type === 'historicalPriceChart') {
        console.log(`Chart Settings:`)
        console.log(`  - Region: ${block.region || 'default'}`)
        console.log(`  - Days to show: ${block.daysToShow || 'default'}`)
      }
      
      if (block._type === 'priceCalculatorWidget') {
        console.log(`Calculator Type: ${block.calculatorType || 'default'}`)
      }
      
      // Log any other relevant fields
      const otherFields = Object.keys(block).filter(key => 
        !['_type', '_key', 'title', 'subtitle', 'content', 'textContent', 'headerAlignment'].includes(key)
      )
      
      if (otherFields.length > 0) {
        console.log('\nOther fields:')
        otherFields.forEach(field => {
          const value = block[field]
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            console.log(`  - ${field}: ${value}`)
          }
        })
      }
    })
    
    console.log('\n=== END OF ANALYSIS ===')
    
  } catch (error) {
    console.error('Error fetching page:', error)
  }
}

analyzeHistoriskePriserPage()