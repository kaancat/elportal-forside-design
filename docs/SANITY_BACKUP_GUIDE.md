# Sanity Content Backup Guide for ElPortal

## Overview
This guide explains how to backup and restore your Sanity content to prevent data loss from accidental deletions, content corruption, or issues like the draft/published problem you experienced.

## Why Backups Are Critical
- Sanity does **NOT** automatically backup your content
- The free plan has limited history/revision access
- Content mistakes, deletions, or corruptions can happen
- Your content is your business - protect it!

## Backup Methods

### 1. Manual Backup (Immediate)
Run this command right now to create an immediate backup:

```bash
# Quick backup
./scripts/backup-sanity.sh

# Or manually:
npx sanity dataset export production backup_$(date +%Y%m%d).tar.gz
```

### 2. Automated Daily Backups (GitHub Actions)
A GitHub Action has been created that will:
- Run daily at 2 AM UTC
- Export full dataset as `.tar.gz`
- Export content as readable JSON files
- Store backups for 30 days
- Can be triggered manually

**Setup Required:**
1. Go to your GitHub repository settings
2. Navigate to Secrets and variables → Actions
3. Add a new secret named `SANITY_API_TOKEN` with your Sanity token
4. The workflow will start running automatically

### 3. Local Backup Script
The `scripts/backup-sanity.sh` script provides:
- Full dataset export
- JSON exports for easy reading
- Automatic restore script generation
- Backup rotation (keeps last 10)
- Colored output and progress tracking

**Usage:**
```bash
# Run backup
./scripts/backup-sanity.sh

# Backups are stored in ./sanity-backups/
# Each backup includes:
# - backup_full_TIMESTAMP.tar.gz (complete dataset)
# - json_TIMESTAMP/ (readable JSON files)
# - restore_TIMESTAMP.sh (restore script)
# - info_TIMESTAMP.txt (backup information)
```

## Restoring from Backup

### Method 1: Using the restore script
```bash
cd sanity-backups
./restore_20250128_143022.sh  # Use your backup's timestamp
```

### Method 2: Manual restore
```bash
npx sanity dataset import path/to/backup.tar.gz production --replace
```

**⚠️ WARNING:** Restore operations will REPLACE your entire dataset!

## Backup Best Practices

### 1. Regular Schedule
- Daily automated backups via GitHub Actions
- Manual backup before major changes
- Weekly backup to cloud storage

### 2. Test Restores
- Regularly test restore procedures
- Create a test dataset for restore testing:
  ```bash
  npx sanity dataset create test-restore
  npx sanity dataset import backup.tar.gz test-restore
  ```

### 3. Multiple Backup Locations
- GitHub artifacts (30 days)
- Local backups (10 most recent)
- Cloud storage (S3, Google Cloud, Dropbox)

### 4. Monitor Backup Health
- Check GitHub Actions for successful runs
- Verify backup file sizes
- Test random restore periodically

## Cloud Storage Integration

### AWS S3 Example
Add to your backup script:
```bash
aws s3 cp backup_$DATE.tar.gz s3://your-bucket/sanity-backups/
```

### Google Cloud Storage
```bash
gsutil cp backup_$DATE.tar.gz gs://your-bucket/sanity-backups/
```

## Emergency Recovery Procedures

### If content is accidentally deleted:
1. Stop all write operations immediately
2. Check if content is in drafts vs published
3. Run immediate backup of current state
4. Restore from most recent backup
5. Compare and merge any needed changes

### If navigation breaks (like your recent issue):
1. Check Sanity Studio for validation errors
2. Review recent changes in git
3. Use backup JSON files to reconstruct
4. Apply fixes via scripts or manual updates

## Backup Monitoring

### Set up notifications:
1. GitHub Actions will email on failures
2. Add Slack/Discord webhooks for success/failure
3. Monitor backup file sizes for anomalies

### Check backup integrity:
```bash
# Verify tar file
tar -tzf backup_file.tar.gz > /dev/null && echo "Backup OK" || echo "Backup corrupt"

# Check JSON exports
for file in json_*/; do
  jq . "$file" > /dev/null 2>&1 || echo "$file is invalid"
done
```

## Cost Considerations

### Sanity Plans:
- **Free**: Basic export/import only
- **Team ($99/mo)**: History API access
- **Business**: Advanced history & point-in-time restore
- **Enterprise**: Full disaster recovery

### Recommendation:
Start with free plan + automated backups. Upgrade if you need:
- Real-time history tracking
- Point-in-time recovery
- Audit logs

## Quick Reference

```bash
# Backup now
./scripts/backup-sanity.sh

# List backups
ls -la sanity-backups/

# Restore specific backup
./sanity-backups/restore_TIMESTAMP.sh

# Export specific types
npx sanity documents query "*[_type == 'page']" > pages.json

# Check dataset size
npx sanity dataset size production
```

## Support
For issues with backups:
1. Check backup script output
2. Verify Sanity API token permissions
3. Check GitHub Actions logs
4. Review this guide

Remember: **No backup = No business continuity!**