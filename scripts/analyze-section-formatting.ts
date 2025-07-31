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

async function analyzeSectionFormatting() {
  try {
    console.log('🔍 Analyzing section formatting patterns...\n')
    
    // Check a well-formatted page (e.g., elpriser)
    const elpriserPage = await client.fetch(`*[_type == "page" && slug.current == "elpriser"][0]{
      contentBlocks[_type == "pageSection"]{
        title,
        content[0...3]{
          _type,
          style,
          children[]{
            text,
            marks
          }
        }
      }
    }`)
    
    console.log('📄 Well-formatted sections from Elpriser page:\n')
    elpriserPage?.contentBlocks?.forEach((section: any, idx: number) => {
      if (section) {
        console.log(`Section ${idx + 1}: "${section.title}"`)
        section.content?.forEach((block: any, blockIdx: number) => {
          if (block._type === 'block') {
            console.log(`  Block ${blockIdx + 1}: style="${block.style || 'normal'}"`)
            const text = block.children?.map((child: any) => child.text).join('') || ''
            console.log(`  Text preview: "${text.substring(0, 50)}..."`)
            console.log(`  Has marks: ${block.children?.some((child: any) => child.marks?.length > 0) ? 'Yes' : 'No'}`)
          }
        })
        console.log('')
      }
    })
    
    // Now check the problematic homepage sections
    const homepage = await client.fetch(`*[_type == "homePage"][0]{
      contentBlocks[_type == "pageSection" && title in [
        "Sådan Bruger Du Grafen til at Spare Penge",
        "Live Elpriser Time for Time: Se Dagens Spotpriser Nu",
        "Hvad Koster Strømmen? Beregn Dit Elforbrug Her",
        "Få en Ladeboks og Oplad Din Elbil Billigere og Grønnere"
      ]]{
        _key,
        title,
        content[]{
          _type,
          _key,
          style,
          children[]{
            _key,
            text,
            marks
          },
          markDefs
        }
      }
    }`)
    
    console.log('\n📄 Current homepage sections that need fixing:\n')
    homepage?.contentBlocks?.forEach((section: any) => {
      if (section) {
        console.log(`Section: "${section.title}"`)
        console.log(`Content blocks: ${section.content?.length || 0}`)
        section.content?.forEach((block: any, idx: number) => {
          if (block._type === 'block') {
            console.log(`  Block ${idx + 1}: style="${block.style || 'normal'}"`)
            const hasCheckmark = block.children?.some((child: any) => 
              child.text?.includes('✅') || child.text?.includes('✓')
            )
            const hasX = block.children?.some((child: any) => 
              child.text?.includes('❌') || child.text?.includes('✗')
            )
            if (hasCheckmark || hasX) {
              console.log(`  Contains emoji/symbol: ${hasCheckmark ? '✅' : ''}${hasX ? '❌' : ''}`)
            }
          }
        })
        console.log('')
      }
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
analyzeSectionFormatting()