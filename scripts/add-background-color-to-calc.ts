/**
 * Script to add backgroundColor field to existing PriceCalculator blocks
 * This adds the field to the content documents (works immediately)
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

async function addBackgroundColorField() {
  console.log('🔍 Finding pages with PriceCalculator blocks...');

  // Query for all pages with PriceCalculator blocks
  const query = `*[_type == "page" && defined(contentBlocks)] {
    _id,
    title,
    slug,
    "calcBlocks": contentBlocks[_type == "priceCalculator"] {
      _key,
      title
    }
  }`;

  const pages = await client.fetch(query);
  console.log(`📄 Found ${pages.length} pages with potential priceCalculator blocks`);

  let updatesCount = 0;

  for (const page of pages) {
    if (!page.calcBlocks || page.calcBlocks.length === 0) {
      continue;
    }

    console.log(`\n📝 Processing page: "${page.title}"`);
    console.log(`   Slug: ${page.slug?.current || 'N/A'}`);

    for (const block of page.calcBlocks) {
      console.log(`   - Found priceCalculator block: "${block.title || 'Untitled'}"`);

      // Update the block to add backgroundColor field (optional, defaults to gray-100 in code)
      // The field will now be available in Sanity Studio
      const patch = client
        .patch(page._id)
        .set({
          [`contentBlocks[_key=="${block._key}"].backgroundColor`]: null, // Initialize as null/undefined
        });

      try {
        await patch.commit({ ifRevisionID: page._id });
        console.log(`   ✅ Updated block ${block._key}`);
        updatesCount++;
      } catch (error: any) {
        if (error.statusCode === 409) {
          console.log(`   ℹ️  Block already up to date (revision conflict)`);
        } else {
          console.error(`   ❌ Error updating block:`, error);
        }
      }
    }
  }

  console.log(`\n✨ Done! Updated ${updatesCount} block(s)`);
  console.log(`\n📝 Note: The backgroundColor field is now available in Sanity CMS.`);
  console.log(`   You can set it to: white, gray, blue, green, yellow, orange, red, purple, or pink`);
  console.log(`   If left empty, it defaults to gray.`);
}

// Run the script
addBackgroundColorField()
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error during execution:', error);
    process.exit(1);
  });

