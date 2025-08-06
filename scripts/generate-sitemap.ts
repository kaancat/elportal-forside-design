#!/usr/bin/env tsx
/**
 * Script to generate sitemap.xml
 * Run with: npm run generate:sitemap
 */

import { generateSitemap } from '../src/utils/sitemapGenerator';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    console.log('🗺️  Generating sitemap...');
    
    // Generate sitemap content
    const sitemapXml = await generateSitemap('https://elportal.dk');
    
    // Write to public directory
    const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    await fs.writeFile(publicPath, sitemapXml, 'utf-8');
    
    console.log('✅ Sitemap generated successfully at public/sitemap.xml');
    
    // Also write to dist directory if it exists (for production builds)
    const distPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
    try {
      await fs.access(path.dirname(distPath));
      await fs.writeFile(distPath, sitemapXml, 'utf-8');
      console.log('✅ Sitemap also written to dist/sitemap.xml');
    } catch {
      // dist directory doesn't exist, that's fine
    }
    
    // Log sitemap stats
    const urls = sitemapXml.match(/<url>/g);
    console.log(`📊 Total URLs in sitemap: ${urls ? urls.length : 0}`);
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the script
main();