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

async function fixCTASection() {
  console.log('🔧 Fixing Call to Action section specifically...\n')
  
  try {
    // Fetch the current page
    const page = await client.fetch(`*[_id == "page.prognoser"][0]`)
    
    if (!page) {
      console.error('❌ Page not found!')
      return
    }
    
    console.log('📄 Analyzing Call to Action block structure...\n')
    
    // Find the CTA block
    const ctaBlockIndex = page.contentBlocks.findIndex((block: any) => block._type === 'callToActionSection')
    if (ctaBlockIndex === -1) {
      console.error('❌ No Call to Action block found!')
      return
    }
    
    const ctaBlock = page.contentBlocks[ctaBlockIndex]
    console.log('Current CTA block fields:', Object.keys(ctaBlock))
    console.log('Current CTA block:', JSON.stringify(ctaBlock, null, 2))
    
    // The schema shows these are the actual field names:
    // - heading (not title)
    // - description
    // - primaryButtonText
    // - primaryButtonLink
    // - secondaryButtonText (optional)
    // - secondaryButtonLink (optional)
    // - variant (optional)
    
    // So we need to KEEP the original field names, not change them!
    const fixedCTA = {
      _key: ctaBlock._key,
      _type: 'callToActionSection',
      heading: ctaBlock.heading || ctaBlock.title || 'Start Din Besparelse i Dag',
      description: ctaBlock.description || 'Få daglige elpris prognoser og spar tusindvis af kroner årligt. Vælg en elleverandør der giver dig fleksibilitet og grøn energi.',
      primaryButtonText: ctaBlock.primaryButtonText || ctaBlock.buttonText || 'Find din elleverandør',
      primaryButtonLink: ctaBlock.primaryButtonLink || ctaBlock.buttonUrl || '/sammenlign',
      secondaryButtonText: ctaBlock.secondaryButtonText || 'Se dagens priser',
      secondaryButtonLink: ctaBlock.secondaryButtonLink || '/elpriser',
      variant: ctaBlock.variant || 'centered'
    }
    
    // Update the page with the fixed CTA
    const updatedPage = { ...page }
    updatedPage.contentBlocks[ctaBlockIndex] = fixedCTA
    
    console.log('\nFixed CTA block:', JSON.stringify(fixedCTA, null, 2))
    
    // Update in Sanity
    console.log('\n📤 Updating page with fixed CTA...')
    const result = await client.createOrReplace(updatedPage)
    
    console.log('\n✅ Call to Action section fixed!')
    console.log('🔗 Check in Sanity Studio: https://dinelportal.sanity.studio/structure/page;page.prognoser')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the fix
fixCTASection()
  .then(() => {
    console.log('\n🎉 CTA fix completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })