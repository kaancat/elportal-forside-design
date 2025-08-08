import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function findProviderLists() {
  try {
    // Method 1: Find all pages
    const allPages = await client.fetch(`*[_type == "page"] { _id, title }`);
    console.log(`Total pages: ${allPages.length}`);
    
    // Method 2: Find pages with any contentBlocks
    const pagesWithContent = await client.fetch(`
      *[_type == "page" && defined(contentBlocks)] {
        _id,
        title,
        "blockTypes": contentBlocks[]._type
      }
    `);
    
    console.log(`\nPages with content blocks: ${pagesWithContent.length}`);
    pagesWithContent.forEach(page => {
      const hasProviderList = page.blockTypes?.includes('providerList');
      console.log(`- ${page.title}: ${page.blockTypes?.join(', ')} ${hasProviderList ? '✓ HAS PROVIDERLIST' : ''}`);
    });

    // Method 3: Direct search for providerList
    const query = `*[_type == "page"] {
      _id,
      title,
      contentBlocks[] {
        _type,
        _key,
        _type == "providerList" => {
          title,
          subtitle,
          providers
        }
      }
    }`;
    
    const pages = await client.fetch(query);
    console.log('\n--- Detailed search ---');
    
    pages.forEach(page => {
      const providerLists = page.contentBlocks?.filter(b => b._type === 'providerList') || [];
      if (providerLists.length > 0) {
        console.log(`\n✓ Page: ${page.title}`);
        providerLists.forEach(pl => {
          console.log(`  - ProviderList: "${pl.title || 'Untitled'}"`)
          console.log(`    - Has providers array: ${pl.providers ? 'YES' : 'NO'}`);
          console.log(`    - Provider count: ${pl.providers?.length || 0}`);
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

findProviderLists();