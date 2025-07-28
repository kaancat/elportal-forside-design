#!/bin/bash

# Script to deploy the elprisberegner page to Sanity

echo "🚀 Deploying Elprisberegner Page to Sanity"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with SANITY_API_TOKEN"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if SANITY_API_TOKEN is set
if [ -z "$SANITY_API_TOKEN" ]; then
    echo "❌ Error: SANITY_API_TOKEN not found in .env file!"
    echo "Please add your Sanity API token to the .env file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "📦 Running deployment script..."
echo ""

# Run the TypeScript deployment script
npm run tsx scripts/deploy-elprisberegner-page.ts

echo ""
echo "=========================================="
echo "Deployment process completed!"