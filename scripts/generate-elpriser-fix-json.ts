import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2025-01-01'
})

async function generateElpriserFix() {
  const pageId = '1BrgDwXdqxJ08rMIoYfLjP'
  
  try {
    console.log('Generating fix JSON for elpriser page validation errors...')
    
    // Fetch current page
    const currentPage = await client.fetch(`*[_id == "${pageId}"][0]`)
    if (!currentPage) {
      console.error('Page not found!')
      return
    }

    console.log('\n=== MANUAL FIX INSTRUCTIONS ===')
    console.log('\n1. Go to Sanity Studio: https://dinelportal.sanity.studio')
    console.log('2. Navigate to Pages > "Elpriser 2025 - Find det billigste elselskab"')
    console.log('3. Apply these fixes:\n')

    console.log('=== FIX 1: Remove Fields ===')
    console.log('- Find and delete the "ogImage" field (if visible)')
    console.log('- Find and delete the "seo" field (deprecated field with description, keywords, etc.)')
    console.log('')

    console.log('=== FIX 2: Hero With Calculator ===')
    console.log('The Hero With Calculator block appears to be working correctly.')
    console.log('Current data:')
    console.log('- Title: "Elpriser 2025 - Find det billigste elselskab i dit område"')
    console.log('- Subtitle: "Sammenlign elpriser fra alle danske elselskaber..."')
    console.log('- Stats are present')
    console.log('')

    console.log('=== FIX 3: Value Proposition Box ===')
    console.log('Find the "Value Proposition" block titled "Hvorfor bruge DinElPortal?"')
    console.log('Add these fields at the top level:')
    console.log('\nHeading: "Din komplette løsning til elmarkedet"')
    console.log('Subheading: "Vi gør det nemt at spare penge på din elregning med fuld gennemsigtighed"')
    console.log('')
    console.log('Update each Value Item as follows:')
    console.log('')

    const valueItems = [
      {
        icon: 'lucide:piggy-bank',
        heading: 'Spar op til 3.000 kr. årligt',
        description: 'Find det billigste elselskab og reducer din elregning markant uden at gå på kompromis med kvaliteten.'
      },
      {
        icon: 'lucide:leaf',
        heading: '100% grøn strøm',
        description: 'Alle vores anbefalede leverandører tilbyder kun certificeret grøn strøm fra vindkraft og andre vedvarende energikilder.'
      },
      {
        icon: 'lucide:clock',
        heading: 'Skift på 5 minutter',
        description: 'Det er hurtigt og nemt at skifte elleverandør. Vi guider dig gennem hele processen, så du sparer tid og penge.'
      },
      {
        icon: 'lucide:shield-check',
        heading: 'Uvildig rådgivning',
        description: 'Vi viser alle leverandører på markedet og giver dig et komplet overblik, så du kan træffe det bedste valg.'
      },
      {
        icon: 'lucide:trending-up',
        heading: 'Følg elpriserne live',
        description: 'Se de aktuelle elpriser time for time og planlæg dit forbrug, når strømmen er billigst.'
      },
      {
        icon: 'lucide:users',
        heading: 'Over 50.000 brugere',
        description: 'Tusindvis af danskere har allerede sparet penge ved at bruge DinElPortal til at finde deres elleverandør.'
      }
    ]

    valueItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`)
      console.log(`- Icon: ${item.icon} (keep existing)`)
      console.log(`- Heading: "${item.heading}"`)
      console.log(`- Description: "${item.description}"`)
      console.log('')
    })

    console.log('=== ALTERNATIVE: Full JSON Replacement ===')
    console.log('If you prefer, here\'s the complete valueProposition block JSON:')
    console.log('')
    
    const valuePropositionBlock = {
      _type: 'valueProposition',
      _key: 'value-prop-1',
      title: 'Hvorfor bruge DinElPortal?',
      heading: 'Din komplette løsning til elmarkedet',
      subheading: 'Vi gør det nemt at spare penge på din elregning med fuld gennemsigtighed',
      items: valueItems.map((item, index) => ({
        _key: `value-${index + 1}`,
        _type: 'valueItem',
        icon: {
          _type: 'icon.manager',
          icon: item.icon,
          metadata: {
            iconName: item.icon,
            collectionId: 'lucide',
            collectionName: 'Lucide',
            size: { width: 20, height: 20 }
          }
        },
        heading: item.heading,
        description: item.description
      }))
    }

    console.log(JSON.stringify(valuePropositionBlock, null, 2))

  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the generator
generateElpriserFix()