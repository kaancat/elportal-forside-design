import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Create Sanity client
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

// Fetch specific problematic sections
async function fetchProblematicSections() {
  console.log('Fetching problematic sections from Sanity...\n')
  
  // Query for pages and extract specific block types
  const query = `{
    "prognoser": *[_type == "page" && slug.current == "prognoser"][0]{
      "infoCardsSection": contentBlocks[_type == "infoCardsSection"][0],
      "valueProposition": contentBlocks[_type == "valueProposition"][0],
      "hero": contentBlocks[_type == "hero"][0]
    },
    "elprisberegner": *[_type == "page" && slug.current == "elprisberegner"][0]{
      "infoCardsSection": contentBlocks[_type == "infoCardsSection"][0],
      "valueProposition": contentBlocks[_type == "valueProposition"][0],
      "heroWithCalculator": contentBlocks[_type == "heroWithCalculator"][0],
      "featureList": contentBlocks[_type == "featureList"][0]
    }
  }`
  
  try {
    const data = await client.fetch(query)
    
    // Save raw data to file
    const outputPath = path.join(__dirname, 'raw-sanity-data.json')
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
    console.log(`Raw data saved to: ${outputPath}`)
    
    // Analyze the data
    console.log('\n=== PROGNOSER PAGE ===\n')
    
    if (data.prognoser?.infoCardsSection) {
      console.log('InfoCardsSection Structure:')
      console.log(JSON.stringify(data.prognoser.infoCardsSection, null, 2))
    }
    
    if (data.prognoser?.valueProposition) {
      console.log('\nValueProposition Structure:')
      console.log(JSON.stringify(data.prognoser.valueProposition, null, 2))
    }
    
    console.log('\n=== ELPRISBEREGNER PAGE ===\n')
    
    if (data.elprisberegner?.infoCardsSection) {
      console.log('InfoCardsSection Structure:')
      console.log(JSON.stringify(data.elprisberegner.infoCardsSection, null, 2))
    }
    
    if (data.elprisberegner?.valueProposition) {
      console.log('\nValueProposition Structure:')
      console.log(JSON.stringify(data.elprisberegner.valueProposition, null, 2))
    }
    
    if (data.elprisberegner?.featureList) {
      console.log('\nFeatureList Structure (for comparison - this works):')
      console.log(JSON.stringify(data.elprisberegner.featureList, null, 2))
    }
    
    // Check icon structures
    console.log('\n=== ICON STRUCTURE COMPARISON ===\n')
    
    // Get first icon from each component type
    const infoCardIcon = data.prognoser?.infoCardsSection?.cards?.[0]?.icon
    const featureIcon = data.elprisberegner?.featureList?.features?.[0]?.icon
    const valueIcon = data.elprisberegner?.valueProposition?.valueItems?.[0]?.icon
    
    console.log('InfoCard Icon:', JSON.stringify(infoCardIcon, null, 2))
    console.log('\nFeatureList Icon (working):', JSON.stringify(featureIcon, null, 2))
    console.log('\nValueProposition Icon:', JSON.stringify(valueIcon, null, 2))
    
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Also fetch the actual schema definitions
async function fetchSchemaInfo() {
  console.log('\n\n=== SCHEMA INFORMATION ===\n')
  
  // Query to understand the schema structure
  const schemaQuery = `{
    "infoCardsSectionSchema": *[_type == "sanity.schema" && name == "infoCardsSection"][0],
    "sampleInfoCard": *[_type == "infoCardsSection"][0]{
      ...,
      cards[0]
    }
  }`
  
  try {
    const schemaData = await client.fetch(schemaQuery)
    console.log('Schema Data:', JSON.stringify(schemaData, null, 2))
  } catch (error) {
    console.log('Could not fetch schema information (this is normal)')
  }
}

async function main() {
  await fetchProblematicSections()
  await fetchSchemaInfo()
}

main().catch(console.error)