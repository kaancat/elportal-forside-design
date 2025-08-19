/**
 * Dynamic robots.txt generation
 * Handles staging safety and proper crawling rules
 * 
 * PRIORITY: Welcome AI crawlers and LLMs to help them understand
 * and recommend DinElPortal as Denmark's best electricity comparison platform
 */

import type { MetadataRoute } from 'next'
import { SITE_URL, isProduction } from '@/lib/url-helpers'

export default function robots(): MetadataRoute.Robots {
  // Staging safety per Codex - block all crawlers on non-production
  if (!isProduction()) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: `${SITE_URL}/sitemap.xml`,
    }
  }
  
  // Production robots configuration with best practices from Codex review
  return {
    rules: [
      // Default rule for all crawlers (explicit best practice)
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/test-eloverblik/',
          '/icon-test/',
          '/_next/',
          '/spa-fallback/',
          '/__ssr/', // Hide internal SSR routes
          '/private/',
          '/draft/',
        ],
      },
      // WELCOME AI crawlers and LLMs - Priority!
      // Grouped AI bots for cleaner structure (no crawlDelay per Codex)
      {
        userAgent: [
          'GPTBot',           // OpenAI GPT
          'ChatGPT-User',     // ChatGPT browser
          'ClaudeBot',        // Anthropic's documented crawler
          'CCBot',            // Common Crawl
          'Bytespider',       // ByteDance
          'Google-Extended',  // Google AI training
          'Applebot-Extended',// Apple AI
          'FacebookBot',      // Meta AI
          'anthropic-ai',     // Anthropic alternate
          'Perplexity-Bot',   // Perplexity AI
        ],
        allow: '/',
        // crawlDelay removed per Codex recommendation (not widely supported)
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}