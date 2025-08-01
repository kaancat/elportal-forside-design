import * as fs from 'fs';

function countWordsInText(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

function countWordsInPortableText(blocks) {
  if (!Array.isArray(blocks)) return 0;
  
  let words = 0;
  blocks.forEach(block => {
    if (block.children && Array.isArray(block.children)) {
      block.children.forEach(child => {
        if (child.text) {
          words += countWordsInText(child.text);
        }
      });
    }
  });
  return words;
}

function analyzeBackupContent() {
  try {
    // Read the full backup file
    const backupContent = fs.readFileSync('/tmp/page.json', 'utf8');
    
    // Parse the backup file
    const backupData = JSON.parse(backupContent);
    
    // Extract pages from the result
    const pages = backupData.result || backupData;
    
    // Find all elprisberegner pages
    const elprisberegnerPages = pages.filter(page => 
      page.slug && page.slug.current === 'elprisberegner'
    );
    
    console.log(`Found ${elprisberegnerPages.length} elprisberegner page(s) in backup`);
    
    elprisberegnerPages.forEach((page, index) => {
      console.log(`\\n=== BACKUP VERSION ${index + 1} ===`);
      console.log('ID:', page._id);
      console.log('Type:', page._type);
      console.log('Title:', page.title);
      console.log('Updated:', page._updatedAt);
      console.log('Content blocks:', page.contentBlocks?.length || 0);
      
      if (page.contentBlocks && page.contentBlocks.length > 0) {
        let totalWords = 0;
        const blockSummary = [];
        
        page.contentBlocks.forEach((block, blockIndex) => {
          let blockWords = 0;
          const blockType = block._type;
          const blockTitle = block.title || block.headline || block.heading || `Block ${blockIndex + 1}`;
          
          // Count words in different field types
          ['title', 'headline', 'heading', 'description', 'leadingText', 'subheadline', 'subtitle'].forEach(field => {
            if (block[field]) {
              if (typeof block[field] === 'string') {
                blockWords += countWordsInText(block[field]);
              } else if (Array.isArray(block[field])) {
                blockWords += countWordsInPortableText(block[field]);
              }
            }
          });
          
          // Handle content field (often portable text)
          if (block.content && Array.isArray(block.content)) {
            blockWords += countWordsInPortableText(block.content);
          }
          
          // Handle nested structures
          if (block.valueItems && Array.isArray(block.valueItems)) {
            block.valueItems.forEach(item => {
              if (item.heading) blockWords += countWordsInText(item.heading);
              if (item.description) blockWords += countWordsInText(item.description);
            });
          }
          
          if (block.faqItems && Array.isArray(block.faqItems)) {
            block.faqItems.forEach(item => {
              if (item.question) blockWords += countWordsInText(item.question);
              if (item.answer && Array.isArray(item.answer)) {
                blockWords += countWordsInPortableText(item.answer);
              }
            });
          }
          
          if (block.items && Array.isArray(block.items)) {
            block.items.forEach(item => {
              if (item.title) blockWords += countWordsInText(item.title);
              if (item.description) blockWords += countWordsInText(item.description);
            });
          }
          
          totalWords += blockWords;
          blockSummary.push({
            index: blockIndex + 1,
            type: blockType,
            title: blockTitle,
            words: blockWords
          });
        });
        
        console.log('\\nContent Breakdown:');
        blockSummary.forEach(block => {
          console.log(`${block.index}. ${block.type}: "${block.title}" - ${block.words} words`);
        });
        
        console.log(`\\n📝 BACKUP TOTAL WORDS: ${totalWords}`);
        
        // Save this version for comparison
        fs.writeFileSync(`/tmp/backup-elprisberegner-${index + 1}.json`, JSON.stringify(page, null, 2));
        console.log(`Backup version ${index + 1} saved to /tmp/backup-elprisberegner-${index + 1}.json`);
      }
    });
    
  } catch (error) {
    console.error('Error analyzing backup:', error.message);
  }
}

analyzeBackupContent();