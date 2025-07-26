# Sanity Schema Validation Fix for Historiske Priser Page

## Summary
Fixed critical validation errors in the "historiske-priser" page creation script by aligning field structures with actual Sanity CMS schemas.

## Issues Found and Fixed

### 1. Hero Schema Mismatch
**Problem**: Previous scripts used incorrect field names
```javascript
// ❌ WRONG - Used in old scripts
{
  title: "...",       // Field doesn't exist
  subtitle: "...",    // Field doesn't exist
  content: [...]      // Field doesn't exist
}

// ✅ CORRECT - Actual schema from hero.ts
{
  headline: "...",    // string field (required)
  subheadline: "...", // text field (optional)
  image: {...}        // image field (optional)
}
```

### 2. Provider List Schema Mismatch
**Problem**: Used fake provider references
```javascript
// ❌ WRONG - Non-existent provider references
providers: [
  { _type: 'reference', _ref: 'provider.vindstod' },
  { _type: 'reference', _ref: 'provider.ok' }
]

// ✅ CORRECT - Actual provider UUIDs from database
providers: [
  { _type: 'reference', _ref: '63c05ca2-cd1e-4f00-b544-6a2077d4031a', _key: '...' },
  { _type: 'reference', _ref: '9451a43b-6e68-4914-945c-73a81a508214', _key: '...' }
]
```

### 3. SEO Fields Schema Mismatch
**Problem**: Used nested seo object instead of flat fields
```javascript
// ❌ WRONG - Nested structure
seo: {
  title: "...",
  description: "...",
  keywords: [...]
}

// ✅ CORRECT - Flat structure from seoFields.ts
seoMetaTitle: "...",
seoMetaDescription: "...",
seoKeywords: [...]
```

### 4. Page Section Schema Issues
**Problem**: Incorrect field names and missing required fields
```javascript
// ❌ WRONG
{
  subtitle: "...",     // Field doesn't exist
  alignment: "..."     // Field doesn't exist
}

// ✅ CORRECT - From pageSection.ts
{
  title: "...",        // string field
  headerAlignment: "center", // required with specific options
  content: [...]       // array of blocks
}
```

### 5. Component Schema Validation
**Problem**: Missing required fields or incorrect field types

**Fixed Components:**
- **livePriceGraph**: Required `apiRegion` and `headerAlignment` fields
- **monthlyProductionChart**: Required `headerAlignment` field
- **co2EmissionsChart**: Required `headerAlignment` field, `leadingText` as array of blocks
- **priceCalculator**: Only has optional `title` field

## Validation Process Used

### 1. Schema Analysis
Read all relevant schema files from `/Users/kaancatalkaya/Desktop/projects/sanityelpriscms/schemaTypes/`:
- `hero.ts`
- `providerList.ts`
- `pageSection.ts`
- `page.ts`
- `shared/seoFields.ts`
- `livePriceGraph.ts`
- `monthlyProductionChart.ts`
- `co2EmissionsChart.ts`
- `priceCalculator.ts`

### 2. Database Verification
Queried existing data to find:
- Actual provider UUIDs in use
- Existing page structures that work
- Homepage provider list examples

### 3. Field Structure Mapping
Created exact mappings between:
- Schema definitions → Required fields
- Field types → Data structures
- Reference formats → Database IDs

## Final Script: create-historiske-priser-corrected.ts

The corrected script includes:
- ✅ Exact field names from schemas
- ✅ Proper data types for each field
- ✅ Required vs optional field handling
- ✅ Correct provider references
- ✅ Proper Portable Text structure
- ✅ Valid slug format
- ✅ Flat SEO field structure

## Deployment Result
```
✅ Corrected page created successfully!
Page ID: page.historiske-priser
Title: Historiske Elpriser i Danmark: Se Udviklingen & Find Billig Strøm
View at: https://dinelportal.sanity.studio/structure/page;page.historiske-priser
```

## Key Learnings for Future SEO Page Generation

### 1. Always Read Schemas First
Before creating any Sanity content, read the actual schema files to understand:
- Required vs optional fields
- Exact field names (case-sensitive)
- Data types (string vs text vs array)
- Reference formats

### 2. Query Existing Data
Use Sanity client to check:
- Existing provider/reference IDs
- Working page examples
- Actual data structures in use

### 3. Validate Field by Field
Each content block type has specific requirements:
- Some require `headerAlignment` (livePriceGraph, monthlyProductionChart, co2EmissionsChart)
- Some have only optional fields (priceCalculator)
- Arrays need `_key` properties for each item

### 4. Test Incrementally
- Start with basic page structure
- Add one content block at a time
- Validate after each addition

## Prevention for Future

1. **Schema Documentation**: Keep up-to-date mapping of all content block schemas
2. **Validation Helper**: Create a utility function to validate content before sending to Sanity
3. **Reference Checker**: Query and cache valid reference IDs
4. **Template Library**: Maintain working examples for each content block type

This fix ensures smooth deployment of future SEO pages without manual intervention.