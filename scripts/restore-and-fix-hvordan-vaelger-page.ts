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

// The original features that were lost
const originalFeatures = [
  {
    "_key": "ss1q6hzmro",
    "_type": "featureItem",
    "description": "Forstå forskellen mellem spotpris, fastpris og hybrid-modeller. Vælg den model der passer til din risikovillighed og forbrugsmønster.",
    "icon": {
      "_type": "icon.manager",
      "name": "circleEuro",
      "provider": "hi",
      "svg": "<svg stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" viewBox=\"0 0 24 24\" height=\"1em\" width=\"1em\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"none\" stroke-width=\"2\" d=\"M12,23 C18.0751322,23 23,18.0751322 23,12 C23,5.92486775 18.0751322,1 12,1 C5.92486775,1 1,5.92486775 1,12 C1,18.0751322 5.92486775,23 12,23 Z M6,8 L13,8 M6,12 L13,12 M15,16 C15,16 13.0611501,17 11.5,17 C9,17 7.5,15 7.5,12 C7.5,9 9,7 11.5,7 C13.0611501,7 15,8 15,8\"></path></svg>"
    },
    "title": "Pris og prismodeller"
  },
  {
    "_key": "6nvsnmo6c3d",
    "_type": "featureItem",
    "description": "Check bindingsperioder, opsigelsesvarsel og gebyrer. Vælg fleksible løsninger der giver dig frihed til at skifte.",
    "icon": {
      "_type": "icon.manager",
      "name": "contract",
      "provider": "fi",
      "svg": "<svg stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" viewBox=\"0 0 24 24\" height=\"1em\" width=\"1em\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z\"></path></svg>"
    },
    "title": "Kontraktvilkår og binding"
  },
  {
    "_key": "amf4bq2h14",
    "_type": "featureItem",
    "description": "Vælg leverandører med certificeret vedvarende energi. Støt den grønne omstilling med vindstrøm eller solenergi.",
    "icon": {
      "_type": "icon.manager",
      "name": "leaf",
      "provider": "fa",
      "svg": "<svg stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" viewBox=\"0 0 512 512\" height=\"1em\" width=\"1em\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.3 5.4c-25.9 5.9-49.9 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z\"></path></svg>"
    },
    "title": "Grøn energi"
  },
  {
    "_key": "ublqro4a4aq",
    "_type": "featureItem",
    "description": "God support sparer dig frustrationer. Vælg leverandører med dansk kundeservice og gode digitale løsninger.",
    "icon": {
      "_type": "icon.manager",
      "name": "headset",
      "provider": "fi",
      "svg": "<svg stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" viewBox=\"0 0 24 24\" height=\"1em\" width=\"1em\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M20 12v-1.707c0-4.442-3.479-8.161-7.755-8.29-2.204-.051-4.251.736-5.816 2.256A7.933 7.933 0 0 0 4 10v2c-1.103 0-2 .897-2 2v4c0 1.103.897 2 2 2h2V10a5.95 5.95 0 0 1 1.821-4.306 5.977 5.977 0 0 1 4.363-1.691C15.392 4.099 18 6.921 18 10.293V20h2c1.103 0 2-.897 2-2v-4c0-1.103-.897-2-2-2z\"></path><path d=\"M7 12h2v8H7zm8 0h2v8h-2z\"></path></svg>"
    },
    "title": "Kundeservice"
  }
]

