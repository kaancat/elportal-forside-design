import dotenv from 'dotenv'
import { createClient } from '@sanity/client'

dotenv.config()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'yxesi03x'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.SANITY_API_VERSION || '2025-01-01'
const token = process.env.SANITY_API_TOKEN

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

async function main() {
  const page = await client.fetch(`*[_type == "page" && isHomepage == true][0]{ _id, title, contentBlocks[]{ _type, _key } }`)
  console.log('Homepage ID:', page?._id)
  console.log('Homepage title:', page?.title)
  console.log('Blocks:', Array.isArray(page?.contentBlocks) ? page.contentBlocks.map((b:any)=>b._type) : null)
}

main().catch(e=>{ console.error(e); process.exit(1) })

