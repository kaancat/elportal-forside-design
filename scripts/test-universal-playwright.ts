#!/usr/bin/env tsx
import { chromium } from 'playwright';

async function testUniversalScript() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    console.log(`[Browser Console ${msg.type()}]:`, msg.text());
  });
  
  // Capture errors
  page.on('pageerror', error => {
    console.error('[Page Error]:', error.message);
  });
  
  // Capture network errors
  page.on('requestfailed', request => {
    console.error('[Request Failed]:', request.url(), request.failure()?.errorText);
  });
  
  console.log('Testing universal script endpoint...');
  
  // First test the API endpoint directly
  try {
    const response = await page.goto('https://dinelportal.dk/api/tracking/universal.js?partner_id=test&debug=true');
    console.log('API Response Status:', response?.status());
    
    if (response?.ok()) {
      const content = await response.text();
      console.log('Script content length:', content.length);
      console.log('First 500 chars:', content.substring(0, 500));
      
      // Check for TypeScript artifacts
      if (content.includes('export ') || content.includes('import ') || content.includes(': ') || content.includes('interface ')) {
        console.error('❌ TypeScript artifacts found in JavaScript!');
      }
    }
  } catch (error) {
    console.error('Failed to fetch script:', error);
  }
  
  // Now test the partner test page
  console.log('\nTesting partner test page...');
  await page.goto('https://dinelportal.dk/partner-test.html?click_id=dep_test_123');
  
  // Wait a bit for script to load
  await page.waitForTimeout(5000);
  
  // Check if DinElportal is available
  const apiAvailable = await page.evaluate(() => {
    return typeof (window as any).DinElportal !== 'undefined';
  });
  
  console.log('DinElportal API available:', apiAvailable);
  
  if (apiAvailable) {
    const apiInfo = await page.evaluate(() => {
      const api = (window as any).DinElportal;
      return {
        version: api.version,
        methods: Object.keys(api),
        trackingData: api.getTrackingData ? api.getTrackingData() : null
      };
    });
    console.log('API Info:', apiInfo);
  }
  
  // Check for JavaScript errors
  const jsErrors = await page.evaluate(() => {
    return (window as any).__errors || [];
  });
  
  if (jsErrors.length > 0) {
    console.error('JavaScript errors found:', jsErrors);
  }
  
  // Keep browser open for manual inspection
  console.log('\nBrowser will stay open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

testUniversalScript().catch(console.error);