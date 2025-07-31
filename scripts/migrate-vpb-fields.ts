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

interface MigrationResult {
  pageId: string;
  pageTitle: string;
  blocksUpdated: number;
  errors: string[];
}

async function migrateVPBFields(): Promise<void> {
  console.log('🚀 Starting Value Proposition Box field migration...\n');
  
  // First, get all pages with VPB blocks that need migration
  const pagesNeedingMigration = await client.fetch(`
    *[_type == "page" && defined(contentBlocks[_type == "valueProposition"])]{
      _id,
      title,
      slug,
      contentBlocks
    }
  `);
  
  console.log(`Found ${pagesNeedingMigration.length} pages with Value Proposition Boxes\n`);
  
  const results: MigrationResult[] = [];
  
  for (const page of pagesNeedingMigration) {
    const result: MigrationResult = {
      pageId: page._id,
      pageTitle: page.title,
      blocksUpdated: 0,
      errors: []
    };
    
    console.log(`\n📄 Processing: ${page.title}`);
    console.log(`   ID: ${page._id}`);
    
    let hasChanges = false;
    const updatedBlocks = [...page.contentBlocks];
    
    updatedBlocks.forEach((block: any, index: number) => {
      if (block._type === 'valueProposition') {
        console.log(`\n   Checking VPB block ${index + 1} (key: ${block._key})...`);
        
        let blockUpdated = false;
        
        // Migrate title → heading
        if (!block.heading && block.title) {
          block.heading = block.title;
          console.log(`     ✅ Migrated title → heading: "${block.title}"`);
          blockUpdated = true;
        }
        
        // Migrate items → valueItems
        if ((!block.valueItems || block.valueItems.length === 0) && block.items && block.items.length > 0) {
          block.valueItems = block.items.map((item: any) => {
            // Ensure each item has the correct structure
            const migratedItem: any = {
              _key: item._key || `migrated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              heading: item.heading || item.text || '',
              description: item.description || ''
            };
            
            // Preserve icon if it exists
            if (item.icon) {
              migratedItem.icon = item.icon;
            }
            
            return migratedItem;
          });
          
          console.log(`     ✅ Migrated ${block.items.length} items → valueItems`);
          blockUpdated = true;
        }
        
        // Migrate propositions → valueItems (if no items exist)
        if ((!block.valueItems || block.valueItems.length === 0) && 
            (!block.items || block.items.length === 0) && 
            block.propositions && block.propositions.length > 0) {
          block.valueItems = block.propositions.map((text: string, idx: number) => ({
            _key: `prop-${Date.now()}-${idx}`,
            heading: text,
            description: ''
          }));
          
          console.log(`     ✅ Migrated ${block.propositions.length} propositions → valueItems`);
          blockUpdated = true;
        }
        
        if (blockUpdated) {
          result.blocksUpdated++;
          hasChanges = true;
        } else {
          console.log(`     ℹ️  No migration needed`);
        }
      }
    });
    
    // Update the page if there were changes
    if (hasChanges) {
      try {
        console.log(`\n   💾 Saving changes to Sanity...`);
        
        await client
          .patch(page._id)
          .set({ contentBlocks: updatedBlocks })
          .commit();
        
        console.log(`   ✅ Successfully updated ${result.blocksUpdated} blocks`);
      } catch (error) {
        const errorMsg = `Failed to update page: ${error}`;
        console.error(`   ❌ ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    } else {
      console.log(`   ℹ️  No changes needed for this page`);
    }
    
    results.push(result);
  }
  
  // Summary
  console.log('\n\n📊 Migration Summary');
  console.log('====================');
  
  const totalBlocksUpdated = results.reduce((sum, r) => sum + r.blocksUpdated, 0);
  const pagesWithErrors = results.filter(r => r.errors.length > 0);
  
  console.log(`Total pages processed: ${results.length}`);
  console.log(`Total blocks migrated: ${totalBlocksUpdated}`);
  console.log(`Pages with errors: ${pagesWithErrors.length}`);
  
  if (pagesWithErrors.length > 0) {
    console.log('\n❌ Errors:');
    pagesWithErrors.forEach(page => {
      console.log(`\n${page.pageTitle}:`);
      page.errors.forEach(error => console.log(`  - ${error}`));
    });
  }
  
  // Verify the migration
  console.log('\n\n🔍 Verifying migration...');
  
  const verificationResult = await client.fetch(`
    *[_type == "page" && defined(contentBlocks[_type == "valueProposition"])]{
      title,
      "vpbStatus": contentBlocks[_type == "valueProposition"]{
        "hasValueItems": count(valueItems) > 0,
        "hasItems": count(items) > 0,
        "itemsInOldField": count(items)
      }
    }
  `);
  
  const stillHaveOldData = verificationResult.filter((page: any) => 
    page.vpbStatus.some((vpb: any) => vpb.hasItems && vpb.itemsInOldField > 0)
  );
  
  if (stillHaveOldData.length > 0) {
    console.log('\n⚠️  Some pages still have data in deprecated fields:');
    stillHaveOldData.forEach((page: any) => {
      console.log(`  - ${page.title}`);
    });
  } else {
    console.log('\n✅ All Value Proposition Boxes successfully migrated!');
  }
}

// Run the migration
migrateVPBFields().catch(console.error);