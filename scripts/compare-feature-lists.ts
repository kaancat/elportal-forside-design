import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
});

async function compareFeatureLists() {
  try {
    // Find all pages with featureLists
    const query = `*[_type == "page" && contentBlocks[_type == "featureList"]] {
      _id,
      title,
      slug,
      "featureLists": contentBlocks[_type == "featureList"] {
        _type,
        _key,
        title,
        subtitle,
        features[]{
          _key,
          title,
          description,
          icon {
            _type,
            name,
            metadata {
              url,
              width,
              height,
              provider,
              icon
            }
          }
        }
      }
    }`;

    const pages = await client.fetch(query);
    
    console.log(`Found ${pages.length} pages with feature lists\n`);

    pages.forEach((page: any) => {
      console.log(`Page: ${page.title}`);
      console.log(`URL: /${page.slug.current}`);
      
      page.featureLists.forEach((featureList: any, index: number) => {
        console.log(`\n  Feature List ${index + 1}: ${featureList.title || 'Untitled'}`);
        
        if (featureList.features) {
          featureList.features.forEach((feature: any, fIndex: number) => {
            console.log(`\n    Feature ${fIndex + 1}: ${feature.title}`);
            if (feature.icon) {
              console.log('      Icon type:', feature.icon._type);
              console.log('      Icon name:', feature.icon.name);
              console.log('      Has metadata:', !!feature.icon.metadata);
              if (feature.icon.metadata) {
                console.log('      Metadata URL:', feature.icon.metadata.url);
                console.log('      Provider:', feature.icon.metadata.provider);
              }
            } else {
              console.log('      No icon');
            }
          });
        }
      });
      console.log('\n---\n');
    });

  } catch (error) {
    console.error('Error comparing feature lists:', error);
  }
}

compareFeatureLists();