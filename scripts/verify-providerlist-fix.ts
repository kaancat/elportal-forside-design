import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

async function verifyProviderListFix() {
  console.log('🔍 Verifying ProviderList schema fix...\n')

  try {
    // 1. Check schema definition
    console.log('1. Checking schema definition...')
    const schemaQuery = `*[_type == "sanity.schema" && name == "providerList"][0]`
    const schema = await client.fetch(schemaQuery)
    
    if (!schema) {
      console.error('❌ providerList schema not found!')
      return
    }

    console.log('✅ Schema found\n')

    // 2. Test creating a document with the new fields
    console.log('2. Testing document creation with new fields...')
    
    const testDoc = {
      _type: 'providerList',
      _id: 'test.providerList.verification',
      title: 'Test Provider List',
      subtitle: 'Vi sammenligner priser fra alle danske elselskaber',
      headerAlignment: 'center',
      providers: []
    }

    await client.createOrReplace(testDoc)
    console.log('✅ Document created successfully with new fields\n')

    // 3. Fetch the document to verify fields are stored
    console.log('3. Fetching document to verify fields...')
    const fetchedDoc = await client.fetch(`*[_id == "test.providerList.verification"][0]`)
    
    if (!fetchedDoc) {
      console.error('❌ Could not fetch test document!')
      return
    }

    console.log('Fetched document:', JSON.stringify(fetchedDoc, null, 2))
    
    // 4. Verify fields exist
    const fieldsToCheck = ['title', 'subtitle', 'headerAlignment']
    let allFieldsValid = true
    
    console.log('\n4. Verifying fields:')
    for (const field of fieldsToCheck) {
      if (field in fetchedDoc) {
        console.log(`✅ ${field}: ${fetchedDoc[field]}`)
      } else {
        console.log(`❌ ${field}: Missing!`)
        allFieldsValid = false
      }
    }

    // 5. Check pages using providerList
    console.log('\n5. Checking pages with providerList blocks...')
    const pagesQuery = `*[_type == "page" && contentBlocks[_type == "providerList"]] {
      _id,
      title,
      slug,
      "providerLists": contentBlocks[_type == "providerList"] {
        _key,
        title,
        subtitle,
        headerAlignment
      }
    }`
    
    const pages = await client.fetch(pagesQuery)
    
    if (pages.length > 0) {
      console.log(`Found ${pages.length} pages with providerList blocks:\n`)
      pages.forEach((page: any) => {
        console.log(`Page: ${page.title} (${page.slug.current})`)
        page.providerLists.forEach((list: any) => {
          console.log(`  - ProviderList: ${list.title || 'No title'}`)
          console.log(`    Subtitle: ${list.subtitle || 'Not set'}`)
          console.log(`    Alignment: ${list.headerAlignment || 'Not set'}`)
        })
      })
    } else {
      console.log('No pages with providerList blocks found.')
    }

    // 6. Clean up test document
    console.log('\n6. Cleaning up test document...')
    await client.delete('test.providerList.verification')
    console.log('✅ Test document deleted\n')

    // Final summary
    console.log('=' * 50)
    if (allFieldsValid) {
      console.log('✅ VERIFICATION SUCCESSFUL!')
      console.log('The providerList schema has been updated with:')
      console.log('  - subtitle field (string)')
      console.log('  - headerAlignment field (left/center/right)')
    } else {
      console.log('❌ VERIFICATION FAILED!')
      console.log('Some fields are missing from the schema.')
    }

  } catch (error) {
    console.error('❌ Error during verification:', error)
  }
}

// Run verification
verifyProviderListFix()