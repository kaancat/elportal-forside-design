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

async function addPrognoserNavigation() {
  console.log('🔧 Adding prognoser page to navigation...\n')
  
  try {
    // 1. Fetch current site settings
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0]`)
    
    if (!siteSettings) {
      console.error('❌ Site settings not found!')
      return
    }
    
    console.log('📄 Current site settings found')
    console.log(`📊 Current header links: ${siteSettings.headerLinks?.length || 0}`)
    
    // 2. Check if prognoser link already exists
    const existingPrognoserLink = siteSettings.headerLinks?.find((link: any) => {
      return link.linkType === 'internal' && 
             link.internalLink && 
             (link.internalLink._ref === 'page.prognoser' || 
              link.internalLink._id === 'page.prognoser')
    })
    
    if (existingPrognoserLink) {
      console.log('✅ Prognoser link already exists in navigation!')
      console.log(`   Title: ${existingPrognoserLink.title}`)
      return
    }
    
    // 3. Create new prognoser navigation link
    const prognoserLink = {
      _key: `prognoser-nav-${Date.now()}`,
      _type: 'link',
      title: 'Prognoser',
      linkType: 'internal',
      internalLink: {
        _type: 'reference',
        _ref: 'page.prognoser'
      },
      isButton: false
    }
    
    // 4. Insert prognoser link in a logical position (after "Elpriser")
    const updatedHeaderLinks = [...(siteSettings.headerLinks || [])]
    
    // Find position after "Elpriser" 
    const elpriserIndex = updatedHeaderLinks.findIndex((link: any) => 
      link.title?.toLowerCase().includes('elpriser')
    )
    
    if (elpriserIndex !== -1) {
      // Insert after Elpriser
      updatedHeaderLinks.splice(elpriserIndex + 1, 0, prognoserLink)
      console.log('✅ Inserting prognoser link after "Elpriser"')
    } else {
      // Insert at beginning if no Elpriser found
      updatedHeaderLinks.unshift(prognoserLink)
      console.log('✅ Inserting prognoser link at beginning')
    }
    
    // 5. Update site settings
    const updatedSettings = {
      ...siteSettings,
      headerLinks: updatedHeaderLinks
    }
    
    console.log('\n📤 Updating site settings...')
    const result = await client.createOrReplace(updatedSettings)
    
    console.log('\n✅ Navigation updated successfully!')
    console.log('🔗 Prognoser page is now accessible via navigation menu')
    console.log('🌐 Test the link: https://elportal-forside-design.vercel.app/prognoser')
    
    // 6. Show updated navigation structure
    console.log('\n📋 Updated navigation structure:')
    updatedHeaderLinks.forEach((link: any, index: number) => {
      if (link._type === 'link') {
        console.log(`[${index + 1}] ${link.title} (${link.linkType})`)
        if (link._key === prognoserLink._key) {
          console.log('    ← NEW: Links to prognoser page')
        }
      } else {
        console.log(`[${index + 1}] ${link.title} (${link._type})`)
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the update
addPrognoserNavigation()
  .then(() => {
    console.log('\n🎉 Prognoser navigation link added successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })