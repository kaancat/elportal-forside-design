/**
 * XML Sitemap Generator
 * Generates sitemap.xml following Google's sitemap protocol
 * https://www.sitemaps.org/protocol.html
 */

import { SanityService } from '@/services/sanityService';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Escapes special XML characters in URLs
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Formats a date to W3C datetime format (ISO 8601)
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Generates a single URL entry for the sitemap
 */
function generateUrlEntry(url: SitemapUrl): string {
  const escapedLoc = escapeXml(url.loc);
  let entry = `  <url>\n    <loc>${escapedLoc}</loc>`;
  
  if (url.lastmod) {
    entry += `\n    <lastmod>${formatDate(url.lastmod)}</lastmod>`;
  }
  
  if (url.changefreq) {
    entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
  }
  
  if (url.priority !== undefined) {
    entry += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
  }
  
  entry += '\n  </url>';
  return entry;
}

/**
 * Generates the complete sitemap XML
 */
export function generateSitemapXml(urls: SitemapUrl[]): string {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const footer = '\n</urlset>';
  
  const urlEntries = urls.map(generateUrlEntry).join('\n');
  
  return `${header}\n${urlEntries}${footer}`;
}

/**
 * Fetches all pages from Sanity and generates sitemap data
 */
export async function generateSitemapData(baseUrl: string = (process.env.SITE_URL || 'https://dinelportal.dk')): Promise<SitemapUrl[]> {
  const urls: SitemapUrl[] = [];
  
  // Add homepage with highest priority
  urls.push({
    loc: baseUrl,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: 1.0
  });
  
  try {
    // Fetch all pages from Sanity
    const pages = await SanityService.getAllPages();
    
    if (pages && Array.isArray(pages)) {
      pages.forEach(page => {
        // Skip pages marked as noIndex
        if (page.noIndex) {
          return;
        }
        
        // Determine priority based on page type and slug
        let priority = 0.8;
        let changefreq: SitemapUrl['changefreq'] = 'weekly';
        
        // High priority pages
        if (['elpriser', 'sammenlign-elpriser', 'elselskaber'].includes(page.slug)) {
          priority = 0.9;
          changefreq = 'daily';
        }
        // Medium priority pages
        else if (['groen-energi', 'spar-penge', 'elregning'].includes(page.slug)) {
          priority = 0.7;
          changefreq = 'weekly';
        }
        // Low priority pages
        else if (['om-os', 'kontakt', 'privatlivspolitik', 'betingelser'].includes(page.slug)) {
          priority = 0.5;
          changefreq = 'monthly';
        }
        
        urls.push({
          loc: `${baseUrl}/${page.slug}`,
          lastmod: page._updatedAt || page._createdAt || new Date().toISOString(),
          changefreq,
          priority
        });
      });
    }
    
    // Add specific important routes if they exist
    const importantRoutes = [
      { path: '/beregner', priority: 0.9, changefreq: 'weekly' as const },
      { path: '/live-priser', priority: 0.8, changefreq: 'hourly' as const },
      { path: '/vindstod', priority: 0.9, changefreq: 'weekly' as const },
    ];
    
    // Check if these routes exist and aren't already in the sitemap
    importantRoutes.forEach(route => {
      const exists = urls.some(url => url.loc === `${baseUrl}${route.path}`);
      if (!exists) {
        // You might want to verify these routes exist in your app
        urls.push({
          loc: `${baseUrl}${route.path}`,
          lastmod: new Date().toISOString(),
          changefreq: route.changefreq,
          priority: route.priority
        });
      }
    });
    
  } catch (error) {
    console.error('Error fetching pages for sitemap:', error);
  }
  
  // Sort by priority (highest first)
  urls.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  return urls;
}

/**
 * Generates a complete sitemap.xml content
 */
export async function generateSitemap(baseUrl?: string): Promise<string> {
  const urls = await generateSitemapData(baseUrl);
  return generateSitemapXml(urls);
}

/**
 * Generates a sitemap index file for large sites
 * (For future use when the site grows)
 */
export function generateSitemapIndex(sitemaps: { loc: string; lastmod?: string }[]): string {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const footer = '\n</sitemapindex>';
  
  const entries = sitemaps.map(sitemap => {
    let entry = `  <sitemap>\n    <loc>${escapeXml(sitemap.loc)}</loc>`;
    if (sitemap.lastmod) {
      entry += `\n    <lastmod>${formatDate(sitemap.lastmod)}</lastmod>`;
    }
    entry += '\n  </sitemap>';
    return entry;
  }).join('\n');
  
  return `${header}\n${entries}${footer}`;
}

/**
 * Validates a sitemap URL structure
 */
export function validateSitemapUrl(url: SitemapUrl): boolean {
  // Check required field
  if (!url.loc || typeof url.loc !== 'string') {
    return false;
  }
  
  // Validate URL format
  try {
    new URL(url.loc);
  } catch {
    return false;
  }
  
  // Validate priority range
  if (url.priority !== undefined && (url.priority < 0 || url.priority > 1)) {
    return false;
  }
  
  // Validate changefreq values
  const validChangefreq = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
  if (url.changefreq && !validChangefreq.includes(url.changefreq)) {
    return false;
  }
  
  return true;
}
