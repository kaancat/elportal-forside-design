# Elprisberegner Schema Validation Report

## Summary
The elprisberegner page had several schema validation issues that were causing undefined values and missing required fields. All issues have been successfully resolved.

## Issues Found and Fixed

### 1. livePriceGraph Component
**Issue**: Using `region` field instead of required `apiRegion` field
**Fix**: Renamed `region` to `apiRegion`
**Schema Requirements**:
- Required: `title` (string), `apiRegion` (string - "DK1" or "DK2")
- Optional: `subtitle` (string), `headerAlignment` (string - "left", "center", "right")

### 2. energyTipsSection Component
**Issue**: The component appears to be using a custom implementation with `tips` array instead of the schema's `showCategories`
**Note**: This is not a validation error since all fields are optional in the schema
**Schema Requirements**:
- All fields are optional with defaults
- Default title: "Praktiske energispare tips"
- Default subtitle: "Følg disse simple råd for at reducere dit energiforbrug"

### 3. faqGroup Component
**Issue**: Using `faqs` field instead of required `faqItems` field
**Fix**: Renamed `faqs` to `faqItems`
**Schema Requirements**:
- Required: `title` (string), `faqItems` (array, minimum 1 item)
- faqItems must be inline objects, NOT references

### 4. infoCardsSection Component
**Issue**: None found - all required fields were present
**Schema Requirements**:
- Required for each card: `title` (string)
- Optional: `description`, `icon`, `iconColor`, `bgColor`

### 5. callToActionSection Component
**Issue**: Using `primaryCta`/`secondaryCta` structure instead of required flat fields
**Fix**: Extracted `buttonText` and `buttonUrl` from `primaryCta` while keeping original structure
**Schema Requirements**:
- Required: `title` (string), `buttonText` (string), `buttonUrl` (string)

## Lessons Learned

### Common Schema Mismatches
1. **Field Name Changes**: Often fields are renamed between schema versions (e.g., `region` → `apiRegion`, `faqs` → `faqItems`)
2. **Structure Changes**: Components may evolve from flat fields to nested objects (e.g., `buttonText` → `primaryCta.text`)
3. **Optional vs Required**: Always check which fields are required in the schema

### Best Practices
1. **Always Read Schema Files**: Before creating content, check the actual schema definition in `/sanityelpriscms/schemaTypes/`
2. **Use Validation Scripts**: Run validation before deploying to catch issues early
3. **Maintain Backward Compatibility**: When fixing issues, preserve original fields when possible
4. **Document Custom Implementations**: If a component uses different fields than the schema, document why

## Verification Steps
To verify all issues are resolved:
```bash
# Check the page structure
npx tsx scripts/analyze-elprisberegner-schema.ts

# Run comprehensive validation
npm run validate:comprehensive
```

## Schema Quick Reference

### Required Fields by Component
- **livePriceGraph**: title, apiRegion
- **faqGroup**: title, faqItems (array with min 1)
- **infoCardsSection**: cards[].title
- **callToActionSection**: title, buttonText, buttonUrl

### Common Default Values
- **headerAlignment**: "center" (for most components)
- **displayMode**: "tabs" (for energyTipsSection)
- **columns**: 3 (for infoCardsSection)

## Migration Script
The fix was applied using: `scripts/fix-elprisberegner-validation.ts`

This script can be used as a template for fixing similar validation issues on other pages.