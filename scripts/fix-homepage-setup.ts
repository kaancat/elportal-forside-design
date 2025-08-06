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

async function fixHomepageSetup() {
  console.log('Fixing homepage setup...\n');
  
  try {
    // Step 1: Delete the unused homePage type document
    const unusedHomePage = await client.fetch(`*[_type == "homePage"][0] { _id }`);
    if (unusedHomePage) {
      console.log(`Deleting unused homePage document: ${unusedHomePage._id}`);
      await client.delete(unusedHomePage._id);
      console.log('✓ Deleted unused homePage document\n');
    }
    
    // Step 2: Check if we have a page with isHomepage=true
    const currentHomepage = await client.fetch(`*[_type == "page" && isHomepage == true][0] { _id, title }`);
    
    if (currentHomepage) {
      console.log(`✓ Homepage already properly configured: ${currentHomepage._id}`);
      console.log(`  Title: ${currentHomepage.title}`);
    } else {
      // Step 3: Find the page document with ID "homepage" (published)
      const homepageDoc = await client.fetch(`*[_id == "homepage"][0] { _id, title, contentBlocks }`);
      
      if (homepageDoc) {
        console.log(`Found homepage document: ${homepageDoc._id}`);
        console.log(`Setting isHomepage flag to true...`);
        
        // Update the document to set isHomepage=true
        await client.patch('homepage')
          .set({ isHomepage: true })
          .commit();
        
        console.log('✓ Homepage document updated with isHomepage=true');
        
        // Also update the draft if it exists
        const draftExists = await client.fetch(`*[_id == "drafts.homepage"][0] { _id }`);
        if (draftExists) {
          await client.patch('drafts.homepage')
            .set({ isHomepage: true })
            .commit();
          console.log('✓ Draft homepage also updated');
        }
      } else {
        console.log('⚠️  No suitable homepage document found to configure');
        console.log('   You may need to create a new homepage in Sanity Studio');
      }
    }
    
    // Step 4: Clean up any other drafts or duplicates
    const allHomepageRelated = await client.fetch(`*[
      _type == "homePage" || 
      (_type == "page" && (_id match "homepage*" || title match "*DinElPortal*"))
    ] { _id, _type, title, isHomepage }`);
    
    console.log('\n📋 Final state of homepage-related documents:');
    allHomepageRelated.forEach((doc: any) => {
      const isActive = doc.isHomepage ? ' ✓ [ACTIVE HOMEPAGE]' : '';
      console.log(`   - ${doc._id} (${doc._type})${isActive}`);
    });
    
  } catch (error) {
    console.error('Error fixing homepage setup:', error);
  }
}

fixHomepageSetup();