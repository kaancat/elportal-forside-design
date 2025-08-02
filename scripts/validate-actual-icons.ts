import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function main() {
  console.log('🔍 Validating actual icon.manager objects...\n')
  
  // Query for all icon.manager objects
  const query = `*[defined(@[].icon._type) || defined(@[][].icon._type)] {
    _id,
    _type,
    "icons": [...@[].icon[_type == "icon.manager"], ...@[][].icon[_type == "icon.manager"]],
    "cardIcons": @[].cards[].icon[_type == "icon.manager"],
    "valueIcons": @[].valueItems[].icon[_type == "icon.manager"],
    "featureIcons": @[].features[].icon[_type == "icon.manager"]
  }`
  
  const results = await client.fetch(query)
  
  let totalIcons = 0
  let validIcons = 0
  let issues: any[] = []
  
  results.forEach((doc: any) => {
    const allIcons = [
      ...(doc.icons || []),
      ...(doc.cardIcons || []),
      ...(doc.valueIcons || []),
      ...(doc.featureIcons || [])
    ]
    
    allIcons.forEach((icon: any, idx: number) => {
      totalIcons++
      
      const problems = []
      if (!icon.metadata?.size?.width) problems.push('Missing metadata.size.width')
      if (!icon.metadata?.size?.height) problems.push('Missing metadata.size.height')
      if (!icon.metadata?.iconName) problems.push('Missing metadata.iconName')
      
      if (problems.length === 0) {
        validIcons++
      } else {
        issues.push({
          docId: doc._id,
          docType: doc._type,
          problems: problems.join(', ')
        })
      }
    })
  })
  
  console.log(`✅ Found ${totalIcons} icon.manager objects`)
  console.log(`✅ ${validIcons} are properly formatted`)
  
  if (issues.length > 0) {
    console.log(`\n⚠️  ${issues.length} icons have issues:`)
    issues.slice(0, 5).forEach(issue => {
      console.log(`  - ${issue.docType} (${issue.docId}): ${issue.problems}`)
    })
  } else {
    console.log('\n🎉 All icon.manager objects are properly structured!')
    console.log('✅ No remnants of previous implementations found.')
  }
  
  // Check for any string icons in icon fields
  const stringIconQuery = `*[defined(@[].icon) || defined(@[][].icon)] {
    _id,
    _type,
    "stringIcons": [...@[].icon[_type == null], ...@[][].icon[_type == null]]
  }`
  
  const stringResults = await client.fetch(stringIconQuery)
  const docsWithStringIcons = stringResults.filter((doc: any) => doc.stringIcons?.length > 0)
  
  if (docsWithStringIcons.length > 0) {
    console.log(`\n⚠️  Found ${docsWithStringIcons.length} documents with string icons`)
  } else {
    console.log('\n✅ No string icons found in icon fields')
  }
}

main().catch(console.error)