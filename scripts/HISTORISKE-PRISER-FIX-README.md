# Historiske Priser Page - Comprehensive Fix

This directory contains scripts to fix all issues on the historiske-priser page.

## Issues Fixed

1. **Dynamic 2025 Price Trend**: Makes "Aktuel pristendens" dynamic with current year and prominent display
2. **Section Alignments**: Fixes all header alignments per requirements
3. **InfoCards Section**: Properly implements "Sådan Udnytter Du Historiske Prismønstre" with correct icons
4. **Conclusion Text**: Ensures complete text without cutoff
5. **Comprehensive Content**: Adds all missing sections with proper Danish content

## Running the Fix

### Option 1: Using Environment Variable
```bash
# Set the token in your environment
export SANITY_API_TOKEN="your-token-here"

# Run the fix script
npm run tsx scripts/fix-historiske-priser-comprehensive.ts

# Test the results
npm run tsx scripts/test-historiske-priser-fix.ts
```

### Option 2: Direct Token (One Line)
```bash
# Run with token inline
SANITY_API_TOKEN="your-token-here" npm run tsx scripts/fix-historiske-priser-comprehensive.ts

# Test with token inline
SANITY_API_TOKEN="your-token-here" npm run tsx scripts/test-historiske-priser-fix.ts
```

### Option 3: Add to .env.local
Add this line to your `.env.local` file:
```
SANITY_API_TOKEN=your-token-here
```

Then run:
```bash
npm run tsx scripts/fix-historiske-priser-comprehensive.ts
npm run tsx scripts/test-historiske-priser-fix.ts
```

## What the Scripts Do

### fix-historiske-priser-comprehensive.ts
- Fetches the current page
- Completely rebuilds the content structure with all fixes
- Updates the page in Sanity
- Verifies the update was successful

### test-historiske-priser-fix.ts
- Fetches the updated page
- Displays the content structure
- Verifies all requirements are met:
  - ✓ 2025 price trend section exists
  - ✓ All alignments are correct
  - ✓ InfoCards section is populated
  - ✓ Conclusion is complete

## Expected Output

After running the fix script, you should see:
```
🔧 Starting comprehensive fix for historiske-priser page...
📄 Found page: Historiske Elpriser
🔍 Current content blocks: [number]
✅ Page updated successfully!
📊 New content blocks: 13

🔍 Verifying update...
✅ Verification complete:
- Title: Historiske Elpriser
- Total blocks: 13
- Block types: hero, pageSection, monthlyProductionChart, ...

📐 Section alignments:
  - "📊 Aktuel Pristendens 2025": center
  - "CO₂-udledning og Miljøpåvirkning": left
  - "Valget mellem fast og variabel elpris": left
  - "Hvad Påvirker Historiske Elpriser?": left
  - "Historiske elpriser giver værdifuld indsigt": left
  - "Konklusion": center

🎴 Info cards sections:
  - "Sådan Udnytter Du Historiske Prismønstre": 4 cards
```

## Content Structure After Fix

1. **Hero** - Main header
2. **PageSection** - 📊 Aktuel Pristendens 2025 (CENTER, prominent)
3. **MonthlyProductionChart** - Historical price graph
4. **PageSection** - CO₂-udledning (LEFT)
5. **PriceExampleTable** - Fast vs Variabel (CENTER)
6. **PageSection** - Valget mellem fast og variabel (LEFT)
7. **PageSection** - Hvad Påvirker (LEFT)
8. **InfoCardsSection** - Sådan Udnytter Du (4 cards with proper icons)
9. **PageSection** - Historiske elpriser giver (LEFT)
10. **FAQGroup** - Frequently asked questions
11. **PageSection** - Konklusion (CENTER, complete text)
12. **CallToActionSection** - Link to current prices

## Troubleshooting

If you see "❌ Page not found!", ensure:
- The page slug is exactly "historiske-priser"
- You have the correct Sanity project ID and dataset
- Your token has write permissions

If you see validation errors:
- Check the Sanity Studio for any schema changes
- Ensure all required fields are included
- Verify icon names match the available options