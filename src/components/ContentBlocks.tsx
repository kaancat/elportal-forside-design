
import React from 'react'
import { PageSection, FAQItem } from '@/types/sanity'
import PageSectionComponent from './PageSectionComponent'
import FAQItemComponent from './FAQItemComponent'

interface ContentBlocksProps {
  blocks: Array<PageSection | FAQItem>
}

const ContentBlocks: React.FC<ContentBlocksProps> = ({ blocks }) => {
  // Group consecutive FAQ items together
  const groupedBlocks: Array<PageSection | FAQItem[]> = []
  let currentFAQGroup: FAQItem[] = []

  blocks.forEach((block) => {
    if (block._type === 'faqItem') {
      currentFAQGroup.push(block as FAQItem)
    } else {
      if (currentFAQGroup.length > 0) {
        groupedBlocks.push([...currentFAQGroup])
        currentFAQGroup = []
      }
      groupedBlocks.push(block as PageSection)
    }
  })

  // Don't forget the last FAQ group
  if (currentFAQGroup.length > 0) {
    groupedBlocks.push([...currentFAQGroup])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {groupedBlocks.map((block, index) => {
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
        } else {
          // This is a page section
          return <PageSectionComponent key={block._key} section={block} />
        }
      })}
    </div>
  )
}

export default ContentBlocks
