#!/usr/bin/env tsx
import { chromium } from 'playwright';

interface PageTest {
  url: string;
  category: string;
  description: string;
}

const pages: PageTest[] = [
  // Testing Pages
  {
    url: 'https://www.dinelportal.dk/partner-test.html',
    category: 'Testing Page',
    description: 'Partner Integration Test Page'
  },
  // Admin Dashboard
  {
    url: 'https://www.dinelportal.dk/admin/dashboard',
    category: 'Admin Dashboard',
    description: 'Main Admin Dashboard (Shows all tracking metrics)'
  }
];

async function testAllPages() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: false 
  });
  
  const context = await browser.newContext();
  
  console.log('Testing all DinElportal pages...\n');
  console.log('=' .repeat(80));
  
  for (const pageTest of pages) {
    const page = await context.newPage();
    
    // Capture console messages
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(`[ERROR]: ${msg.text()}`);
      }
    });
    
    // Capture network errors
    page.on('requestfailed', request => {
      consoleLogs.push(`[Network Failed]: ${request.url()}`);
    });
    
    console.log(`\n📍 Testing: ${pageTest.description}`);
    console.log(`   Category: ${pageTest.category}`);
    console.log(`   URL: ${pageTest.url}`);
    console.log('-'.repeat(80));
    
    try {
      // Navigate to the page
      const response = await page.goto(pageTest.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      const status = response?.status() || 0;
      console.log(`   Status: ${status}`);
      
      // Check if it's a successful load
      if (status === 200) {
        console.log(`   ✅ Page loaded successfully`);
        
        // Get page title
        const title = await page.title();
        console.log(`   Title: "${title}"`);
        
        // Check page content based on URL
        if (pageTest.url.includes('partner-test.html')) {
          // Test partner test page
          const hasScript = await page.evaluate(() => {
            return !!document.querySelector('script[src*="universal.js"]');
          });
          console.log(`   Universal script present: ${hasScript ? '✅' : '❌'}`);
          
          const apiAvailable = await page.evaluate(() => {
            return typeof (window as any).DinElportal !== 'undefined';
          });
          console.log(`   DinElportal API available: ${apiAvailable ? '✅' : '❌'}`);
          
          // Check for click_id in URL
          const url = page.url();
          if (url.includes('click_id=')) {
            console.log(`   Click ID in URL: ✅`);
          }
          
        } else if (pageTest.url.includes('test-tracking')) {
          // Check for tracking test functionality
          const hasContent = await page.evaluate(() => {
            return document.body.textContent?.includes('tracking') || 
                   document.body.textContent?.includes('Tracking') ||
                   document.body.innerHTML.includes('track');
          });
          console.log(`   Has tracking content: ${hasContent ? '✅' : '❌'}`);
          
        } else if (pageTest.url.includes('test-provider-links')) {
          // Check for provider links
          const providerLinks = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href*="vindstod"], a[href*="andelenergi"]'));
            return links.length;
          });
          console.log(`   Provider links found: ${providerLinks}`);
          
        } else if (pageTest.url.includes('admin')) {
          // Admin pages might require authentication
          const hasLoginForm = await page.evaluate(() => {
            return !!document.querySelector('input[type="password"], input[name="password"], button[type="submit"]');
          });
          
          const hasAdminContent = await page.evaluate(() => {
            return document.body.textContent?.includes('dashboard') || 
                   document.body.textContent?.includes('Dashboard') ||
                   document.body.textContent?.includes('admin');
          });
          
          if (hasLoginForm) {
            console.log(`   🔒 Authentication required (login form detected)`);
          } else if (hasAdminContent) {
            console.log(`   📊 Admin content visible`);
          } else {
            console.log(`   ⚠️  Page loaded but content unclear`);
          }
        }
        
        // Check for React app
        const isReactApp = await page.evaluate(() => {
          return !!document.querySelector('#root') || !!document.querySelector('[data-reactroot]');
        });
        if (isReactApp) {
          console.log(`   React app: ✅`);
        }
        
      } else if (status === 404) {
        console.log(`   ❌ Page not found (404)`);
      } else if (status === 401 || status === 403) {
        console.log(`   🔒 Authentication required (${status})`);
      } else if (status === 500) {
        console.log(`   ❌ Server error (500)`);
      } else {
        console.log(`   ⚠️  Unexpected status: ${status}`);
      }
      
      // Report console errors
      if (consoleLogs.length > 0) {
        console.log(`   Console issues:`);
        consoleLogs.slice(0, 3).forEach(log => {
          console.log(`     ${log}`);
        });
      }
      
      // Take a screenshot for documentation
      await page.screenshot({ 
        path: `test-screenshots/${pageTest.url.split('/').pop() || 'page'}.png`,
        fullPage: false 
      });
      
      // Wait a bit to observe
      await page.waitForTimeout(2000);
      
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
    } finally {
      await page.close();
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('Testing complete! Browser will close in 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  await browser.close();
}

// Create screenshots directory
import fs from 'fs';
const screenshotDir = 'test-screenshots';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

testAllPages().catch(console.error);