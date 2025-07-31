import { createClient } from '@sanity/client';

const token = process.argv[2];
if (!token) {
  console.error('Please provide Sanity API token as first argument');
  process.exit(1);
}

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: token,
  useCdn: false,
});

async function cleanupDeprecatedFields(): Promise<void> {
  console.log('🧹 Cleaning up deprecated VPB fields...\n');
  
  // Get all pages with VPB blocks
  const pages = await client.fetch(`
    *[_type == "page" && defined(contentBlocks[_type == "valueProposition"])]{
      _id,
      title,
      contentBlocks
    }
  `);
  
  console.log(`Found ${pages.length} pages to check\n`);
  
  for (const page of pages) {
    console.log(`\n📄 Processing: ${page.title}`);
    
    let hasChanges = false;
    const updatedBlocks = page.contentBlocks.map((block: any) => {
      if (block._type === 'valueProposition') {
        // Only clean up if data has been migrated
        const hasNewData = block.valueItems && block.valueItems.length > 0;
        const hasOldData = block.items && block.items.length > 0;
        
        if (hasNewData && hasOldData) {
          console.log(`   🧹 Removing deprecated fields from VPB (key: ${block._key})`);
          
          // Create a clean block without deprecated fields
          const cleanBlock: any = {
            _key: block._key,
            _type: block._type,
            heading: block.heading,
            subheading: block.subheading,
            content: block.content,
            valueItems: block.valueItems
          };
          
          hasChanges = true;
          return cleanBlock;
        }
      }
      return block;
    });
    
    if (hasChanges) {
      try {
        console.log(`   💾 Saving cleaned data...`);
        
        await client
          .patch(page._id)
          .set({ contentBlocks: updatedBlocks })
          .commit();
        
        console.log(`   ✅ Successfully cleaned deprecated fields`);
      } catch (error) {
        console.error(`   ❌ Failed to update page: ${error}`);
      }
    } else {
      console.log(`   ℹ️  No cleanup needed`);
    }
  }
  
  // Final verification
  console.log('\n\n🔍 Final verification...');
  
  const finalCheck = await client.fetch(`
    *[_type == "page" && defined(contentBlocks[_type == "valueProposition"])]{
      title,
      "hasDeprecatedData": count(contentBlocks[_type == "valueProposition" && (defined(items) || defined(title) || defined(propositions))]) > 0
    }
  `);
  
  const stillHaveDeprecated = finalCheck.filter((page: any) => page.hasDeprecatedData);
  
  if (stillHaveDeprecated.length > 0) {
    console.log('\n⚠️  Some pages still have deprecated fields:');
    stillHaveDeprecated.forEach((page: any) => {
      console.log(`  - ${page.title}`);
    });
    console.log('\nThis might be because the data hasn\'t been migrated yet.');
  } else {
    console.log('\n✅ All deprecated fields have been cleaned up!');
  }
}

cleanupDeprecatedFields().catch(console.error);