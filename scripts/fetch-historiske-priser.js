import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config();

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function fetchPage() {
  try {
    // Fetch the page by document ID
    const page = await client.getDocument('qgCxJyBbKpvhb2oGYjlhjr');
    
    // Save to file for analysis
    writeFileSync('historiske-priser-content.json', JSON.stringify(page, null, 2));
    
    console.log('Page content saved to historiske-priser-content.json');
    console.log('Page type:', page._type);
    console.log('Page title:', page.title);
    console.log('Number of sections:', page.sections?.length || 0);
  } catch (error) {
    console.error('Error fetching page:', error);
  }
}

fetchPage();