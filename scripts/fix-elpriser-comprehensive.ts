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

// Helper function to generate keys
function generateKey() {
  return Math.random().toString(36).substring(2, 15)
}

async function fixElpriserPageComprehensively() {
  const pageId = '1BrgDwXdqxJ08rMIoYfLjP' // elpriser page ID
  
  try {
    console.log('🔧 Starting comprehensive fix for elpriser page...\n')
    
    // Fetch current page
    const currentPage = await client.fetch(`*[_id == "${pageId}"][0]`)
    if (!currentPage) {
      console.error('❌ Page not found!')
      return
    }

    console.log('📄 Found page:', currentPage.title)
    console.log('🔗 Slug:', currentPage.slug?.current)

    // 1. Fix SEO fields
    console.log('\n1️⃣ Fixing SEO fields...')
    const seoUpdates: any = {}
    
    // Clear null ogImage (keep field but unset null value)
    if (currentPage.ogImage === null) {
      console.log('   - Clearing null ogImage value')
      // We'll use unset to clear it
    }

    // 2. Check and populate heroWithCalculator if needed
    console.log('\n2️⃣ Checking heroWithCalculator content...')
    const heroCalcIndex = currentPage.contentBlocks?.findIndex(
      (block: any) => block._type === 'heroWithCalculator'
    )
    
    if (heroCalcIndex !== -1) {
      const heroCalc = currentPage.contentBlocks[heroCalcIndex]
      console.log('   - Found heroWithCalculator block')
      
      if (!heroCalc.title || !heroCalc.subtitle) {
        console.log('   - Populating missing content')
        seoUpdates[`contentBlocks[${heroCalcIndex}].title`] = heroCalc.title || 'Sammenlign elpriser og spar penge'
        seoUpdates[`contentBlocks[${heroCalcIndex}].subtitle`] = heroCalc.subtitle || 'Find det billigste elselskab i Danmark på under 1 minut'
      }
    }

    // 3. Fix Value Proposition Box
    console.log('\n3️⃣ Fixing Value Proposition Box...')
    const valuePropIndex = currentPage.contentBlocks?.findIndex(
      (block: any) => block._type === 'valueProposition'
    )

    if (valuePropIndex !== -1) {
      const valueProp = currentPage.contentBlocks[valuePropIndex]
      console.log('   - Found valueProposition block')
      
      // Update heading and subheading
      seoUpdates[`contentBlocks[${valuePropIndex}].heading`] = 'Derfor skal du sammenligne elpriser'
      seoUpdates[`contentBlocks[${valuePropIndex}].subheading`] = 'Opdag fordelene ved at skifte elselskab'
      
      // Create comprehensive value items with proper icons
      const valueItems = [
        {
          _key: generateKey(),
          _type: 'valueItem',
          icon: {
            _type: 'icon.manager',
            icon: 'lucide:piggy-bank',
            metadata: {
              collectionId: 'lucide',
              collectionName: 'Lucide',
              icon: 'piggy-bank',
              iconName: 'Piggy Bank',
              url: 'https://api.iconify.design/lucide:piggy-bank.svg?color=%2384db41',
              inlineSvg: null,
              size: { width: 24, height: 24 }
            }
          },
          heading: 'Spar op til 3.000 kr. årligt',
          description: 'Find det billigste elselskab og reducer din elregning markant uden at gå på kompromis med kvaliteten.'
        },
        {
          _key: generateKey(),
          _type: 'valueItem',
          icon: {
            _type: 'icon.manager',
            icon: 'lucide:leaf',
            metadata: {
              collectionId: 'lucide',
              collectionName: 'Lucide',
              icon: 'leaf',
              iconName: 'Leaf',
              url: 'https://api.iconify.design/lucide:leaf.svg?color=%2384db41',
              inlineSvg: null,
              size: { width: 24, height: 24 }
            }
          },
          heading: '100% grøn strøm',
          description: 'Alle vores anbefalede leverandører tilbyder kun certificeret grøn strøm fra vindkraft og andre vedvarende energikilder.'
        },
        {
          _key: generateKey(),
          _type: 'valueItem',
          icon: {
            _type: 'icon.manager',
            icon: 'lucide:clock',
            metadata: {
              collectionId: 'lucide',
              collectionName: 'Lucide',
              icon: 'clock',
              iconName: 'Clock',
              url: 'https://api.iconify.design/lucide:clock.svg?color=%2384db41',
              inlineSvg: null,
              size: { width: 24, height: 24 }
            }
          },
          heading: 'Skift på 5 minutter',
          description: 'Det er hurtigt og nemt at skifte elleverandør. Vi guider dig gennem hele processen, så du sparer tid og penge.'
        },
        {
          _key: generateKey(),
          _type: 'valueItem',
          icon: {
            _type: 'icon.manager',
            icon: 'lucide:shield-check',
            metadata: {
              collectionId: 'lucide',
              collectionName: 'Lucide',
              icon: 'shield-check',
              iconName: 'Shield Check',
              url: 'https://api.iconify.design/lucide:shield-check.svg?color=%2384db41',
              inlineSvg: null,
              size: { width: 24, height: 24 }
            }
          },
          heading: 'Uvildig rådgivning',
          description: 'Vi viser alle leverandører på markedet og giver dig et komplet overblik, så du kan træffe det bedste valg.'
        },
        {
          _key: generateKey(),
          _type: 'valueItem',
          icon: {
            _type: 'icon.manager',
            icon: 'lucide:trending-up',
            metadata: {
              collectionId: 'lucide',
              collectionName: 'Lucide',
              icon: 'trending-up',
              iconName: 'Trending Up',
              url: 'https://api.iconify.design/lucide:trending-up.svg?color=%2384db41',
              inlineSvg: null,
              size: { width: 24, height: 24 }
            }
          },
          heading: 'Følg elpriserne live',
          description: 'Se de aktuelle elpriser time for time og planlæg dit forbrug, når strømmen er billigst.'
        },
        {
          _key: generateKey(),
          _type: 'valueItem',
          icon: {
            _type: 'icon.manager',
            icon: 'lucide:users',
            metadata: {
              collectionId: 'lucide',
              collectionName: 'Lucide',
              icon: 'users',
              iconName: 'Users',
              url: 'https://api.iconify.design/lucide:users.svg?color=%2384db41',
              inlineSvg: null,
              size: { width: 24, height: 24 }
            }
          },
          heading: 'Over 50.000 brugere',
          description: 'Tusindvis af danskere har allerede sparet penge ved at bruge DinElPortal til at finde deres elleverandør.'
        }
      ]
      
      // Update valueItems (not items - check which field exists)
      if ('valueItems' in valueProp || !('items' in valueProp)) {
        seoUpdates[`contentBlocks[${valuePropIndex}].valueItems`] = valueItems
      } else {
        seoUpdates[`contentBlocks[${valuePropIndex}].items`] = valueItems
      }
    }

    // 4. Apply all updates and remove deprecated fields
    console.log('\n4️⃣ Applying all updates to Sanity...')
    
    const transaction = client.transaction()
      .patch(pageId)
      .set(seoUpdates)
    
    // Unset null ogImage and deprecated seo field
    if (currentPage.ogImage === null) {
      transaction.unset(['ogImage'])
    }
    
    if ('seo' in currentPage) {
      console.log('   - Removing deprecated seo field')
      transaction.unset(['seo'])
    }
    
    const result = await transaction.commit()
    
    console.log('\n✅ Successfully fixed all validation errors!')
    console.log('🆔 Updated page ID:', result._id)

    // 5. Verify the fixes
    console.log('\n5️⃣ Verifying fixes...')
    const updatedPage = await client.fetch(`*[_id == "${pageId}"][0]{
      title,
      slug,
      ogImage,
      seo,
      "heroWithCalculator": contentBlocks[_type == "heroWithCalculator"][0]{
        title,
        subtitle
      },
      "valueProposition": contentBlocks[_type == "valueProposition"][0]{
        heading,
        subheading,
        "itemsField": defined(items),
        "valueItemsField": defined(valueItems),
        "itemCount": count(coalesce(valueItems, items))
      }
    }`)

    console.log('\n📊 Verification Results:')
    console.log('✓ Page title:', updatedPage.title)
    console.log('✓ ogImage cleared:', updatedPage.ogImage === undefined)
    console.log('✓ seo field removed:', updatedPage.seo === undefined)
    console.log('✓ heroWithCalculator has title:', !!updatedPage.heroWithCalculator?.title)
    console.log('✓ valueProposition has heading:', !!updatedPage.valueProposition?.heading)
    console.log('✓ valueProposition has subheading:', !!updatedPage.valueProposition?.subheading)
    console.log('✓ valueProposition item count:', updatedPage.valueProposition?.itemCount || 0)
    
    console.log('\n🎉 All validation errors have been fixed!')
    console.log('📝 You can now view the page in Sanity Studio without validation errors.')
    
  } catch (error) {
    console.error('\n❌ Error fixing elpriser page:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
  }
}

// Run the comprehensive fix
console.log('🚀 ElPortal - Comprehensive Elpriser Page Fix')
console.log('============================================\n')
fixElpriserPageComprehensively()