// Value items for the value proposition
const valuePropositionItems = [
  {
    "_key": "vp1",
    "_type": "valueItem",
    "heading": "Uvildig sammenligning",
    "description": "Vi viser alle leverandører transparent og giver dig det fulde overblik",
    "icon": {
      "_type": "icon.manager",
      "name": "balance",
      "provider": "fa",
      "svg": "<svg stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" viewBox=\"0 0 640 512\" height=\"1em\" width=\"1em\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M554.9 154.5c-17.62-35.25-68.12-35.38-85.87 0c-87 174.3-84.1 165.9-84.1 181.5c0 44.13 57.25 80 128 80s127.1-35.88 127.1-80C639.1 319.9 641.4 327.3 554.9 154.5zM439.1 320l71.96-144l72.17 144H439.1zM256 336c0-16.12 1.375-8.75-85.12-181.5c-17.62-35.25-68.12-35.38-85.87 0c-87 174.3-84.1 165.9-84.1 181.5c0 44.13 57.25 80 127.1 80S256 380.1 256 336zM127.9 176L200.1 320H55.96L127.9 176zM495.1 448h-143.1V153.3C375.5 143 393.1 121.8 398.4 96h113.6c17.67 0 31.1-14.33 31.1-32s-14.33-32-31.1-32h-128.4c-14.62-19.38-37.5-32-63.62-32S270.1 12.62 256.4 32H128C110.3 32 96 46.33 96 64S110.3 96 127.1 96h113.6c5.25 25.75 22.87 47 46.37 57.25V448H144c-26.51 0-48.01 21.49-48.01 48c0 8.836 7.165 16 16 16h416c8.836 0 16-7.164 16-16C544 469.5 522.5 448 495.1 448z\"></path></svg>"
    }
  },
  {
    "_key": "vp2",
    "_type": "valueItem",
    "heading": "Realtidsdata",
    "description": "Se aktuelle elpriser og prognoser direkte fra de officielle kilder",
    "icon": {
      "_type": "icon.manager",
      "name": "chart",
      "provider": "fi",
      "svg": "<svg stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" viewBox=\"0 0 24 24\" height=\"1em\" width=\"1em\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M3 3v18h18v-2H5V3H3z\"></path><path d=\"M19 10h2v3h-2zm-5-5h2v10h-2zm-5 8h2v5H9z\"></path></svg>"
    }
  },
  {
    "_key": "vp3",
    "_type": "valueItem",
    "heading": "Personlig beregning",
    "description": "Få præcise prisoverslag baseret på dit faktiske forbrug",
    "icon": {
      "_type": "icon.manager",
      "name": "calculator",
      "provider": "fi",
      "svg": "<svg stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" viewBox=\"0 0 24 24\" height=\"1em\" width=\"1em\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M19 2H5c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zM5 20V4h14l.001 16H5z\"></path><path d=\"M7 12h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zM7 6h10v4H7zm4 10h2v2h-2zm4-4h2v6h-2z\"></path></svg>"
    }
  },
  {
    "_key": "vp4",
    "_type": "valueItem",
    "heading": "Gratis og uafhængig",
    "description": "ElPortal er 100% gratis at bruge og helt uafhængig af leverandørerne",
    "icon": {
      "_type": "icon.manager",
      "name": "shield",
      "provider": "fi",
      "svg": "<svg stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" viewBox=\"0 0 24 24\" height=\"1em\" width=\"1em\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M20.995 6.9a.998.998 0 0 0-.548-.795l-8-4a1 1 0 0 0-.895 0l-8 4a1.002 1.002 0 0 0-.547.795c-.011.107-.961 10.767 8.589 15.014a.987.987 0 0 0 .812 0c9.55-4.247 8.6-14.906 8.589-15.014zM12 19.897C5.231 16.625 4.911 9.642 4.966 7.635L12 4.118l7.029 3.515c.037 1.989-.328 9.018-7.029 12.264z\"></path><path d=\"m11 12.586-2.293-2.293-1.414 1.414L11 15.414l5.707-5.707-1.414-1.414z\"></path></svg>"
    }
  }
]

async function restoreAndFixPage() {
  const slug = 'hvordan-vaelger-du-elleverandoer'
  
  console.log(`\n🔧 Restoring and fixing page: ${slug}\n`)
  
  try {
    // First, get the page ID
    const pageQuery = `*[_type == "page" && slug.current == $slug][0]._id`
    const pageId = await client.fetch(pageQuery, { slug })
    
    if (!pageId) {
      console.log('❌ Page not found')
      return
    }
    
    console.log('✅ Page found with ID:', pageId)
    
    // Now, let's patch specific blocks
    console.log('\n📝 Fixing specific content blocks...')
    
    // Fix 1: Restore features to featureList (block index 3)
    console.log('\n1️⃣ Restoring features to featureList block...')
    const featureListPatch = await client
      .patch(pageId)
      .set({
        'contentBlocks[3].features': originalFeatures
      })
      .unset(['contentBlocks[3].headerAlignment', 'contentBlocks[3].items'])
      .commit()
    
    console.log('   ✅ Features restored and invalid fields removed')
    
    // Fix 2: Add valueItems to valueProposition (block index 8)
    console.log('\n2️⃣ Adding valueItems to valueProposition block...')
    const valuePropositionPatch = await client
      .patch(pageId)
      .set({
        'contentBlocks[8].valueItems': valuePropositionItems
      })
      .unset(['contentBlocks[8].items'])
      .commit()
    
    console.log('   ✅ ValueItems added')
    
    // Verify all fixes
    console.log('\n🔍 Verifying all fixes...')
    
    const verifyQuery = `*[_type == "page" && slug.current == $slug][0] {
      contentBlocks[] {
        _type == "featureList" => {
          _type,
          _key,
          title,
          subtitle,
          "featuresCount": count(features),
          "hasInvalidFields": defined(headerAlignment) || defined(items)
        },
        _type == "valueProposition" => {
          _type,
          _key,
          heading,
          subheading,
          "valueItemsCount": count(valueItems),
          "hasItems": defined(items)
        }
      }
    }`
    
    const verification = await client.fetch(verifyQuery, { slug })
    
    console.log('\n📊 Final Verification:')
    verification.contentBlocks
      .filter((b: any) => b._type === 'featureList' || b._type === 'valueProposition')
      .forEach((block: any) => {
        if (block._type === 'featureList') {
          console.log(`\n✅ FeatureList: "${block.title}"`)
          console.log(`   - Features count: ${block.featuresCount}`)
          console.log(`   - Has invalid fields: ${block.hasInvalidFields}`)
        }
        if (block._type === 'valueProposition') {
          console.log(`\n✅ ValueProposition: "${block.heading}"`)
          console.log(`   - ValueItems count: ${block.valueItemsCount}`)
          console.log(`   - Has items field: ${block.hasItems}`)
        }
      })
    
    console.log('\n🎉 Page successfully restored and fixed!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the restoration
restoreAndFixPage()