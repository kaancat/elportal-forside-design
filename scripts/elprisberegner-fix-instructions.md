# Elprisberegner Page Fix Instructions

## Issues to Fix
1. **Tiny Icons in FeatureList**: The "Sådan Fungerer Elprisberegneren" section has small 20x20 icons that need to be replaced with larger 32x32 colorful icons
2. **Missing Icons in ValueProposition**: The value proposition boxes show as "untitled" in Sanity Studio and need icons added

## Script: fix-elprisberegner-comprehensive.ts

### What the script does:
1. **Updates FeatureList Icons**:
   - Replaces small 20x20 icons with 32x32 colorful icons
   - Uses Streamline Bold collection for better visibility
   - Applies brand colors:
     - Emerald 500 (#10b981) for "Aktuelle Spotpriser"
     - Blue 500 (#3b82f6) for "Alle Afgifter Inkluderet"
     - Amber 500 (#f59e0b) for "Sammenlign Elselskaber"
     - Red 500 (#ef4444) for "Dit Præcise Forbrug"

2. **Adds Icons to ValueProposition Items**:
   - Adds missing icons to the three value items:
     - Money graph icon for "Gennemsnitlig elpris 2025"
     - Piggy bank icon for "Mulig besparelse"
     - Fluctuation graph icon for "Prisudsving"
   - Uses same colorful brand palette

### How to Run:
```bash
cd scripts
npm install @sanity/client dotenv
tsx fix-elprisberegner-comprehensive.ts "YOUR_SANITY_API_TOKEN"
```

### Expected Results:
- Icons in FeatureList will be larger and more colorful (32x32 instead of 20x20)
- ValueProposition items will have icons and display properly in Sanity Studio
- Frontend will render icons at appropriate sizes:
  - FeatureList: 48px (scaled from 32px source)
  - ValueProposition: 24px (scaled from 32px source)

### Notes:
- The frontend components already support icon rendering at proper sizes
- No frontend changes needed - only Sanity content update
- Icons use the premium Streamline Bold collection for consistency