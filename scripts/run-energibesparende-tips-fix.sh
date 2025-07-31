#!/bin/bash

echo "🔧 ElPortal - Fix Energibesparende Tips Page"
echo "==========================================="
echo ""
echo "This script will fix the following issues:"
echo "1. Set headerAlignment to 'left' for two sections:"
echo "   - 'Når Dine Vaner Ikke Er Nok: Forstå Din Elpris'"
echo "   - 'Det Sidste, Vigtige Skridt: Vælger du det Rigtige Elselskab?'"
echo "2. Add apiRegion: 'DK1' to livePriceGraph component"
echo "3. Add descriptive leadingText to renewableEnergyForecast"
echo "4. Migrate valueProposition from deprecated fields to correct schema"
echo "5. Remove all invalid fields from valueProposition"
echo ""

# Check if token is provided as argument
if [ -z "$1" ]; then
    echo "❌ Error: Sanity API token required!"
    echo ""
    echo "Usage: ./scripts/run-energibesparende-tips-fix.sh YOUR_SANITY_TOKEN"
    echo ""
    echo "Get your token from the provided credentials"
    echo ""
    exit 1
fi

# Run the TypeScript fix script
echo "🚀 Running fix script..."
echo ""
npx ts-node scripts/fix-energibesparende-tips-comprehensive.ts "$1"