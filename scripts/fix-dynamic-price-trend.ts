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

// Mock function to get current average price
// In production, this would fetch from your price API
async function getCurrentAveragePrice(): Promise<number> {
  // TODO: Replace with actual API call to get current average price
  // For now, returning a realistic average for 2025
  return 0.38 // kr/kWh
}

async function updateDynamicPriceTrend() {
  try {
    console.log('Fetching historiske-priser page...')
    
    // Fetch the page
    const page = await client.fetch(`*[_id == "qgCxJyBbKpvhb2oGYjlhjr"][0]`)
    if (!page) {
      console.error('historiske-priser page not found')
      return
    }

    // Get current year and average price
    const currentYear = new Date().getFullYear()
    const averagePrice = await getCurrentAveragePrice()
    
    console.log(`Current year: ${currentYear}`)
    console.log(`Current average price: ${averagePrice} kr/kWh`)

    // Find the noegletal-section
    const noegletialIndex = page.contentBlocks.findIndex(
      (block: any) => block._key === 'noegletal-section'
    )

    if (noegletialIndex === -1) {
      console.error('noegletal-section not found')
      return
    }

    const noegletialSection = page.contentBlocks[noegletialIndex]
    
    // Update the content to make the price trend dynamic
    const updatedContent = noegletialSection.content.map((block: any) => {
      if (block._type === 'block' && block.children?.[0]?.text?.includes('Aktuel pristendens')) {
        // Update the price trend text with current year and average
        const newText = `Aktuel pristendens ${currentYear}: ${averagePrice.toFixed(2)} kr/kWh`
        
        return {
          ...block,
          children: [
            {
              ...block.children[0],
              text: newText
            }
          ]
        }
      }
      return block
    })

    // Also update the content to be more visually prominent
    const enhancedContent = [
      {
        _key: 'k9gln8',
        _type: 'block',
        children: [
          {
            _key: 'l2kvt',
            _type: 'span',
            marks: ['strong'],
            text: '📊 Vigtige Nøgletal for Elmarkedet'
          }
        ],
        markDefs: [],
        style: 'normal'
      },
      {
        _key: 'xdgc3h',
        _type: 'block',
        children: [{ _key: 'eq6vog', _type: 'span', marks: [], text: '' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _key: 'ksbam-dynamic',
        _type: 'block',
        children: [
          {
            _key: 'f41wb-dynamic',
            _type: 'span',
            marks: ['strong'],
            text: `📈 Aktuel pristendens ${currentYear}: ${averagePrice.toFixed(2)} kr/kWh`
          }
        ],
        markDefs: [],
        style: 'h3' // Make it stand out as a heading
      },
      {
        _key: '4h2lmm',
        _type: 'block',
        children: [
          {
            _key: 'bdb0pm',
            _type: 'span',
            marks: [],
            text: 'Priserne er faldet markant fra energikrisens højdepunkt i 2022.'
          }
        ],
        markDefs: [],
        style: 'normal'
      },
      {
        _key: '3kov9b',
        _type: 'block',
        children: [{ _key: 'tj9vdt', _type: 'span', marks: [], text: '' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _key: '5huo5',
        _type: 'block',
        children: [
          {
            _key: 'm6oa0h',
            _type: 'span',
            marks: [],
            text: `Vindkraftproduktion har nået rekordniveauer i ${currentYear}, hvilket driver priserne ned i vindrige perioder. Negative priser forekommer nu regelmæssigt - over 300 timer i ${currentYear}.`
          }
        ],
        markDefs: [],
        style: 'normal'
      },
      {
        _key: 'zxnom',
        _type: 'block',
        children: [{ _key: 'dglso', _type: 'span', marks: [], text: '' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _key: 'ozpxzf',
        _type: 'block',
        children: [
          {
            _key: 'xtwgp7',
            _type: 'span',
            marks: [],
            text: 'Den grønne omstilling betyder mere ustabile priser, men generelt lavere gennemsnit. Smart forbrug kan udnytte de billigste timer.'
          }
        ],
        markDefs: [],
        style: 'normal'
      }
    ]

    // Update the contentBlocks
    const updatedContentBlocks = [...page.contentBlocks]
    updatedContentBlocks[noegletialIndex] = {
      ...noegletialSection,
      content: enhancedContent
    }

    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit()

    console.log('✅ Dynamic price trend updated successfully!')
    console.log(`- Year: ${currentYear}`)
    console.log(`- Average price: ${averagePrice.toFixed(2)} kr/kWh`)
    console.log('- Made price trend visually prominent with h3 style and emoji')

  } catch (error) {
    console.error('Error updating dynamic price trend:', error)
  }
}

// Run the update
updateDynamicPriceTrend()