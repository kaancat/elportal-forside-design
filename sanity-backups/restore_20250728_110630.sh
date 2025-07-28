#!/bin/bash
# Restore script for backup created on 20250728_110630

echo -e "\033[1;33m⚠️  WARNING: This will REPLACE the entire dataset!\033[0m"
echo "Dataset to restore: production"
echo "Backup file: backup_full_20250728_110630.tar.gz"
echo ""
echo -n "Are you ABSOLUTELY sure you want to restore? (type 'yes' to confirm): "
read -r response

if [[ "$response" == "yes" ]]; then
    echo -e "\033[1;33m🔄 Starting restore...\033[0m"
    cd /Users/kaancatalkaya/Desktop/projects/sanityelpriscms
    npx sanity dataset import /Users/kaancatalkaya/Desktop/projects/elportal-forside-design/sanity-backups/backup_full_20250728_110630.tar.gz production --replace
    cd - > /dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "\033[0;32m✅ Dataset restored successfully!\033[0m"
    else
        echo -e "\033[0;31m❌ Restore failed!\033[0m"
    fi
else
    echo -e "\033[0;31m❌ Restore cancelled\033[0m"
fi
