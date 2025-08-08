import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function updateProviderReferences() {
  try {
    // First, find all pages with providerList blocks
    const pages = await client.fetch(`
      *[_type == "page" && contentBlocks[_type == "providerList"]] {
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

    console.log(`Found ${pages.length} pages with providerList blocks`);

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

    // Process each page
    for (const page of pages) {
      const providerListBlocks = page.contentBlocks.filter(b => b._type === 'providerList');
      
      for (const block of providerListBlocks) {
        if (block.providers && block.providers.length > 0) {
          console.log(`\nPage: ${page.title}`);
          console.log('Current providers in block:');
          block.providers.forEach(p => {
            console.log(`  - ${p.providerName} (${p._id}) - Active: ${p.isActive}`);
          });

          // Check if we have inactive Vindstød entries
          const hasInactiveVindstod = block.providers.some(p => 
            p.providerName === 'Vindstød' && (p.isActive === false || p._id !== 'provider.vindstod-danskvind')
          );

          if (hasInactiveVindstod) {
            console.log('\n⚠️ Found inactive/wrong Vindstød reference, updating...');
            
            // Create new provider list with correct Vindstød
            const newProviders = block.providers
              .filter(p => p.providerName !== 'Vindstød') // Remove all old Vindstød entries
              .map(p => ({ _type: 'reference', _ref: p._id }));
            
            // Add the correct Vindstød reference at the beginning
            newProviders.unshift({ _type: 'reference', _ref: vindstod._id });

            // Find the index of this block in contentBlocks
            const blockIndex = page.contentBlocks.findIndex(b => b._key === block._key);
            
            // Update the page
            const result = await client
              .patch(page._id)
              .set({
                [`contentBlocks[${blockIndex}].providers`]: newProviders
              })
              .commit();

            console.log(`✅ Updated page: ${page.title}`);
            console.log('New provider references:', newProviders.map(r => r._ref));
          } else if (!block.providers.some(p => p._id === 'provider.vindstod-danskvind')) {
            console.log('\n⚠️ Vindstød not found in block, adding...');
            
            // Add Vindstød reference
            const newProviders = [
              { _type: 'reference', _ref: vindstod._id },
              ...block.providers.map(p => ({ _type: 'reference', _ref: p._id }))
            ];

            // Find the index of this block in contentBlocks
            const blockIndex = page.contentBlocks.findIndex(b => b._key === block._key);
            
            // Update the page
            const result = await client
              .patch(page._id)
              .set({
                [`contentBlocks[${blockIndex}].providers`]: newProviders
              })
              .commit();

            console.log(`✅ Added Vindstød to page: ${page.title}`);
          } else {
            console.log('✓ Provider references are correct');
          }
        }
      }
    }

    console.log('\n✅ Provider reference update complete!');
    
  } catch (error) {
    console.error('Error updating provider references:', error);
  }
}

updateProviderReferences();