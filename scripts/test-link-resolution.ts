#!/usr/bin/env npx tsx

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../.env') })

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID!,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
})

// Copy of the resolveLink function for testing
const resolveLink = (link: any, componentName: string = 'Component'): string => {
  if (!link) {
    console.warn(`[${componentName}] Link is null or undefined`);
    return '/';
  }

  if (link.linkType === 'external') {
    if (!link.externalUrl) {
      console.warn(`[${componentName}] External link missing URL:`, {
        link,
        title: link.title,
        _key: link._key
      });
    }
    return link.externalUrl || '#';
  }
  
  if (link.linkType === 'internal') {
    if (!link.internalLink) {
      console.error(`[${componentName}] Broken internal link - missing reference:`, {
        link,
        title: link.title,
        _key: link._key,
        _ref: link._ref,
        message: 'This usually happens when a referenced page has been deleted'
      });
      return '/';
    }
    
    if (!link.internalLink.slug) {
      console.error(`[${componentName}] Internal link missing slug:`, {
        link,
        internalLink: link.internalLink,
        title: link.title,
        message: 'Referenced document exists but has no slug'
      });
      return '/';
    }
    
    return `/${link.internalLink.slug}`;
  }
  
  console.warn(`[${componentName}] Unknown link type:`, {
    link,
    linkType: link.linkType,
    message: 'Expected linkType to be "internal" or "external"'
  });
  return '/';
};

async function testLinkResolution() {
  console.log('🧪 Testing link resolution for leverandoer-sammenligning...\n')
  
  // Get the exact same query as getSiteSettings
  const query = `*[_type == "siteSettings"][0] {
    ...,
    headerLinks[] {
      ...,
      _type == 'link' => {
        ...,
        internalLink->{ "slug": slug.current, _type }
      },
      _type == 'megaMenu' => {
        ...,
        content[] {
          ...,
          _type == 'megaMenuColumn' => {
            ...,
            items[] {
              ...,
              icon {
                ...,
                metadata {
                  inlineSvg,
                  iconName,
                  url,
                  color
                }
              },
              link {
                ...,
                linkType,
                title,
                externalUrl,
                internalLink->{ "slug": slug.current, _type }
              }
            }
          }
        }
      }
    }
  }`
  
  const siteSettings = await client.fetch(query)
  
  // Find our link in the mega menu
  let leverandoerLink = null
  
  siteSettings.headerLinks.forEach((item: any) => {
    if (item._type === 'megaMenu') {
      item.content?.forEach((column: any) => {
        if (column._type === 'megaMenuColumn') {
          column.items?.forEach((megaItem: any) => {
            if (megaItem.link?.internalLink?.slug === 'leverandoer-sammenligning') {
              leverandoerLink = megaItem.link
            }
          })
        }
      })
    }
  })
  
  if (!leverandoerLink) {
    console.log('❌ Could not find leverandoer-sammenligning link in navigation')
    return
  }
  
  console.log('📋 Found link structure:')
  console.log(JSON.stringify(leverandoerLink, null, 2))
  
  console.log('\n🔧 Testing resolveLink function:')
  const resolvedUrl = resolveLink(leverandoerLink, 'TEST')
  console.log(`✅ Resolved URL: ${resolvedUrl}`)
  
  if (resolvedUrl === '/leverandoer-sammenligning') {
    console.log('\n✅ SUCCESS! The link should work correctly.')
    console.log('Expected URL: /leverandoer-sammenligning')
    console.log('Actual URL: ' + resolvedUrl)
  } else {
    console.log('\n❌ PROBLEM! The link is not resolving correctly.')
    console.log('Expected URL: /leverandoer-sammenligning')
    console.log('Actual URL: ' + resolvedUrl)
  }
}

testLinkResolution()