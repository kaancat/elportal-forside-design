import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function cleanupProviders() {
  try {
    // Deactivate duplicate Vindstød entries (keep only the one we just created with full data)
    const duplicates = [
      '63c05ca2-cd1e-4f00-b544-6a2077d4031a', // Old DanskVind
      'a6541984-3dbb-466a-975b-badba029e139'  // Vindstød2
    ];
    
    for (const id of duplicates) {
      console.log(`Deactivating duplicate: ${id}`);
      await client
        .patch(id)
        .set({ isActive: false })
        .commit();
      console.log(`✅ Deactivated ${id}`);
    }
    
    console.log('\n✅ Cleanup complete! Only the correct Vindstød with full pricing data remains active.');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

cleanupProviders();