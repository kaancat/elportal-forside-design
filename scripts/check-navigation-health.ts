import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || 'yxesi03x',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

interface LinkReport {
  location: string
  title: string
  linkType: 'internal' | 'external'
  status: 'valid' | 'broken' | 'warning'
  issue?: string
  details?: any
}

async function checkNavigationHealth() {
  console.log('🔍 Navigation Health Check Starting...\n')
  
  const reports: LinkReport[] = []
  
  try {
    // 1. Fetch Site Settings with navigation
    console.log('📋 Fetching site settings and navigation...')
    const siteSettings = await client.fetch(`
      *[_type == "siteSettings"][0] {
        _id,
        headerLinks[] {
          _key,
          _type,
          title,
          linkType,
          externalUrl,
          internalLink->{
            _id,
            _type,
            title,
            "slug": slug.current
          },
          _type == 'megaMenu' => {
            content[] {
              _key,
              title,
              items[] {
                _key,
                title,
                link {
                  linkType,
                  externalUrl,
                  internalLink->{
                    _id,
                    _type,
                    title,
                    "slug": slug.current
                  }
                }
              }
            }
          }
        },
        footer {
          linkGroups[] {
            _key,
            title,
            links[] {
              _key,
              title,
              linkType,
              externalUrl,
              internalLink->{
                _id,
                _type,
                title,
                "slug": slug.current
              }
            }
          }
        }
      }
    `)
    
    if (!siteSettings) {
      console.error('❌ No site settings found!')
      return
    }
    
    // 2. Check header links
    console.log('\n🔗 Checking header navigation links...')
    if (siteSettings.headerLinks) {
      for (const item of siteSettings.headerLinks) {
        if (item._type === 'link') {
          const report = checkLink(item, 'Header Navigation')
          reports.push(report)
        } else if (item._type === 'megaMenu' && item.content) {
          // Check mega menu items
          for (const column of item.content) {
            for (const menuItem of column.items || []) {
              if (menuItem.link) {
                const report = checkLink(
                  { ...menuItem.link, title: menuItem.title },
                  `Mega Menu > ${item.title} > ${column.title}`
                )
                reports.push(report)
              }
            }
          }
        }
      }
    }
    
    // 3. Check footer links
    console.log('\n🔗 Checking footer links...')
    if (siteSettings.footer?.linkGroups) {
      for (const group of siteSettings.footer.linkGroups) {
        for (const link of group.links || []) {
          const report = checkLink(link, `Footer > ${group.title}`)
          reports.push(report)
        }
      }
    }
    
    // 4. Check for orphaned pages (pages not in navigation)
    console.log('\n📄 Checking for orphaned pages...')
    const allPages = await client.fetch(`
      *[_type == "page"] {
        _id,
        title,
        "slug": slug.current
      }
    `)
    
    const referencedPageIds = new Set<string>()
    reports.forEach(report => {
      if (report.details?.internalLink?._id) {
        referencedPageIds.add(report.details.internalLink._id)
      }
    })
    
    const orphanedPages = allPages.filter((page: any) => !referencedPageIds.has(page._id))
    
    // 5. Generate report
    console.log('\n' + '='.repeat(60))
    console.log('📊 NAVIGATION HEALTH REPORT')
    console.log('='.repeat(60) + '\n')
    
    // Summary
    const brokenLinks = reports.filter(r => r.status === 'broken')
    const warningLinks = reports.filter(r => r.status === 'warning')
    const validLinks = reports.filter(r => r.status === 'valid')
    
    console.log('📈 Summary:')
    console.log(`   Total links checked: ${reports.length}`)
    console.log(`   ✅ Valid: ${validLinks.length}`)
    console.log(`   ⚠️  Warnings: ${warningLinks.length}`)
    console.log(`   ❌ Broken: ${brokenLinks.length}`)
    console.log(`   📄 Orphaned pages: ${orphanedPages.length}`)
    
    // Broken links details
    if (brokenLinks.length > 0) {
      console.log('\n❌ Broken Links:')
      brokenLinks.forEach(report => {
        console.log(`   • ${report.location} > "${report.title}"`)
        console.log(`     Issue: ${report.issue}`)
      })
    }
    
    // Warning links details
    if (warningLinks.length > 0) {
      console.log('\n⚠️  Warning Links:')
      warningLinks.forEach(report => {
        console.log(`   • ${report.location} > "${report.title}"`)
        console.log(`     Issue: ${report.issue}`)
      })
    }
    
    // Orphaned pages
    if (orphanedPages.length > 0) {
      console.log('\n📄 Orphaned Pages (not in navigation):')
      orphanedPages.forEach((page: any) => {
        console.log(`   • "${page.title}" (/${page.slug})`)
      })
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:')
    if (brokenLinks.length > 0) {
      console.log('   1. Fix broken links by updating references in Site Settings')
      console.log('   2. Consider implementing webhooks for real-time updates')
    }
    if (orphanedPages.length > 0) {
      console.log('   3. Add orphaned pages to navigation or delete if unused')
    }
    if (brokenLinks.length === 0 && warningLinks.length === 0) {
      console.log('   ✨ Navigation is healthy! Consider setting up monitoring.')
    }
    
  } catch (error) {
    console.error('❌ Error running health check:', error)
  }
}

function checkLink(link: any, location: string): LinkReport {
  const report: LinkReport = {
    location,
    title: link.title || 'Untitled',
    linkType: link.linkType,
    status: 'valid',
    details: link
  }
  
  if (link.linkType === 'external') {
    if (!link.externalUrl) {
      report.status = 'broken'
      report.issue = 'External URL is missing'
    } else if (!link.externalUrl.startsWith('http')) {
      report.status = 'warning'
      report.issue = `External URL should start with http/https: "${link.externalUrl}"`
    }
  } else if (link.linkType === 'internal') {
    if (!link.internalLink) {
      report.status = 'broken'
      report.issue = 'Internal reference is broken (page may have been deleted)'
    } else if (!link.internalLink.slug) {
      report.status = 'broken'
      report.issue = 'Referenced page exists but has no slug'
    }
  } else {
    report.status = 'warning'
    report.issue = `Unknown link type: "${link.linkType}"`
  }
  
  return report
}

// Run the health check
checkNavigationHealth().catch(console.error)
