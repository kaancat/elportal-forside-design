#!/bin/bash

# DinElportal Emergency Rollback Script
# Use this script to immediately rollback to the pre-migration state

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "Timestamp: $(date)"

# 1. Switch back to main branch
echo "📍 Switching to main branch..."
git checkout main

# 2. Reset to pre-migration tag
echo "⏮️ Resetting to pre-migration state..."
git reset --hard backup/pre-nextjs-migration-2024-08-18

# 3. Verify rollback
echo "✅ Rollback complete - verifying state..."
git log --oneline -3

# 4. Instructions for Vercel rollback
echo ""
echo "🔄 NEXT STEPS FOR COMPLETE ROLLBACK:"
echo "1. Run: vercel alias set spa-backup.elportal.dk elportal.dk"
echo "2. Run: vercel alias set spa-backup.elportal.dk www.elportal.dk"
echo "3. Verify site is accessible at https://elportal.dk"
echo ""
echo "📊 SANITY ROLLBACK (if needed):"
echo "cd /Users/kaancatalkaya/Desktop/projects/sanityelpriscms"
echo "npx @sanity/cli dataset import backups/pre-migration/sanity-backup-*.tar.gz production --replace"
echo ""
echo "⚠️ Remember to restore environment variables from backups/pre-migration/"
echo "✅ EMERGENCY ROLLBACK PROCEDURE COMPLETE"