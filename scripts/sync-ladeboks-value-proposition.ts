import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function syncLadeboksValueProposition() {
  console.log('🔍 Syncing Value Proposition Box for Ladeboks page...\n')

  try {
    // First, let's check the current state in Sanity
    const query = `*[_type == "page" && slug.current == "ladeboks"][0] {
      _id,
      _rev,
      title,
      "valuePropositions": contentBlocks[_type == "valueProposition"] {
        _key,
        _type,
        heading,
        subheading,
        content,
        valueItems[] {
          _key,
          heading,
          description,
          icon
        },
        // Check deprecated fields too
        title,
        items[] {
          _key,
          heading,
          title,
          text,
          description,
          icon
        },
        propositions
      }
    }`

    const page = await client.fetch(query)
    
    if (!page) {
      console.error('❌ Ladeboks page not found!')
      return
    }

    console.log('📄 Current page details:')
    console.log(`- ID: ${page._id}`)
    console.log(`- Title: ${page.title}`)
    console.log(`- Value Propositions found: ${page.valuePropositions.length}`)
    
    // The expected content based on what should be shown on frontend
    const expectedValueItems = [
      {
        _key: 'item1',
        heading: 'Spar op til 60%',
        description: 'Få de laveste priser på opladning hjemme med vores dynamiske eltariffer'
      },
      {
        _key: 'item2',
        heading: 'Smart styring',
        description: 'Lad automatisk, når strømmen er billigst og grønnest'
      },
      {
        _key: 'item3',
        heading: 'Fuld kontrol',
        description: 'Styr og overvåg din opladning direkte fra din telefon'
      },
      {
        _key: 'item4',
        heading: 'Miljøvenlig kørsel',
        description: 'Prioritér grøn strøm og reducer dit CO2-aftryk'
      }
    ]

    // Check if we have a value proposition block with missing valueItems
    let needsUpdate = false
    const updates: any[] = []

    for (const vp of page.valuePropositions) {
      console.log(`\n📦 Checking Value Proposition block ${vp._key}:`)
      console.log(`- Heading: ${vp.heading || vp.title || 'Not set'}`)
      console.log(`- Subheading: ${vp.subheading || 'Not set'}`)
      console.log(`- Has valueItems: ${vp.valueItems?.length > 0 ? `Yes (${vp.valueItems.length})` : 'No'}`)
      console.log(`- Has legacy items: ${vp.items?.length > 0 ? `Yes (${vp.items.length})` : 'No'}`)
      console.log(`- Has propositions: ${vp.propositions?.length > 0 ? `Yes (${vp.propositions.length})` : 'No'}`)

      // If valueItems is empty but we have legacy data, or if it needs to be synced
      if (!vp.valueItems || vp.valueItems.length === 0) {
        needsUpdate = true
        
        // Find the index of this block in contentBlocks
        const blockQuery = `*[_type == "page" && _id == $id][0].contentBlocks`
        const contentBlocks = await client.fetch(blockQuery, { id: page._id })
        const blockIndex = contentBlocks.findIndex((b: any) => b._key === vp._key)
        
        if (blockIndex === -1) {
          console.error(`❌ Could not find block with key ${vp._key}`)
          continue
        }

        const updatePath = `contentBlocks[${blockIndex}]`
        
        // Prepare the complete block update
        const updatedBlock = {
          _type: 'valueProposition',
          _key: vp._key,
          heading: vp.heading || vp.title || 'Derfor skal du vælge en ladeboks',
          subheading: vp.subheading || 'Oplev fordelene ved smart opladning derhjemme',
          content: vp.content || [
            {
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  text: 'Med en ladeboks fra Din Elportal får du ikke bare en opladningsløsning - du får et komplet system, der optimerer din opladning og sparer dig penge hver dag.'
                }
              ]
            }
          ],
          valueItems: expectedValueItems
        }

        updates.push({
          path: updatePath,
          value: updatedBlock
        })

        console.log(`\n✅ Prepared update for block ${vp._key}`)
      }
    }

    if (needsUpdate && updates.length > 0) {
      console.log(`\n🔄 Applying ${updates.length} updates...`)
      
      // Apply updates using patch
      await client
        .patch(page._id)
        .set(updates.reduce((acc, update) => {
          acc[update.path] = update.value
          return acc
        }, {}))
        .commit()

      console.log('✅ Updates applied successfully!')

      // Verify the update
      const verifyQuery = `*[_type == "page" && slug.current == "ladeboks"][0] {
        "valuePropositions": contentBlocks[_type == "valueProposition"] {
          _key,
          heading,
          subheading,
          "valueItemsCount": count(valueItems),
          valueItems[] {
            heading,
            description
          }
        }
      }`

      const verified = await client.fetch(verifyQuery)
      console.log('\n📋 Verification:')
      for (const vp of verified.valuePropositions) {
        console.log(`- Block ${vp._key}: ${vp.valueItemsCount} value items`)
        if (vp.valueItems) {
          vp.valueItems.forEach((item: any, idx: number) => {
            console.log(`  ${idx + 1}. ${item.heading}`)
          })
        }
      }
    } else {
      console.log('\n✅ No updates needed - Value Proposition data appears to be correctly set')
      
      // Show current data
      for (const vp of page.valuePropositions) {
        if (vp.valueItems && vp.valueItems.length > 0) {
          console.log(`\nCurrent valueItems in block ${vp._key}:`)
          vp.valueItems.forEach((item: any, idx: number) => {
            console.log(`  ${idx + 1}. ${item.heading}: ${item.description}`)
          })
        }
      }
    }

    // Final check - let's also verify what the frontend would see
    console.log('\n🔍 Testing frontend query...')
    const frontendQuery = `*[_type == "page" && slug.current == "ladeboks"][0] {
      contentBlocks[] {
        _type == "valueProposition" => {
          _key,
          _type,
          heading,
          subheading,
          content,
          valueItems[]{
            _key,
            heading,
            description,
            icon
          }
        }
      }
    }`

    const frontendData = await client.fetch(frontendQuery)
    const vpBlocks = frontendData?.contentBlocks?.filter((b: any) => b._type === 'valueProposition') || []
    
    console.log(`\n📱 Frontend would see ${vpBlocks.length} Value Proposition blocks`)
    vpBlocks.forEach((vp: any) => {
      console.log(`- Block ${vp._key}: ${vp.valueItems?.length || 0} items`)
    })

    console.log('\n✅ Sync process completed!')
    console.log('\n💡 Note: Icons need to be added manually in Sanity Studio using the icon.manager field')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the sync
syncLadeboksValueProposition()