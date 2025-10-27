/**
 * Script to verify Bornholm has been moved from DK1 to DK2 in Sanity CMS
 */

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'yxesi03x',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

async function verifyBornholmUpdate() {
    console.log('🔍 Checking regionalComparison blocks...\n');

    const query = `*[_type == "page" && defined(contentBlocks)] {
    _id,
    title,
    slug,
    "regionalBlocks": contentBlocks[_type == "regionalComparison"] {
      _key,
      dk1Features,
      dk2Features
    }
  }`;

    const pages = await client.fetch(query);

    for (const page of pages) {
        if (!page.regionalBlocks || page.regionalBlocks.length === 0) {
            continue;
        }

        console.log(`📄 Page: "${page.title}"`);
        console.log(`   Slug: ${page.slug?.current || 'N/A'}`);

        for (const block of page.regionalBlocks) {
            console.log(`\n   Block: ${block._key}`);
            console.log(`   DK1 Features: ${JSON.stringify(block.dk1Features || [])}`);
            console.log(`   DK2 Features: ${JSON.stringify(block.dk2Features || [])}`);

            if (block.dk1Features?.includes('Bornholm')) {
                console.log('   ⚠️  WARNING: Bornholm is still in DK1!');
            } else if (block.dk2Features?.includes('Bornholm')) {
                console.log('   ✅ Bornholm is correctly in DK2');
            } else {
                console.log('   ℹ️  Bornholm not found in either region');
            }
        }
        console.log('');
    }
}

verifyBornholmUpdate()
    .then(() => {
        console.log('✨ Verification complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });

