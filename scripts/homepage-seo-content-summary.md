# Homepage SEO Content Update Summary

## Overview
This script updates the ElPortal.dk homepage with comprehensive Danish SEO content for sections 6-11, replacing placeholder text with rich, keyword-optimized content.

## Content Sections Updated

### Section 6: Elpriser Overview (200+ words)
**Keywords:** elpriser, spotpriser, strømpriser, DK1, DK2
- Explains electricity price dynamics in Denmark
- Covers market factors and regional differences
- Highlights potential savings (up to 3,000 kr/year)
- Internal link to `/elpriser`

### Section 7: Elselskaber Overview (250+ words)
**Keywords:** elselskaber, elleverandører, strømudbydere, liberalisering
- Market liberalization history (since 2003)
- Focus on established providers for stability
- Benefits of choosing reliable electricity companies
- Internal link to `/elselskaber`

### Section 9: Live Spot Prices (200+ words)
**Keywords:** spotpriser, elpris i dag, energinet, Nord Pool
- Explains spot price mechanics and Nord Pool
- Data sourcing from Energinet
- Tips for using price variations to save money
- Mentions negative prices and high wind production benefits

### Section 10: Appliance Calculator (200+ words)
**Keywords:** elforbrug, strømforbrug, beregn elforbrug, energibesparelser
- Breakdown of household electricity consumption
- Specific examples (heat pumps, refrigerators)
- Potential savings from energy-efficient appliances
- Internal link to `/prisberegner`

### Section 11: Ladeboks/EV Charging (250+ words)
**Keywords:** ladeboks, elbil opladning, hjemmeladning, ladeboks-ordningen
- Comprehensive EV charging box information
- Installation costs (10,000-25,000 kr)
- Government rebates (up to 7,500 kr)
- Smart charging benefits and solar integration
- Internal link to `/ladeboks`

## Technical Implementation

### Key Features:
1. **Rich Text Blocks**: Uses proper Sanity Portable Text format
2. **Internal Links**: Implemented with proper markDefs structure
3. **SEO Optimization**: Natural keyword integration throughout
4. **Danish Language**: Native Danish terminology and phrasing
5. **Green Energy Focus**: Subtle promotion of renewable energy benefits

### Helper Functions:
- `createRichTextBlock()`: Creates formatted text blocks
- `createBlockWithLink()`: Creates blocks with internal links
- `generateKey()`: Ensures unique keys for all blocks

## Running the Script

```bash
# Install dependencies first
npm install

# Run the script
npx tsx scripts/update-homepage-seo-content.ts
```

## Verification
After running, verify in Sanity Studio that:
1. All sections display correctly
2. Internal links are functional
3. Text formatting is preserved
4. No validation errors occur

## Business Impact
- Improved SEO ranking for key Danish electricity terms
- Better user understanding of electricity pricing
- Increased internal linking for better site navigation
- Subtle positioning of green energy benefits (supporting Vindstød)