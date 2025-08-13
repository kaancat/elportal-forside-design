import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function publishElprisberegner() {
  try {
    console.log('🔍 Fetching the elprisberegner draft...')
    
    // Find the draft document
    const draftQuery = `*[_id == "drafts.f7ecf92783e749828f7281a6e5829d52"][0]`
    const draft = await client.fetch(draftQuery)
    
    if (!draft) {
      console.error('❌ Draft not found!')
      return
    }
    
    console.log('✅ Found draft:', draft._id)
    
    // Create the published version
    const publishedDoc = {
      ...draft,
      _id: draft._id.replace('drafts.', '') // Remove drafts prefix
    }
    
    delete publishedDoc._rev // Remove revision
    
    console.log('📝 Publishing document...')
    
    // Create or replace the published document
    const result = await client.createOrReplace(publishedDoc)
    
    console.log('✅ Successfully published elprisberegner page!')
    console.log('🔗 View in Sanity Studio: https://dinelportal.sanity.studio/structure/page;' + result._id)
    console.log('🌐 View on website: https://www.dinelportal.dk/elprisberegner')
    
    // Verify the tips are included with proper references
    console.log('\n🔍 Verifying published page...')
    const verifyQuery = `*[_type == "page" && slug.current == "elprisberegner"][0] {
      contentBlocks[_type == "energyTipsSection"][0] {
        _type,
        title,
        subtitle,
        "tipsCount": count(tips),
        "firstFewTips": tips[0...3]->{
          _id,
          title,
          category,
          shortDescription
        }
      }
    }`
    
    const verification = await client.fetch(verifyQuery)
    if (verification?.contentBlocks?.[0]) {
      const section = verification.contentBlocks[0]
      console.log(`\n✅ Verification successful:`)
      console.log(`  - Title: ${section.title}`)
      console.log(`  - Tips count: ${section.tipsCount}`)
      console.log(`  - First few tips:`)
      section.firstFewTips?.forEach((tip: any, index: number) => {
        console.log(`    ${index + 1}. ${tip.title} (${tip.category})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error publishing page:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    process.exit(1)
  }
}

// Run the publish
publishElprisberegner()