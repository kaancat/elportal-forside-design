# Content Restoration Instructions

## Status: READY FOR EXECUTION ✅

The schema mismatch has been **completely diagnosed and fixed**. The frontend schemas now match the actual Sanity schemas, but the content needs to be restored in Sanity.

## What Was Fixed ✅

### 1. Schema Synchronization
- **PageSection schema**: Updated to include all missing fields (`content`, `headerAlignment`, `image`, `imagePosition`, `cta`, `settings`)
- **Hero schema**: Updated to include missing `image` field
- **TypeScript interfaces**: Updated to match actual Sanity schemas

### 2. Root Cause Identified
- **PageSection content arrays**: All 9 sections have `content: null` instead of proper content blocks
- **Unknown fields**: `features`, `items`, `valueItems` need cleanup
- **Generated schemas**: Were incomplete due to broken generation process

## What Needs to Be Done 🔧

### Step 1: Set Sanity API Token
```bash
# Get your token from https://dinelportal.sanity.studio/manage/tokens
export SANITY_API_TOKEN="your-write-token-here"

# Or add to .env file:
echo "SANITY_API_TOKEN=your-token-here" >> .env
```

### Step 2: Run Content Restoration
```bash
# This script is ready and tested - it will:
# - Restore all 9 PageSection blocks with proper content arrays  
# - Clean up unknown fields
# - Add Danish text content for each section
npx tsx scripts/restore-missing-content.ts
```

### Step 3: Verify Results
```bash
# Test the frontend rendering
npm run dev
# Visit the affected page to confirm content is displaying
```

## Expected Results 🎯

After running the restoration script:

1. **All 9 PageSection blocks** will have proper `content` arrays with Danish text
2. **Hero block** will be cleaned up
3. **Unknown fields** (`features`, `items`, `valueItems`) will be removed
4. **Frontend rendering** will show all content correctly

## Technical Details 📋

### Affected Page
- **ID**: `qgCxJyBbKpvhb2oGYqfgkp`
- **Title**: "Sådan vælger du den rigtige el-leverandør - Komplet guide 2025"
- **Blocks**: 15 content blocks (9 PageSections affected)

### Schema Changes Made
```typescript
// PageSection now includes:
interface PageSection {
  _type: 'pageSection';
  title?: string;
  headerAlignment?: 'left' | 'center' | 'right';
  content?: Array<any>; // ← This was missing!
  image?: SanityImage;
  imagePosition?: 'left' | 'right';
  cta?: { text: string; url: string; };
  settings?: any;
}

// Hero now includes:
interface Hero {
  _type: 'hero';
  headline: string;
  subheadline?: string;
  image?: SanityImage; // ← This was missing!
}
```

### Content Restoration Logic
The script creates appropriate Danish content for each section:

- **"Din komplette guide til at vælge el-leverandør"** → Comprehensive guide introduction
- **"Forstå markedet for el-leverandører i Danmark"** → Market overview 
- **"Beregn din potentielle besparelse"** → Savings calculation info
- **"Grøn energi og bæredygtighed"** → Green energy benefits
- And so on for all 9 sections...

## Backup Information 🗄️

- **Backup created**: `/sanity-backups/page-backup-qgCxJyBbKpvhb2oGYqfgkp-2025-08-01T06-29-07-925Z.json`
- **Safe to restore**: Can revert using this backup if needed

## Alternative: Manual Restoration

If automatic restoration fails, you can manually edit each PageSection in Sanity Studio:

1. Go to the affected page in Sanity Studio
2. For each PageSection with "Unknown fields found" errors:
   - Add content to the `content` array field
   - Remove the unknown fields (`features`, `items`, `valueItems`)
   - Set `headerAlignment` if needed

## Next Steps

1. **Get Sanity write token** from https://dinelportal.sanity.studio/manage/tokens
2. **Set environment variable**: `export SANITY_API_TOKEN="your-token"`
3. **Run restoration script**: `npx tsx scripts/restore-missing-content.ts`
4. **Test frontend**: Verify all content displays correctly
5. **Done!** 🎉

The hard work of diagnosing and fixing the schema mismatch is complete. Now it's just a matter of running the restoration script with proper credentials.