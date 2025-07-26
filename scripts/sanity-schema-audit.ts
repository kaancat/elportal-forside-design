import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

interface AuditResult {
  documentType: string
  issueType: string
  documentId: string
  documentTitle?: string
  details: string
}

async function performSchemaAudit() {
  console.log('🔍 Starting Comprehensive Sanity Schema Audit...\n')
  
  const issues: AuditResult[] = []
  
  try {
    // 1. Check all pages for common issues
    console.log('=== Auditing Pages ===')
    
    // Check for pages with legacy fields
    const pagesWithLegacyFields = await client.fetch(`
      *[_type == "page" && (
        defined(description) || 
        defined(contentGoal) ||
        defined(generatedAt) ||
        defined(keywords) ||
        defined(language) ||
        defined(seoDescription) ||
        defined(seoTitle)
      )] {
        _id,
        title,
        "legacyFields": {
          "hasDescription": defined(description),
          "hasContentGoal": defined(contentGoal),
          "hasGeneratedAt": defined(generatedAt),
          "hasKeywords": defined(keywords),
          "hasLanguage": defined(language),
          "hasSeoDescription": defined(seoDescription),
          "hasSeoTitle": defined(seoTitle)
        }
      }
    `)
    
    pagesWithLegacyFields.forEach((page: any) => {
      const fields = []
      if (page.legacyFields.hasDescription) fields.push('description')
      if (page.legacyFields.hasContentGoal) fields.push('contentGoal')
      if (page.legacyFields.hasGeneratedAt) fields.push('generatedAt')
      if (page.legacyFields.hasKeywords) fields.push('keywords')
      if (page.legacyFields.hasLanguage) fields.push('language')
      if (page.legacyFields.hasSeoDescription) fields.push('seoDescription')
      if (page.legacyFields.hasSeoTitle) fields.push('seoTitle')
      
      if (fields.length > 0) {
        issues.push({
          documentType: 'page',
          issueType: 'legacy-fields',
          documentId: page._id,
          documentTitle: page.title,
          details: `Has deprecated fields: ${fields.join(', ')}`
        })
      }
    })
    
    console.log(`✓ Found ${pagesWithLegacyFields.length} pages with legacy fields`)
    
    // Check for pages missing SEO fields
    const pagesWithoutSEO = await client.fetch(`
      *[_type == "page" && (!defined(seoMetaDescription) || !defined(seoKeywords))] {
        _id,
        title,
        "missingSEO": {
          "noDescription": !defined(seoMetaDescription),
          "noKeywords": !defined(seoKeywords)
        }
      }
    `)
    
    pagesWithoutSEO.forEach((page: any) => {
      const missing = []
      if (page.missingSEO.noDescription) missing.push('seoMetaDescription')
      if (page.missingSEO.noKeywords) missing.push('seoKeywords')
      
      issues.push({
        documentType: 'page',
        issueType: 'missing-seo',
        documentId: page._id,
        documentTitle: page.title,
        details: `Missing SEO fields: ${missing.join(', ')}`
      })
    })
    
    console.log(`✓ Found ${pagesWithoutSEO.length} pages without proper SEO fields`)
    
    // 2. Check content blocks for common issues
    console.log('\n=== Auditing Content Blocks ===')
    
    // Check for hero blocks with wrong field names
    const pagesWithHeroIssues = await client.fetch(`
      *[_type == "page" && defined(contentBlocks)] {
        _id,
        title,
        "heroBlocks": contentBlocks[_type == "hero"]{
          _key,
          "hasHeading": defined(heading),
          "hasHeadline": defined(headline),
          "hasCTA": defined(ctaLink) || defined(ctaText),
          "hasTitle": defined(title)
        }
      }
    `)
    
    pagesWithHeroIssues.forEach((page: any) => {
      page.heroBlocks?.forEach((hero: any, index: number) => {
        const problems = []
        if (hero.hasHeading && !hero.hasHeadline) problems.push('uses "heading" instead of "headline"')
        if (hero.hasTitle) problems.push('uses "title" instead of "headline"')
        if (hero.hasCTA) problems.push('has non-existent CTA fields')
        
        if (problems.length > 0) {
          issues.push({
            documentType: 'page',
            issueType: 'hero-schema-mismatch',
            documentId: page._id,
            documentTitle: page.title,
            details: `Hero block ${index + 1}: ${problems.join(', ')}`
          })
        }
      })
    })
    
    console.log(`✓ Checked hero blocks across all pages`)
    
    // Check for pageSection blocks missing headerAlignment
    const pageSectionIssues = await client.fetch(`
      *[_type == "page" && defined(contentBlocks)] {
        _id,
        title,
        "pageSections": contentBlocks[_type == "pageSection"]{
          _key,
          "hasHeaderAlignment": defined(headerAlignment),
          "hasTitle": defined(title),
          "hasHeading": defined(heading)
        }
      }
    `)
    
    pageSectionIssues.forEach((page: any) => {
      page.pageSections?.forEach((section: any, index: number) => {
        const problems = []
        if (!section.hasHeaderAlignment) problems.push('missing headerAlignment')
        if (section.hasTitle && !section.hasHeading) problems.push('uses "title" instead of "heading"')
        
        if (problems.length > 0) {
          issues.push({
            documentType: 'page',
            issueType: 'pageSection-schema-mismatch',
            documentId: page._id,
            documentTitle: page.title,
            details: `PageSection block ${index + 1}: ${problems.join(', ')}`
          })
        }
      })
    })
    
    console.log(`✓ Checked pageSection blocks across all pages`)
    
    // 3. Check for broken references
    console.log('\n=== Checking for Broken References ===')
    
    // Check FAQ references
    const faqGroupsWithRefs = await client.fetch(`
      *[_type == "page" && defined(contentBlocks)] {
        _id,
        title,
        "faqGroups": contentBlocks[_type == "faqGroup"]{
          _key,
          "refs": faqItems[defined(_ref)]._ref
        }
      }
    `)
    
    for (const page of faqGroupsWithRefs) {
      for (const faqGroup of page.faqGroups || []) {
        if (faqGroup.refs && faqGroup.refs.length > 0) {
          const refs = faqGroup.refs
          const existingDocs = await client.fetch(`*[_id in $refs]._id`, { refs })
          const missingRefs = refs.filter((ref: string) => !existingDocs.includes(ref))
          
          if (missingRefs.length > 0) {
            issues.push({
              documentType: 'page',
              issueType: 'broken-reference',
              documentId: page._id,
              documentTitle: page.title,
              details: `FAQ Group has ${missingRefs.length} broken references: ${missingRefs.join(', ')}`
            })
          }
        }
      }
    }
    
    console.log(`✓ Checked FAQ references`)
    
    // Check value proposition references
    const valuePropsWithRefs = await client.fetch(`
      *[_type == "page" && defined(contentBlocks)] {
        _id,
        title,
        "valueProps": contentBlocks[_type == "valueProposition"]{
          _key,
          "refs": items[defined(_ref)]._ref
        }
      }
    `)
    
    for (const page of valuePropsWithRefs) {
      for (const valueProp of page.valueProps || []) {
        if (valueProp.refs && valueProp.refs.length > 0) {
          const refs = valueProp.refs
          const existingDocs = await client.fetch(`*[_id in $refs]._id`, { refs })
          const missingRefs = refs.filter((ref: string) => !existingDocs.includes(ref))
          
          if (missingRefs.length > 0) {
            issues.push({
              documentType: 'page',
              issueType: 'broken-reference',
              documentId: page._id,
              documentTitle: page.title,
              details: `Value Proposition has ${missingRefs.length} broken references: ${missingRefs.join(', ')}`
            })
          }
        }
      }
    }
    
    console.log(`✓ Checked value proposition references`)
    
    // 4. Check provider list issues
    console.log('\n=== Checking Provider Lists ===')
    
    const providerListIssues = await client.fetch(`
      *[_type == "page" && defined(contentBlocks)] {
        _id,
        title,
        "providerLists": contentBlocks[_type == "providerList"]{
          _key,
          "hasDescription": defined(description),
          "hasSubtitle": defined(subtitle),
          "hasHeading": defined(heading),
          "hasTitle": defined(title)
        }
      }
    `)
    
    providerListIssues.forEach((page: any) => {
      page.providerLists?.forEach((list: any, index: number) => {
        const problems = []
        if (list.hasDescription && !list.hasSubtitle) problems.push('uses "description" instead of "subtitle"')
        if (list.hasHeading && !list.hasTitle) problems.push('uses "heading" instead of "title"')
        
        if (problems.length > 0) {
          issues.push({
            documentType: 'page',
            issueType: 'providerList-schema-mismatch',
            documentId: page._id,
            documentTitle: page.title,
            details: `ProviderList block ${index + 1}: ${problems.join(', ')}`
          })
        }
      })
    })
    
    console.log(`✓ Checked provider lists`)
    
    // 5. Summary Report
    console.log('\n=== AUDIT SUMMARY ===')
    console.log(`Total issues found: ${issues.length}`)
    
    if (issues.length > 0) {
      // Group issues by type
      const issuesByType = issues.reduce((acc, issue) => {
        if (!acc[issue.issueType]) acc[issue.issueType] = []
        acc[issue.issueType].push(issue)
        return acc
      }, {} as Record<string, AuditResult[]>)
      
      console.log('\nIssues by type:')
      Object.entries(issuesByType).forEach(([type, typeIssues]) => {
        console.log(`\n${type} (${typeIssues.length} issues):`)
        typeIssues.forEach(issue => {
          console.log(`  - ${issue.documentTitle || issue.documentId}: ${issue.details}`)
        })
      })
      
      // Generate fix script
      console.log('\n=== Suggested Fixes ===')
      console.log('Run the following command to auto-fix these issues:')
      console.log('npx tsx scripts/auto-fix-schema-issues.ts')
    } else {
      console.log('\n✅ No schema issues found! Your Sanity data is clean.')
    }
    
    return issues
    
  } catch (error) {
    console.error('Error during audit:', error)
  }
}

// Run the audit
performSchemaAudit()