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

async function fixElpriserPage() {
  try {
    console.log('🔧 Fixing elpriser page...');
    
    // Fetch the current page
    const page = await client.fetch(`*[_id == "1BrgDwXdqxJ08rMIoYfLjP"][0]`);
    
    if (!page) {
      console.error('❌ Elpriser page not found!');
      return;
    }

    console.log('📄 Found page:', page.title);

    // Use unset to remove fields
    const transaction = client.transaction();
    
    // Unset the problematic fields
    transaction.patch('1BrgDwXdqxJ08rMIoYfLjP', patch => patch
      .unset(['ogImage', 'seo'])
    );

    // Execute the transaction
    const result = await transaction.commit();
    console.log('✅ Successfully removed ogImage and seo fields');
    
    // Now update the Value Proposition if needed
    const updatedPage = await client.fetch(`*[_id == "1BrgDwXdqxJ08rMIoYfLjP"][0]`);
    
    // Find value proposition blocks that need updating
    const updatedBlocks = [...updatedPage.contentBlocks];
    let hasChanges = false;

    updatedBlocks.forEach((block, index) => {
      if (block._type === 'valueProposition') {
        // Ensure heading and subheading are set
        if (!block.heading) {
          block.heading = "Derfor skal du sammenligne elpriser";
          hasChanges = true;
        }
        if (!block.subheading) {
          block.subheading = "Opdag fordelene ved at skifte elselskab";
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      await client.patch('1BrgDwXdqxJ08rMIoYfLjP')
        .set({ contentBlocks: updatedBlocks })
        .commit();
      console.log('✅ Updated Value Proposition content');
    }

    console.log('✅ All fixes applied successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixElpriserPage();