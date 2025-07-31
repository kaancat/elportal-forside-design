# Fix Elpriser Page - Comprehensive Instructions

## Quick Start

1. Navigate to scripts folder:
   ```bash
   cd /Users/kaancatalkaya/Desktop/projects/elportal-forside-design/scripts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file and add the token (provided separately):
   ```bash
   echo "SANITY_API_TOKEN=your_token_here" > .env
   ```

4. Run the fix:
   ```bash
   npm run fix-elpriser
   ```

## What This Script Fixes

### 1. SEO Fields
- ✅ Clears null `ogImage` value (unsets the null, keeps field available)
- ✅ Removes deprecated `seo` field entirely

### 2. Hero with Calculator
- ✅ Populates missing title: "Sammenlign elpriser og spar penge"
- ✅ Populates missing subtitle: "Find det billigste elselskab i Danmark på under 1 minut"

### 3. Value Proposition Box
- ✅ Sets heading: "Derfor skal du sammenligne elpriser"
- ✅ Sets subheading: "Opdag fordelene ved at skifte elselskab"
- ✅ Creates 6 comprehensive value items with proper icon metadata:
  - 💰 Spar op til 3.000 kr. årligt
  - 🍃 100% grøn strøm
  - ⏰ Skift på 5 minutter
  - 🛡️ Uvildig rådgivning
  - 📈 Følg elpriserne live
  - 👥 Over 50.000 brugere

## Expected Output

```
🔧 Starting comprehensive fix for elpriser page...

📄 Found page: Elpriser
🔗 Slug: elpriser

1️⃣ Fixing SEO fields...
   - Clearing null ogImage value

2️⃣ Checking heroWithCalculator content...
   - Found heroWithCalculator block

3️⃣ Fixing Value Proposition Box...
   - Found valueProposition block

4️⃣ Applying all updates to Sanity...
   - Removing deprecated seo field

✅ Successfully fixed all validation errors!
🆔 Updated page ID: 1BrgDwXdqxJ08rMIoYfLjP

5️⃣ Verifying fixes...

📊 Verification Results:
✓ Page title: Elpriser
✓ ogImage cleared: true
✓ seo field removed: true
✓ heroWithCalculator has title: true
✓ valueProposition has heading: true
✓ valueProposition has subheading: true
✓ valueProposition item count: 6

🎉 All validation errors have been fixed!
📝 You can now view the page in Sanity Studio without validation errors.
```

## After Running

1. Go to Sanity Studio: https://dinelportal.sanity.studio
2. Navigate to the Elpriser page
3. Verify all validation errors are gone
4. Check that all content displays correctly

## Troubleshooting

If you see "Page not found":
- Verify page ID is correct: `1BrgDwXdqxJ08rMIoYfLjP`

If you see authentication errors:
- Check that the token is correctly set in `.env`
- Ensure token has write permissions

If validation errors persist:
- Check which specific fields are still causing issues
- The script logs detailed information about each step

## Token Information

The Sanity API token has been provided separately. Add it to your `.env` file before running the script.