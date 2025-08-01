import React from 'react'
import { ContentBlock } from '@/types/sanity'
import ContentBlocks from './ContentBlocks'
import { ContentBlocksWithBreadcrumb } from './ContentBlocksWithBreadcrumb'
import { type BreadcrumbItem } from './PageBreadcrumbSubtle'

interface UnifiedContentBlocksProps {
  page: {
    isHomepage?: boolean
    contentBlocks?: ContentBlock[]
    title?: string
    slug?: { current: string }
    [key: string]: any
  }
  enableBreadcrumbs?: boolean
  breadcrumbItems?: BreadcrumbItem[]
}

/**
 * Unified content blocks wrapper that handles both homepage and regular pages
 * - Homepage: Uses ContentBlocks with error boundaries
 * - Regular pages: Uses ContentBlocksWithBreadcrumb (unless breadcrumbs disabled)
 */
const UnifiedContentBlocks: React.FC<UnifiedContentBlocksProps> = ({ 
  page, 
  enableBreadcrumbs = true,
  breadcrumbItems 
}) => {
  // Ensure blocks is always an array and filter out null/undefined values
  const blocks = (page?.contentBlocks || []).filter(Boolean)

  // Homepage or breadcrumbs disabled: use regular ContentBlocks
  if (page?.isHomepage || !enableBreadcrumbs) {
    return <ContentBlocks blocks={blocks} enableErrorBoundaries={true} />
  }

  // Generate default breadcrumb items if not provided
  const items = breadcrumbItems || (page.title ? [{ label: page.title }] : [])

  // Regular pages with breadcrumbs: use ContentBlocksWithBreadcrumb
  return <ContentBlocksWithBreadcrumb blocks={blocks} breadcrumbItems={items} slug={page.slug?.current} />
}

export default UnifiedContentBlocks