#!/bin/bash

# Script to run Agent Actions tests

echo "🧪 Running Agent Actions Test Suite"
echo "=================================="

# Check if we have the API token
if [ -z "$SANITY_API_TOKEN" ]; then
  echo "❌ Error: SANITY_API_TOKEN environment variable not set"
  echo "Please export your Sanity API token:"
  echo "export SANITY_API_TOKEN='your-token-here'"
  exit 1
fi

# Navigate to the project root
cd "$(dirname "$0")/../.."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

echo ""
echo "1️⃣ Running basic Agent Actions test..."
echo "─────────────────────────────────────"
npx tsx scripts/agent-actions/test-agent-actions.ts

echo ""
echo "2️⃣ Running SEO page creation comparison..."
echo "─────────────────────────────────────────"
npx tsx scripts/agent-actions/create-seo-page-with-agent-actions.ts

echo ""
echo "✅ Test suite completed!"
echo ""
echo "To clean up test documents, run with --cleanup flag:"
echo "npx tsx scripts/agent-actions/test-agent-actions.ts --cleanup"