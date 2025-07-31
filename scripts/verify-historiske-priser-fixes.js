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

async function verifyFixes() {
  const query = `*[_type == 'page' && slug.current == 'historiske-priser'][0]`;
  const page = await client.fetch(query);
  
  console.log('=== VERIFICATION REPORT ===\n');
  
  // Expected alignments
  const expectedAlignments = {
    "CO₂-udledning fra elforbrug": "left",
    "Valget mellem fast og variabel pris": "left", 
    "Hvad Påvirker Elpriserne?": "left",
    "Historiske elpriser giver værdifuld indsigt": "left",
    "Fast vs Variabel Pris: Hvad Passer Bedst til Dig?": "center"
  };
  
  console.log('1. ALIGNMENT CHECKS:');
  Object.entries(expectedAlignments).forEach(([title, expectedAlignment]) => {
    const block = page.contentBlocks.find(b => b.title === title);
    if (block) {
      const status = block.headerAlignment === expectedAlignment ? '✅' : '❌';
      console.log(`   ${status} "${title}": ${block.headerAlignment || 'undefined'} (expected: ${expectedAlignment})`);
    } else {
      console.log(`   ⚠️  "${title}": Component not found`);
    }
  });
  
  console.log('\n2. YEAR UPDATE CHECK:');
  const noegletalSection = page.contentBlocks.find(b => b.title === "Aktuelle Nøgletal fra Historiske Elpriser");
  if (noegletalSection && noegletalSection.content) {
    let foundYear = false;
    noegletalSection.content.forEach(content => {
      if (content._type === 'block' && content.children) {
        content.children.forEach(child => {
          if (child.text && child.text.includes('Aktuel pristendens')) {
            foundYear = true;
            const has2025 = child.text.includes('2025');
            const status = has2025 ? '✅' : '❌';
            console.log(`   ${status} "Aktuel pristendens" year: ${has2025 ? '2025' : 'NOT 2025'}`);
          }
        });
      }
    });
    if (!foundYear) {
      console.log('   ⚠️  "Aktuel pristendens" text not found');
    }
  }
  
  console.log('\n3. TEXT CUTOFF CHECK:');
  let foundTextIssue = false;
  page.contentBlocks.forEach(block => {
    if (block._type === 'pageSection' && block.content) {
      block.content.forEach(content => {
        if (content._type === 'block' && content.children) {
          content.children.forEach(child => {
            if (child.text && child.text.includes('Historiske elpriser giver værdifuld indsigt i m')) {
              foundTextIssue = true;
              console.log(`   ❌ Text cutoff still exists in section: "${block.title}"`);
            }
          });
        }
      });
    }
  });
  if (!foundTextIssue) {
    console.log('   ✅ No text cutoff issues found');
  }
  
  console.log('\n4. INFOCARDSSECTION CHECK:');
  const infoCardsSection = page.contentBlocks.find(b => 
    b._type === 'infoCardsSection' && b.title === 'Sådan Udnytter Du Historiske Prismønstre'
  );
  if (infoCardsSection) {
    console.log('   ❌ Empty infoCardsSection still exists');
  } else {
    console.log('   ✅ Empty infoCardsSection has been removed');
  }
  
  console.log('\n=== END OF REPORT ===');
}

verifyFixes().catch(console.error);