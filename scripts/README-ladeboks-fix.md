# Ladeboks Page Fix Scripts

This directory contains scripts to fix validation errors in the Ladeboks page in Sanity CMS.

## Problem

The Ladeboks page has multiple field naming errors that prevent it from working properly:
- Hero sections use "heading" instead of "headline"
- PageSection uses "heading" instead of "title"  
- ValueProposition uses "heading" instead of "title" and "values" instead of "items"
- LivePriceGraph uses "heading" instead of "title"
- FaqGroup uses "heading" instead of "title" and "faqs" instead of "faqItems"
- And several other field mismatches

## Scripts

### 1. validate-ladeboks-page.ts
Validates the current state of the page and reports all errors.

```bash
npm run tsx scripts/validate-ladeboks-page.ts
```

### 2. fix-ladeboks-page.ts
Quick fix that updates all field names to match the schemas.

```bash
npm run tsx scripts/fix-ladeboks-page.ts
```

### 3. fix-ladeboks-page-safe.ts
Safe version that creates a backup before making changes.

```bash
npm run tsx scripts/fix-ladeboks-page-safe.ts
```

## Usage

1. First, run the validation script to see current errors:
   ```bash
   npm run tsx scripts/validate-ladeboks-page.ts
   ```

2. Then run one of the fix scripts:
   - Use `fix-ladeboks-page.ts` for a quick fix
   - Use `fix-ladeboks-page-safe.ts` to create a backup first (recommended)

3. After fixing, run the validation script again to confirm all issues are resolved.

## Environment

Make sure you have `SANITY_API_TOKEN` set in your `.env` file with write permissions.

## Field Mappings

| Component Type | Wrong Field | Correct Field |
|----------------|-------------|---------------|
| hero | heading | headline |
| pageSection | heading | title |
| valueProposition | heading | title |
| valueProposition | values | items |
| livePriceGraph | heading | title |
| faqGroup | heading | title |
| faqGroup | faqs | faqItems |
| featureList | heading | title |
| callToActionSection | headline | title |
| richTextSection | (no title field) | (no title field) |
| chargingBoxShowcase | (uses heading correctly) | heading |

## Notes

- The `chargingBoxShowcase` component actually uses "heading" as its correct field name
- The `richTextSection` component doesn't have any title field - only content
- All array items need `_key` properties
- Some components have required fields that must be present