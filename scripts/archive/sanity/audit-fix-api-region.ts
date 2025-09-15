/*
 Audits Sanity content for price-related blocks with missing/invalid region and optionally fixes them.
 Usage:
   PREVIEW_URL=... SANITY_PROJECT_ID=... SANITY_DATASET=... SANITY_API_TOKEN=... npx -y tsx scripts/sanity/audit-fix-api-region.ts --fix
   or run without --fix to do a dry run.
*/
import { createClient } from '@sanity/client'

interface BlockBase { _type: string; _key: string; region?: string | null }

const PROJECT_ID = process.env.SANITY_PROJECT_ID
const DATASET = process.env.SANITY_DATASET || 'production'
const TOKEN = process.env.SANITY_API_TOKEN

if (!PROJECT_ID) {
  console.error('Missing SANITY_PROJECT_ID env var')
  process.exit(1)
}
if (!TOKEN) {
  console.error('Missing SANITY_API_TOKEN env var (required to apply fixes)')
  process.exit(1)
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2025-01-01',
  token: TOKEN,
  useCdn: false,
})

const TARGET_TYPES = ['livePriceGraph', 'dailyPriceTimeline', 'renewableEnergyForecast', 'realPriceComparisonTable']
const isValidRegion = (r: any) => r === 'DK1' || r === 'DK2'

async function run() {
  const fix = process.argv.includes('--fix')
  const pages = await client.fetch<any[]>(`*[_type == "page" && defined(contentBlocks)]{ _id, title, contentBlocks[] }`)

  let invalidBlocks: Array<{ docId: string; title: string; block: BlockBase }> = []
  for (const p of pages) {
    const blocks: BlockBase[] = (p.contentBlocks || []).filter((b: any) => TARGET_TYPES.includes(b._type))
    for (const b of blocks) {
      // Some blocks might not have a region field; treat as invalid
      if (!isValidRegion((b as any).region)) {
        invalidBlocks.push({ docId: p._id, title: p.title, block: b })
      }
    }
  }

  console.log(`Found ${invalidBlocks.length} block(s) with missing/invalid region across ${pages.length} page(s).`)
  for (const it of invalidBlocks.slice(0, 30)) {
    console.log(` - ${it.title || it.docId} :: ${it.block._type} [_key=${it.block._key}] region=${(it.block as any).region}`)
  }
  if (invalidBlocks.length > 30) {
    console.log(` ... and ${invalidBlocks.length - 30} more`)
  }

  if (!fix) return

  // Apply fixes: set region to 'DK2' by default
  const tx = client.transaction()
  for (const it of invalidBlocks) {
    tx.patch(it.docId, (p) => p.set({ [`contentBlocks[_key=="${it.block._key}"].region`]: 'DK2' }))
  }
  if (invalidBlocks.length) {
    await tx.commit()
    console.log(`Patched ${invalidBlocks.length} block(s) to region='DK2'`)
  } else {
    console.log('Nothing to patch')
  }
}

run().catch((e) => { console.error(e); process.exit(1) })

