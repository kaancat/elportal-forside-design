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

function countWordsInBlock(block) {
  let blockWords = 0;
  
  // Text fields to check
  const textFields = ['title', 'headline', 'heading', 'description', 'content', 'leadingText', 'subheadline', 'subtitle'];
  
  textFields.forEach(field => {
    if (block[field]) {
      if (typeof block[field] === 'string') {
        blockWords += block[field].split(/\s+/).filter(word => word.length > 0).length;
      } else if (Array.isArray(block[field])) {
        // Handle portable text arrays
        block[field].forEach(item => {
          if (item.children) {
            item.children.forEach(child => {
              if (child.text) {
                blockWords += child.text.split(/\s+/).filter(word => word.length > 0).length;
              }
            });
          } else if (typeof item === 'string') {
            blockWords += item.split(/\s+/).filter(word => word.length > 0).length;
          }
        });
      }
    }
  });
  
  // Handle nested structures like valueItems, faqItems, etc.
  if (block.valueItems && Array.isArray(block.valueItems)) {
    block.valueItems.forEach(item => {
      blockWords += countWordsInBlock(item);
    });
  }
  
  if (block.faqItems && Array.isArray(block.faqItems)) {
    block.faqItems.forEach(item => {
      blockWords += countWordsInBlock(item);
    });
  }
  
  if (block.items && Array.isArray(block.items)) {
    block.items.forEach(item => {
      blockWords += countWordsInBlock(item);
    });
  }
  
  return blockWords;
}

async function compareElprisberegnerContent() {
  try {
    console.log('=== FETCHING CURRENT LIVE VERSION ===');
    
    const currentPage = await client.fetch('*[_type == "page" && slug.current == "elprisberegner"][0]');
    
    if (!currentPage) {
      console.log('❌ Current page not found');
      return;
    }
    
    console.log('✅ Current Title:', currentPage.title);
    console.log('📊 Current Content blocks:', currentPage.contentBlocks?.length || 0);
    
    // Count words in current version
    let currentTotalWords = 0;
    const currentBlockSummary = [];
    
    if (currentPage.contentBlocks) {
      currentPage.contentBlocks.forEach((block, index) => {
        const blockWords = countWordsInBlock(block);
        const blockType = block._type;
        const blockTitle = block.title || block.headline || block.heading || `Block ${index + 1}`;
        
        currentTotalWords += blockWords;
        currentBlockSummary.push({ 
          index: index + 1,
          type: blockType, 
          title: blockTitle, 
          words: blockWords 
        });
      });
    }
    
    console.log('\\n=== CURRENT VERSION CONTENT BREAKDOWN ===');
    currentBlockSummary.forEach(block => {
      console.log(`${block.index}. ${block.type}: "${block.title}" - ${block.words} words`);
    });
    console.log(`\\n📝 CURRENT TOTAL WORDS: ${currentTotalWords}`);
    
    // Now analyze backup
    console.log('\\n=== ANALYZING BACKUP VERSION ===');
    
    // Try to read the backup data
    let backupData;
    try {
      const backupRaw = fs.readFileSync('/tmp/elprisberegner-backup-raw.json', 'utf8');
      
      // Try to extract JSON from the raw data
      const lines = backupRaw.split('\\n');
      let jsonStart = -1;
      let braceCount = 0;
      let jsonContent = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('"current": "elprisberegner"')) {
          // Find the start of this JSON object
          for (let j = i - 50; j >= 0; j--) {
            if (lines[j].trim().startsWith('{')) {
              jsonStart = j;
              break;
            }
          }
          break;
        }
      }
      
      if (jsonStart >= 0) {
        for (let i = jsonStart; i < lines.length; i++) {
          const line = lines[i];
          jsonContent += line + '\\n';
          
          // Count braces to find end of object
          for (let char of line) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
          }
          
          if (braceCount === 0 && jsonContent.trim().endsWith('}')) {
            break;
          }
        }
        
        backupData = JSON.parse(jsonContent);
      }
    } catch (error) {
      console.log('⚠️  Could not parse backup data cleanly, attempting alternative method...');
      
      // Alternative: try to find it in the main page.json
      try {
        const fullBackup = fs.readFileSync('/tmp/page.json', 'utf8');
        const pages = JSON.parse(fullBackup);
        if (Array.isArray(pages)) {
          backupData = pages.find(page => page.slug && page.slug.current === 'elprisberegner');
        }
      } catch (altError) {
        console.log('❌ Could not parse backup file:', altError.message);
      }
    }
    
    if (backupData) {
      console.log('✅ Backup Title:', backupData.title);
      console.log('📊 Backup Content blocks:', backupData.contentBlocks?.length || 0);
      
      // Count words in backup version
      let backupTotalWords = 0;
      const backupBlockSummary = [];
      
      if (backupData.contentBlocks) {
        backupData.contentBlocks.forEach((block, index) => {
          const blockWords = countWordsInBlock(block);
          const blockType = block._type;
          const blockTitle = block.title || block.headline || block.heading || `Block ${index + 1}`;
          
          backupTotalWords += blockWords;
          backupBlockSummary.push({ 
            index: index + 1,
            type: blockType, 
            title: blockTitle, 
            words: blockWords 
          });
        });
      }
      
      console.log('\\n=== BACKUP VERSION CONTENT BREAKDOWN ===');
      backupBlockSummary.forEach(block => {
        console.log(`${block.index}. ${block.type}: "${block.title}" - ${block.words} words`);
      });
      console.log(`\\n📝 BACKUP TOTAL WORDS: ${backupTotalWords}`);
      
      // COMPARISON
      console.log('\\n=== 📊 COMPARISON RESULTS ===');
      console.log(`Current version: ${currentTotalWords} words`);
      console.log(`Backup version:  ${backupTotalWords} words`);
      
      const wordDifference = backupTotalWords - currentTotalWords;
      const percentageDifference = backupTotalWords > 0 ? ((wordDifference / backupTotalWords) * 100).toFixed(1) : 0;
      
      if (wordDifference > 0) {
        console.log(`\\n🚨 DISCREPANCY FOUND: Current version is MISSING ${wordDifference} words (${percentageDifference}% less content)`);
      } else if (wordDifference < 0) {
        console.log(`\\n✅ Current version has ${Math.abs(wordDifference)} more words than backup`);
      } else {
        console.log(`\\n✅ Word counts match exactly`);
      }
      
      console.log(`\\nBlock count difference: ${(currentPage.contentBlocks?.length || 0) - (backupData.contentBlocks?.length || 0)}`);
      
    } else {
      console.log('❌ Could not find elprisberegner page in backup');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

compareElprisberegnerContent();