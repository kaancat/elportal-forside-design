/**
 * Script to move Bornholm from DK1 to DK2 in Sanity CMS
 * Updates all regionalComparison blocks on the homepage
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

async function updateBornholmRegion() {
    console.log('🔍 Finding regionalComparison blocks...');

    // Query for all pages with regionalComparison blocks
    const query = `*[_type == "page" && defined(contentBlocks)] {
    _id,
    title,
    "regionalBlocks": contentBlocks[_type == "regionalComparison"] {
      _key,
      dk1Features,
      dk2Features
    }
  }`;

    const pages = await client.fetch(query);
    console.log(`📄 Found ${pages.length} pages with potential regionalComparison blocks`);

    let updatesCount = 0;

    for (const page of pages) {
        if (!page.regionalBlocks || page.regionalBlocks.length === 0) {
            continue;
        }

        console.log(`\n📝 Processing page: "${page.title}" (${page._id})`);

        for (const block of page.regionalBlocks) {
            const { _key, dk1Features, dk2Features } = block;

            // Check if Bornholm is in DK1 features
            if (dk1Features && dk1Features.includes('Bornholm')) {
                console.log(`  ✓ Found Bornholm in DK1 features (block: ${_key})`);

                // Remove Bornholm from DK1
                const newDk1Features = dk1Features.filter((f: string) => f !== 'Bornholm');

                // Add Bornholm to DK2 if not already there
                const newDk2Features = dk2Features || [];
                if (!newDk2Features.includes('Bornholm')) {
                    newDk2Features.push('Bornholm');
                }

                // Update the specific block within the contentBlocks array
                const patch = client
                    .patch(page._id)
                    .set({
                        [`contentBlocks[_key=="${_key}"].dk1Features`]: newDk1Features,
                        [`contentBlocks[_key=="${_key}"].dk2Features`]: newDk2Features,
                    });

                console.log(`  📝 Updating block ${_key}...`);
                console.log(`    DK1 features: ${JSON.stringify(newDk1Features)}`);
                console.log(`    DK2 features: ${JSON.stringify(newDk2Features)}`);

                await patch.commit();
                updatesCount++;
                console.log(`  ✅ Updated successfully!`);
            } else {
                console.log(`  ℹ️  Block ${_key} doesn't have Bornholm in DK1 (skipping)`);
            }
        }
    }

    console.log(`\n✨ Done! Updated ${updatesCount} block(s)`);
}

// Run the script
updateBornholmRegion()
    .then(() => {
        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error during migration:', error);
        process.exit(1);
    });

