import { createClient } from '@sanity/client';

// You need to set SANITY_API_TOKEN environment variable before running this script
const token = process.env.SANITY_API_TOKEN;

if (!token) {
  console.error('Error: SANITY_API_TOKEN environment variable not set');
  console.log('Please run: export SANITY_API_TOKEN="your-token-here"');
  process.exit(1);
}

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: token
});

async function fixHistoriskePriserPage() {
  console.log('Fetching historiske-priser page...');
  
  // Fetch the current page
  const query = `*[_type == 'page' && slug.current == 'historiske-priser'][0]`;
  const page = await client.fetch(query);
  
  if (!page) {
    console.error('Page not found!');
    return;
  }

  console.log('Found page:', page._id);
  
  // Fix 1: Update component alignments
  const alignmentsToUpdate = {
    "CO₂-udledning fra elforbrug": "left",
    "Valget mellem fast og variabel pris": "left", 
    "Hvad Påvirker Elpriserne?": "left",
    "Historiske elpriser giver værdifuld indsigt": "left",
    "Fast vs Variabel Pris: Hvad Passer Bedst til Dig?": "center"
  };
  
  // Fix 2: Update year from 2024 to 2025 in "Aktuel pristendens"
  // Fix 3: Fix text cutoff in "Historiske elpriser giver værdifuld indsigt"
  // Fix 4: Remove empty infoCardsSection
  
  let updatedContentBlocks = page.contentBlocks.map(block => {
    // Fix alignments
    if (block.title && alignmentsToUpdate[block.title]) {
      console.log(`Updating alignment for "${block.title}" to ${alignmentsToUpdate[block.title]}`);
      return {
        ...block,
        headerAlignment: alignmentsToUpdate[block.title]
      };
    }
    
    // Fix CO2 emissions chart alignment
    if (block._type === 'co2EmissionsChart' && block.title === "CO₂-udledning fra elforbrug") {
      console.log('Updating CO2 emissions chart alignment to left');
      return {
        ...block,
        headerAlignment: 'left'
      };
    }
    
    // Fix year in "Aktuel pristendens 2024" to 2025
    if (block._type === 'pageSection' && block.title === "Aktuelle Nøgletal fra Historiske Elpriser") {
      console.log('Updating year from 2024 to 2025 in nøgletal section');
      const updatedContent = block.content.map(contentBlock => {
        if (contentBlock._type === 'block' && contentBlock.children) {
          const updatedChildren = contentBlock.children.map(child => {
            if (child.text && child.text.includes('Aktuel pristendens 2024')) {
              return {
                ...child,
                text: child.text.replace('2024', '2025')
              };
            }
            return child;
          });
          return {
            ...contentBlock,
            children: updatedChildren
          };
        }
        return contentBlock;
      });
      
      return {
        ...block,
        content: updatedContent
      };
    }
    
    // Fix text cutoff in "Historiske elpriser giver værdifuld indsigt"
    if (block._type === 'pageSection' && block.title === "Historiske elpriser giver værdifuld indsigt") {
      console.log('Fixing text cutoff in historiske elpriser section');
      const updatedContent = block.content.map(contentBlock => {
        if (contentBlock._type === 'block' && contentBlock.children) {
          const updatedChildren = contentBlock.children.map(child => {
            if (child.text && child.text.includes('Historiske elpriser giver værdifuld indsigt i m')) {
              return {
                ...child,
                text: 'Historiske elpriser giver værdifuld indsigt i markedets udvikling og hjælper dig med at træffe bedre beslutninger om din elaftale.'
              };
            }
            return child;
          });
          return {
            ...contentBlock,
            children: updatedChildren
          };
        }
        return contentBlock;
      });
      
      return {
        ...block,
        content: updatedContent,
        headerAlignment: 'left'
      };
    }
    
    // Remove empty infoCardsSection
    if (block._type === 'infoCardsSection' && block.title === "Sådan Udnytter Du Historiske Prismønstre") {
      console.log('Removing empty infoCardsSection');
      return null; // This will be filtered out
    }
    
    return block;
  }).filter(Boolean); // Remove null entries
  
  // Update the document
  console.log('\nUpdating document...');
  
  try {
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit();
    
    console.log('✅ Successfully updated historiske-priser page!');
    console.log('Document revision:', result._rev);
    
    // Verify the changes
    console.log('\nChanges made:');
    console.log('1. ✅ Updated alignments for 5 components');
    console.log('2. ✅ Changed year from 2024 to 2025 in "Aktuel pristendens"');
    console.log('3. ✅ Fixed text cutoff in "Historiske elpriser giver værdifuld indsigt"');
    console.log('4. ✅ Removed empty infoCardsSection');
    
  } catch (error) {
    console.error('❌ Error updating document:', error);
  }
}

// Run the fix
fixHistoriskePriserPage().catch(console.error);