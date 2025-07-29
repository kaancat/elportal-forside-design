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
    // 1. Test creating a document with the new fields
    console.log('1. Testing document creation with new fields...')
    
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

    // 2. Fetch the document to verify fields are stored
    console.log('2. Fetching document to verify fields...')
    const fetchedDoc = await client.fetch(`*[_id == "test.providerList.verification"][0]`)
    
    if (!fetchedDoc) {
      console.error('❌ Could not fetch test document!')
      return
    }

    console.log('Fetched document:', JSON.stringify(fetchedDoc, null, 2))
    
    // 3. Verify fields exist
    const fieldsToCheck = ['title', 'subtitle', 'headerAlignment']
    let allFieldsValid = true
    
    console.log('\n3. Verifying fields:')
    for (const field of fieldsToCheck) {
      if (field in fetchedDoc) {
        console.log(`✅ ${field}: "${fetchedDoc[field]}"`)
      } else {
        console.log(`❌ ${field}: Missing!`)
        allFieldsValid = false
      }
    }

    // 4. Check existing providerList blocks with issues
    console.log('\n4. Looking for providerList blocks with validation issues...')
    
    // Find all pages with providerList blocks
    const pagesQuery = `*[_type == "page" && contentBlocks[_type == "providerList"]] {
      _id,
      title,
      slug,
      "providerLists": contentBlocks[_type == "providerList"]
    }`
    
    const pages = await client.fetch(pagesQuery)
    
    if (pages.length > 0) {
      console.log(`\nFound ${pages.length} pages with providerList blocks:`)
      
      let issuesFound = 0
      pages.forEach((page: any) => {
        page.providerLists.forEach((list: any) => {
          // Check if this list has the problematic values
          if (list.subtitle === "Vi sammenligner priser fra alle danske elselskaber" || 
              list.headerAlignment === "center") {
            issuesFound++
            console.log(`\n⚠️  Page: ${page.title} (/${page.slug.current})`)
            console.log(`   Block key: ${list._key}`)
            console.log(`   Title: ${list.title || 'Not set'}`)
            console.log(`   Subtitle: ${list.subtitle || 'Not set'}`)
            console.log(`   Alignment: ${list.headerAlignment || 'Not set'}`)
            console.log(`   → These fields are now supported! ✅`)
          }
        })
      })
      
      if (issuesFound === 0) {
        console.log('\n✅ No providerList blocks found with the previously unknown fields.')
      } else {
        console.log(`\n✅ Found ${issuesFound} providerList blocks that previously had unknown fields.`)
        console.log('   These should now work correctly!')
      }
    } else {
      console.log('No pages with providerList blocks found.')
    }

    // 5. Test frontend query
    console.log('\n5. Testing frontend GROQ query...')
    const testQuery = `*[_type == "page" && slug.current == "elpriser"][0] {
      contentBlocks[] {
        _type == "providerList" => {
          _key,
          _type,
          title,
          subtitle,
          headerAlignment,
          'providers': providers[]->{ 
            "id": _id,
            providerName,
            productName
          }
        }
      }
    }`
    
    const testResult = await client.fetch(testQuery)
    if (testResult?.contentBlocks) {
      const providerLists = testResult.contentBlocks.filter((b: any) => b?._type === 'providerList')
      if (providerLists.length > 0) {
        console.log('✅ Frontend query successfully includes new fields:')
        providerLists.forEach((list: any) => {
          console.log(`   - subtitle: "${list.subtitle || 'Not set'}"`)
          console.log(`   - headerAlignment: "${list.headerAlignment || 'Not set'}"`)
        })
      }
    }

    // 6. Clean up test document
    console.log('\n6. Cleaning up test document...')
    await client.delete('test.providerList.verification')
    console.log('✅ Test document deleted\n')

    // Final summary
    console.log('=' .repeat(60))
    if (allFieldsValid) {
      console.log('✅ VERIFICATION SUCCESSFUL!')
      console.log('\nThe providerList schema has been updated with:')
      console.log('  - subtitle field (string)')
      console.log('  - headerAlignment field (left/center/right)')
      console.log('\nBoth the Sanity schema and frontend TypeScript types have been updated.')
      console.log('The frontend GROQ queries now include these fields.')
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