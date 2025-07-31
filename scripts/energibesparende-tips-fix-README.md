# Fix Energibesparende Tips Page - Comprehensive Solution

## Overview
This script fixes all validation errors and alignment issues on the `energibesparende-tips` page in Sanity.

## Issues Fixed

### 1. Frontend Alignment Issues
- **"Når Dine Vaner Ikke Er Nok: Forstå Din Elpris"** - Changed from center to LEFT align
- **"Det Sidste, Vigtige Skridt: Vælger du det Rigtige Elselskab?"** - Changed from center to LEFT align

### 2. Sanity Validation Errors
- **Live Price Graph**: Added missing `apiRegion: 'DK1'` field
- **Renewable Energy Forecast**: Added descriptive `leadingText` for better user understanding
- **Value Proposition Box**: 
  - Migrated from deprecated fields (`title` → `heading`, `items` → `valueItems`)
  - Removed invalid fields: `description`, `features`, `headerAlignment`, `values`
  - Properly structured `valueItems` array with correct schema

## How to Run

### Option 1: Using the Shell Script (Recommended)
```bash
cd /Users/kaancatalkaya/Desktop/projects/elportal-forside-design
./scripts/run-energibesparende-tips-fix.sh YOUR_SANITY_TOKEN
```

### Option 2: Direct TypeScript Execution
```bash
cd /Users/kaancatalkaya/Desktop/projects/elportal-forside-design
npx ts-node scripts/fix-energibesparende-tips-comprehensive.ts YOUR_SANITY_TOKEN
```

### Option 3: Using Environment Variable
1. Add to `.env.local`:
   ```
   SANITY_API_TOKEN=YOUR_TOKEN_HERE
   ```
2. Run without arguments:
   ```bash
   npx ts-node scripts/fix-energibesparende-tips-comprehensive.ts
   ```

## Your Sanity Credentials
- **Project ID**: yxesi03x
- **Dataset**: production
- **Token**: [Use the provided token from your credentials]

## What the Script Does

1. **Fetches** the current page from Sanity
2. **Analyzes** each content block for issues
3. **Fixes** all validation errors and alignment issues:
   - Sets correct `headerAlignment` values
   - Adds missing required fields
   - Migrates deprecated field names
   - Removes invalid fields
4. **Updates** the page in Sanity with fixed content
5. **Reports** success with a summary of changes

## Expected Output

```
🔧 ElPortal - Fix Energibesparende Tips Page
===========================================

🚀 Running fix script...

Fetching energibesparende-tips page...
Current page structure: [JSON output]

Fixed page structure: [JSON output]

Updating page in Sanity...
✅ Page updated successfully!
Page ID: page.energibesparende-tips

📋 Summary of fixes applied:
1. ✅ Set headerAlignment to "left" for two pageSections
2. ✅ Added apiRegion: "DK1" to livePriceGraph
3. ✅ Added descriptive leadingText to renewableEnergyForecast
4. ✅ Migrated valueProposition from deprecated fields to correct schema
5. ✅ Removed all invalid fields from valueProposition
```

## Verification

After running the script:
1. Visit https://dinelportal.sanity.studio
2. Navigate to Pages → "Energibesparende Tips"
3. Check that all validation errors are gone
4. Preview the page to ensure proper left alignment

## Troubleshooting

### Token Error
If you see "No Sanity API token provided!", ensure you're passing the token as an argument or have it in `.env.local`.

### Permission Error
If you get permission errors, ensure your token has write access to the production dataset.

### Network Error
If the script fails due to network issues, simply run it again - it's idempotent and safe to re-run.

## Technical Details

The script handles these specific schema migrations:
- `valueProposition.title` → `valueProposition.heading`
- `valueProposition.items` → `valueProposition.valueItems`
- Removes non-existent fields from valueProposition
- Ensures all required fields are present with correct types