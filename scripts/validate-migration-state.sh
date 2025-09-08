#!/bin/bash

# DinElportal Migration State Validation Script
# Validates that backup infrastructure is working correctly

echo "🔍 MIGRATION STATE VALIDATION"
echo "Timestamp: $(date)"
echo ""

# Check Git repositories
echo "📦 REPOSITORY STATE:"
echo "Frontend branch: $(git branch --show-current)"
echo "Frontend commit: $(git rev-parse --short HEAD)"

cd /Users/kaancatalkaya/Desktop/projects/sanityelpriscms
echo "Backend branch: $(git branch --show-current)"  
echo "Backend commit: $(git rev-parse --short HEAD)"
cd - > /dev/null
echo ""

# Check backup files
echo "💾 BACKUP FILES:"
BACKUP_DIR="backups/pre-migration"
if [ -d "$BACKUP_DIR" ]; then
    echo "✅ Backup directory exists"
    echo "📁 Backup files:"
    ls -la $BACKUP_DIR/
else
    echo "❌ Backup directory missing!"
fi
echo ""

# Check Git tags
echo "🏷️ BACKUP TAGS:"
if git tag | grep -q "backup/pre-nextjs-migration-2024-08-18"; then
    echo "✅ Frontend backup tag exists"
else
    echo "❌ Frontend backup tag missing!"
fi

cd /Users/kaancatalkaya/Desktop/projects/sanityelpriscms
if git tag | grep -q "backup/pre-migration-state-2024-08-18"; then
    echo "✅ Backend backup tag exists"
else
    echo "❌ Backend backup tag missing!"
fi
cd - > /dev/null
echo ""

# Check Sanity backup
echo "🗄️ SANITY BACKUP:"
SANITY_BACKUP=$(ls $BACKUP_DIR/sanity-backup-*.tar.gz 2>/dev/null | head -1)
if [ -f "$SANITY_BACKUP" ]; then
    echo "✅ Sanity backup found: $(basename $SANITY_BACKUP)"
    echo "📊 Size: $(du -h $SANITY_BACKUP | cut -f1)"
else
    echo "❌ Sanity backup missing!"
fi
echo ""

# Check environment backups
echo "🔐 ENVIRONMENT BACKUPS:"
ENV_BACKUPS=$(ls $BACKUP_DIR/.env*.backup* 2>/dev/null | wc -l)
if [ $ENV_BACKUPS -gt 0 ]; then
    echo "✅ Environment backups found: $ENV_BACKUPS files"
    ls $BACKUP_DIR/.env*.backup*
else
    echo "❌ Environment backups missing!"
fi
echo ""

# Check Vercel backup
VERCEL_BACKUP=$(ls $BACKUP_DIR/vercel-env-backup-*.txt 2>/dev/null | head -1)
if [ -f "$VERCEL_BACKUP" ]; then
    echo "✅ Vercel env backup found: $(basename $VERCEL_BACKUP)"
else
    echo "❌ Vercel env backup missing!"
fi
echo ""

echo "🎯 VALIDATION COMPLETE"
echo "✅ Ready for migration if all checks passed"
echo "❌ Fix any missing backups before proceeding"