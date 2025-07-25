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

async function validateLadeboksPage() {
  try {
    console.log('🔍 Validating comprehensive Ladeboks page...\n')
    
    // Fetch the page with expanded content
    const query = `*[_id == "Ldbn1aqxfi6rpqe9dn"][0] {
      _id,
      _type,
      title,
      slug,
      seoMetaTitle,
      seoMetaDescription,
      seoKeywords,
      "contentBlocksCount": count(contentBlocks),
      contentBlocks[] {
        _type,
        _key,
        _type == "hero" => {
          headline,
          subheadline,
          "hasImage": defined(image)
        },
        _type == "priceCalculator" => {
          title
        },
        _type == "pageSection" => {
          title,
          headerAlignment,
          "contentLength": count(content),
          "hasContent": defined(content) && count(content) > 0
        },
        _type == "valueProposition" => {
          title,
          "itemsCount": count(items),
          items[] {
            _type,
            _key,
            heading,
            description,
            "hasIcon": defined(icon)
          }
        },
        _type == "chargingBoxShowcase" => {
          heading,
          headerAlignment,
          "descriptionLength": count(description),
          "productsCount": count(products),
          "products": products[]->name
        },
        _type == "co2EmissionsChart" => {
          title,
          subtitle,
          headerAlignment,
          showGauge,
          "hasLeadingText": defined(leadingText) && count(leadingText) > 0
        },
        _type == "faqGroup" => {
          title,
          "faqCount": count(faqItems),
          faqItems[] {
            question,
            "answerLength": count(answer)
          }
        },
        _type == "callToActionSection" => {
          title,
          buttonText,
          buttonUrl
        }
      }
    }`
    
    const page = await client.fetch(query)
    
    if (!page) {
      console.log('❌ Page not found!')
      return
    }
    
    console.log('📊 Page Overview:')
    console.log(`✅ Title: ${page.title}`)
    console.log(`✅ Slug: ${page.slug?.current}`)
    console.log(`✅ SEO Title: ${page.seoMetaTitle}`)
    console.log(`✅ SEO Description: ${page.seoMetaDescription}`)
    console.log(`✅ Keywords: ${page.seoKeywords?.length || 0} keywords`)
    console.log(`✅ Content Blocks: ${page.contentBlocksCount}`)
    
    console.log('\n🧩 Component Analysis:')
    
    const issues = []
    const warnings = []
    
    page.contentBlocks?.forEach((block: any, index: number) => {
      console.log(`\n${index + 1}. ${block._type}`)
      
      if (!block._key) {
        issues.push(`Block ${index + 1} (${block._type}) missing _key`)
      }
      
      switch (block._type) {
        case 'hero':
          console.log(`   - Headline: ✅ ${block.headline?.substring(0, 50)}...`)
          console.log(`   - Subheadline: ✅ Present`)
          console.log(`   - Image: ${block.hasImage ? '✅' : '⚠️ Missing (add in Studio)'}`)
          if (!block.hasImage) warnings.push('Hero section needs an image')
          break
          
        case 'pageSection':
          console.log(`   - Title: ${block.title || '❌ Missing'}`)
          console.log(`   - Content blocks: ${block.contentLength || 0}`)
          console.log(`   - Has content: ${block.hasContent ? '✅' : '❌'}`)
          if (!block.hasContent) issues.push(`PageSection "${block.title}" has no content`)
          break
          
        case 'valueProposition':
          console.log(`   - Title: ${block.title}`)
          console.log(`   - Items: ${block.itemsCount}`)
          block.items?.forEach((item: any, i: number) => {
            const iconStatus = item.hasIcon ? '✅' : '⚠️ Missing'
            console.log(`     ${i + 1}. ${item.heading} - Icon: ${iconStatus}`)
            if (!item.hasIcon) warnings.push(`Value item "${item.heading}" needs icon`)
          })
          break
          
        case 'chargingBoxShowcase':
          console.log(`   - Heading: ${block.heading}`)
          console.log(`   - Description blocks: ${block.descriptionLength || 0}`)
          console.log(`   - Products: ${block.productsCount || 0}`)
          if (!block.productsCount) warnings.push('Charging box showcase needs products')
          break
          
        case 'co2EmissionsChart':
          console.log(`   - Title: ${block.title}`)
          console.log(`   - Has leading text: ${block.hasLeadingText ? '✅' : '❌'}`)
          console.log(`   - Show gauge: ${block.showGauge ? '✅' : '❌'}`)
          break
          
        case 'faqGroup':
          console.log(`   - Title: ${block.title}`)
          console.log(`   - FAQ items: ${block.faqCount}`)
          block.faqItems?.forEach((faq: any, i: number) => {
            console.log(`     ${i + 1}. ${faq.question.substring(0, 50)}...`)
          })
          break
          
        case 'callToActionSection':
          console.log(`   - Title: ${block.title}`)
          console.log(`   - Button: "${block.buttonText}" → ${block.buttonUrl}`)
          break
          
        default:
          console.log(`   - Component type: ${block._type}`)
      }
    })
    
    // Check for missing components
    const componentTypes = page.contentBlocks?.map((b: any) => b._type) || []
    const recommendedComponents = [
      'hero',
      'priceCalculator',
      'pageSection',
      'valueProposition',
      'chargingBoxShowcase',
      'co2EmissionsChart',
      'faqGroup',
      'callToActionSection'
    ]
    
    const missingComponents = recommendedComponents.filter(comp => !componentTypes.includes(comp))
    
    console.log('\n📋 Validation Summary:')
    
    if (issues.length > 0) {
      console.log('\n❌ Critical Issues:')
      issues.forEach(issue => console.log(`   - ${issue}`))
    } else {
      console.log('\n✅ No critical issues found!')
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ Warnings (manual action needed):')
      warnings.forEach(warning => console.log(`   - ${warning}`))
    }
    
    if (missingComponents.length > 0) {
      console.log('\n💡 Missing recommended components:')
      missingComponents.forEach(comp => console.log(`   - ${comp}`))
    }
    
    console.log('\n📝 Manual Actions Required:')
    console.log('1. Add hero image in Sanity Studio')
    console.log('2. Select icons for all value proposition items')
    console.log('3. Add product references to charging box showcase')
    console.log('4. Review all content in Sanity Studio')
    console.log('5. Publish when ready')
    
    console.log('\n🔗 Edit in Sanity Studio:')
    console.log(`https://dinelportal.sanity.studio/structure/page;Ldbn1aqxfi6rpqe9dn`)
    
  } catch (error) {
    console.error('❌ Error validating page:', error)
  }
}

validateLadeboksPage()