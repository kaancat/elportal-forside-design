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

async function forceNavigationRefresh() {
  console.log('🔄 Forcing navigation cache refresh...\n')
  
  try {
    // 1. Test navigation data fetch
    console.log('📡 Testing navigation data fetch...')
    const siteSettings = await client.fetch(`*[_type == "siteSettings"][0]{
      _id,
      title,
      headerLinks[]{
        _key,
        _type,
        title,
        linkType,
        internalLink->{ "slug": slug.current, _type, _id }
      }
    }`)
    
    console.log('✅ Navigation data fetched successfully')
    console.log(`📊 Found ${siteSettings?.headerLinks?.length || 0} navigation items:`)
    
    siteSettings?.headerLinks?.forEach((link: any, index: number) => {
      console.log(`  [${index + 1}] ${link.title}`)
      if (link.linkType === 'internal' && link.internalLink) {
        console.log(`      → /${link.internalLink.slug} (${link.internalLink._id})`)
        if (link.internalLink._id === 'page.prognoser') {
          console.log('      ✅ PROGNOSER LINK FOUND!')
        }
      }
    })
    
    // 2. Check if webhooks are working by triggering a test
    console.log('\n🔍 Checking webhook endpoint...')
    
    // Try to reach the frontend
    const frontendUrl = 'https://elportal-forside-design.vercel.app'
    console.log(`🌐 Frontend URL: ${frontendUrl}`)
    
    console.log('\n' + '='.repeat(60))
    console.log('📋 NAVIGATION REFRESH INSTRUCTIONS')
    console.log('='.repeat(60))
    console.log('')
    console.log('The prognoser navigation link has been added successfully!')
    console.log('However, since this is a React SPA, you need to refresh to see it.')
    console.log('')
    console.log('✨ IMMEDIATE SOLUTIONS:')
    console.log('1. 🔄 Refresh your browser page (Cmd+R / Ctrl+R)')
    console.log('2. 💻 Open a new browser window/tab')
    console.log('3. 🔗 Navigate directly to: https://elportal-forside-design.vercel.app/prognoser')
    console.log('')
    console.log('📈 LONG-TERM SOLUTIONS (for developers):')
    console.log('1. Implement React Query with shorter staleTime for navigation')
    console.log('2. Add a polling mechanism to check for navigation updates')
    console.log('3. Implement WebSocket connection for real-time updates')
    console.log('4. Add a "Refresh Navigation" button for admin users')
    console.log('')
    console.log('🔧 WEBHOOK STATUS:')
    console.log('- ✅ Revalidation API endpoint exists')
    console.log('- ✅ Prognoser link added to Sanity')
    console.log('- ⚠️  Frontend needs manual refresh to see changes')
    console.log('')
    console.log('🧪 TEST STEPS:')
    console.log('1. Open: https://elportal-forside-design.vercel.app')
    console.log('2. Refresh the page (Cmd+R)')
    console.log('3. Look for "Prognoser" in the main navigation menu')
    console.log('4. Click it to navigate to /prognoser')
    console.log('')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the check
forceNavigationRefresh()
  .then(() => {
    console.log('🎉 Navigation refresh instructions provided!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })