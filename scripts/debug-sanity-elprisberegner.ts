import { createClient } from '@sanity/client'

async function main() {
  const projectId = process.env.SANITY_PROJECT_ID || 'yxesi03x'
  const dataset = process.env.SANITY_DATASET || 'production'
  const token = process.env.SANITY_API_TOKEN
  if (!token) throw new Error('SANITY_API_TOKEN required')
  const client = createClient({ projectId, dataset, apiVersion: '2025-01-01', token, useCdn: false })
  const slug = 'elprisberegner'
  const query = `*[_type == "page" && slug.current == $slug][0]{
    title,
    contentBlocks[]{
      _type,_key,title,subtitle,headerAlignment,displayMode,showCategories,
      tips[]{_key,title,category,shortDescription,description}
    }
  }`
  const res = await client.fetch(query, { slug })
  console.log(JSON.stringify(res, null, 2))
}

main().catch(err => { console.error(err); process.exit(1) })

