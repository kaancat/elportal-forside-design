# Ladeboks Page Deployment Instructions

## Prerequisites

1. **Sanity API Token**: You need a Sanity API token with write permissions
   - Go to: https://www.sanity.io/manage/personal/project/yxesi03x/api#tokens
   - Create a new token with "Editor" or "Deploy" permissions
   - Add it to your `.env` file as: `SANITY_API_TOKEN=your_token_here`

## Current Status

### ✅ Completed
1. **Schema Updates**: Added `chargingBoxShowcase` to page content blocks in Sanity CMS
2. **Products Exist**: Three charging box products are already in the system:
   - DEFA Power (`chargingBoxProduct-defa-power`) - 5495 kr
   - Easee Up (`chargingBoxProduct-easee-up`) - 4699 kr  
   - Zaptec Go (`chargingBoxProduct-zaptec-go`) - 3995 kr

### ❌ Pending (Requires API Token)
1. **Create Ladeboks Page**: The page content is ready but needs API token to deploy

## Deployment Steps

1. **Set up API Token** (if not already done):
   ```bash
   # Add to .env file:
   SANITY_API_TOKEN=your_sanity_api_token_here
   ```

2. **Deploy the Page**:
   ```bash
   npx tsx scripts/create-ladeboks-page-only.ts
   ```

3. **Verify in Sanity Studio**:
   - Go to: https://dinelportal.sanity.studio
   - Navigate to Pages → Ladeboks
   - Review all content blocks

## Page Structure

The Ladeboks page includes:
- Hero section with CTA
- Introduction to home charging benefits
- **Charging Box Showcase** displaying the 3 products
- Value propositions (6 benefits)
- Detailed installation guide
- CO2 emissions chart (for green charging timing)
- Live price graph (for cost optimization)
- Technical comparison section
- FAQ section (6 questions)
- Call-to-action section

## Alternative: Manual Creation

If you prefer to create the page manually in Sanity Studio:

1. Go to Pages → Create New Page
2. Set title: "Ladeboks til Elbil - Find den Bedste Hjemmelader"
3. Set slug: "ladeboks"
4. Add SEO fields as specified in the script
5. Add content blocks in the order shown in `create-ladeboks-page-only.ts`

## Frontend Implementation

The frontend already supports the `chargingBoxShowcase` component through:
- Component exists in `ContentBlocks.tsx` and `SafeContentBlocks.tsx`
- Proper TypeScript types are defined
- Responsive design is implemented

## Notes

- The page uses existing product IDs (not the ones we tried to create)
- All content is in Danish as required
- SEO optimization includes relevant keywords
- The page subtly promotes green energy without being pushy
- Technical content is comprehensive yet accessible