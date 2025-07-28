#!/bin/bash
# Sanity Content Backup Script for ElPortal

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="yxesi03x"
DATASET="production"
BACKUP_DIR="/Users/kaancatalkaya/Desktop/projects/elportal-forside-design/sanity-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

echo -e "${GREEN}🔄 Starting Sanity backup for ElPortal...${NC}"
echo "Date: $(date)"
echo "Dataset: $DATASET"
echo ""

# Check if Sanity CLI is installed
if ! command -v sanity &> /dev/null; then
    echo -e "${YELLOW}⚠️  Sanity CLI not found. Installing...${NC}"
    npm install -g @sanity/cli
fi

# Full dataset export
echo -e "${GREEN}📦 Exporting full dataset...${NC}"
cd /Users/kaancatalkaya/Desktop/projects/sanityelpriscms
npx sanity dataset export $DATASET $BACKUP_DIR/backup_full_$DATE.tar.gz
cd - > /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Full dataset exported successfully${NC}"
else
    echo -e "${RED}❌ Failed to export dataset${NC}"
    exit 1
fi

# Export specific document types as JSON for easy reading
echo -e "${GREEN}📄 Exporting content as JSON...${NC}"
mkdir -p $BACKUP_DIR/json_$DATE

# Document types to export
TYPES=(
    "page"
    "provider"
    "siteSettings"
    "homePage"
    "blogPost"
    "colorTheme"
    "navigation"
)

for TYPE in "${TYPES[@]}"; do
    echo -e "  ${YELLOW}→${NC} Exporting $TYPE documents..."
    cd /Users/kaancatalkaya/Desktop/projects/sanityelpriscms
    npx sanity documents query "*[_type == '$TYPE']" \
        --dataset $DATASET \
        > $BACKUP_DIR/json_$DATE/${TYPE}.json 2>/dev/null
    cd - > /dev/null
    
    # Check if any documents were found
    if [ -s $BACKUP_DIR/json_$DATE/${TYPE}.json ]; then
        COUNT=$(grep -o '"_id"' $BACKUP_DIR/json_$DATE/${TYPE}.json | wc -l)
        echo -e "    ${GREEN}✓${NC} Found $COUNT $TYPE document(s)"
    else
        echo -e "    ${YELLOW}⚠${NC} No $TYPE documents found"
        rm $BACKUP_DIR/json_$DATE/${TYPE}.json
    fi
done

# Create a restore script
echo -e "${GREEN}📝 Creating restore script...${NC}"
cat > $BACKUP_DIR/restore_$DATE.sh << EOF
#!/bin/bash
# Restore script for backup created on $DATE

echo -e "${YELLOW}⚠️  WARNING: This will REPLACE the entire dataset!${NC}"
echo "Dataset to restore: $DATASET"
echo "Backup file: backup_full_$DATE.tar.gz"
echo ""
echo -n "Are you ABSOLUTELY sure you want to restore? (type 'yes' to confirm): "
read -r response

if [[ "\$response" == "yes" ]]; then
    echo -e "${YELLOW}🔄 Starting restore...${NC}"
    cd /Users/kaancatalkaya/Desktop/projects/sanityelpriscms
    npx sanity dataset import $BACKUP_DIR/backup_full_$DATE.tar.gz $DATASET --replace
    cd - > /dev/null
    
    if [ \$? -eq 0 ]; then
        echo -e "${GREEN}✅ Dataset restored successfully!${NC}"
    else
        echo -e "${RED}❌ Restore failed!${NC}"
    fi
else
    echo -e "${RED}❌ Restore cancelled${NC}"
fi
EOF

chmod +x $BACKUP_DIR/restore_$DATE.sh

# Create backup info file
echo -e "${GREEN}📊 Creating backup info...${NC}"
cat > $BACKUP_DIR/info_$DATE.txt << EOF
ElPortal Sanity Backup Information
==================================
Date: $(date)
Dataset: $DATASET
Project ID: $PROJECT_ID
Backup ID: $DATE

Files in this backup:
- backup_full_$DATE.tar.gz    (Complete dataset export)
- json_$DATE/                  (Human-readable JSON exports)
- restore_$DATE.sh             (Restore script)
- info_$DATE.txt               (This file)

To restore this backup:
1. Navigate to the backup directory
2. Run: ./restore_$DATE.sh
3. Follow the prompts

JSON files exported:
$(ls -1 $BACKUP_DIR/json_$DATE/ 2>/dev/null | sed 's/^/- /')

Note: Keep this backup in a safe place. Consider uploading to cloud storage.
EOF

# Calculate backup size
BACKUP_SIZE=$(du -sh $BACKUP_DIR/backup_full_$DATE.tar.gz | cut -f1)

# Clean up old backups (keep last 10)
echo -e "${GREEN}🧹 Cleaning old backups...${NC}"
BACKUP_COUNT=$(ls -1 $BACKUP_DIR/backup_full_*.tar.gz 2>/dev/null | wc -l)
if [ $BACKUP_COUNT -gt 10 ]; then
    ls -t $BACKUP_DIR/backup_full_*.tar.gz | tail -n +11 | xargs rm -f
    ls -t $BACKUP_DIR/json_* -d 2>/dev/null | tail -n +11 | xargs rm -rf
    ls -t $BACKUP_DIR/restore_*.sh 2>/dev/null | tail -n +11 | xargs rm -f
    ls -t $BACKUP_DIR/info_*.txt 2>/dev/null | tail -n +11 | xargs rm -f
    echo -e "${GREEN}✅ Cleaned old backups (keeping last 10)${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}✅ Backup complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "📁 Backup location: ${YELLOW}$BACKUP_DIR/backup_full_$DATE.tar.gz${NC}"
echo -e "📏 Backup size: ${YELLOW}$BACKUP_SIZE${NC}"
echo -e "📄 JSON exports: ${YELLOW}$BACKUP_DIR/json_$DATE/${NC}"
echo -e "🔧 Restore script: ${YELLOW}$BACKUP_DIR/restore_$DATE.sh${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: Upload this backup to cloud storage for extra safety!${NC}"