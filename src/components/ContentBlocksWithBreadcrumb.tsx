import React from 'react'
import ContentBlocks from './ContentBlocks'
import { PageBreadcrumbSubtle, type BreadcrumbItem } from './PageBreadcrumbSubtle'
import { ContentBlock } from '@/types/sanity'
import { useBreadcrumbPlacement } from '@/hooks/useBreadcrumbPlacement'

interface ContentBlocksWithBreadcrumbProps {
  blocks: ContentBlock[]
  breadcrumbItems: BreadcrumbItem[]
  slug?: string
}

export const ContentBlocksWithBreadcrumb: React.FC<ContentBlocksWithBreadcrumbProps> = ({ 
  blocks, 
  breadcrumbItems,
  slug 
}) => {
  const breadcrumbPlacement = useBreadcrumbPlacement({
    blocks: blocks || [],
    preferredPosition: 'after-hero',
    fallbackToFloating: true
  })

  // If placement is inline and we have an insert index, render breadcrumb between blocks
  if (breadcrumbPlacement.position === 'inline' && breadcrumbPlacement.insertIndex !== undefined) {
    const blocksBeforeBreadcrumb = blocks.slice(0, breadcrumbPlacement.insertIndex)
    const blocksAfterBreadcrumb = blocks.slice(breadcrumbPlacement.insertIndex)

    return (
      <>
        {/* Render first part of content blocks */}
        <ContentBlocks blocks={blocksBeforeBreadcrumb} enableErrorBoundaries={true} />
        
        {/* Render inline breadcrumb */}
        {slug && breadcrumbItems.length > 0 && (
          <div className="container mx-auto px-4 py-2">
            <div className="border-t border-gray-100 pt-2">
              <PageBreadcrumbSubtle 
                items={breadcrumbItems} 
                variant="inline"
                className="text-xs text-gray-400"
              />
            </div>
          </div>
        )}
        
        {/* Render remaining content blocks */}
        <ContentBlocks blocks={blocksAfterBreadcrumb} enableErrorBoundaries={true} />
      </>
    )
  }

  // For floating or sticky-bottom, render normally
  return (
    <>
      {slug && breadcrumbItems.length > 0 && (
        <PageBreadcrumbSubtle 
          items={breadcrumbItems} 
          variant={breadcrumbPlacement.position as any}
        />
      )}
      <ContentBlocks blocks={blocks} enableErrorBoundaries={true} />
    </>
  )
}