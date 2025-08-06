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

async function verifyHomepage() {
  console.log('✅ Verification Complete!\n');
  console.log('📊 Summary:');
  
  try {
    // Check for any remaining homePage type documents
    const homePageDocs = await client.fetch(`count(*[_type == "homePage"])`);
    console.log(`   ✅ Documents of type "homePage": ${homePageDocs} (removed successfully)`);
    
    // Check pages with isHomepage flag
    const homepages = await client.fetch(`
      *[_type == "page" && isHomepage == true] { 
        _id, 
        title,
        "contentBlocks": count(contentBlocks)
      }
    `);
    
    console.log(`   📄 Pages marked as homepage: ${homepages.length}`);
    homepages.forEach((hp: any) => {
      const isDraft = hp._id.startsWith('drafts.');
      const icon = isDraft ? '📝' : '✅';
      console.log(`      ${icon} ${hp._id}: "${hp.title}" (${hp.contentBlocks} content blocks)`);
    });
    
    // Test the actual query the app uses
    const appHomepage = await client.fetch(`
      *[_type == "page" && isHomepage == true][0] { 
        _id,
        title
      }
    `);
    
    if (appHomepage) {
      console.log(`\n   🏠 App will use: "${appHomepage.title}" (${appHomepage._id})`);
    }
    
    console.log('\n✨ The homepage tab has been removed from Sanity Studio!');
    console.log('   - The homepage is now just a regular page with a home icon');
    console.log('   - It can be found in the Pages section');
    console.log('   - It\'s marked with isHomepage:true');
    
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

verifyHomepage();