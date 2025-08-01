import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function restoreElprisberegnerFAQ() {
  try {
    console.log('=== RESTORING ELPRISBEREGNER FAQ CONTENT ===');
    
    // Get current live version
    const currentPage = await client.fetch('*[_type == "page" && slug.current == "elprisberegner"][0]');
    
    if (!currentPage) {
      console.log('❌ Current page not found');
      return;
    }
    
    console.log('✅ Found current page:', currentPage.title);
    
    // Load backup content
    const backupData = JSON.parse(fs.readFileSync('/tmp/backup-elprisberegner-2.json', 'utf8'));
    
    console.log('✅ Loaded backup data');
    
    // Find the FAQ group in backup
    const backupFaqGroup = backupData.contentBlocks?.find(block => block._type === 'faqGroup');
    
    if (!backupFaqGroup) {
      console.log('❌ No FAQ group found in backup');
      return;
    }
    
    console.log('✅ Found FAQ group in backup with', backupFaqGroup.faqItems?.length || 0, 'FAQ items');
    
    // Update the current page's FAQ group
    const updatedContentBlocks = currentPage.contentBlocks.map(block => {
      if (block._type === 'faqGroup') {
        console.log('🔄 Replacing FAQ group content...');
        
        // Use the complete FAQ structure from backup
        return {
          ...block,
          title: backupFaqGroup.title,
          faqItems: backupFaqGroup.faqItems
        };
      }
      return block;
    });
    
    // Verify we found and updated the FAQ
    const updatedFaqGroup = updatedContentBlocks.find(block => block._type === 'faqGroup');
    console.log('✅ Updated FAQ group will have', updatedFaqGroup.faqItems?.length || 0, 'FAQ items');
    
    // Count words in restored FAQ
    let faqWords = 0;
    if (updatedFaqGroup.faqItems) {
      updatedFaqGroup.faqItems.forEach(item => {
        if (item.question) {
          faqWords += item.question.split(/\s+/).filter(w => w.length > 0).length;
        }
        if (item.answer && Array.isArray(item.answer)) {
          item.answer.forEach(block => {
            if (block.children && Array.isArray(block.children)) {
              block.children.forEach(child => {
                if (child.text) {
                  faqWords += child.text.split(/\s+/).filter(w => w.length > 0).length;
                }
              });
            }
          });
        }
      });
    }
    
    console.log('📝 Restored FAQ content:', faqWords, 'words');
    
    // Update the page
    const result = await client
      .patch(currentPage._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit();
    
    console.log('\\n✅ Successfully restored FAQ content to page:', result._id);
    console.log('\\n📊 RESTORATION SUMMARY:');
    console.log(`- Restored ${updatedFaqGroup.faqItems?.length || 0} FAQ items`);
    console.log(`- Added approximately ${faqWords} words of FAQ content`);
    console.log(`- Total estimated page words now: ${1165 - 5 + faqWords} (was 1165)`);
    
    console.log('\\n🎯 FAQ items restored:');
    if (updatedFaqGroup.faqItems) {
      updatedFaqGroup.faqItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.question}`);
      });
    }
    
    console.log('\\n✅ FAQ content restoration complete!');
    console.log('📝 The page now contains the full FAQ content from the backup.');
    
  } catch (error) {
    console.error('❌ Error restoring FAQ content:', error.message);
  }
}

restoreElprisberegnerFAQ();