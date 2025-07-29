import { useEffect, useState, useRef } from 'react'
import { ContentBlock } from '@/types/sanity'

interface BreadcrumbPlacementOptions {
  blocks: ContentBlock[]
  preferredPosition?: 'after-hero' | 'after-first' | 'floating' | 'sticky-bottom'
  fallbackToFloating?: boolean
}

interface BreadcrumbPlacement {
  position: 'floating' | 'sticky-bottom' | 'inline'
  insertIndex?: number
  targetComponentRef?: React.RefObject<HTMLElement>
}

/**
 * Smart breadcrumb placement hook that analyzes content blocks
 * and determines the best position for the breadcrumb
 */
export const useBreadcrumbPlacement = ({
  blocks,
  preferredPosition = 'after-hero',
  fallbackToFloating = true
}: BreadcrumbPlacementOptions): BreadcrumbPlacement => {
  const [placement, setPlacement] = useState<BreadcrumbPlacement>({
    position: 'floating'
  })
  
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!blocks || blocks.length === 0) {
      setPlacement({ position: 'floating' })
      return
    }

    const firstBlock = blocks[0]
    const secondBlock = blocks[1]

    // Determine if first block is suitable for inline breadcrumb
    const suitableFirstBlocks = [
      'hero',
      'heroWithCalculator',
      'pageSection',
      'livePriceGraph',
      'priceCalculator'
    ]

    const unsuitableFirstBlocks = [
      'richTextSection',
      'faqItem',
      'faqGroup',
      'priceExampleTable'
    ]

    // Check if we can place breadcrumb after first component
    if (preferredPosition === 'after-hero' || preferredPosition === 'after-first') {
      if (suitableFirstBlocks.includes(firstBlock._type)) {
        // Good candidate for inline placement after first component
        setPlacement({
          position: 'inline',
          insertIndex: 1
        })
        return
      }
    }

    // If first block is unsuitable, check if we should use floating
    if (unsuitableFirstBlocks.includes(firstBlock._type)) {
      if (fallbackToFloating) {
        setPlacement({ position: 'floating' })
      } else {
        setPlacement({ position: 'sticky-bottom' })
      }
      return
    }

    // For pages with lots of data visualizations, use sticky-bottom
    const dataVizBlocks = blocks.filter(b => 
      ['livePriceGraph', 'co2EmissionsChart', 'renewableEnergyForecast', 
       'monthlyProductionChart', 'realPriceComparisonTable'].includes(b._type)
    )
    
    if (dataVizBlocks.length > 2) {
      setPlacement({ position: 'sticky-bottom' })
      return
    }

    // Default to floating for other cases
    setPlacement({ position: 'floating' })
  }, [blocks, preferredPosition, fallbackToFloating])

  return placement
}