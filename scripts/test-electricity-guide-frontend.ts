import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Create Sanity client
const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

// Test fetching the page through the frontend query
async function testFrontendQuery() {
  console.log('🧪 Testing frontend query for electricity guide page')
  
  const slug = 'hvordan-vaelger-du-elleverandoer'
  
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
          ...
        }
      },
      _type == "faqGroup" => {
        ...,
        heading,
        faqItems[]{
          _key,
          question,
          answer
        }
      },
      _type == "callToActionSection" => {
        title,
        buttonText,
        buttonUrl
      },
      _type == "providerList" => {
        _key,
        _type,
        title,
        subtitle,
        headerAlignment,
        'providers': providers[]->{ 
          "id": _id,
          providerName,
          productName,
          "logoUrl": logo.asset->url,
          displayPrice_kWh,
          displayMonthlyFee,
          signupLink,
          isVindstoedProduct,
          benefits
        }
      },
      _type == "featureList" => {
        _key,
        _type,
        title,
        subtitle,
        headerAlignment,
        features[]{
          _key,
          _type,
          title,
          description,
          icon {
            ...,
            metadata {
              inlineSvg,
              iconName,
              url,
              color
            }
          }
        }
      },
      _type == "valueProposition" => {
        _key,
        _type,
        heading,
        subheading,
        items[]{
          _key,
          heading,
          description,
          icon {
            ...,
            metadata {
              inlineSvg,
              iconName,
              url,
              color
            }
          }
        }
      },
      _type == "priceCalculatorWidget" => {
        _key,
        _type,
        title,
        description,
        showComparison,
        variant
      },
      _type == "hero" => {
        _key,
        _type,
        headline,
        subheadline,
        content,
        variant,
        showScrollIndicator,
        image{
          asset,
          alt,
          hotspot,
          crop
        }
      }
    }
  }`
  
  try {
    console.log(`\n📡 Fetching page with slug: ${slug}`)
    const page = await client.fetch(query, { slug })
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('✅ Page fetched successfully!')
    console.log(`\n📄 Page Title: ${page.title}`)
    console.log(`🔗 Slug: ${page.slug.current}`)
    console.log(`📊 Content Blocks: ${page.contentBlocks?.length || 0}`)
    
    // Analyze content blocks
    if (page.contentBlocks && page.contentBlocks.length > 0) {
      console.log('\n📋 Content Block Types:')
      const blockTypes = page.contentBlocks.map((block: any) => block._type)
      const uniqueTypes = [...new Set(blockTypes)]
      uniqueTypes.forEach(type => {
        const count = blockTypes.filter((t: string) => t === type).length
        console.log(`   - ${type}: ${count}`)
      })
      
      // Check for any null or undefined values
      const hasNullProviders = page.contentBlocks.some((block: any) => 
        block._type === 'providerList' && (!block.providers || block.providers.length === 0)
      )
      
      if (hasNullProviders) {
        console.log('\n⚠️  Warning: ProviderList has no providers referenced')
      }
      
      // Check FAQ content
      const faqBlocks = page.contentBlocks.filter((block: any) => block._type === 'faqGroup')
      if (faqBlocks.length > 0) {
        console.log(`\n❓ FAQ Blocks: ${faqBlocks.length}`)
        faqBlocks.forEach((faq: any, index: number) => {
          console.log(`   FAQ ${index + 1}: ${faq.faqItems?.length || 0} items`)
        })
      }
    }
    
    console.log('\n✅ Frontend query test complete!')
    console.log('📌 The page should render correctly at: /hvordan-vaelger-du-elleverandoer')
    
  } catch (error) {
    console.error('❌ Error testing frontend query:', error)
  }
}

// Execute test
testFrontendQuery()