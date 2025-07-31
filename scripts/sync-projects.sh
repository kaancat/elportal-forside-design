#!/bin/bash

# ElPortal Project Synchronization Script
# Keeps frontend and CMS projects in sync

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project paths
FRONTEND_DIR="/Users/kaancatalkaya/Desktop/projects/elportal-forside-design"
CMS_DIR="/Users/kaancatalkaya/Desktop/projects/sanityelpriscms"

echo -e "${GREEN}🔄 ElPortal Project Sync Starting...${NC}"

# Function to check if directory exists
check_dir() {
    if [ ! -d "$1" ]; then
        echo -e "${RED}❌ Directory not found: $1${NC}"
        exit 1
    fi
}

# Verify both projects exist
check_dir "$FRONTEND_DIR"
check_dir "$CMS_DIR"

# 1. Check for Sanity schema changes
echo -e "\n${YELLOW}📋 Checking for schema changes...${NC}"
cd "$CMS_DIR"

# Get last modification time of schema files
SCHEMA_CHANGED=$(find schemaTypes -name "*.ts" -newer "$FRONTEND_DIR/src/lib/sanity-schemas.zod.ts" 2>/dev/null | wc -l)

if [ "$SCHEMA_CHANGED" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Schema changes detected!${NC}"
    
    # Deploy Sanity changes
    echo -e "${GREEN}🚀 Deploying Sanity schema changes...${NC}"
    npm run deploy
    
    # Regenerate types in frontend
    echo -e "${GREEN}🔧 Regenerating TypeScript types...${NC}"
    cd "$FRONTEND_DIR"
    npm run generate:types
    
    echo -e "${GREEN}✅ Types regenerated successfully${NC}"
else
    echo -e "${GREEN}✅ No schema changes detected${NC}"
fi

# 2. Validate content block synchronization
echo -e "\n${YELLOW}🔍 Validating content block synchronization...${NC}"

# Get list of content block schemas
cd "$CMS_DIR"
SCHEMA_BLOCKS=$(grep -l "defineType" schemaTypes/*.ts | xargs grep -l "_type.*:" | xargs basename -s .ts | sort)

# Check if all schemas have corresponding React components
cd "$FRONTEND_DIR"
MISSING_COMPONENTS=""

for block in $SCHEMA_BLOCKS; do
    # Skip non-content blocks
    if [[ ! "$block" =~ ^(page|homePage|siteSettings|provider|footerLinkGroup|megaMenu|megaMenuColumn|megaMenuItem|link|sectionSettings|shared)$ ]]; then
        # Check if component exists in ContentBlocks.tsx
        if ! grep -q "case '$block':" src/components/ContentBlocks.tsx 2>/dev/null; then
            MISSING_COMPONENTS="$MISSING_COMPONENTS $block"
        fi
    fi
done

if [ -n "$MISSING_COMPONENTS" ]; then
    echo -e "${RED}❌ Missing React components for:${NC}"
    for component in $MISSING_COMPONENTS; do
        echo -e "   - $component"
    done
    echo -e "${YELLOW}⚠️  Remember to add these to BOTH ContentBlocks.tsx AND SafeContentBlocks.tsx${NC}"
else
    echo -e "${GREEN}✅ All content blocks have React components${NC}"
fi

# 3. Check for TypeScript errors
echo -e "\n${YELLOW}🔍 Running TypeScript checks...${NC}"
cd "$FRONTEND_DIR"

if npm run typecheck 2>&1 | grep -q "error"; then
    echo -e "${RED}❌ TypeScript errors found! Please fix before continuing.${NC}"
else
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
fi

# 4. Verify environment variables
echo -e "\n${YELLOW}🔍 Verifying environment variables...${NC}"

if [ -f "$FRONTEND_DIR/.env" ]; then
    if grep -q "VITE_SANITY_PROJECT_ID=yxesi03x" "$FRONTEND_DIR/.env"; then
        echo -e "${GREEN}✅ Frontend environment configured correctly${NC}"
    else
        echo -e "${RED}❌ Frontend .env missing or incorrect VITE_SANITY_PROJECT_ID${NC}"
    fi
else
    echo -e "${RED}❌ Frontend .env file not found${NC}"
fi

# 5. Generate sync report
echo -e "\n${GREEN}📊 Sync Report:${NC}"
echo -e "Frontend: $FRONTEND_DIR"
echo -e "CMS: $CMS_DIR"
echo -e "Last sync: $(date)"

# Create sync log
SYNC_LOG="$FRONTEND_DIR/logs/sync-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$FRONTEND_DIR/logs"
{
    echo "ElPortal Project Sync Log"
    echo "========================"
    echo "Date: $(date)"
    echo "Frontend: $FRONTEND_DIR"
    echo "CMS: $CMS_DIR"
    echo ""
    echo "Schema Changes: $SCHEMA_CHANGED"
    echo "Missing Components: $MISSING_COMPONENTS"
    echo ""
} > "$SYNC_LOG"

echo -e "\n${GREEN}✅ Sync complete! Log saved to: $SYNC_LOG${NC}"

# Reminder about manual checks
echo -e "\n${YELLOW}📝 Manual checks:${NC}"
echo "1. Test content creation in Sanity Studio"
echo "2. Verify frontend rendering of new content"
echo "3. Check that Vindstød ranking is maintained"
echo "4. Run the frontend dev server and test"