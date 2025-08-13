#!/bin/bash

echo "🚀 DinElPortal Webhook Deployment Script"
echo "===================================="
echo ""

# Load webhook secret from .env
if [ -f ".env" ]; then
    export $(grep SANITY_WEBHOOK_SECRET .env | xargs)
else
    echo "❌ .env file not found"
    exit 1
fi

if [ -z "$SANITY_WEBHOOK_SECRET" ]; then
    echo "❌ SANITY_WEBHOOK_SECRET not found in .env"
    exit 1
fi

echo "✅ Loaded webhook secret from .env"
echo ""

# Check if logged in to Vercel
echo "📋 Checking Vercel login status..."
if ! vercel whoami >/dev/null 2>&1; then
    echo "❌ Not logged in to Vercel"
    echo ""
    echo "📝 Please login to Vercel:"
    echo "   1. Run: vercel login"
    echo "   2. Choose your login method (GitHub, GitLab, Bitbucket, or Email)"
    echo "   3. Follow the browser prompts"
    echo "   4. Run this script again after logging in"
    exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

# Check if project is linked
echo "🔗 Checking if project is linked to Vercel..."
if [ ! -f ".vercel/project.json" ]; then
    echo "❌ Project not linked to Vercel"
    echo ""
    echo "📝 Linking project to Vercel..."
    echo "   This will connect your local project to Vercel"
    echo ""
    vercel link
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to link project"
        exit 1
    fi
fi

echo "✅ Project is linked to Vercel"
echo ""

# Add environment variable
echo "🔐 Adding webhook secret to Vercel..."
echo ""

# Add to all environments (development, preview, production)
echo "$SANITY_WEBHOOK_SECRET" | vercel env add SANITY_WEBHOOK_SECRET production --force
echo "$SANITY_WEBHOOK_SECRET" | vercel env add SANITY_WEBHOOK_SECRET preview --force
echo "$SANITY_WEBHOOK_SECRET" | vercel env add SANITY_WEBHOOK_SECRET development --force

echo ""
echo "✅ Environment variable added"
echo ""

# Deploy to production
echo "🚀 Deploying to production..."
echo "   This will deploy your app with the new webhook endpoint"
echo ""

vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Copy your production URL from above (e.g., https://your-app.vercel.app)"
    echo "   2. Go to: https://www.sanity.io/manage/personal/project/yxesi03x/api#webhooks"
    echo "   3. Create a new webhook with:"
    echo "      - URL: https://your-app.vercel.app/api/revalidate"
    echo "      - Secret: (same as in your .env file)"
    echo "      - Triggers: Create, Update, Delete"
    echo ""
    echo "📝 Full instructions in: docs/WEBHOOK_DEPLOYMENT_STEPS.md"
else
    echo "❌ Deployment failed"
    exit 1
fi