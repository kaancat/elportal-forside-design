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

// Pages that were affected by the icon fix script
const AFFECTED_PAGES = [
  { id: '1BrgDwXdqxJ08rMIoYfLjP', name: 'Elpriser' },
  { id: 'I7aq0qw44tdJ3YglBpsP1G', name: 'Energibesparende Tips' },
  { id: 'dPOYkdZ6jQJpSdo6MLX9d3', name: 'Leverandoer-sammenligning' },
  { id: 'qgCxJyBbKpvhb2oGYkdQx3', name: 'Prognoser' },
  { id: 'qgCxJyBbKpvhb2oGYqfgkp', name: 'Hvordan vælger' },
  // Also check draft versions
  { id: 'drafts.1BrgDwXdqxJ08rMIoYfLjP', name: 'Elpriser (draft)' },
  { id: 'drafts.I7aq0qw44tdJ3YglBpsP1G', name: 'Energibesparende Tips (draft)' },
];

async function restorePages() {
  console.log('🚨 EMERGENCY RESTORATION STARTING...\n');
  console.log('This will restore pages to their state from before the icon fix script ran.\n');
  
  for (const page of AFFECTED_PAGES) {
    console.log(`\n📄 Restoring ${page.name} (${page.id})...`);
    
    try {
      // Get the document history
      const history = await client.request({
        uri: `/data/history/${page.id}`,
        withCredentials: true,
      });
      
      if (!history || !history.documents || history.documents.length === 0) {
        console.log(`   ⚠️  No history found for ${page.name}`);
        continue;
      }
      
      console.log(`   Found ${history.documents.length} revisions`);
      
      // Find a revision from before the damage (looking for one at least 1 hour old to be safe)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      let goodRevision = null;
      
      for (const revision of history.documents) {
        const revisionTime = new Date(revision._updatedAt);
        if (revisionTime < oneHourAgo) {
          goodRevision = revision;
          break;
        }
      }
      
      if (!goodRevision) {
        // If no revision older than 1 hour, take the second-to-last one
        if (history.documents.length > 1) {
          goodRevision = history.documents[1];
          console.log(`   ⚠️  No revision older than 1 hour, using previous revision from ${goodRevision._updatedAt}`);
        } else {
          console.log(`   ❌ No suitable revision found to restore`);
          continue;
        }
      } else {
        console.log(`   ✅ Found good revision from ${goodRevision._updatedAt}`);
      }
      
      // Restore the document
      console.log(`   💾 Restoring document...`);
      
      // Remove system fields that shouldn't be included in the update
      const dataToRestore = { ...goodRevision };
      delete dataToRestore._id;
      delete dataToRestore._rev;
      delete dataToRestore._createdAt;
      delete dataToRestore._updatedAt;
      
      const result = await client
        .patch(page.id)
        .set(dataToRestore)
        .commit();
      
      console.log(`   ✅ Successfully restored ${page.name}`);
      
    } catch (error) {
      console.error(`   ❌ Failed to restore ${page.name}:`, error);
    }
  }
  
  console.log('\n\n✅ Restoration process complete!');
  console.log('\nPlease check your pages in Sanity Studio to verify all content is restored.');
  console.log('\nIf any issues remain, you can use the revision history in Sanity Studio to manually restore.');
}

// Alternative approach if the history API doesn't work
async function manualRestore() {
  console.log('\n\nIf the automatic restoration failed, you can manually restore in Sanity Studio:');
  console.log('1. Go to each affected page');
  console.log('2. Click the "Restore" button in the top menu');
  console.log('3. Select a revision from before the damage occurred');
  console.log('4. Click "Restore to this version"');
  
  console.log('\nAffected pages to check:');
  AFFECTED_PAGES.forEach(page => {
    console.log(`- ${page.name}: https://dinelportal.sanity.studio/structure/page;${page.id}`);
  });
}

restorePages().then(() => {
  manualRestore();
}).catch(console.error);