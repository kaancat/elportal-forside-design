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

async function fullRestoreFromBackup() {
  console.log('🔧 Starting FULL restoration from backup...\n');
  console.log('⚠️  WARNING: This will restore ALL content to the state from 4 hours ago\n');
  
  try {
    const backupDir = path.join(process.cwd(), 'json_20250731_034201');
    const documentTypes = ['page', 'homePage', 'siteSettings', 'provider', 'blogPost'];
    
    let totalDocuments = 0;
    let restoredDocuments = 0;
    let failedDocuments = 0;
    
    for (const docType of documentTypes) {
      const backupFile = path.join(backupDir, `${docType}.json`);
      
      if (!fs.existsSync(backupFile)) {
        console.log(`⏭️  Skipping ${docType} - no backup file found`);
        continue;
      }
      
      console.log(`\n📂 Processing ${docType} documents...`);
      
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      
      if (!backupData.result || !Array.isArray(backupData.result)) {
        console.error(`❌ Invalid backup format for ${docType}`);
        continue;
      }
      
      const documents = backupData.result.filter((doc: any) => !doc._id.startsWith('drafts.'));
      console.log(`   Found ${documents.length} ${docType} documents to restore`);
      
      for (const doc of documents) {
        totalDocuments++;
        
        try {
          // Remove system fields that shouldn't be in the update
          const cleanDoc = { ...doc };
          delete cleanDoc._createdAt;
          delete cleanDoc._updatedAt;
          delete cleanDoc._rev;
          delete cleanDoc._system;
          
          // Use createOrReplace to ensure document exists with exact content
          await client.createOrReplace(cleanDoc);
          
          restoredDocuments++;
          
          // Log progress for pages with titles
          if (doc.title) {
            console.log(`   ✅ Restored: ${doc.title}`);
          } else if (doc.name) {
            console.log(`   ✅ Restored: ${doc.name}`);
          } else {
            console.log(`   ✅ Restored: ${doc._id}`);
          }
          
        } catch (error: any) {
          failedDocuments++;
          console.error(`   ❌ Failed to restore ${doc._id}: ${error.message}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESTORATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total documents processed: ${totalDocuments}`);
    console.log(`Successfully restored: ${restoredDocuments}`);
    console.log(`Failed: ${failedDocuments}`);
    console.log('='.repeat(60));
    
    if (failedDocuments === 0) {
      console.log('\n✅ Full restoration completed successfully!');
      console.log('\nAll content has been restored to the state from 4 hours ago.');
    } else {
      console.log('\n⚠️  Restoration completed with some errors.');
      console.log('Please check the failed documents above.');
    }
    
    console.log('\nNext steps:');
    console.log('1. Verify content in Sanity Studio');
    console.log('2. Check the frontend to ensure everything displays correctly');
    console.log('3. If needed, individual documents can be manually reviewed in Studio');
    
  } catch (error) {
    console.error('❌ Fatal error during restoration:', error);
  }
}

// Add confirmation prompt
console.log('This will restore ALL content from the backup taken 4 hours ago.');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

setTimeout(() => {
  fullRestoreFromBackup().catch(console.error);
}, 5000);