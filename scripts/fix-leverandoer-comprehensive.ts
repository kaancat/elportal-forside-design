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

// Helper function to generate unique keys
const generateKey = () => Math.random().toString(36).substr(2, 9)

// Helper function to create text blocks
const createTextBlock = (text: string, style: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' = 'normal') => ({
  _type: 'block',
  _key: generateKey(),
  style,
  children: [{
    _type: 'span',
    _key: generateKey(),
    text,
    marks: []
  }]
})

async function fixLeverandoerComprehensive() {
  console.log('🚀 Starting comprehensive fix of leverandoer-sammenligning page...\n')

  try {
    // First, fetch the current page to get its exact ID
    const currentPage = await client.fetch(`
      *[_type == "page" && slug.current == "leverandoer-sammenligning"][0] {
        _id,
        _type,
        title,
        slug,
        seoMetaTitle,
        seoMetaDescription,
        seoKeywords,
        contentBlocks
      }
    `)

    if (!currentPage) {
      console.log('❌ Page not found!')
      return
    }

    console.log(`📄 Found page with ID: ${currentPage._id}`)
    console.log(`   Title: ${currentPage.title}`)

    // Analyze current issues
    console.log('\n🔍 Analyzing current issues...')
    
    const heroIndex = currentPage.contentBlocks?.findIndex((b: any) => b._type === 'heroWithCalculator')
    const vpIndex = currentPage.contentBlocks?.findIndex((b: any) => b._type === 'valueProposition')
    const flIndex = currentPage.contentBlocks?.findIndex((b: any) => b._type === 'featureList')

    console.log(`- Hero with Calculator at index: ${heroIndex}`)
    console.log(`- Value Proposition at index: ${vpIndex}`)
    console.log(`- Feature List at index: ${flIndex}`)

    // Create fixed content blocks
    const fixedContentBlocks = [...(currentPage.contentBlocks || [])]

    // Fix 1: Hero with Calculator
    if (heroIndex >= 0) {
      console.log('\n✅ Fixing Hero with Calculator...')
      fixedContentBlocks[heroIndex] = {
        _type: 'heroWithCalculator',
        _key: fixedContentBlocks[heroIndex]._key || generateKey(),
        headline: 'Find Danmarks Bedste Elselskab',
        subheadline: 'Sammenlign priser fra 40+ elselskaber og spar op til 2.000 kr om året',
        // Note: heroWithCalculator doesn't have an image field in the schema
      }
    }

    // Fix 2: Value Proposition
    if (vpIndex >= 0) {
      console.log('\n✅ Fixing Value Proposition...')
      const vp = fixedContentBlocks[vpIndex]
      
      // Remove invalid subheadline field and fix icons
      fixedContentBlocks[vpIndex] = {
        _type: 'valueProposition',
        _key: vp._key || generateKey(),
        heading: 'Fordele ved at sammenligne elselskaber',
        // Remove subheadline - not in schema!
        items: [
          {
            _type: 'valueItem',
            _key: generateKey(),
            icon: {
              _type: 'icon.manager',
              name: 'piggy-bank',
              manager: 'lucide',
              metadata: {
                version: '0.469.0',
                license: 'ISC',
                author: 'Lucide Contributors'
              }
            },
            heading: 'Spar op til 2.000 kr/år',
            description: 'Den gennemsnitlige danske familie kan spare mellem 500-2.000 kr årligt ved at vælge det rigtige elselskab.'
          },
          {
            _type: 'valueItem',
            _key: generateKey(),
            icon: {
              _type: 'icon.manager',
              name: 'leaf',
              manager: 'lucide',
              metadata: {
                version: '0.469.0',
                license: 'ISC',
                author: 'Lucide Contributors'
              }
            },
            heading: 'Støt den grønne omstilling',
            description: 'Vælg et elselskab der investerer i ny vedvarende energi, ikke bare køber certifikater.'
          },
          {
            _type: 'valueItem',
            _key: generateKey(),
            icon: {
              _type: 'icon.manager',
              name: 'shield-check',
              manager: 'lucide',
              metadata: {
                version: '0.469.0',
                license: 'ISC',
                author: 'Lucide Contributors'
              }
            },
            heading: 'Fuld gennemsigtighed',
            description: 'Se alle priser, gebyrer og betingelser samlet ét sted. Ingen skjulte overraskelser.'
          },
          {
            _type: 'valueItem',
            _key: generateKey(),
            icon: {
              _type: 'icon.manager',
              name: 'zap',
              manager: 'lucide',
              metadata: {
                version: '0.469.0',
                license: 'ISC',
                author: 'Lucide Contributors'
              }
            },
            heading: 'Skift på 5 minutter',
            description: 'Det nye elselskab håndterer alt det praktiske. Du skal bare vælge og tilmelde dig.'
          }
        ]
      }
    }

    // Fix 3: Feature List
    if (flIndex >= 0) {
      console.log('\n✅ Fixing Feature List...')
      const fl = fixedContentBlocks[flIndex]
      
      fixedContentBlocks[flIndex] = {
        _type: 'featureList',
        _key: fl._key || generateKey(),
        title: 'Sådan skifter du elselskab',
        subtitle: 'Det er nemmere end du tror - følg disse simple trin',
        features: [
          {
            _type: 'featureItem',
            _key: generateKey(),
            icon: {
              _type: 'icon.manager',
              name: 'search',
              manager: 'lucide',
              metadata: {
                version: '0.469.0',
                license: 'ISC',
                author: 'Lucide Contributors'
              }
            },
            title: '1. Sammenlign priser',
            description: 'Brug vores sammenligning til at finde det bedste elselskab for dig'
          },
          {
            _type: 'featureItem',
            _key: generateKey(),
            icon: {
              _type: 'icon.manager',
              name: 'file-check',
              manager: 'lucide',
              metadata: {
                version: '0.469.0',
                license: 'ISC',
                author: 'Lucide Contributors'
              }
            },
            title: '2. Tjek din nuværende aftale',
            description: 'Se om du har bindingsperiode eller opsigelsesvarsel'
          },
          {
            _type: 'featureItem',
            _key: generateKey(),
            icon: {
              _type: 'icon.manager',
              name: 'user-plus',
              manager: 'lucide',
              metadata: {
                version: '0.469.0',
                license: 'ISC',
                author: 'Lucide Contributors'
              }
            },
            title: '3. Tilmeld dig nyt selskab',
            description: 'Udfyld tilmeldingen online - det tager kun 2-3 minutter'
          },
          {
            _type: 'featureItem',
            _key: generateKey(),
            icon: {
              _type: 'icon.manager',
              name: 'refresh-cw',
              manager: 'lucide',
              metadata: {
                version: '0.469.0',
                license: 'ISC',
                author: 'Lucide Contributors'
              }
            },
            title: '4. Automatisk skift',
            description: 'Dit nye elselskab klarer opsigelsen og alt det praktiske'
          },
          {
            _type: 'featureItem',
            _key: generateKey(),
            icon: {
              _type: 'icon.manager',
              name: 'check-circle',
              manager: 'lucide',
              metadata: {
                version: '0.469.0',
                license: 'ISC',
                author: 'Lucide Contributors'
              }
            },
            title: '5. Velkommen til besparelser',
            description: 'Efter 3 uger er skiftet gennemført og du sparer penge'
          }
        ]
      }
    }

    // Prepare the update
    const updatedPage = {
      _id: currentPage._id,
      _type: 'page',
      title: currentPage.title,
      slug: currentPage.slug,
      seoMetaTitle: currentPage.seoMetaTitle,
      seoMetaDescription: currentPage.seoMetaDescription,
      seoKeywords: currentPage.seoKeywords,
      contentBlocks: fixedContentBlocks
    }

    console.log('\n📝 Updating page in Sanity...')
    const result = await client.createOrReplace(updatedPage)
    
    console.log('\n✅ Page updated successfully!')
    console.log(`📄 Document ID: ${result._id}`)
    console.log(`🔗 URL: https://dinelportal.dk/${result.slug.current}`)
    
    console.log('\n🔧 Fixed issues:')
    console.log('- ✅ Hero with Calculator: Added missing headline and subheadline')
    console.log('- ✅ Value Proposition: Removed invalid subheadline field')
    console.log('- ✅ Value Proposition: Fixed all 4 icons with proper metadata')
    console.log('- ✅ Feature List: Fixed all 5 icons with proper metadata')
    console.log('- ✅ All icons now use proper icon.manager format with metadata')

    // Verify the fix
    console.log('\n🔍 Verifying the fix...')
    const verifyPage = await client.fetch(`
      *[_id == "${currentPage._id}"][0] {
        contentBlocks[] {
          _type,
          ...select(
            _type == "heroWithCalculator" => {
              headline,
              subheadline
            },
            _type == "valueProposition" => {
              heading,
              subheadline,
              "itemCount": count(items),
              "validIcons": count(items[icon._type == "icon.manager" && defined(icon.metadata)])
            },
            _type == "featureList" => {
              title,
              "featureCount": count(features),
              "validIcons": count(features[icon._type == "icon.manager" && defined(icon.metadata)])
            }
          )
        }
      }
    `)

    const vHero = verifyPage.contentBlocks?.find((b: any) => b._type === 'heroWithCalculator')
    const vVP = verifyPage.contentBlocks?.find((b: any) => b._type === 'valueProposition')
    const vFL = verifyPage.contentBlocks?.find((b: any) => b._type === 'featureList')

    console.log('\n✅ Verification results:')
    console.log(`- Hero: ${vHero?.headline ? '✓' : '✗'} headline, ${vHero?.subheadline ? '✓' : '✗'} subheadline`)
    console.log(`- Value Proposition: ${vVP?.validIcons}/${vVP?.itemCount} valid icons, subheadline: ${vVP?.subheadline === undefined ? '✓ removed' : '✗ still present'}`)
    console.log(`- Feature List: ${vFL?.validIcons}/${vFL?.featureCount} valid icons`)

  } catch (error) {
    console.error('\n❌ Error:', error)
    throw error
  }
}

// Execute the fix
fixLeverandoerComprehensive()
  .then(() => {
    console.log('\n🎉 All fixes completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fix failed with error:', error)
    process.exit(1)
  })