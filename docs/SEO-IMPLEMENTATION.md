# SEO Implementation Guide for ElPortal

## Overview

This document describes the SEO implementation across the ElPortal platform, including both the Sanity CMS backend and the React frontend.

## Sanity CMS Schema

### Extended SEO Fields

All pages (including homepage) now support the following SEO fields:

1. **Basic SEO Fields**:
   - `seoMetaTitle` - Page title for search results (max 60 chars)
   - `seoMetaDescription` - Page description for search results (max 160 chars)

2. **Extended SEO Fields**:
   - `seoKeywords` - Array of keywords for SEO optimization
   - `ogImage` - Open Graph image for social media sharing
     - Includes `alt` text for accessibility
     - Recommended dimensions: 1200x630px
   - `noIndex` - Boolean to hide page from search engines

### Schema Implementation

Both `homePage.ts` and `page.ts` schemas now use `extendedSeoFields`:

```typescript
import { extendedSeoFields, seoGroup } from './shared/seoFields'

// In schema definition
groups: [seoGroup],
fields: [
  // ... other fields
  ...extendedSeoFields,
  // ... more fields
]
```

## Frontend Implementation

### Meta Tag Management

Both `Index.tsx` (homepage) and `GenericPage.tsx` (all other pages) now handle:

1. **Dynamic Title**: Updates `document.title` with `seoMetaTitle` or fallback
2. **Meta Description**: Updates the description meta tag
3. **Open Graph Image**: Dynamically sets OG image from Sanity
4. **NoIndex Handling**: Adds/removes robots meta tag based on settings

### Sanity Image Helper

The `getSanityImageUrl` function in `/src/lib/sanityImage.ts` properly constructs CDN URLs for Sanity images with transformation options:

```typescript
const imageUrl = getSanityImageUrl(ogImage.asset._ref, {
  width: 1200,
  height: 630,
  format: 'jpg'
})
```

## Usage in Sanity Studio

1. Navigate to any page or the homepage in Sanity Studio
2. Click on the "SEO & Metadata" tab
3. Fill in the fields:
   - **SEO Meta Title**: Override the default page title
   - **SEO Meta Description**: Custom description for search results
   - **SEO Keywords**: Add relevant keywords (tags format)
   - **Open Graph Image**: Upload a 1200x630px image for social sharing
   - **Hide from search engines**: Check to add noindex directive

## Best Practices

### Title Tags
- Keep under 60 characters
- Include primary keyword near the beginning
- Make each page title unique
- Format: "Primary Keyword - Secondary Keyword | Brand"

### Meta Descriptions
- Keep under 160 characters
- Include a call-to-action
- Use target keywords naturally
- Make it compelling to increase click-through rate

### Open Graph Images
- Use 1200x630px dimensions
- Include text overlay for context
- Ensure text is readable on mobile
- Use brand colors and logo

### Keywords
- Focus on 3-5 primary keywords per page
- Include long-tail variations
- Research competitor keywords
- Avoid keyword stuffing

## Technical Implementation Details

### TypeScript Types

The `HomePage` and `SanityPage` interfaces have been updated to include all SEO fields:

```typescript
export interface HomePage {
  // ... other fields
  seoMetaTitle: string
  seoMetaDescription: string
  seoKeywords?: string[]
  ogImage?: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
    alt?: string
  }
  noIndex?: boolean
}
```

### Meta Tag Updates

The implementation uses DOM manipulation to update meta tags dynamically:

```javascript
// Update or create meta tags
const metaDescription = document.querySelector('meta[name="description"]')
if (metaDescription) {
  metaDescription.setAttribute('content', seoMetaDescription)
}
```

## Future Enhancements

1. **Structured Data**: Add JSON-LD schema markup for rich snippets
2. **Twitter Cards**: Add Twitter-specific meta tags
3. **Canonical URLs**: Implement canonical URL handling
4. **Sitemap**: Generate dynamic XML sitemap from Sanity pages
5. **Meta Tag Library**: Consider using React Helmet for better meta tag management
6. **Preview**: Add SEO preview in Sanity Studio
7. **Validation**: Add SEO scoring and suggestions in CMS

## Testing SEO Implementation

1. **Open Graph Debugger**: Use Facebook's Sharing Debugger
2. **Twitter Card Validator**: Test Twitter card rendering
3. **Google Search Console**: Monitor indexing and search performance
4. **Lighthouse**: Run SEO audits in Chrome DevTools
5. **Meta Tag Inspector**: Browser extensions for quick checks