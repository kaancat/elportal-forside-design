import { createClient } from '@sanity/client';

const token = process.env.SANITY_API_TOKEN;

if (!token) {
  console.error('Error: SANITY_API_TOKEN environment variable not set');
  process.exit(1);
}

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: token
});

async function checkAndFixRemainingIssues() {
  const query = `*[_type == 'page' && slug.current == 'historiske-priser'][0]`;
  const page = await client.fetch(query);
  
  console.log('Checking for remaining issues...\n');
  
  let hasIssues = false;
  let updatedContentBlocks = [...page.contentBlocks];
  
  // Check each block
  page.contentBlocks.forEach((block, index) => {
    // Check for missing alignments
    if (block.title === 'Valget mellem fast og variabel pris' && (!block.headerAlignment || block.headerAlignment !== 'left')) {
      console.log(`❌ Found alignment issue: "${block.title}" should be LEFT`);
      updatedContentBlocks[index] = { ...block, headerAlignment: 'left' };
      hasIssues = true;
    }
    
    if (block.title === 'Historiske elpriser giver værdifuld indsigt' && (!block.headerAlignment || block.headerAlignment !== 'left')) {
      console.log(`❌ Found alignment issue: "${block.title}" should be LEFT`);
      updatedContentBlocks[index] = { ...block, headerAlignment: 'left' };
      hasIssues = true;
    }
    
    // Check for text cutoff in pageSection
    if (block._type === 'pageSection' && block.title === 'Historiske elpriser giver værdifuld indsigt') {
      let needsUpdate = false;
      const updatedContent = block.content?.map(content => {
        if (content._type === 'block' && content.children) {
          const updatedChildren = content.children.map(child => {
            if (child.text && child.text.includes('Historiske elpriser giver værdifuld indsigt i m')) {
              console.log(`❌ Found text cutoff in section: "${block.title}"`);
              needsUpdate = true;
              hasIssues = true;
              return {
                ...child,
                text: 'Historiske elpriser giver værdifuld indsigt i markedets udvikling og hjælper dig med at træffe bedre beslutninger om din elaftale.'
              };
            }
            return child;
          });
          return { ...content, children: updatedChildren };
        }
        return content;
      }) || [];
      
      if (needsUpdate) {
        updatedContentBlocks[index] = { 
          ...block, 
          content: updatedContent,
          headerAlignment: 'left'
        };
      }
    }
    
    // Check for empty infoCardsSection
    if (block._type === 'infoCardsSection' && block.title === 'Sådan Udnytter Du Historiske Prismønstre') {
      console.log(`❌ Found empty infoCardsSection: "${block.title}" - will remove`);
      hasIssues = true;
    }
  });
  
  // Filter out the empty infoCardsSection
  updatedContentBlocks = updatedContentBlocks.filter(block => 
    !(block._type === 'infoCardsSection' && block.title === 'Sådan Udnytter Du Historiske Prismønstre')
  );
  
  if (hasIssues) {
    console.log('\nFixing remaining issues...');
    
    try {
      const result = await client
        .patch(page._id)
        .set({ contentBlocks: updatedContentBlocks })
        .commit();
      
      console.log('✅ Successfully fixed remaining issues!');
      console.log('Document revision:', result._rev);
    } catch (error) {
      console.error('❌ Error updating document:', error);
    }
  } else {
    console.log('✅ No remaining issues found!');
  }
}

checkAndFixRemainingIssues().catch(console.error);