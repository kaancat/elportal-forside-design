# Sanity Page Creation Guidelines & Troubleshooting

## 🚨 Critical Discovery: The Page ID Problem

### What Happened
We spent hours debugging why the "prognoser" page link wasn't working in navigation, despite:
- ✅ Page existing in Sanity
- ✅ Correct slug (/prognoser)
- ✅ Proper reference in mega menu
- ✅ Webhooks configured
- ✅ React Query navigation updates

**The Root Cause**: The page was created with a custom ID `page.prognoser` (with a dot) instead of letting Sanity generate a standard ID.

### Why This Breaks
Sanity expects document IDs in a specific format. When you use custom IDs with special characters (like dots), the reference resolution system (`->` operator in GROQ) can fail silently.

**Working IDs**: `1BrgDwXdqxJ08rMIoYfLjP`, `qgCxJyBbKpvhb2oGYjlhjr`  
**Broken ID**: `page.prognoser` ❌

## ✅ Correct Page Creation Patterns

### 1. Creating New Pages - Let Sanity Generate IDs

```typescript
// ✅ CORRECT - Let Sanity generate the ID
const newPage = await client.create({
  _type: 'page',
  title: 'Your Page Title',
  slug: { _type: 'slug', current: 'your-slug' },
  contentBlocks: [...]
})

// ❌ WRONG - Don't specify custom IDs
const newPage = await client.createOrReplace({
  _id: 'page.your-slug',  // This can break references!
  _type: 'page',
  ...
})
```

### 2. When to Use createOrReplace

Only use `createOrReplace` with custom IDs for:
- Site settings (`siteSettings` - singleton)
- Home page (`homePage` - singleton)
- Never for regular content pages!

### 3. Updating Existing Pages

```typescript
// ✅ CORRECT - Update by querying first
const page = await client.fetch(`*[_type == "page" && slug.current == $slug][0]`, { slug })
if (page) {
  await client.patch(page._id).set({ ...updates }).commit()
}

// ❌ WRONG - Don't assume custom ID patterns
await client.patch('page.slug-name').set({ ...updates }).commit()
```

## 🔍 Navigation Troubleshooting Checklist

When a new page doesn't appear in navigation:

### 1. Check Page ID Format
```bash
# Run this to check page IDs
npx tsx -e "
const client = require('@sanity/client').createClient({...})
const pages = await client.fetch('*[_type == \"page\"]{ _id, title, \"slug\": slug.current }')
pages.forEach(p => console.log(\`ID: \${p._id} | Slug: \${p.slug}\`))
"
```

Look for:
- Custom IDs with dots, dashes, or prefixes
- Duplicate pages with similar slugs

### 2. Verify Reference Resolution
```javascript
// Test if a reference resolves properly
const test = await client.fetch(`{
  'ref': { '_ref': 'YOUR_PAGE_ID', '_type': 'reference' },
  'resolved': *[_id == 'YOUR_PAGE_ID'][0]
}`)
```

### 3. Check Navigation Data Flow
1. **Sanity Query**: Does the page appear in the GROQ query?
2. **React Component**: Is the link being rendered?
3. **Link Resolution**: Does `resolveLink()` return the correct URL?

### 4. Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Custom ID with dots | Link doesn't work despite correct data | Recreate page without custom ID |
| Missing reference | Link returns null/undefined | Check if page was deleted |
| Duplicate pages | Wrong page loads | Delete duplicates, update references |
| CDN caching | Old navigation data | Disable CDN (`useCdn: false`) |

## 🛠️ The Fix Script Pattern

When you encounter the ID issue:

```typescript
// 1. Backup the content
const oldPage = await client.fetch(`*[_id == "problematic.id"][0]`)
const { _id, _rev, _createdAt, _updatedAt, ...content } = oldPage

// 2. Create new page (let Sanity generate ID)
const newPage = await client.create(content)

// 3. Update all references
// - Navigation links
// - Mega menu items
// - Any other references

// 4. Delete old page (if no remaining references)
await client.delete('problematic.id')
```

## 📝 Best Practices Going Forward

### For AI Agents & Developers

1. **Never use custom IDs** for content pages
2. **Always verify ID format** after creating pages
3. **Test navigation immediately** after adding new pages
4. **Use the troubleshooting checklist** when links don't work
5. **Document any custom ID usage** if absolutely necessary

### For Page Creation Scripts

```typescript
// Standard template for creating SEO pages
async function createSEOPage(slug: string, content: any) {
  // Check if page already exists
  const existing = await client.fetch(
    `*[_type == "page" && slug.current == $slug][0]`,
    { slug }
  )
  
  if (existing) {
    console.log(`Page ${slug} already exists with ID: ${existing._id}`)
    return existing
  }
  
  // Create new page - NO CUSTOM ID!
  const newPage = await client.create({
    _type: 'page',
    slug: { _type: 'slug', current: slug },
    ...content
  })
  
  console.log(`✅ Created page ${slug} with ID: ${newPage._id}`)
  return newPage
}
```

## 🚀 Quick Reference

### Do's ✅
- Use `client.create()` for new pages
- Let Sanity generate IDs
- Test navigation after creating pages
- Use standard Sanity ID format

### Don'ts ❌
- Don't use `createOrReplace` with custom IDs for pages
- Don't use dots in custom IDs
- Don't assume ID patterns
- Don't skip testing navigation

## 📚 Related Documentation
- [React Query Navigation Implementation](./NAVIGATION_ARCHITECTURE.md)
- [Webhook Setup Guide](./WEBHOOK_SETUP_GUIDE.md)
- [Sanity Schema Validation](./SANITY_SCHEMA_VALIDATION_FIX.md)

---

**Remember**: When in doubt, let Sanity generate the ID. It will save you hours of debugging!