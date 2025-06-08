
import React from 'react'
import { PageSection, FAQItem, PriceExampleTable, VideoSection, FaqGroup, RichTextSection, CallToActionSection, LivePriceGraph, RealPriceComparisonTable, RenewableEnergyForecast } from '@/types/sanity'
import PageSectionComponent from './PageSectionComponent'
import FAQItemComponent from './FAQItemComponent'
import PriceExampleTableComponent from './PriceExampleTableComponent'
import VideoSectionComponent from './VideoSectionComponent'
import FaqGroupComponent from './FaqGroupComponent'
import RichTextSectionComponent from './RichTextSectionComponent'
import CallToActionSectionComponent from './CallToActionSectionComponent'
import LivePriceGraphComponent from './LivePriceGraphComponent'
import RealPriceComparisonTableComponent from './RealPriceComparisonTable'
import RenewableEnergyForecastComponent from './RenewableEnergyForecast'

interface ContentBlocksProps {
  blocks: Array<PageSection | FAQItem | PriceExampleTable | VideoSection | FaqGroup | RichTextSection | CallToActionSection | LivePriceGraph | RealPriceComparisonTable | RenewableEnergyForecast>
}

const ContentBlocks: React.FC<ContentBlocksProps> = ({ blocks }) => {
  console.log('ContentBlocks component received blocks:', blocks)

  // Group consecutive FAQ items together
  const groupedBlocks: Array<PageSection | FAQItem[] | PriceExampleTable | VideoSection | FaqGroup | RichTextSection | CallToActionSection | LivePriceGraph | RealPriceComparisonTable | RenewableEnergyForecast> = []
  let currentFAQGroup: FAQItem[] = []

  blocks.forEach((block, index) => {
    console.log(`Processing block ${index}:`, block)
    
    if (block._type === 'faqItem') {
      currentFAQGroup.push(block as FAQItem)
    } else {
      if (currentFAQGroup.length > 0) {
        groupedBlocks.push([...currentFAQGroup])
        currentFAQGroup = []
      }
      groupedBlocks.push(block)
    }
  })

  // Don't forget the last FAQ group
  if (currentFAQGroup.length > 0) {
    groupedBlocks.push([...currentFAQGroup])
  }

  console.log('Grouped blocks for rendering:', groupedBlocks)

  return (
    <div className="space-y-6">
      {groupedBlocks.map((block, index) => {
        console.log(`Rendering grouped block ${index}:`, block)
        
        if (Array.isArray(block)) {
          // This is a group of FAQ items
          return (
            <section key={index} className="container mx-auto px-4 py-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-6">Ofte stillede spørgsmål</h2>
              <div className="max-w-3xl">
                {block.map((faqItem) => (
                  <FAQItemComponent key={faqItem._key} item={faqItem} />
                ))}
              </div>
            </section>
          )
        } else if (block._type === 'faqGroup') {
          console.log('Passing faqGroup to FaqGroupComponent:', block)
          return <FaqGroupComponent key={block._key} block={block as FaqGroup} />
        } else if (block._type === 'priceExampleTable') {
          console.log('Passing priceExampleTable to PriceExampleTableComponent:', block)
          return <PriceExampleTableComponent key={block._key} block={block as PriceExampleTable} />
        } else if (block._type === 'videoSection') {
          console.log('Passing videoSection to VideoSectionComponent:', block)
          return <VideoSectionComponent key={block._key} block={block as VideoSection} />
        } else if (block._type === 'richTextSection') {
          console.log('Passing richTextSection to RichTextSectionComponent:', block)
          return <RichTextSectionComponent key={block._key} block={block as RichTextSection} />
        } else if (block._type === 'callToActionSection') {
          console.log('Passing callToActionSection to CallToActionSectionComponent:', block)
          return <CallToActionSectionComponent key={block._key} block={block as CallToActionSection} />
        } else if (block._type === 'livePriceGraph') {
          console.log('Passing livePriceGraph to LivePriceGraphComponent:', block)
          return <LivePriceGraphComponent key={block._key} block={block as LivePriceGraph} />
        } else if (block._type === 'realPriceComparisonTable') {
          console.log('Passing realPriceComparisonTable to RealPriceComparisonTableComponent:', block)
          return <RealPriceComparisonTableComponent key={block._key} block={block as RealPriceComparisonTable} />
        } else if (block._type === 'renewableEnergyForecast') {
          console.log('Passing renewableEnergyForecast to RenewableEnergyForecastComponent:', block)
          return <RenewableEnergyForecastComponent key={block._key} block={block as RenewableEnergyForecast} />
        } else {
          console.log('Passing section to PageSectionComponent:', block)
          return <PageSectionComponent key={block._key} section={block as PageSection} />
        }
      })}
    </div>
  )
}

export default ContentBlocks
