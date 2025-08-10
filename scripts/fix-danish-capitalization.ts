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

async function fixCapitalizationAndBranding() {
  console.log('Fixing Danish capitalization and branding...')

  // Get current page
  const currentPage = await client.fetch('*[_id == "f5IMbE4BjT3OYPNFYb8v2Z"][0]')
  
  if (!currentPage) {
    console.error('Page not found!')
    return
  }

  // Update content blocks with proper Danish capitalization and DinElPortal branding
  const updatedContentBlocks = currentPage.contentBlocks.map((block: any) => {
    // Hero section
    if (block._key === 'hero-forbrug-tracker') {
      return {
        ...block,
        headline: 'Dit personlige elforbrug - følg med i realtid',
        subheadline: 'Forbind sikkert med Eloverblik og få fuld kontrol over dit strømforbrug og omkostninger. Log ind med MitID og se præcis hvor meget strøm du bruger.'
      }
    }
    
    // Forbrug Tracker Widget
    if (block._key === 'forbrug-tracker-main') {
      return {
        ...block,
        title: 'Start din forbrug tracker nu'
      }
    }
    
    // Value Proposition
    if (block._key === 'benefits') {
      return {
        ...block,
        heading: 'Hvorfor bruge DinElPortals forbrug tracker?',
        valueItems: block.valueItems?.map((item: any) => {
          if (item._key === 'vi1') {
            return { ...item, heading: '100% sikker med MitID' }
          }
          if (item._key === 'vi2') {
            return { ...item, heading: 'Realtidsdata time for time' }
          }
          if (item._key === 'vi3') {
            return { ...item, heading: 'Præcise omkostningsberegninger' }
          }
          if (item._key === 'vi4') {
            return { ...item, heading: 'Find din besparelse' }
          }
          return item
        })
      }
    }
    
    // Smart consumption section
    if (block._key === 'smart-consumption') {
      return {
        ...block,
        title: 'Smart elforbrug - brug strøm når det er billigst',
        content: block.content?.map((content: any) => {
          if (content._key === 'smart-2') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'De dyreste timer' }]
            }
          }
          if (content._key === 'smart-4') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'De billigste timer' }]
            }
          }
          if (content._key === 'smart-6') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Automatisk styring' }]
            }
          }
          if (content._key === 'smart-8') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Typiske besparelser' }]
            }
          }
          return content
        })
      }
    }
    
    // Appliance consumption
    if (block._key === 'appliance-consumption') {
      return {
        ...block,
        title: 'Hvad bruger dine apparater?',
        content: block.content?.map((content: any) => {
          if (content._key === 'app-2') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Varmepumpe / elvarme' }]
            }
          }
          return content
        })
      }
    }
    
    // Live Price Graph
    if (block._key === 'live-prices') {
      return {
        ...block,
        title: 'Aktuelle elpriser time for time'
      }
    }
    
    // Understanding consumption
    if (block._key === 'understanding-consumption') {
      return {
        ...block,
        title: 'Forstå dit elforbrug og spar penge',
        content: block.content?.map((content: any) => {
          if (content._key === 'uc-2') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Spids- og lavlastperioder' }]
            }
          }
          if (content._key === 'uc-4') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Sæsonvariationer i dit forbrug' }]
            }
          }
          if (content._key === 'uc-6') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Typiske forbrugsmønstre' }]
            }
          }
          if (content._key === 'uc-8') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Konkrete sparetips' }]
            }
          }
          if (content._key === 'uc-10') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Smart home og automatisering' }]
            }
          }
          return content
        })
      }
    }
    
    // Provider List
    if (block._key === 'provider-comparison') {
      return {
        ...block,
        title: 'Sammenlign elselskaber baseret på dit faktiske forbrug'
      }
    }
    
    // Green Energy
    if (block._key === 'green-energy') {
      return {
        ...block,
        title: 'Grøn energi og dit CO2-aftryk',
        content: block.content?.map((content: any) => {
          if (content._key === 'green-2') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Vindkraftens rolle i Danmark' }]
            }
          }
          if (content._key === 'green-4') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Oprindelsesgarantier og grønne certifikater' }]
            }
          }
          if (content._key === 'green-6') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Dit personlige CO2-regnskab' }]
            }
          }
          if (content._key === 'green-8') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Danmarks klimamål 2030' }]
            }
          }
          // Update text mentioning ElPortal
          if (content._key === 'green-7' && content.children?.[0]?.text) {
            return {
              ...content,
              children: [{
                ...content.children[0],
                text: content.children[0].text.replace('ElPortals', 'DinElPortals')
              }]
            }
          }
          return content
        })
      }
    }
    
    // CO2 Chart
    if (block._key === 'co2-chart') {
      return {
        ...block,
        title: 'CO₂-udledning fra elforbrug lige nu',
        subtitle: 'Se hvor grøn strømmen er i dette øjeblik'
      }
    }
    
    // Regional differences
    if (block._key === 'regional-differences') {
      return {
        ...block,
        title: 'DK1 vs DK2: prisforskelle i Danmark',
        content: block.content?.map((content: any) => {
          if (content._key === 'region-2') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Hvorfor er der prisforskel?' }]
            }
          }
          if (content._key === 'region-4') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Typiske prisforskelle' }]
            }
          }
          if (content._key === 'region-6') {
            return {
              ...content,
              children: [{ ...content.children[0], text: 'Netselskaber og tariffer' }]
            }
          }
          return content
        })
      }
    }
    
    // FAQ
    if (block._key === 'faq') {
      return {
        ...block,
        title: 'Ofte stillede spørgsmål om forbrug tracker',
        faqItems: block.faqItems?.map((item: any) => {
          // Update FAQ items that mention ElPortal
          if (item._key === 'faq1' && item.answer?.[0]?.children?.[0]?.text) {
            return {
              ...item,
              answer: [{
                ...item.answer[0],
                children: [{
                  ...item.answer[0].children[0],
                  text: item.answer[0].children[0].text.replace('ElPortal', 'DinElPortal')
                }]
              }]
            }
          }
          if (item._key === 'faq2' && item.answer?.[0]?.children?.[0]?.text) {
            return {
              ...item,
              question: 'Hvordan giver jeg DinElPortal adgang til mine data?',
              answer: [{
                ...item.answer[0],
                children: [{
                  ...item.answer[0].children[0],
                  text: item.answer[0].children[0].text.replace('ElPortals', 'DinElPortals')
                }]
              }]
            }
          }
          if (item._key === 'faq3' && item.answer?.[0]?.children?.[0]?.text) {
            return {
              ...item,
              question: 'Hvilke data kan jeg se i forbrug tracker?'
            }
          }
          if (item._key === 'faq4' && item.answer?.[0]?.children?.[0]?.text) {
            return {
              ...item,
              question: 'Koster det noget at bruge forbrug tracker?'
            }
          }
          if (item._key === 'faq7' && item.answer?.[0]?.children?.[0]?.text) {
            return {
              ...item,
              question: 'Kan jeg bruge forbrug tracker hvis jeg bor til leje?'
            }
          }
          if (item._key === 'faq10' && item.answer?.[0]?.children?.[0]?.text) {
            return {
              ...item,
              answer: [{
                ...item.answer[0],
                children: [{
                  ...item.answer[0].children[0],
                  text: item.answer[0].children[0].text.replace('ElPortals Forbrug Tracker', 'DinElPortals forbrug tracker')
                }]
              }]
            }
          }
          if (item._key === 'faq12' && item.answer?.[0]?.children?.[0]?.text) {
            return {
              ...item,
              answer: [{
                ...item.answer[0],
                children: [{
                  ...item.answer[0].children[0],
                  text: item.answer[0].children[0].text.replace('ElPortal', 'DinElPortal')
                }]
              }]
            }
          }
          return item
        })
      }
    }
    
    return block
  })
  
  // Also update SEO metadata
  const updatedSeo = {
    ...currentPage.seo,
    metaTitle: 'Forbrug tracker - dit personlige elforbrug i realtid | DinElPortal',
    metaDescription: 'Forbind sikkert med Eloverblik via MitID. Se dit faktiske elforbrug time for time, beregn præcise omkostninger og find besparelser hos forskellige elleverandører.'
  }

  try {
    const result = await client.patch('f5IMbE4BjT3OYPNFYb8v2Z')
      .set({ 
        contentBlocks: updatedContentBlocks,
        seo: updatedSeo,
        title: 'Forbrug tracker'
      })
      .commit()
      
    console.log('✅ Danish capitalization and branding fixed successfully!')
    console.log('   - Changed all headlines to proper Danish capitalization')
    console.log('   - Changed ElPortal to DinElPortal throughout')
    console.log('   - Updated SEO metadata')
    console.log(`   View in Studio: https://dinelportal.sanity.studio/structure/page;f5IMbE4BjT3OYPNFYb8v2Z`)
    
    return result
  } catch (error) {
    console.error('❌ Failed to fix capitalization:', error)
    throw error
  }
}

// Run the fix
fixCapitalizationAndBranding()
  .then(() => {
    console.log('✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })