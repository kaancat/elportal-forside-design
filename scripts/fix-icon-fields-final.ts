import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function fixIconFields() {
  try {
    console.log('Fixing icon fields in Ladeboks page...\n')
    
    const currentPage = await client.getDocument('page.ladeboks')
    
    if (!currentPage) {
      console.error('Page not found!')
      return
    }

    // Fix content blocks
    const fixedContentBlocks = currentPage.contentBlocks?.map((block: any) => {
      if (block._type === 'valueProposition' && block.items) {
        console.log(`Fixing valueProposition icons...`)
        
        // Remove string icons, keep only heading and description
        const fixedItems = block.items.map((item: any) => ({
          _type: 'valueItem',
          _key: item._key,
          // Remove icon field completely - user will add manually
          heading: item.heading,
          description: item.description
        }))

        return {
          ...block,
          items: fixedItems
        }
      }
      return block
    })

    const fixedPage = {
      ...currentPage,
      contentBlocks: fixedContentBlocks
    }

    console.log('Updating page with cleaned icon fields...')
    const result = await client.createOrReplace(fixedPage)
    
    console.log('✅ Icon fields cleaned successfully!')
    console.log('Page ID:', result._id)
    console.log('\n📝 Next steps:')
    console.log('1. Go to Sanity Studio: https://dinelportal.sanity.studio/structure/page;page.ladeboks')
    console.log('2. Edit the value proposition section')
    console.log('3. Select appropriate icons for each value item')
    console.log('4. The validation errors should now be gone!')

  } catch (error) {
    console.error('❌ Error fixing icon fields:', error)
    if (error.response) {
      console.error('Response details:', error.response.body)
    }
  }
}

fixIconFields()