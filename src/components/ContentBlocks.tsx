
import React from 'react'
import { PageSection, FAQItem, PriceExampleTable, VideoSection } from '@/types/sanity'
import PageSectionComponent from './PageSectionComponent'
import FAQItemComponent from './FAQItemComponent'
import PriceExampleTableComponent from './PriceExampleTableComponent'
import VideoSectionComponent from './VideoSectionComponent'

interface ContentBlocksProps {
  blocks: Array<PageSection | FAQItem | PriceExampleTable | VideoSection>
}

const ContentBlocks: React.FC<ContentBlocksProps> = ({ blocks }) => {
  console.log('ContentBlocks component received blocks:', blocks)

  // Group consecutive FAQ items together
  const groupedBlocks: Array<PageSection | FAQItem[] | PriceExampleTable | VideoSection> = []
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
    <div className="container mx-auto px-4 py-8">
      {groupedBlocks.map((block, index) => {
        console.log(`Rendering grouped block ${index}:`, block)
        
        if (Array.isArray(block)) {
          // This is a group of FAQ items
          return (
            <section key={index} className="mb-12">
              <h2 className="text-2xl font-bold text-brand-dark mb-6">Ofte stillede spørgsmål</h2>
              <div className="max-w-3xl">
                {block.map((faqItem) => (
                  <FAQItemComponent key={faqItem._key} item={faqItem} />
                ))}
              </div>
            </section>
          )
        } else if (block._type === 'priceExampleTable') {
          // This is a price example table
          console.log('Passing priceExampleTable to PriceExampleTableComponent:', block)
          return <PriceExampleTableComponent key={block._key} block={block as PriceExampleTable} />
        } else if (block._type === 'videoSection') {
          // This is a video section
          console.log('Passing videoSection to VideoSectionComponent:', block)
          return <VideoSectionComponent key={block._key} block={block as VideoSection} />
        } else {
          // This is a page section
          console.log('Passing section to PageSectionComponent:', block)
          return <PageSectionComponent key={block._key} section={block as PageSection} />
        }
      })}
    </div>
  )
}

export default ContentBlocks
