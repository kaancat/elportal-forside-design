import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function fixPage() {
  try {
    // Fetch the page by slug
    const page = await client.fetch('*[_type == "page" && slug.current == "hvordan-vaelger-du-elleverandoer"][0]');
    
    if (!page) {
      console.log('Page not found');
      return;
    }
    
    console.log('Found page:', page.slug?.current);
    
    // Find and fix the feature list with headerAlignment
    const updatedContentBlocks = page.contentBlocks.map(block => {
      if (block._type === 'featureList' && 'headerAlignment' in block) {
        console.log('Removing headerAlignment from feature list:', block._key);
        const { headerAlignment, ...cleanBlock } = block;
        return cleanBlock;
      }
      return block;
    });
    
    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit();
    
    console.log('Successfully updated page:', result._id);
    console.log('Removed headerAlignment field from feature list');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixPage();