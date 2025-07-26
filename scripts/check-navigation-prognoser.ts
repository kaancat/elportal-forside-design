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

async function checkNavigationPrognoser() {
  console.log('🔍 Checking navigation setup for prognoser page...\n')
  
  try {
    // 1. Check if prognoser page exists and has correct slug
    const prognoserPage = await client.fetch(`*[_id == "page.prognoser"][0]{
      _id,
      title,
      slug
    }`)
    
    console.log('📄 Prognoser page:', prognoserPage)
    
    if (!prognoserPage) {
      console.error('❌ Prognoser page not found!')
      return
    }
    
    if (!prognoserPage.slug?.current) {
      console.error('❌ Prognoser page has no slug!')
      return
    }
    
    console.log(`✅ Prognoser page exists with slug: /${prognoserPage.slug.current}\n`)
    
    // 2. Check site settings and navigation links
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0]{
      _id,
      title,
      headerLinks[]{
        _key,
        _type,
        title,
        linkType,
        externalUrl,
        internalLink->{
          _id,
          _type,
          title,
          slug
        }
      }
    }`)
    
    console.log('🔗 Site settings:', siteSettings?.title)
    console.log('📊 Total header links:', siteSettings?.headerLinks?.length || 0)
    
    if (!siteSettings?.headerLinks) {
      console.error('❌ No header links found in site settings!')
      return
    }
    
    // 3. Look for prognoser link
    const prognoserLink = siteSettings.headerLinks.find((link: any) => {
      if (link.linkType === 'internal' && link.internalLink) {
        return link.internalLink._id === 'page.prognoser' || 
               link.internalLink.slug?.current === 'prognoser'
      }
      return false
    })
    
    console.log('\n📋 All navigation links:')
    siteSettings.headerLinks.forEach((link: any, index: number) => {
      console.log(`[${index + 1}] ${link.title} (${link._type})`)
      if (link.linkType === 'internal' && link.internalLink) {
        console.log(`    → Internal: /${link.internalLink.slug?.current || 'NO_SLUG'} (${link.internalLink._id})`)
      } else if (link.linkType === 'external') {
        console.log(`    → External: ${link.externalUrl}`)
      }
    })
    
    console.log('\n' + '='.repeat(60))
    
    if (prognoserLink) {
      console.log('✅ PROGNOSER LINK FOUND in navigation!')
      console.log(`   Title: ${prognoserLink.title}`)
      console.log(`   Points to: /${prognoserLink.internalLink.slug?.current}`)
    } else {
      console.log('❌ PROGNOSER LINK NOT FOUND in navigation!')
      console.log('\nTo fix this, you need to:')
      console.log('1. Go to Sanity Studio: https://dinelportal.sanity.studio')
      console.log('2. Open Site Settings')
      console.log('3. Add a new header link:')
      console.log('   - Title: "Prognoser" or "Elpris Prognoser"')
      console.log('   - Link Type: Internal')
      console.log('   - Internal Link: Select the "Elpris Prognose 2025" page')
    }
    
    console.log('='.repeat(60))
    
    // 4. Check if there are any broken internal links
    const brokenLinks = siteSettings.headerLinks.filter((link: any) => 
      link.linkType === 'internal' && (!link.internalLink || !link.internalLink.slug?.current)
    )
    
    if (brokenLinks.length > 0) {
      console.log('\n⚠️  BROKEN NAVIGATION LINKS FOUND:')
      brokenLinks.forEach((link: any, index: number) => {
        console.log(`[${index + 1}] "${link.title}" - Missing or invalid internal reference`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the check
checkNavigationPrognoser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })