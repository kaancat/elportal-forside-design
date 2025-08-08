import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function updateAllProviderLists() {
  try {
    // Get the correct Vindstød provider
    const vindstod = await client.fetch(`
      *[_type == "provider" && _id == "provider.vindstod-danskvind"][0] {
        _id,
        providerName,
        productName
      }
    `);

    if (!vindstod) {
      console.error('Could not find the correct Vindstød provider (provider.vindstod-danskvind)');
      return;
    }

    console.log('Found correct Vindstød provider:', vindstod);

    // Get all active providers (including Vindstød)
    const activeProviders = await client.fetch(`
      *[_type == "provider" && isActive != false] | order(isVindstoedProduct desc, providerName) {
        _id,
        providerName,
        productName,
        isVindstoedProduct
      }
    `);

    console.log(`\nFound ${activeProviders.length} active providers:`);
    activeProviders.forEach(p => {
      console.log(`  - ${p.providerName} - ${p.productName} (${p._id})${p.isVindstoedProduct ? ' ⭐' : ''}`);
    });

    // Find all pages with providerList blocks
    const pages = await client.fetch(`
      *[_type == "page"] {
        _id,
        title,
        contentBlocks[] {
          ...,
          _type == "providerList" => {
            _key,
            _type,
            title,
            subtitle,
            providers[]->{ 
              _id,
              providerName,
              productName,
              isActive
            }
          }
        }
      }
    `);

    const pagesWithProviderLists = pages.filter(page => 
      page.contentBlocks?.some(b => b._type === 'providerList')
    );

    console.log(`\nFound ${pagesWithProviderLists.length} pages with providerList blocks`);

    // Process each page
    for (const page of pagesWithProviderLists) {
      const providerListBlocks = page.contentBlocks.filter(b => b._type === 'providerList');
      
      for (const block of providerListBlocks) {
        console.log(`\n--- Page: ${page.title} ---`);
        console.log(`ProviderList: "${block.title || 'Untitled'}"`);
        
        // Current state
        const currentProviderCount = block.providers?.length || 0;
        console.log(`Current providers: ${currentProviderCount}`);
        
        if (currentProviderCount > 0) {
          block.providers.forEach(p => {
            console.log(`  - ${p.providerName} (${p._id}) - Active: ${p.isActive}`);
          });
        }

        // Check if we need to update
        const hasInactiveProviders = block.providers?.some(p => p.isActive === false) || false;
        const hasWrongVindstod = block.providers?.some(p => 
          p.providerName === 'Vindstød' && p._id !== 'provider.vindstod-danskvind'
        ) || false;
        const missingVindstod = !block.providers?.some(p => p._id === 'provider.vindstod-danskvind');

        if (hasInactiveProviders || hasWrongVindstod || missingVindstod || currentProviderCount === 0) {
          console.log('\n⚠️ Updating provider list...');
          
          // If the list is empty or has issues, populate with all active providers
          // Otherwise, just fix the Vindstød reference
          let newProviderRefs;
          
          if (currentProviderCount === 0) {
            // Empty list - add all active providers
            console.log('Adding all active providers to empty list');
            newProviderRefs = activeProviders.map(p => ({
              _type: 'reference',
              _ref: p._id,
              _key: p._id.replace(/[^a-zA-Z0-9]/g, '_') // Generate safe key
            }));
          } else {
            // Has providers but needs fixing
            // Keep existing active providers (except wrong Vindstød entries)
            const existingActiveProviders = (block.providers || [])
              .filter(p => p.isActive !== false && p.providerName !== 'Vindstød')
              .map(p => ({
                _type: 'reference',
                _ref: p._id,
                _key: p._id.replace(/[^a-zA-Z0-9]/g, '_')
              }));
            
            // Add Vindstød at the beginning
            newProviderRefs = [
              {
                _type: 'reference',
                _ref: vindstod._id,
                _key: vindstod._id.replace(/[^a-zA-Z0-9]/g, '_')
              },
              ...existingActiveProviders
            ];
          }

          // Find the index of this block in contentBlocks
          const blockIndex = page.contentBlocks.findIndex(b => b._key === block._key);
          
          // Update the page
          const result = await client
            .patch(page._id)
            .set({
              [`contentBlocks[${blockIndex}].providers`]: newProviderRefs
            })
            .commit();

          console.log(`✅ Updated with ${newProviderRefs.length} providers`);
          console.log('New providers:', newProviderRefs.map(r => r._ref).join(', '));
        } else {
          console.log('✓ Provider list is already correct');
        }
      }
    }

    console.log('\n✅ All provider lists updated successfully!');
    
  } catch (error) {
    console.error('Error updating provider lists:', error);
  }
}

updateAllProviderLists();