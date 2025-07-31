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

async function finalFixHistoriskePriser() {
  const query = `*[_type == 'page' && slug.current == 'historiske-priser'][0]`;
  const page = await client.fetch(query);
  
  console.log('Starting final fix...\n');
  
  let updatedContentBlocks = page.contentBlocks.map(block => {
    // Find and fix "Historiske elpriser giver værdifuld indsigt i m..." text cutoff
    if (block._type === 'pageSection' && block.title && block.title.includes('Historiske elpriser giver værdifuld indsigt')) {
      console.log(`Found section with text cutoff: "${block.title}"`);
      
      // Fix the title itself if it's cut off
      const updatedBlock = {
        ...block,
        title: 'Historiske elpriser giver værdifuld indsigt',
        headerAlignment: 'left'
      };
      
      // Fix any text content that might be cut off
      if (block.content) {
        updatedBlock.content = block.content.map(content => {
          if (content._type === 'block' && content.children) {
            const updatedChildren = content.children.map(child => {
              if (child.text && (
                child.text.includes('Historiske elpriser giver værdifuld indsigt i m') ||
                child.text.includes('markedets udvikling')
              )) {
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
        });
      }
      
      return updatedBlock;
    }
    
    // Fix "Valget mellem fast og variabel pris" - this might be in a valueProposition or other type
    if (block._type === 'valueProposition' && block.heading && block.heading.includes('Valget mellem fast og variabel pris')) {
      console.log(`Found valueProposition: "${block.heading}"`);
      return {
        ...block,
        headerAlignment: 'left'
      };
    }
    
    // Check all block types for these titles
    if (block.title && (
      block.title.includes('Valget mellem fast og variabel pris') ||
      block.title === 'Valget mellem fast og variabel pris'
    )) {
      console.log(`Found block with title: "${block.title}" (type: ${block._type})`);
      return {
        ...block,
        headerAlignment: 'left'
      };
    }
    
    if (block.heading && (
      block.heading.includes('Valget mellem fast og variabel pris') ||
      block.heading === 'Valget mellem fast og variabel pris'
    )) {
      console.log(`Found block with heading: "${block.heading}" (type: ${block._type})`);
      return {
        ...block,
        headerAlignment: 'left'
      };
    }
    
    return block;
  });
  
  // Update the document
  console.log('\nUpdating document...');
  
  try {
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit();
    
    console.log('✅ Successfully applied final fixes!');
    console.log('Document revision:', result._rev);
    
    // Do a final check
    console.log('\nFinal verification:');
    const updatedPage = await client.fetch(query);
    
    // Look for all blocks with alignment issues
    updatedPage.contentBlocks.forEach(block => {
      if (block.title || block.heading) {
        const title = block.title || block.heading;
        const alignment = block.headerAlignment || 'undefined';
        
        if (title.includes('Historiske elpriser giver') || 
            title.includes('Valget mellem fast') ||
            title.includes('CO₂-udledning') ||
            title.includes('Hvad Påvirker') ||
            title.includes('Fast vs Variabel Pris')) {
          console.log(`- "${title}" (${block._type}): alignment = ${alignment}`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating document:', error);
  }
}

finalFixHistoriskePriser().catch(console.error);