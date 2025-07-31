#!/usr/bin/env npm run tsx

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') })

if (!process.env.VITE_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
  throw new Error('Missing required environment variables: VITE_SANITY_PROJECT_ID and SANITY_API_TOKEN')
}

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function finalCheckLeverandoer() {
  console.log('🔍 Final comprehensive check of leverandoer-sammenligning page...\n')

  try {
    // Fetch complete page data
    const page = await client.fetch(`
      *[_type == "page" && slug.current == "leverandoer-sammenligning"][0] {
        _id,
        _type,
        title,
        slug,
        contentBlocks[] {
          _type,
          _key,
          ...select(
            _type == "heroWithCalculator" => {
              headline,
              subheadline,
              image
            },
            _type == "valueProposition" => {
              heading,
              items[] {
                _key,
                heading,
                description,
                icon {
                  _type,
                  name,
                  manager,
                  metadata
                }
              }
            },
            _type == "featureList" => {
              title,
              subtitle,
              features[] {
                _key,
                title,
                description,
                icon {
                  _type,
                  name,
                  manager,
                  metadata
                }
              }
            },
            _type == "providerList" => {
              title
            },
            _type == "pageSection" => {
              title,
              headerAlignment
            },
            _type == "realPriceComparisonTable" => {
              title
            },
            _type == "declarationGridmix" => {
              title
            },
            _type == "consumptionMap" => {
              title
            },
            _type == "callToActionSection" => {
              title
            },
            _type == "faqGroup" => {
              title,
              "faqCount": count(faqItems)
            }
          )
        }
      }
    `)

    if (!page) {
      console.log('❌ Page not found!')
      return
    }

    console.log('📄 Page Details:')
    console.log(`- ID: ${page._id}`)
    console.log(`- Title: ${page.title}`)
    console.log(`- Slug: ${page.slug?.current}`)
    console.log(`- Total content blocks: ${page.contentBlocks?.length || 0}`)

    console.log('\n🎯 Critical Components Status:')
    
    // Check Hero
    const hero = page.contentBlocks?.find((b: any) => b._type === 'heroWithCalculator')
    console.log('\n1. Hero with Calculator:')
    console.log(`   ${hero ? '✅' : '❌'} Component exists`)
    if (hero) {
      console.log(`   ${hero.headline ? '✅' : '❌'} Headline: "${hero.headline || 'MISSING'}"`)
      console.log(`   ${hero.subheadline ? '✅' : '❌'} Subheadline: "${hero.subheadline || 'MISSING'}"`)
      console.log(`   ${hero.image ? '⚠️' : '✓'} No image field (correct - not in schema)`)
    }

    // Check Value Proposition
    const vp = page.contentBlocks?.find((b: any) => b._type === 'valueProposition')
    console.log('\n2. Value Proposition:')
    console.log(`   ${vp ? '✅' : '❌'} Component exists`)
    if (vp) {
      console.log(`   ${vp.heading ? '✅' : '❌'} Heading: "${vp.heading || 'MISSING'}"`)
      console.log(`   ✓ No subheadline field (correct - not in schema)`)
      console.log(`   ${vp.items?.length > 0 ? '✅' : '❌'} Items: ${vp.items?.length || 0}`)
      
      if (vp.items?.length > 0) {
        console.log('   Icon status:')
        vp.items.forEach((item: any, i: number) => {
          const hasValidIcon = item.icon?._type === 'icon.manager' && item.icon?.metadata
          console.log(`     ${i+1}. ${hasValidIcon ? '✅' : '❌'} ${item.heading} - Icon: ${item.icon?.name || 'MISSING'}`)
        })
      }
    }

    // Check Feature List
    const fl = page.contentBlocks?.find((b: any) => b._type === 'featureList')
    console.log('\n3. Feature List:')
    console.log(`   ${fl ? '✅' : '❌'} Component exists`)
    if (fl) {
      console.log(`   ${fl.title ? '✅' : '❌'} Title: "${fl.title || 'MISSING'}"`)
      console.log(`   ${fl.subtitle ? '✅' : '❌'} Subtitle: "${fl.subtitle || 'MISSING'}"`)
      console.log(`   ${fl.features?.length > 0 ? '✅' : '❌'} Features: ${fl.features?.length || 0}`)
      
      if (fl.features?.length > 0) {
        console.log('   Icon status:')
        fl.features.forEach((feature: any, i: number) => {
          const hasValidIcon = feature.icon?._type === 'icon.manager' && feature.icon?.metadata
          console.log(`     ${i+1}. ${hasValidIcon ? '✅' : '❌'} ${feature.title} - Icon: ${feature.icon?.name || 'MISSING'}`)
        })
      }
    }

    // Summary of other components
    console.log('\n📊 Other Components:')
    const componentCounts: Record<string, number> = {}
    page.contentBlocks?.forEach((block: any) => {
      componentCounts[block._type] = (componentCounts[block._type] || 0) + 1
    })
    
    Object.entries(componentCounts).forEach(([type, count]) => {
      console.log(`- ${type}: ${count}`)
    })

    // Final status
    console.log('\n🏁 Final Status:')
    const heroOk = hero?.headline && hero?.subheadline
    const vpOk = vp?.heading && vp?.items?.every((item: any) => 
      item.icon?._type === 'icon.manager' && item.icon?.metadata
    )
    const flOk = fl?.title && fl?.features?.every((f: any) => 
      f.icon?._type === 'icon.manager' && f.icon?.metadata
    )

    console.log(`- Hero with Calculator: ${heroOk ? '✅ Fixed' : '❌ Issues remain'}`)
    console.log(`- Value Proposition: ${vpOk ? '✅ Fixed' : '❌ Issues remain'}`)
    console.log(`- Feature List: ${flOk ? '✅ Fixed' : '❌ Issues remain'}`)
    
    if (heroOk && vpOk && flOk) {
      console.log('\n🎉 All critical issues have been fixed!')
      console.log('The page should now display correctly on the frontend.')
    } else {
      console.log('\n⚠️  Some issues may still need attention.')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

finalCheckLeverandoer()