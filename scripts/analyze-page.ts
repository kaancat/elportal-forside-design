import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fetchPageContent() {
  try {
    const pageId = 'I7aq0qw44tdJ3YglBpsP1G'
    
    // Fetch the page with all content blocks
    const page = await client.fetch(`
      *[_id == $pageId][0]{
        _id,
        _type,
        title,
        slug,
        seo,
        contentBlocks[]{
          _type,
          _key,
          
          // Hero fields
          headline,
          subheadline,
          image,
          calculatorType,
          
          // Page section fields
          heading,
          headerAlignment,
          content[]{
            _type,
            _key,
            
            // Block content
            children[]{
              _type,
              text,
              marks
            },
            markDefs[],
            style,
            
            // Live price graph
            region,
            timeRange,
            
            // Declaration production chart
            chartType,
            region,
            dataSource,
            
            // Image fields
            asset,
            alt,
            caption
          },
          
          // FAQ Group fields
          heading,
          faqs[]{
            _key,
            question,
            answer[]{
              _type,
              children[]{
                text
              }
            }
          },
          
          // Value proposition fields
          heading,
          items[]{
            _key,
            heading,
            description,
            icon
          }
        }
      }
    `, { pageId })

    console.log('=== PAGE CONTENT ANALYSIS ===')
    console.log(`Page ID: ${pageId}`)
    console.log(`Page Title: ${page?.title || 'No title'}`)
    console.log(`Content Blocks: ${page?.contentBlocks?.length || 0}`)
    
    if (!page) {
      console.error('❌ Page not found')
      return
    }
    
    // Analyze each content block
    page.contentBlocks?.forEach((block: any, index: number) => {
      console.log(`\n📦 Block ${index + 1}: ${block._type}`)
      console.log(`   Key: ${block._key}`)
      
      if (block._type === 'pageSection') {
        console.log(`   Heading: ${block.heading || '❌ MISSING'}`)
        console.log(`   Header Alignment: ${block.headerAlignment || 'default'}`)
        console.log(`   Content items: ${block.content?.length || 0}`)
        
        if (block.content) {
          block.content.forEach((item: any, itemIndex: number) => {
            console.log(`     Content ${itemIndex + 1}: ${item._type}`)
            
            if (item._type === 'block' && item.children) {
              const text = item.children.map((child: any) => child.text || '').join('')
              const status = text.trim() ? '✅' : '❌ EMPTY'
              console.log(`       Text: ${status} ${text ? text.substring(0, 80) + '...' : 'NO CONTENT'}`)
            } else if (item._type === 'livePriceGraph') {
              console.log(`       Region: ${item.region || '❌ MISSING'}`)
              console.log(`       Time Range: ${item.timeRange || '❌ MISSING'}`)
            } else if (item._type === 'declarationProductionChart') {
              console.log(`       Chart Type: ${item.chartType || '❌ MISSING'}`)
              console.log(`       Region: ${item.region || '❌ MISSING'}`)
              console.log(`       Data Source: ${item.dataSource || '❌ MISSING'}`)
            }
          })
        }
        
      } else if (block._type === 'faqGroup') {
        console.log(`   Heading: ${block.heading || '❌ MISSING'}`)
        console.log(`   FAQ items: ${block.faqs?.length || 0}`)
        
        if (block.faqs && block.faqs.length === 0) {
          console.log(`   ⚠️  No FAQ items found`)
        }
        
      } else if (block._type === 'hero' || block._type === 'heroWithCalculator') {
        console.log(`   Headline: ${block.headline || '❌ MISSING'}`)
        console.log(`   Subheadline: ${block.subheadline || '❌ MISSING'}`)
        console.log(`   Image: ${block.image ? '✅' : '❌ MISSING'}`)
        
      } else if (block._type === 'valueProposition') {
        console.log(`   Heading: ${block.heading || '❌ MISSING'}`)
        console.log(`   Items: ${block.items?.length || 0}`)
      }
    })
    
    console.log('\n=== SUMMARY ===')
    const emptyBlocks = page.contentBlocks?.filter((block: any) => {
      if (block._type === 'pageSection') {
        return !block.heading || !block.content || block.content.length === 0
      } else if (block._type === 'faqGroup') {
        return !block.heading || !block.faqs || block.faqs.length === 0
      } else if (block._type === 'hero' || block._type === 'heroWithCalculator') {
        return !block.headline || !block.subheadline
      }
      return false
    }) || []
    
    console.log(`📊 Total blocks: ${page.contentBlocks?.length || 0}`)
    console.log(`❌ Blocks needing content: ${emptyBlocks.length}`)
    console.log(`✅ Complete blocks: ${(page.contentBlocks?.length || 0) - emptyBlocks.length}`)
    
  } catch (error) {
    console.error('❌ Error fetching page:', error)
  }
}

fetchPageContent()