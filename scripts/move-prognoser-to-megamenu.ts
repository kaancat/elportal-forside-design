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

async function movePrognoserToMegaMenu() {
  console.log('🔄 Moving prognoser link from main nav to mega menu...\n')
  
  try {
    // 1. Fetch current site settings
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0]`)
    
    if (!siteSettings) {
      console.error('❌ Site settings not found!')
      return
    }
    
    console.log('📋 Current header links:')
    siteSettings.headerLinks.forEach((link: any, index: number) => {
      console.log(`[${index}] ${link.title} (${link._type})`)
    })
    
    // 2. Find and remove the prognoser link from main navigation
    const prognoserLinkIndex = siteSettings.headerLinks.findIndex((link: any) => 
      link._key === 'prognoser-nav-1753551797753' ||
      (link.linkType === 'internal' && link.internalLink?._ref === 'page.prognoser')
    )
    
    if (prognoserLinkIndex === -1) {
      console.log('⚠️  Prognoser link not found in main navigation')
    } else {
      console.log(`\n✅ Found prognoser link at index ${prognoserLinkIndex}`)
      
      // Remove the prognoser link from headerLinks
      const updatedHeaderLinks = siteSettings.headerLinks.filter((_: any, index: number) => 
        index !== prognoserLinkIndex
      )
      
      console.log('\n📝 Updated header links will be:')
      updatedHeaderLinks.forEach((link: any, index: number) => {
        console.log(`[${index}] ${link.title} (${link._type})`)
      })
      
      // 3. Update the site settings
      const result = await client.patch(siteSettings._id)
        .set({ headerLinks: updatedHeaderLinks })
        .commit()
      
      console.log('\n✅ Successfully updated site settings!')
      console.log('🎯 Prognoser link has been removed from main navigation')
      console.log('📍 It remains available in the mega menu under "Bliv klogere på" → "PRISER"')
    }
    
    // 4. Verify the mega menu still has the prognoser link
    const megaMenuLink = siteSettings.headerLinks.find((link: any) => 
      link._key === '56ab3fed792b' && link._type === 'megaMenu'
    )
    
    if (megaMenuLink?.content) {
      const priserCategory = megaMenuLink.content.find((cat: any) => 
        cat.title === 'Priser'
      )
      const prognoserInMega = priserCategory?.items?.find((item: any) => 
        item.link?.internalLink?._ref === 'page.prognoser'
      )
      
      if (prognoserInMega) {
        console.log('\n✅ Confirmed: Prognoser link exists in mega menu under "PRISER"')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the update
movePrognoserToMegaMenu()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })