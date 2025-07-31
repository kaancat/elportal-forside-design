# Historiske Priser Page Fixes

This collection of scripts fixes various issues on the historiske-priser page.

## Scripts Overview

### 1. `fix-historiske-priser-alignments.ts`
Fixes alignment issues for specific components:
- **LEFT aligned**: CO₂-udledning, Valget mellem fast og variabel pris, Hvad Påvirker Elpriserne?, conclusion section
- **CENTER aligned**: Fast vs Variabel Pris section

### 2. `fix-dynamic-price-trend.ts`
Makes the price trend dynamic:
- Updates "Aktuel pristendens 2024: 0,42 kr/kWh" to use current year
- Makes it visually prominent (h3 style with emoji)
- Updates year references throughout the content
- TODO: Connect to actual price API for real-time average

### 3. `fix-text-cutoff.ts`
Fixes text that appears cut off with "...":
- Specifically targets the conclusion section
- Ensures full text is displayed with proper paragraph breaks

### 4. `fix-info-cards-section.ts`
Fixes the "Sådan Udnytter Du Historiske Prismønstre" section:
- Checks if content exists in Sanity
- Fixes icon structures for proper Studio display
- Populates missing content if needed

### 5. `fix-all-historiske-priser-issues.ts` ⭐
**Master script that runs all fixes in sequence**
- Fetches page once for efficiency
- Applies all fixes in correct order
- Provides comprehensive summary of changes

## Running the Scripts

### Prerequisites
1. Ensure you have a `.env` file with your Sanity API token:
   ```
   SANITY_API_TOKEN=your-token-here
   ```

2. Install dependencies:
   ```bash
   npm install @sanity/client dotenv
   ```

### Running Individual Scripts
```bash
# Fix alignments only
npx tsx scripts/fix-historiske-priser-alignments.ts

# Fix dynamic price trend only
npx tsx scripts/fix-dynamic-price-trend.ts

# Fix text cutoff only
npx tsx scripts/fix-text-cutoff.ts

# Fix info cards section only
npx tsx scripts/fix-info-cards-section.ts
```

### Running All Fixes (Recommended)
```bash
# Run the master script that applies all fixes
npx tsx scripts/fix-all-historiske-priser-issues.ts
```

## What Gets Fixed

1. **Alignment Issues**
   - Components now properly align left or center as specified
   - Improves visual hierarchy and readability

2. **Dynamic Price Trend**
   - Shows current year (2025) instead of hardcoded 2024
   - Price is highlighted with h3 style and emoji
   - Ready for API integration for real-time prices

3. **Text Cutoff**
   - Full conclusion text is displayed
   - Proper paragraph spacing maintained

4. **InfoCardsSection Display**
   - Icons converted to proper icon.manager format
   - Ensures content displays in both frontend and Sanity Studio

## Testing

After running the scripts:

1. **Check Frontend**: https://elportal-forside-design.vercel.app/historiske-priser
2. **Check Sanity Studio**: https://dinelportal.sanity.studio
3. **Verify**:
   - Price trend shows current year and is visually prominent
   - Alignments are correct for specified sections
   - No text is cut off
   - "Sådan Udnytter Du Historiske Prismønstre" shows in Sanity Studio

## Future Improvements

1. **Connect to Price API**: Update `getCurrentAveragePrice()` in the scripts to fetch real average prices
2. **Automated Testing**: Add tests to verify fixes are applied correctly
3. **Scheduled Updates**: Run price trend update script daily/weekly via cron job