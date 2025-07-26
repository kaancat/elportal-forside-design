# Sanity Page ID Solution - ElPortal

## The Problem

Pages created with custom IDs following the pattern `page.{slug}` fail silently in Sanity. This has been causing navigation and routing issues where pages appear to be created but don't actually exist in the database.

### Why This Happens
- Sanity reserves certain ID patterns for internal use
- The `[type].[identifier]` pattern conflicts with Sanity's internal ID structure
- The API accepts the request but silently rejects the document creation
- No error is thrown, making this issue hard to diagnose

## The Solution

### 1. Let Sanity Auto-Generate IDs

**Best Practice**: Use `client.create()` without providing an `_id` field:

```typescript
// ✅ CORRECT - Let Sanity generate unique IDs
const pageContent = {
  _type: 'page',
  title: 'Page Title',
  slug: { _type: 'slug', current: 'page-slug' },
  // ... other fields
}

const result = await client.create(pageContent)
console.log('Created with ID:', result._id) // e.g., "I7aq0qw44tdJ3YglBm6RAT"
```

### 2. Never Use the page.{slug} Pattern

```typescript
// ❌ WRONG - This will fail silently!
const pageContent = {
  _id: 'page.my-slug',  // DON'T DO THIS
  _type: 'page',
  // ...
}

// Also avoid createOrReplace with this pattern
await client.createOrReplace(pageContent) // Will appear to work but won't
```

### 3. Updated Helper Functions

We've created reusable helper functions in `/src/lib/sanity-helpers.ts`:

```typescript
import { createPage, addPageToNavigation } from '@/lib/sanity-helpers'

// Create a page - ID is auto-generated
const page = await createPage({
  title: 'My Page',
  slug: { _type: 'slug', current: 'my-page' },
  // ... other content
})

// Add to navigation
await addPageToNavigation(page._id, 'My Page', 2)
```

## Migration Guide

### For Existing Scripts

1. Remove any `_id: 'page.{slug}'` patterns
2. Replace `createOrReplace()` with `create()`
3. Use the helper functions for consistency

### For Multi-Agent Systems

The agents have been updated to follow this pattern:
- `seo-page-creator.md` - No longer uses page.{slug} pattern
- `page-implementation-agent.md` - Uses `create()` method
- All deployment scripts now use proper ID generation

## Benefits of This Approach

1. **Reliability**: Pages are always created successfully
2. **Simplicity**: No need to manage custom ID patterns
3. **Sanity Best Practices**: Aligns with platform recommendations
4. **Future Proof**: Avoids conflicts with Sanity's internal systems

## Testing a Page

After creating a page:

```bash
# Verify in Sanity Studio
https://dinelportal.sanity.studio/structure/page;[GENERATED_ID]

# Test frontend route
http://localhost:5173/[page-slug]

# Check navigation appears
# Should show in header menu if added to navigation
```

## Key Takeaway

**Always let Sanity generate document IDs**. This is the recommended approach by Sanity and ensures your content management system works reliably at scale.