#!/usr/bin/env tsx

/**
 * Test the Sanity API token permissions
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function testTokenPermissions() {
  console.log('🔐 Testing Sanity API token permissions...');
  console.log('📊 Token length:', process.env.SANITY_API_TOKEN?.length || 'NOT SET');
  console.log('🌐 API URL will be:', `https://yxesi03x.api.sanity.io/v2024-01-01`);
  
  try {
    // Test read permission
    console.log('\n📖 Testing READ permission...');
    const readTest = await client.fetch('*[_type == "page"] | order(_createdAt desc) [0..2] { _id, title }');
    console.log('✅ READ permission: WORKING');
    console.log('📄 Found pages:', readTest.length);
    
    // Test if we can read the specific page
    console.log('\n🎯 Testing access to affected page...');
    const pageData = await client.fetch(
      `*[_id == "qgCxJyBbKpvhb2oGYqfgkp"][0]{ _id, title, _rev }`
    );
    
    if (pageData) {
      console.log('✅ Page access: WORKING');
      console.log('📄 Page:', pageData.title);
      console.log('🔄 Revision:', pageData._rev);
    } else {
      console.log('❌ Page access: NOT FOUND');
    }
    
    // Test write permission with a safe operation
    console.log('\n✏️ Testing WRITE permission...');
    
    const testDoc = {
      _type: 'siteSettings',
      _id: 'test-write-' + Date.now(),
      title: 'Write Test',
      description: 'Testing write permissions'
    };
    
    const createResult = await client.create(testDoc);
    console.log('✅ CREATE permission: WORKING');
    console.log('📝 Created document:', createResult._id);
    
    // Clean up test document
    await client.delete(createResult._id);
    console.log('🗑️ DELETE permission: WORKING');
    console.log('🧹 Cleaned up test document');
    
    console.log('\n🎉 All permissions working correctly!');
    
  } catch (error: any) {
    console.error('\n❌ Token test failed:', error.message);
    if (error.statusCode) {
      console.error('📊 Status code:', error.statusCode);
    }
    if (error.responseBody) {
      console.error('📄 Response:', error.responseBody);
    }
  }
}

// Run test
testTokenPermissions();