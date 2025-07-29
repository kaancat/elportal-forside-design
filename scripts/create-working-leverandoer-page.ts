#!/usr/bin/env npx tsx

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../.env') })

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID!,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function createWorkingLeverandoerPage() {
  console.log('🔧 Creating a working copy of leverandoer-sammenligning page...\n')
  
  try {
    // 1. Fetch the current page content
    const currentPage = await client.fetch(`*[_id == "page.leverandoer-sammenligning"][0]`)
    
    if (!currentPage) {
      console.log('❌ Current page not found!')
      return
    }
    
    console.log('✅ Found current page, creating new version...')
    
    // 2. Remove the _id and other system fields
    const { _id, _rev, _createdAt, _updatedAt, ...pageContent } = currentPage
    
    // 3. Create a new page with auto-generated ID
    const newPage = await client.create(pageContent)
    
    console.log('✅ New page created successfully!')
    console.log(`   New ID: ${newPage._id}`)
    console.log(`   Slug: ${newPage.slug.current}`)
    
    // 4. Test public access
    const publicClient = createClient({
      projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
      dataset: 'production',
      apiVersion: '2024-01-01',
      useCdn: false,
    })
    
    const publicTest = await publicClient.fetch(
      `*[_type == "page" && slug.current == "leverandoer-sammenligning" && _id == "${newPage._id}"][0] { _id, title }`
    )
    
    if (publicTest) {
      console.log('\n✅ SUCCESS! New page is publicly accessible!')
      
      // 5. Update navigation to point to the new page
      console.log('\n📝 Updating navigation to use the new page...')
      
      // Get current siteSettings
      const siteSettings = await client.fetch(`*[_id == "siteSettings"][0]`)
      
      // Update the reference in navigation
      let updated = false
      const updateReferences = (items: any[]): any[] => {
        return items?.map(item => {
          if (item._type === 'megaMenu' && item.content) {
            return {
              ...item,
              content: item.content.map((column: any) => ({
                ...column,
                items: column.items?.map((megaItem: any) => {
                  if (megaItem.link?.internalLink?._ref === 'page.leverandoer-sammenligning') {
                    updated = true
                    return {
                      ...megaItem,
                      link: {
                        ...megaItem.link,
                        internalLink: {
                          _type: 'reference',
                          _ref: newPage._id
                        }
                      }
                    }
                  }
                  return megaItem
                })
              }))
            }
          }
          return item
        }) || []
      }
      
      const updatedHeaderLinks = updateReferences(siteSettings.headerLinks)
      
      if (updated) {
        await client
          .patch('siteSettings')
          .set({ headerLinks: updatedHeaderLinks })
          .commit()
        
        console.log('✅ Navigation updated to use the new page!')
        
        // 6. Delete the old broken page
        console.log('\n🗑️ Deleting the old page with visibility issues...')
        await client.delete('page.leverandoer-sammenligning')
        console.log('✅ Old page deleted')
        
        console.log('\n🎉 SUCCESS! The navigation link should work now!')
        console.log('📝 Note: Clear your browser cache if needed.')
      } else {
        console.log('⚠️ Could not find the navigation reference to update')
      }
      
    } else {
      console.log('\n❌ New page is still not publicly accessible')
      console.log('This might be a dataset configuration issue.')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createWorkingLeverandoerPage()