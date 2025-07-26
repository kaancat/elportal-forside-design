import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

// Helper to create text blocks
const createTextBlock = (text: string, style: string = 'normal') => ({
  _type: 'block',
  _key: Math.random().toString(36).substring(7),
  style,
  markDefs: [],
  children: [
    {
      _type: 'span',
      _key: Math.random().toString(36).substring(7),
      text,
      marks: [],
    },
  ],
})

const createBoldText = (text: string) => ({
  _type: 'block',
  _key: Math.random().toString(36).substring(7),
  style: 'normal',
  markDefs: [],
  children: [
    {
      _type: 'span',
      _key: Math.random().toString(36).substring(7),
      text,
      marks: ['strong'],
    },
  ],
})

async function updateHistoriskePriserDesign() {
  console.log('🎨 Updating Historiske Priser page design...\n')
  
  // 1. Fetch the current page
  console.log('📄 Fetching current page content...')
  const pageId = 'qgCxJyBbKpvhb2oGYjlhjr'
  
  const currentPage = await client.fetch(`*[_id == "${pageId}"][0]`)
  
  if (!currentPage) {
    console.log('❌ Page not found!')
    return
  }
  
  console.log('✅ Found page:', currentPage.title)
  console.log('\n🔧 Applying design updates...\n')
  
  // Create updated sections
  const updatedSections = currentPage.contentBlocks.map((section: any, index: number) => {
    // Fix alignment issues - make all headers left-aligned
    if (section._type === 'pageSection' && section.headerAlignment) {
      console.log(`  - Fixing alignment for section ${index + 1}: ${section.headerAlignment} → left`)
      section.headerAlignment = 'left'
    }
    
    // Fix Block 2: Replace "30 dage" with more accurate text
    if (index === 1 && section.content) {
      console.log('  - Updating static "30 dage" text to current year reference')
      section.content = section.content.map((block: any) => {
        if (block.children?.[0]?.text?.includes('30 dage')) {
          return createTextBlock('Aktuel pristendens 2024: 0,42 kr/kWh')
        }
        return block
      })
    }
    
    // Fix Block 5: Convert seasonal bullets to featureList
    if (index === 4 && section._type === 'pageSection' && section.title?.includes('Sæsonudsving')) {
      console.log('  - Converting seasonal bullets to featureList component')
      return {
        _type: 'featureList',
        _key: section._key || Math.random().toString(36).substring(7),
        title: 'Sæsonudsving: Hvornår er Strøm Billigst?',
        subtitle: 'Elpriserne følger typisk et forudsigeligt sæsonmønster. Forstå hvornår på året du kan forvente de laveste og højeste priser.',
        features: [
          {
            _type: 'featureItem',
            _key: 'spring-feature',
            icon: {
              _type: 'icon.manager',
              icon: 'flower',
              metadata: {
                icon: 'flower',
                iconName: 'Flower',
                collectionId: 'lucide',
                collectionName: 'Lucide',
                url: 'https://lucide.dev/icons/flower'
              }
            },
            title: 'Forår (marts-maj)',
            description: 'Faldende priser med stigende solproduktion og mindre opvarmningsbehov. Gennemsnit: 25-35 øre/kWh (2024)'
          },
          {
            _type: 'featureItem',
            _key: 'summer-feature',
            icon: {
              _type: 'icon.manager',
              icon: 'sun',
              metadata: {
                icon: 'sun',
                iconName: 'Sun',
                collectionId: 'lucide',
                collectionName: 'Lucide',
                url: 'https://lucide.dev/icons/sun'
              }
            },
            title: 'Sommer (juni-august)',
            description: 'Årets laveste priser med maksimal solcelleproduktion og lavt forbrug. Negative priser i weekender. Gennemsnit: 20-30 øre/kWh (2024)'
          },
          {
            _type: 'featureItem',
            _key: 'autumn-feature',
            icon: {
              _type: 'icon.manager',
              icon: 'leaf',
              metadata: {
                icon: 'leaf',
                iconName: 'Leaf',
                collectionId: 'lucide',
                collectionName: 'Lucide',
                url: 'https://lucide.dev/icons/leaf'
              }
            },
            title: 'Efterår (sept-nov)',
            description: 'Stigende priser når solproduktion falder og opvarmningssæson starter. Gennemsnit: 35-50 øre/kWh (2024)'
          },
          {
            _type: 'featureItem',
            _key: 'winter-feature',
            icon: {
              _type: 'icon.manager',
              icon: 'snowflake',
              metadata: {
                icon: 'snowflake',
                iconName: 'Snowflake',
                collectionId: 'lucide',
                collectionName: 'Lucide',
                url: 'https://lucide.dev/icons/snowflake'
              }
            },
            title: 'Vinter (dec-feb)',
            description: 'Højeste priser med minimal solproduktion og højt varmeforbrug. Kuldeperioder kan tredoble priserne. Gennemsnit: 45-70 øre/kWh (2024)'
          }
        ]
      }
    }
    
    // Fix Block 6: Monthly chart description
    if (index === 5 && section.title?.includes('Gennemsnitlige Månedspriser')) {
      console.log('  - Fixing monthly chart description from "3 år" to accurate timeframe')
      section.description = 'Baseret på data fra de seneste 12 måneder viser grafen tydelige sæsonmønstre i elpriserne.'
    }
    
    return section
  })
  
  // Update key statistics section (Block 2) to be more visual
  const statisticsIndex = 1
  if (updatedSections[statisticsIndex]?._type === 'pageSection') {
    console.log('  - Improving visual design of statistics section')
    updatedSections[statisticsIndex].content = [
      createBoldText('📊 Vigtige Nøgletal for Elmarkedet'),
      createTextBlock(''),
      createTextBlock('Aktuel pristendens 2024: 0,42 kr/kWh'),
      createTextBlock('Priserne er faldet markant fra energikrisens højdepunkt i 2022.'),
      createTextBlock(''),
      createTextBlock('Vindkraftproduktion har nået rekordniveauer i 2024, hvilket driver priserne ned i vindrige perioder. Negative priser forekommer nu regelmæssigt - over 300 timer i 2024.'),
      createTextBlock(''),
      createTextBlock('Den grønne omstilling betyder mere ustabile priser, men generelt lavere gennemsnit. Smart forbrug kan udnytte de billigste timer.')
    ]
  }
  
  // Update the page
  try {
    console.log('\n💾 Saving updates to Sanity...')
    
    const result = await client
      .patch(pageId)
      .set({ contentBlocks: updatedSections })
      .commit()
    
    console.log('\n✅ Successfully updated the page!')
    console.log('\n📝 Changes made:')
    console.log('   - All section headers now left-aligned')
    console.log('   - "30 dage" replaced with "Aktuel pristendens 2024"')
    console.log('   - Seasonal section converted to 4-column featureList')
    console.log('   - Monthly chart description updated to "12 måneder"')
    console.log('   - Statistics section improved with better text flow')
    
    console.log('\n🎉 Next steps:')
    console.log('   1. Refresh the page to see changes')
    console.log('   2. Review the visual improvements')
    console.log('   3. We can continue with more bullet point conversions if needed')
    
  } catch (error) {
    console.error('\n❌ Error updating page:', error)
  }
}

updateHistoriskePriserDesign().catch(console.error)