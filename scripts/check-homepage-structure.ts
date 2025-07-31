import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function checkHomepageStructure() {
  try {
    console.log('Fetching homepage structure...')
    
    const homepage = await client.fetch(`*[_type == "homePage"][0]{
      _id,
      title,
      contentBlocks[]{
        _key,
        _type
      }
    }`)
    
    if (!homepage) {
      console.error('Homepage not found')
      return
    }
    
    console.log('\nHomepage ID:', homepage._id)
    console.log('Title:', homepage.title)
    console.log('\nContent blocks:')
    
    if (!homepage.contentBlocks || homepage.contentBlocks.length === 0) {
      console.log('No content blocks found')
    } else {
      homepage.contentBlocks.forEach((block: any, index: number) => {
        console.log(`${index + 1}. Type: ${block._type}, Key: ${block._key}`)
      })
    }
    
    // Also check for the specific page mentioned by the user
    console.log('\nChecking specific page ID: 1BrgDwXdqxJ08rMIoYfLjP')
    const specificPage = await client.fetch(`*[_id == "1BrgDwXdqxJ08rMIoYfLjP"][0]{
      _id,
      _type,
      title,
      slug,
      contentBlocks[]{
        _key,
        _type,
        _type == "heroWithCalculator" => {
          headline,
          subheadline
        }
      }
    }`)
    
    if (specificPage) {
      console.log('\nFound page with ID 1BrgDwXdqxJ08rMIoYfLjP:')
      console.log('Type:', specificPage._type)
      console.log('Title:', specificPage.title)
      console.log('Slug:', specificPage.slug?.current || 'No slug')
      console.log('\nContent blocks:')
      
      if (specificPage.contentBlocks) {
        specificPage.contentBlocks.forEach((block: any, index: number) => {
          console.log(`${index + 1}. Type: ${block._type}, Key: ${block._key}`)
          if (block._type === 'heroWithCalculator') {
            console.log('   - Headline:', block.headline || 'EMPTY')
            console.log('   - Subheadline:', block.subheadline || 'EMPTY')
          }
        })
      }
    } else {
      console.log('\nNo page found with ID 1BrgDwXdqxJ08rMIoYfLjP')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the script
checkHomepageStructure()