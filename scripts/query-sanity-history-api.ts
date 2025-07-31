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

const targetPageId = 'qgCxJyBbKpvhb2oGYqfgkp';

async function queryHistoryAPI() {
  console.log('🔍 Querying Sanity History API for page revisions...\n');
  console.log(`Target page ID: ${targetPageId}`);
  console.log('Page slug: hvordan-vaelger-du-elleverandoer\n');
  console.log('=' .repeat(80));
  
  try {
    // First, let's check if we can access the history API
    console.log('\n📜 Attempting to access document history...');
    
    try {
      // Query the history endpoint for our specific document
      const historyResponse = await client.request({
        url: `/data/history/production/documents/${targetPageId}`,
        method: 'GET'
      });
      
      console.log('\n✅ Successfully accessed history API!');
      console.log(`Found ${historyResponse.documents?.length || 0} revisions\n`);
      
      if (historyResponse.documents && historyResponse.documents.length > 0) {
        // Analyze each revision
        console.log('📊 Analyzing revisions to find proper component structure...\n');
        
        let foundGoodRevision = null;
        let revisionIndex = 0;
        
        for (const revision of historyResponse.documents) {
          revisionIndex++;
          const rev = revision;
          const contentBlocks = rev.contentBlocks || [];
          
          // Count different component types
          const componentTypes = contentBlocks.reduce((acc: any, block: any) => {
            const type = block._type;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});
          
          // Calculate total word count (rough estimate)
          let wordCount = 0;
          contentBlocks.forEach((block: any) => {
            if (block.title) wordCount += block.title.split(' ').length;
            if (block.content && Array.isArray(block.content)) {
              block.content.forEach((item: any) => {
                if (item._type === 'block' && item.children) {
                  item.children.forEach((child: any) => {
                    if (child.text) wordCount += child.text.split(' ').length;
                  });
                }
              });
            }
          });
          
          const hasGoodStructure = 
            Object.keys(componentTypes).length > 3 && // Multiple component types
            !componentTypes.pageSection || // Either no pageSections
            (componentTypes.pageSection < 10 && Object.keys(componentTypes).length > 5); // Or limited pageSections with other components
          
          console.log(`Revision ${revisionIndex} (${new Date(rev._updatedAt).toLocaleString('da-DK')}):`);
          console.log(`  - Component types: ${JSON.stringify(componentTypes)}`);
          console.log(`  - Estimated words: ${wordCount}`);
          console.log(`  - Good structure: ${hasGoodStructure ? '✅' : '❌'}`);
          console.log(`  - Revision ID: ${rev._rev}\n`);
          
          // Check if this revision has the proper diverse structure
          if (hasGoodStructure && wordCount > 2000 && !foundGoodRevision) {
            foundGoodRevision = rev;
            console.log('🎯 Found revision with proper component diversity!\n');
          }
        }
        
        if (foundGoodRevision) {
          console.log('\n✨ BEST REVISION FOUND:');
          console.log('=' .repeat(80));
          console.log(`Revision: ${foundGoodRevision._rev}`);
          console.log(`Updated: ${new Date(foundGoodRevision._updatedAt).toLocaleString('da-DK')}`);
          console.log(`\nComponent breakdown:`);
          
          const componentBreakdown: any = {};
          foundGoodRevision.contentBlocks.forEach((block: any) => {
            componentBreakdown[block._type] = (componentBreakdown[block._type] || 0) + 1;
          });
          
          Object.entries(componentBreakdown).forEach(([type, count]) => {
            console.log(`  - ${type}: ${count}`);
          });
          
          // Save the good revision to a file
          console.log('\n💾 Saving revision to file for restoration...');
          const fs = require('fs').promises;
          const outputPath = resolve(__dirname, 'good-revision-hvordan-vaelger.json');
          
          await fs.writeFile(
            outputPath,
            JSON.stringify(foundGoodRevision, null, 2),
            'utf8'
          );
          
          console.log(`\n✅ Revision saved to: ${outputPath}`);
          console.log('\nNext steps:');
          console.log('1. Review the saved revision structure');
          console.log('2. Create a restoration script based on this revision');
          console.log('3. Restore the page with proper component diversity');
          
        } else {
          console.log('\n⚠️  No revision found with proper component diversity.');
          console.log('All revisions appear to have the simplified pageSection structure.');
          console.log('\nAlternative approach needed:');
          console.log('1. Check GitHub Actions backups');
          console.log('2. Reconstruct from deployment scripts');
          console.log('3. Manually rebuild based on SEO content guide');
        }
        
      } else {
        console.log('❌ No revision history found for this document.');
      }
      
    } catch (historyError: any) {
      if (historyError.statusCode === 403) {
        console.log('\n⚠️  History API access denied (403 Forbidden)');
        console.log('This typically means:');
        console.log('  - History API requires a paid Sanity plan (Team or higher)');
        console.log('  - Your current plan does not include history access');
        console.log('  - Token permissions may be insufficient\n');
        
        console.log('Alternative approaches available:');
        console.log('1. Use GitHub Actions backups (if available)');
        console.log('2. Reconstruct from deployment scripts');
        console.log('3. Check local backup files');
        console.log('4. Manually rebuild using SEO content guide');
        
      } else if (historyError.statusCode === 404) {
        console.log('\n❌ Document not found in history');
        console.log('The document ID may be incorrect or the document may be too new.');
        
      } else {
        console.log('\n❌ Error accessing history API:', historyError.message);
        console.log('Status code:', historyError.statusCode);
      }
    }
    
    // As a fallback, let's also check the current state of the document
    console.log('\n📄 Checking current document state...');
    const currentDoc = await client.getDocument(targetPageId);
    
    if (currentDoc) {
      console.log('\nCurrent document found:');
      console.log(`  - Title: ${currentDoc.title}`);
      console.log(`  - Slug: ${currentDoc.slug?.current}`);
      console.log(`  - Content blocks: ${currentDoc.contentBlocks?.length || 0}`);
      
      if (currentDoc.contentBlocks && currentDoc.contentBlocks.length > 0) {
        const currentTypes: any = {};
        currentDoc.contentBlocks.forEach((block: any) => {
          currentTypes[block._type] = (currentTypes[block._type] || 0) + 1;
        });
        console.log(`  - Component types: ${JSON.stringify(currentTypes)}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
  }
}

// Run the query
console.log('🚀 Starting Sanity History API query...\n');
queryHistoryAPI().catch(console.error);