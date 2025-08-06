import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function checkHomepageDocuments() {
  console.log('Checking for homepage documents...\n');
  
  // Query for all homepage-related documents
  const query = `*[_type == "homePage" || _id == "homePage" || _id in ["drafts.homePage", "homepage", "drafts.homepage"]] {
    _id,
    _type,
    _rev,
    _updatedAt,
    title,
    "hasContent": defined(contentBlocks) && length(contentBlocks) > 0
  }`;
  
  try {
    const documents = await client.fetch(query);
    
    if (documents.length === 0) {
      console.log('No homepage documents found.');
      return;
    }
    
    console.log(`Found ${documents.length} homepage document(s):\n`);
    
    documents.forEach((doc: any, index: number) => {
      console.log(`${index + 1}. Document ID: ${doc._id}`);
      console.log(`   Type: ${doc._type}`);
      console.log(`   Title: ${doc.title || 'No title'}`);
      console.log(`   Has Content: ${doc.hasContent ? 'Yes' : 'No'}`);
      console.log(`   Last Updated: ${doc._updatedAt}`);
      console.log(`   Revision: ${doc._rev}`);
      console.log('');
    });
    
    // Check which homepage is actually being used
    console.log('Checking which homepage is being used by the app...');
    
    // The app uses getHomePage() which queries for _id == "homePage"
    const usedHomepage = await client.fetch(`*[_id == "homePage"][0] {
      _id,
      title,
      "contentBlocksCount": count(contentBlocks)
    }`);
    
    if (usedHomepage) {
      console.log(`\n✓ The app is using document with ID: ${usedHomepage._id}`);
      console.log(`  Title: ${usedHomepage.title || 'No title'}`);
      console.log(`  Content blocks: ${usedHomepage.contentBlocksCount || 0}`);
    } else {
      console.log('\n⚠️  No homepage document with ID "homePage" found (this is what the app queries for)');
    }
    
    // Identify unused documents
    const unusedDocs = documents.filter((doc: any) => doc._id !== 'homePage');
    if (unusedDocs.length > 0) {
      console.log('\n❌ Unused homepage documents that can be deleted:');
      unusedDocs.forEach((doc: any) => {
        console.log(`   - ${doc._id}`);
      });
    }
    
  } catch (error) {
    console.error('Error fetching documents:', error);
  }
}

checkHomepageDocuments();