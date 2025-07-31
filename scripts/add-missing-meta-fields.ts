import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function addMissingMetaFields() {
  console.log('🔧 Adding missing meta fields to "hvordan-vaelger-du-elleverandoer" page...\n');
  
  const pageId = 'qgCxJyBbKpvhb2oGYqfgkp';
  
  try {
    // First, get the current page to preserve existing content
    const currentPage = await client.getDocument(pageId);
    
    if (!currentPage) {
      console.error('❌ Page not found!');
      return;
    }
    
    console.log('📄 Current page found:');
    console.log(`   - Title: ${currentPage.title}`);
    console.log(`   - Has metaDescription: ${!!currentPage.metaDescription}`);
    console.log(`   - Has openGraph: ${!!currentPage.openGraph}`);
    console.log(`   - Has publishedAt: ${!!currentPage.publishedAt}`);
    
    // Add the missing fields
    const updatedPage = {
      ...currentPage,
      metaDescription: "Find den bedste el-leverandør til dit behov. Sammenlign priser, kontrakter og grøn energi. Spar penge og træf det rigtige valg med vores guide.",
      openGraph: {
        title: "Sådan vælger du den rigtige el-leverandør - Komplet guide 2024",
        description: "Find den bedste el-leverandør og spar tusindvis af kroner årligt. Sammenlign priser, grøn energi og kontraktvilkår på ElPortal."
        // Note: Not adding image to avoid reference errors
      },
      publishedAt: currentPage.publishedAt || "2025-01-28T11:43:17.000Z"
    };
    
    console.log('\n🚀 Updating page with meta fields...');
    
    // Update the document
    const result = await client
      .patch(pageId)
      .set({
        metaDescription: updatedPage.metaDescription,
        openGraph: updatedPage.openGraph,
        publishedAt: updatedPage.publishedAt
      })
      .commit();
    
    console.log('\n✅ Meta fields successfully added!');
    console.log(`   - Document ID: ${result._id}`);
    console.log(`   - Revision: ${result._rev}`);
    console.log(`   - Updated at: ${result._updatedAt}`);
    
    console.log('\n📋 Fields added:');
    console.log('   - metaDescription: ✅');
    console.log('   - openGraph.title: ✅');
    console.log('   - openGraph.description: ✅');
    console.log('   - publishedAt: ✅');
    
    console.log('\n🎉 The page should no longer show "Unknown fields found" warnings!');
    
  } catch (error) {
    console.error('\n❌ Error updating page:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  }
}

// Run the update
addMissingMetaFields().catch(console.error);