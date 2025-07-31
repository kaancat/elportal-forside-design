#!/bin/bash

# Run the prognoser page fix script
echo "🚀 Running prognoser page fix..."
echo ""

# Check if SANITY_API_TOKEN is set
if [ -z "$SANITY_API_TOKEN" ]; then
    echo "❌ Error: SANITY_API_TOKEN environment variable not set"
    echo ""
    echo "Please run with:"
    echo "SANITY_API_TOKEN='your-token-here' ./scripts/run-prognoser-fix.sh"
    exit 1
fi

# Run the TypeScript fix script
npx tsx scripts/fix-prognoser-page-comprehensive.ts

echo ""
echo "✅ Script execution complete!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Check the hero image guide at: scripts/prognoser-hero-image-guide.md"
echo "2. Upload a hero image to Sanity Studio"
echo "3. Update the script with the actual image asset ID"
echo "4. Run this script again to update the hero image reference"
echo ""
echo "🔗 Test the page at: http://localhost:5173/prognoser"