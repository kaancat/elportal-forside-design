import React from 'react'
import { envBool } from '@/lib/env'
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
 * - Baseline mode: When NEXT_PUBLIC_BASELINE_MODE is true, return a minimal, ultra-fast
 *   layout for the homepage to isolate perf issues during local development.
 *   This exists to provide a reliable baseline comparable to the Vite SPA.
 */
const UnifiedContentBlocks: React.FC<UnifiedContentBlocksProps> = ({ 
  page, 
  enableBreadcrumbs = true,
  breadcrumbItems 
}) => {
  // Baseline mode strips heavy blocks and returns a tiny, static layout for quick testing
  const isBaselineMode = envBool('NEXT_PUBLIC_BASELINE_MODE', false)

  // Ensure blocks is always an array and filter out null/undefined values
  const blocks = (page?.contentBlocks || []).filter(Boolean)

  // Minimal baseline for homepage only
  if (isBaselineMode && page?.isHomepage) {
    return (
      <div className="container mx-auto px-4 py-10">
        <section className="text-center py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
            {page?.title || 'DinElPortal'}
          </h1>
          <p className="mt-4 text-brand-muted max-w-2xl mx-auto">
            Baseline mode is active. Heavy content blocks are disabled so we can
            measure core render speed and isolate slow components.
          </p>
        </section>
      </div>
    )
  }

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
