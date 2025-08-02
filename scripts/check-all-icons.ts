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

async function main() {
  console.log('🔍 Comprehensive Icon Check\n')
  
  // Query all pages with content blocks
  const pageQuery = `*[_type == "page"] {
    _id,
    title,
    slug,
    "contentBlocks": contentBlocks[] {
      _type,
      _key,
      "hasIcon": defined(icon),
      icon,
      "valueItems": valueItems[] {
        heading,
        "hasIcon": defined(icon),
        icon
      },
      "features": features[] {
        title,
        "hasIcon": defined(icon),
        icon
      },
      "cards": cards[] {
        title,
        "hasIcon": defined(icon),
        icon
      }
    }
  }`
  
  const pages = await client.fetch(pageQuery)
  
  let totalIcons = 0
  let validIcons = 0
  let iconIssues: any[] = []
  
  pages.forEach((page: any) => {
    if (!page.contentBlocks) return
    
    const pageSlug = page.slug?.current || page._id
    
    page.contentBlocks.forEach((block: any) => {
      // Check block-level icon
      if (block.hasIcon && block.icon) {
        totalIcons++
        if (block.icon._type === 'icon.manager') {
          if (block.icon.metadata?.size?.width && block.icon.metadata?.size?.height && block.icon.metadata?.iconName) {
            validIcons++
            console.log(`✅ ${pageSlug} - ${block._type} has valid icon.manager`)
          } else {
            iconIssues.push(`${pageSlug} - ${block._type} has malformed icon.manager`)
          }
        } else if (typeof block.icon === 'string') {
          iconIssues.push(`${pageSlug} - ${block._type} has string icon: "${block.icon}"`)
        }
      }
      
      // Check nested icons
      const nestedArrays = ['valueItems', 'features', 'cards'] as const
      nestedArrays.forEach(arrayName => {
        const items = block[arrayName]
        if (items && Array.isArray(items)) {
          items.forEach((item: any, idx: number) => {
            if (item.hasIcon && item.icon) {
              totalIcons++
              if (item.icon._type === 'icon.manager') {
                if (item.icon.metadata?.size?.width && item.icon.metadata?.size?.height && item.icon.metadata?.iconName) {
                  validIcons++
                  console.log(`✅ ${pageSlug} - ${block._type}.${arrayName}[${idx}] has valid icon.manager`)
                } else {
                  iconIssues.push(`${pageSlug} - ${block._type}.${arrayName}[${idx}] has malformed icon.manager`)
                }
              } else if (typeof item.icon === 'string') {
                iconIssues.push(`${pageSlug} - ${block._type}.${arrayName}[${idx}] has string icon: "${item.icon}"`)
              }
            }
          })
        }
      })
    })
  })
  
  console.log('\n📊 Icon Summary:')
  console.log(`  Total pages checked: ${pages.length}`)
  console.log(`  Total icons found: ${totalIcons}`)
  console.log(`  Valid icon.manager icons: ${validIcons}`)
  console.log(`  Icons with issues: ${iconIssues.length}`)
  
  if (iconIssues.length > 0) {
    console.log('\n⚠️  Icon issues found:')
    iconIssues.forEach(issue => console.log(`  - ${issue}`))
  } else if (totalIcons === 0) {
    console.log('\n🤔 No icons found in any pages')
    console.log('   This might mean the migration already completed successfully!')
  } else {
    console.log('\n🎉 All icons are properly formatted as icon.manager!')
    console.log('✅ No remnants of previous implementations found.')
  }
  
  // Let's also check for icon usage statistics
  const iconStatsQuery = `{
    "totalPages": count(*[_type == "page"]),
    "pagesWithIcons": count(*[_type == "page" && defined(contentBlocks[].icon)]),
    "valuePropositions": count(*[_type == "page"].contentBlocks[_type == "valueProposition"]),
    "featureLists": count(*[_type == "page"].contentBlocks[_type == "featureList"]),
    "infoCardSections": count(*[_type == "page"].contentBlocks[_type == "infoCardsSection"])
  }`
  
  const stats = await client.fetch(iconStatsQuery)
  console.log('\n📈 Content Statistics:')
  console.log(`  Total pages: ${stats.totalPages}`)
  console.log(`  Value propositions: ${stats.valuePropositions}`)
  console.log(`  Feature lists: ${stats.featureLists}`)
  console.log(`  Info card sections: ${stats.infoCardSections}`)
}

main().catch(console.error)