import { createClient } from '@sanity/client';

const token = process.argv[2];
if (!token) {
  console.error('Please provide Sanity API token as first argument');
  process.exit(1);
}

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: token,
  useCdn: false,
});

// Data that was lost from leverandoer-sammenligning
const RESTORE_DATA = {
  'dPOYkdZ6jQJpSdo6MLX9d3': {
    name: 'Leverandoer-sammenligning',
    valuePropositions: [
      {
        _key: 'qetdpo1zx',
        heading: 'Fordele ved at sammenligne elselskaber',
        valueItems: [
          {
            _key: 'item-1',
            heading: 'Spar op til 2.000 kr/år',
            description: 'Den gennemsnitlige danske familie kan spare mellem 500-2.000 kr årligt ved at vælge det rigtige elselskab.',
          },
          {
            _key: 'item-2',
            heading: 'Støt den grønne omstilling',
            description: 'Vælg et elselskab der investerer i ny vedvarende energi, ikke bare køber certifikater.',
          },
          {
            _key: 'item-3',
            heading: 'Fuld gennemsigtighed',
            description: 'Se alle priser, gebyrer og betingelser samlet ét sted. Ingen skjulte overraskelser.',
          },
          {
            _key: 'item-4',
            heading: 'Skift på 5 minutter',
            description: 'Det nye elselskab håndterer alt det praktiske. Du skal bare vælge og tilmelde dig.',
          }
        ]
      }
    ],
    featureLists: [
      {
        _key: 'zzj9wemby7q',
        features: [
          {
            _key: 'zz1j5omlr6u',
            title: '1. Sammenlign priser',
            description: 'Brug vores beregner til at se præcis hvad forskellige elselskaber koster for dit forbrug.'
          },
          {
            _key: 'k9obewf9rlc',
            title: '2. Tjek din nuværende aftale',
            description: 'Find din seneste elregning frem og se hvad du betaler i dag - mange betaler for meget.'
          },
          {
            _key: 'gqf8ofyyhph',
            title: '3. Tilmeld dig nyt selskab',
            description: 'Når du har fundet det bedste tilbud, kan du tilmelde dig direkte online på 5 minutter.'
          },
          {
            _key: 'vgzpe8g6gev',
            title: '4. Automatisk skift',
            description: 'Det nye elselskab sørger for opsigelse af din gamle aftale - du skal ikke gøre noget.'
          },
          {
            _key: 'esmewc1gxon',
            title: '5. Velkommen til besparelser',
            description: 'Fra næste måned får du strøm fra dit nye selskab - og forhåbentlig en lavere regning.'
          }
        ]
      }
    ]
  }
};

async function manualRestore() {
  console.log('🔧 Manually restoring Value Proposition and Feature List data...\n');
  
  for (const [pageId, restoreInfo] of Object.entries(RESTORE_DATA)) {
    console.log(`\n📄 Restoring ${restoreInfo.name} (${pageId})...`);
    
    try {
      // Fetch current page
      const page = await client.fetch(`*[_id == "${pageId}"][0]`);
      
      if (!page) {
        console.log(`   ❌ Page not found`);
        continue;
      }
      
      // Update content blocks
      const updatedBlocks = [...page.contentBlocks];
      let hasUpdates = false;
      
      // Restore Value Propositions
      updatedBlocks.forEach((block: any) => {
        if (block._type === 'valueProposition') {
          const restoreVP = restoreInfo.valuePropositions.find(vp => vp._key === block._key);
          if (restoreVP) {
            block.heading = restoreVP.heading;
            block.valueItems = restoreVP.valueItems;
            console.log(`   ✅ Restored Value Proposition: ${restoreVP.heading}`);
            hasUpdates = true;
          }
        }
        
        if (block._type === 'featureList') {
          const restoreFL = restoreInfo.featureLists?.find(fl => fl._key === block._key);
          if (restoreFL) {
            block.features = restoreFL.features;
            console.log(`   ✅ Restored Feature List with ${restoreFL.features.length} items`);
            hasUpdates = true;
          }
        }
      });
      
      if (hasUpdates) {
        await client
          .patch(pageId)
          .set({ contentBlocks: updatedBlocks })
          .commit();
        
        console.log(`   ✅ Successfully restored ${restoreInfo.name}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Failed to restore ${restoreInfo.name}:`, error);
    }
  }
  
  console.log('\n\n✅ Manual restoration complete!');
  console.log('\nIMPORTANT: This only restores the leverandoer-sammenligning page.');
  console.log('For other affected pages, please use the Sanity Studio revision history:');
  console.log('\n1. Go to each page in Sanity Studio');
  console.log('2. Click the menu (three dots) in the top right');
  console.log('3. Select "Restore"');
  console.log('4. Choose a version from before the damage');
  console.log('5. Click "Restore to this version"');
}

manualRestore().catch(console.error);