# ElPortal Navigation Architecture

## Overview

ElPortal uses a reference-based navigation system powered by Sanity CMS. This architecture ensures that navigation links remain valid even when page slugs change, providing a robust and maintainable solution for content management.

## Architecture Components

### 1. Reference-Based Linking

Navigation items in Sanity store **document references** (by `_id`) rather than hardcoded URLs. This provides several benefits:

- **Automatic Updates**: When a page's slug changes, all navigation links update automatically
- **Referential Integrity**: Sanity tracks which pages are referenced where
- **Type Safety**: References ensure links only point to valid documents

### 2. Data Flow

```
Sanity CMS                    Frontend (React)
    |                              |
    |-- Document Reference ------> |
    |   (_ref: "page-id-123")      |
    |                              |
    |-- GROQ Resolution ---------> |
    |   (internalLink->)           |
    |                              |
    |-- Resolved Data -----------> |
    |   {slug: "about-us"}         |
    |                              |
    |                              |-- Router Navigation
    |                              |   (/about-us)
```

### 3. Schema Structure

#### Link Schema (`link.ts`)
```typescript
{
  linkType: 'internal' | 'external',
  internalLink: Reference<Page>,  // Stores _ref to page document
  externalUrl: string,            // For external links
  title: string
}
```

#### Navigation Query Pattern
```groq
internalLink->{ 
  "slug": slug.current, 
  _type,
  _id 
}
```

## Implementation Details

### Frontend Link Resolution

We've implemented a robust link resolution system with comprehensive error handling:

```typescript
// src/utils/linkResolver.ts
export const resolveLink = (link: LinkType, componentName: string): string => {
  // Handles external links
  // Handles internal references
  // Logs broken references
  // Provides fallbacks
}
```

### Error States

1. **Missing Reference**: Page was deleted but still referenced
   - Logged as error with context
   - Falls back to homepage

2. **Missing Slug**: Page exists but has no slug
   - Logged as error
   - Falls back to homepage

3. **Invalid Link Type**: Unknown linkType value
   - Logged as warning
   - Falls back to homepage

## Real-Time Updates via Webhooks

### Setup Process

1. **API Endpoint**: `/api/revalidate`
   - Validates webhook signatures using HMAC
   - Processes Sanity document updates
   - Secure against unauthorized access

2. **Webhook Configuration**: 
   - Triggers on create/update/delete
   - Sends document data to API endpoint
   - Uses shared secret for security

3. **Frontend Response**:
   - For SPAs: Consider implementing polling or WebSockets
   - For SSG: Trigger rebuilds
   - For SSR: Clear caches

## Navigation Health Monitoring

### Health Check Utility

Run periodic health checks to identify issues:

```bash
npm run navigation:health
```

This utility:
- Scans all navigation links
- Identifies broken references
- Finds orphaned pages
- Provides actionable recommendations

### Sample Output
```
📊 NAVIGATION HEALTH REPORT
===========================
📈 Summary:
   Total links checked: 42
   ✅ Valid: 40
   ⚠️  Warnings: 1
   ❌ Broken: 1
   📄 Orphaned pages: 3
```

## Reference Protection

### Document Actions

We've implemented custom document actions that prevent deletion of referenced pages:

```typescript
// Checks for references before allowing deletion
const query = `*[references($documentId)]`
const references = await client.fetch(query)

if (references.length > 0) {
  // Show error: "This page is referenced in navigation"
  // Prevent deletion
}
```

## Best Practices

### 1. Content Editors

- **Always use the reference picker** when adding internal links
- **Check navigation health** after major changes
- **Don't delete pages** that are still in navigation

### 2. Developers

- **Use the linkResolver utility** for all link resolution
- **Monitor console logs** for broken references in development
- **Run health checks** before deployments
- **Set up webhook monitoring** for production

### 3. Slug Management

- **Slugs can be changed freely** - navigation will update automatically
- **Avoid duplicate slugs** - Sanity validates uniqueness
- **Use meaningful slugs** for SEO and user experience

## Troubleshooting

### Common Issues

1. **"Navigation link not working"**
   - Check browser console for errors
   - Run `npm run navigation:health`
   - Verify page exists and has a slug

2. **"Changed slug but link still shows old URL"**
   - Clear browser cache
   - Check if webhook is configured
   - Verify frontend is fetching fresh data

3. **"Can't delete a page"**
   - Page is referenced in navigation
   - Remove navigation references first
   - Then retry deletion

### Debug Commands

```bash
# Check navigation health
npm run navigation:health

# Test webhook locally
curl -X POST http://localhost:5173/api/revalidate \
  -H "Content-Type: application/json" \
  -H "sanity-webhook-signature: [signature]" \
  -d '{"_id": "test", "_type": "page"}'

# Check specific page references
npm run sanity:check-references [page-id]
```

## Future Enhancements

1. **Real-time Updates**: Implement WebSocket connection for instant updates
2. **Visual Link Checker**: Studio plugin to visualize navigation structure
3. **Automated Testing**: E2E tests for navigation integrity
4. **Analytics Integration**: Track broken link clicks

## Migration Guide

### From Hardcoded URLs to References

If migrating from hardcoded navigation:

1. Create pages in Sanity for all routes
2. Update navigation to use references
3. Set up redirects for old URLs
4. Monitor 404s during transition

### Bulk Operations

For bulk navigation updates:
```javascript
// Script to update all navigation references
const updateNavigationReferences = async (oldId, newId) => {
  // Implementation provided in scripts/
}
```

## Summary

ElPortal's navigation architecture provides:
- ✅ Automatic link updates when slugs change
- ✅ Protection against broken links
- ✅ Real-time update capability
- ✅ Comprehensive error handling
- ✅ Health monitoring tools

This creates a robust, maintainable navigation system that scales with your content needs.