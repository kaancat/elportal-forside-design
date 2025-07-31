import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';

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

async function restoreFromBackup() {
  console.log('🔧 Restoring data from backup...\n');
  
  try {
    // Read the backup data
    const backupPath = path.join(process.cwd(), 'json_20250731_034201', 'page.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    if (!backupData.result || !Array.isArray(backupData.result)) {
      console.error('❌ Invalid backup format');
      return;
    }
    
    // Find pages that need restoration
    const pagesToRestore = [
      'dPOYkdZ6jQJpSdo6MLX9d3', // leverandoer-sammenligning
      '1BrgDwXdqxJ08rMIoYfLjP', // elpriser
      '80a93cd8-34a6-4041-8b4b-2f65424dcbc6', // om-os
      'I7aq0qw44tdJ3YglBfyS8h', // elselskaber
      'I7aq0qw44tdJ3YglBpsP1G', // energibesparende-tips
      'Ldbn1aqxfi6rpqe9dn', // ladeboks
      'f7ecf92783e749828f7281a6e5829d52', // elprisberegner
      'qgCxJyBbKpvhb2oGYjlhjr', // historiske-priser
      'qgCxJyBbKpvhb2oGYkdQx3', // prognoser
      'qgCxJyBbKpvhb2oGYqfgkp', // hvordan-vaelger-du-elleverandoer
    ];
    
    for (const pageId of pagesToRestore) {
      const backupPage = backupData.result.find((p: any) => p._id === pageId);
      
      if (!backupPage) {
        console.log(`❌ Page ${pageId} not found in backup`);
        continue;
      }
      
      console.log(`\n📄 Restoring ${backupPage.title} (${pageId})...`);
      
      // Extract only the contentBlocks from backup
      const restoredContentBlocks = backupPage.contentBlocks;
      
      try {
        // Update the page with restored content blocks
        await client
          .patch(pageId)
          .set({ contentBlocks: restoredContentBlocks })
          .commit();
        
        console.log(`   ✅ Successfully restored ${backupPage.title}`);
        
        // Log what was restored
        const vpbCount = restoredContentBlocks.filter((b: any) => b._type === 'valueProposition').length;
        const flCount = restoredContentBlocks.filter((b: any) => b._type === 'featureList').length;
        
        console.log(`   ℹ️  Restored ${restoredContentBlocks.length} content blocks:`);
        if (vpbCount > 0) console.log(`      - ${vpbCount} Value Proposition blocks`);
        if (flCount > 0) console.log(`      - ${flCount} Feature List blocks`);
        
      } catch (error) {
        console.error(`   ❌ Failed to restore ${backupPage.title}:`, error);
      }
    }
    
    console.log('\n\n✅ Restoration complete!');
    console.log('\nNext steps:');
    console.log('1. Check the pages in Sanity Studio to verify restoration');
    console.log('2. If you need to restore more pages, add their IDs to the pagesToRestore array');
    console.log('3. The backup contains all pages, so any affected page can be restored');
    
  } catch (error) {
    console.error('❌ Failed to read backup file:', error);
  }
}

restoreFromBackup().catch(console.error);