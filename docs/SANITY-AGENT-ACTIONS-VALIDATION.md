# Sanity Agent Actions for Validation - Complete Guide

## Overview
This document explains how to use Sanity Agent Actions to troubleshoot and fix validation errors in ElPortal pages.

## What We Fixed
The energibesparende tips page had the following validation errors:
1. **faqGroup missing title field** - Added proper title
2. **faqGroup missing faqItems array** - Added 5 properly structured FAQ items
3. **FAQ items had invalid structure** - Fixed to use proper _type, _key, and Portable Text answers

## Key Learnings

### 1. Agent Actions API Structure
```typescript
// Requires apiVersion: 'vX' (experimental)
const client = createClient({
  apiVersion: 'vX',
  // ... other config
})

// Prompt API for analysis
await client.agent.action.prompt({
  instruction: 'Your analysis request',
  instructionParams: {
    document: {
      type: 'document',
      documentId: 'page-id'
    }
  },
  format: 'json' // or 'text'
})
```

### 2. Common Validation Issues
- **Field name mismatches**: hero uses `headline` not `title`
- **Array structure**: FAQ items must be inline objects with proper _type and _key
- **Portable Text format**: Rich text fields need proper block structure
- **Required fields**: Each block type has specific required fields

### 3. Validation Script Updates
We also discovered that the validation script itself had an error - it was checking for `faqs` field instead of `faqItems` in faqGroup blocks.

## Scripts Created

### 1. Agent Actions Validation Fixer
`scripts/fix-energibesparende-tips-agent-actions.ts`
- Uses prompt API to analyze validation errors
- Attempts to auto-fix using AI understanding
- Good for complex analysis but may misidentify blocks

### 2. Direct Structure Fixer
`scripts/fix-faq-structure-properly.ts`
- Directly finds and fixes faqGroup blocks
- Properly structures FAQ items with Portable Text
- More reliable for specific known issues

## How to Use for Future Pages

### Step 1: Run Comprehensive Validation
```bash
npx tsx scripts/comprehensive-validation.ts
```

### Step 2: Check Specific Page
```bash
npx tsx scripts/validate-energibesparende-tips-page.ts
# Update PAGE_ID in the script for other pages
```

### Step 3: Create Fix Script
Based on the errors found, create a fix script that:
1. Fetches the page document
2. Identifies problematic blocks
3. Fixes the structure
4. Updates the document
5. Verifies the fix

### Step 4: Common Fixes

#### Missing Required Fields
```typescript
if (!block.title) {
  block.title = 'Default Title'
}
```

#### Fix Array Structure
```typescript
const properItems = items.map(item => ({
  _type: 'itemType',
  _key: generateKey(),
  // ... proper fields
}))
```

#### Convert to Portable Text
```typescript
answer: [
  {
    _type: 'block',
    _key: generateKey(),
    style: 'normal',
    children: [{
      _type: 'span',
      _key: generateKey(),
      text: 'Your text here',
      marks: []
    }],
    markDefs: []
  }
]
```

## Best Practices

1. **Always validate after deployment** - Run validation scripts after creating new pages
2. **Check schema documentation** - Refer to `/sanityelpriscms/docs/SANITY-SCHEMA-REFERENCE.md`
3. **Use proper field names** - Common mistakes:
   - hero: `headline/subheadline` NOT `title/subtitle`
   - valueItem: `heading` NOT `title`
   - featureItem: `title` NOT `name`
4. **Test in Sanity Studio** - Always verify changes in the Studio interface

## Sanity Client Version
Ensure you have @sanity/client version 7.4.0+ for agent actions support:
```json
"@sanity/client": "^7.8.1"
```

## Summary
Agent Actions provide powerful AI-assisted validation and fixing capabilities, but sometimes direct structural fixes are more reliable. Always verify fixes with comprehensive validation and check the page in Sanity Studio.