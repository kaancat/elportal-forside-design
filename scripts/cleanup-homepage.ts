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

async function cleanupHomepage() {
  console.log('🧹 Cleaning up homepage setup...\n');
  
  try {
    // Step 1: Find and delete ALL documents of type 'homePage'
    console.log('Step 1: Finding documents of type "homePage" (the redundant schema)...');
    const homePageDocs = await client.fetch(`*[_type == "homePage"] { _id, _rev, title }`);
    
    if (homePageDocs.length > 0) {
      console.log(`Found ${homePageDocs.length} document(s) of type "homePage" to delete:`);
      for (const doc of homePageDocs) {
        console.log(`  - Deleting: ${doc._id} (${doc.title || 'No title'})`);
        await client.delete(doc._id);
      }
      console.log('✅ All "homePage" type documents deleted\n');
    } else {
      console.log('✅ No "homePage" type documents found (already clean)\n');
    }
    
    // Step 2: Verify we have a proper homepage (page with isHomepage:true)
    console.log('Step 2: Verifying proper homepage setup (page with isHomepage:true)...');
    const properHomepage = await client.fetch(`
      *[_type == "page" && isHomepage == true] { 
        _id, 
        title, 
        "hasContent": defined(contentBlocks) && length(contentBlocks) > 0,
        "contentBlockCount": count(contentBlocks)
      }
    `);
    
    if (properHomepage.length === 0) {
      console.log('⚠️  No homepage found! Looking for a suitable page to designate as homepage...');
      
      // Find the page that looks like it should be the homepage
      const candidatePages = await client.fetch(`
        *[_type == "page" && (
          _id in ["homepage", "drafts.homepage"] ||
          title match "*DinElPortal*" ||
          title match "*Homepage*"
        )] { 
          _id, 
          title,
          "hasContent": defined(contentBlocks) && length(contentBlocks) > 0
        }
      `);
      
      if (candidatePages.length > 0) {
        const bestCandidate = candidatePages.find((p: any) => p._id === 'homepage') || 
                             candidatePages.find((p: any) => p.hasContent) ||
                             candidatePages[0];
        
        console.log(`  Setting page "${bestCandidate.title}" (${bestCandidate._id}) as homepage...`);
        
        await client.patch(bestCandidate._id)
          .set({ isHomepage: true })
          .commit();
        
        console.log('✅ Homepage configured successfully\n');
      } else {
        console.log('❌ No suitable page found to set as homepage\n');
      }
    } else if (properHomepage.length === 1) {
      const hp = properHomepage[0];
      console.log('✅ Homepage properly configured:');
      console.log(`   ID: ${hp._id}`);
      console.log(`   Title: ${hp.title}`);
      console.log(`   Content blocks: ${hp.contentBlockCount || 0}`);
      console.log('');
    } else {
      console.log(`⚠️  Multiple pages marked as homepage (${properHomepage.length}):`);
      properHomepage.forEach((hp: any) => {
        console.log(`   - ${hp._id}: ${hp.title}`);
      });
      console.log('   Consider setting isHomepage:false on all but one\n');
    }
    
    // Step 3: Show final state
    console.log('Step 3: Final state check...');
    const allPageTypes = await client.fetch(`
      {
        "homePageType": *[_type == "homePage"] { _id },
        "pagesWithIsHomepage": *[_type == "page" && isHomepage == true] { _id, title },
        "totalPages": count(*[_type == "page"])
      }
    `);
    
    console.log('📊 Final state:');
    console.log(`   Documents of type "homePage": ${allPageTypes.homePageType.length} (should be 0)`);
    console.log(`   Pages with isHomepage:true: ${allPageTypes.pagesWithIsHomepage.length} (should be 1)`);
    console.log(`   Total pages: ${allPageTypes.totalPages}`);
    
    if (allPageTypes.homePageType.length === 0 && allPageTypes.pagesWithIsHomepage.length === 1) {
      console.log('\n✅ Homepage setup is clean and correct!');
      console.log('\n📝 Next step: Remove the homePage schema from sanityelpriscms/schemaTypes/');
      console.log('   1. Delete sanityelpriscms/schemaTypes/homePage.ts');
      console.log('   2. Remove the import and export from sanityelpriscms/schemaTypes/index.ts');
      console.log('   3. Deploy to Sanity Studio');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupHomepage();