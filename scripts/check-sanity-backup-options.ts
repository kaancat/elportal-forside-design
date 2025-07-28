import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') })

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

async function checkSanityBackupOptions() {
  console.log('🔍 Checking Sanity Backup and History Options\n')
  console.log('=' .repeat(80))

  try {
    // 1. Check document history
    console.log('\n📜 Checking Document History Capabilities:')
    try {
      // Try to get history for a specific document
      const siteSettings = await client.getDocument('siteSettings')
      
      if (siteSettings) {
        const history = await client.request({
          url: `/data/history/production/documents/siteSettings`
        }).catch(e => ({ error: e.message }))
        
        console.log('History API response:', history)
      }
    } catch (e: any) {
      console.log('History check error:', e.message)
    }

    // 2. Check available datasets
    console.log('\n💾 Checking Available Datasets:')
    try {
      const datasets = await client.request({
        url: '/data/datasets'
      })
      console.log('Available datasets:', datasets)
    } catch (e: any) {
      console.log('Datasets check error:', e.message)
    }

    // 3. Check export capabilities
    console.log('\n📦 Checking Export Capabilities:')
    console.log('Sanity supports data export via:')
    console.log('  - Command line: sanity dataset export')
    console.log('  - API endpoint: /data/export/{dataset}')
    console.log('  - Real-time export with webhooks')

    // 4. Check document revisions
    console.log('\n🔄 Checking Document Revisions:')
    try {
      // Get a sample document with history
      const docs = await client.fetch(`
        *[_type == "page"][0...1] {
          _id,
          _rev,
          _updatedAt,
          title
        }
      `)
      
      if (docs.length > 0) {
        console.log(`Sample document: ${docs[0].title}`)
        console.log(`  - ID: ${docs[0]._id}`)
        console.log(`  - Revision: ${docs[0]._rev}`)
        console.log(`  - Last updated: ${docs[0]._updatedAt}`)
        
        // Try to get document history
        try {
          const docHistory = await client.request({
            url: `/data/history/production/documents/${docs[0]._id}`
          })
          console.log(`  - History entries: ${docHistory.documents?.length || 0}`)
        } catch (e: any) {
          console.log(`  - History access: ${e.statusCode === 403 ? 'Requires higher plan' : e.message}`)
        }
      }
    } catch (e: any) {
      console.log('Revision check error:', e.message)
    }

    // 5. Backup recommendations
    console.log('\n💡 Backup Recommendations:')
    console.log('\n1. Manual Backup Commands:')
    console.log('   npx sanity dataset export production backup.tar.gz')
    console.log('   npx sanity dataset export production --types page,provider,siteSettings partial-backup.tar.gz')
    
    console.log('\n2. Automated Backup Script:')
    console.log('   - Create a scheduled job (cron/GitHub Actions)')
    console.log('   - Export dataset regularly to cloud storage')
    console.log('   - Keep rotating backups (daily/weekly/monthly)')
    
    console.log('\n3. Version Control Integration:')
    console.log('   - Export content as JSON files')
    console.log('   - Commit to git for version history')
    console.log('   - Track changes over time')
    
    console.log('\n4. Real-time Backup with Webhooks:')
    console.log('   - Set up webhooks for create/update/delete')
    console.log('   - Stream changes to backup storage')
    console.log('   - Maintain real-time mirror')

    console.log('\n5. Sanity Features by Plan:')
    console.log('   - Free plan: Basic export/import')
    console.log('   - Team plan: History API access')
    console.log('   - Business plan: Advanced history & restore')
    console.log('   - Enterprise: Full backup & disaster recovery')

    // 6. Create a sample backup script
    console.log('\n📝 Sample Backup Script Created: backup-sanity-content.sh')
    
    const backupScript = `#!/bin/bash
# Sanity Content Backup Script

# Configuration
PROJECT_ID="yxesi03x"
DATASET="production"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

echo "🔄 Starting Sanity backup..."

# Full dataset export
echo "📦 Exporting full dataset..."
npx sanity dataset export $DATASET $BACKUP_DIR/backup_full_$DATE.tar.gz

# Export specific document types as JSON
echo "📄 Exporting content as JSON..."
mkdir -p $BACKUP_DIR/json_$DATE

# Export each document type
for TYPE in page provider siteSettings homePage blogPost; do
  echo "  - Exporting $TYPE documents..."
  npx sanity documents query "*[_type == '$TYPE']" > $BACKUP_DIR/json_$DATE/${TYPE}.json
done

# Create a restore script
cat > $BACKUP_DIR/restore_$DATE.sh << 'EOF'
#!/bin/bash
echo "⚠️  This will restore the dataset from backup. Are you sure? (y/n)"
read -r response
if [[ "$response" == "y" ]]; then
  npx sanity dataset import backup_full_$DATE.tar.gz $DATASET --replace
  echo "✅ Dataset restored!"
else
  echo "❌ Restore cancelled"
fi
EOF

chmod +x $BACKUP_DIR/restore_$DATE.sh

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "json_*" -type d -mtime +30 -exec rm -rf {} +

echo "✅ Backup complete!"
echo "📁 Backup location: $BACKUP_DIR/backup_full_$DATE.tar.gz"
echo "📄 JSON exports: $BACKUP_DIR/json_$DATE/"
`

    await require('fs').promises.writeFile(
      resolve(__dirname, 'backup-sanity-content.sh'),
      backupScript,
      { mode: 0o755 }
    )

  } catch (error) {
    console.error('❌ Error checking backup options:', error)
  }
}

// Run the check
checkSanityBackupOptions().catch(console.error)