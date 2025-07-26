import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function verifyPage() {
  try {
    console.log('Fetching updated page...');
    
    // Fetch with a GROQ query similar to what the frontend would use
    const query = `*[_id == "qgCxJyBbKpvhb2oGYjlhjr"][0] {
      _id,
      _type,
      title,
      slug,
      seoMetaTitle,
      seoMetaDescription,
      seoKeywords,
      noIndex,
      contentBlocks[] {
        _key,
        _type,
        ...,
        // Expand references for providerList
        _type == "providerList" => {
          ...,
          providers[]-> {
            _id,
            name,
            slug,
            spotPriceFee,
            monthlyFee,
            bindingPeriod,
            greenPercentage,
            hasGreenOption
          }
        },
        // Expand other fields
        content[] {
          ...,
          _type == "block" => {
            ...,
            children[] {
              ...,
              _type == "span" => {
                _key,
                _type,
                text,
                marks
              }
            }
          }
        }
      }
    }`;
    
    const page = await client.fetch(query);
    
    if (!page) {
      console.error('❌ Page not found!');
      return;
    }
    
    console.log('✅ Page fetched successfully!');
    console.log(`Title: ${page.title}`);
    console.log(`Slug: ${page.slug.current}`);
    console.log(`Content blocks: ${page.contentBlocks.length}`);
    
    // Check for any validation issues
    const issues = [];
    
    page.contentBlocks.forEach((block, index) => {
      if (!block._key) {
        issues.push(`Block at index ${index} missing _key`);
      }
      if (!block._type) {
        issues.push(`Block at index ${index} missing _type`);
      }
      
      // Check specific block types
      if (block._type === 'pageSection' && block.content) {
        block.content.forEach((contentBlock, contentIndex) => {
          if (contentBlock._type === 'block') {
            if (!contentBlock.children || !Array.isArray(contentBlock.children)) {
              issues.push(`PageSection ${block._key} has invalid block at index ${contentIndex}`);
            }
          }
        });
      }
    });
    
    if (issues.length > 0) {
      console.log('\n⚠️  Validation issues found:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('\n✅ No validation issues found!');
    }
    
    // Test specific content blocks
    console.log('\n📋 Content block types found:');
    const blockTypes = [...new Set(page.contentBlocks.map(b => b._type))];
    blockTypes.forEach(type => {
      const count = page.contentBlocks.filter(b => b._type === type).length;
      console.log(`  - ${type}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error verifying page:', error);
    if (error.response) {
      console.error('API Response:', error.response.body);
    }
  }
}

verifyPage();