
import React from 'react'
import { RichTextSection } from '@/types/sanity'
import BlockContent from './BlockContent'

interface RichTextSectionComponentProps {
  block: RichTextSection
}

const RichTextSectionComponent: React.FC<RichTextSectionComponentProps> = ({ block }) => {
  console.log('RichTextSectionComponent received block:', block)

  if (!block?.content || block.content.length === 0) {
    console.warn('RichTextSectionComponent: No content provided')
    return null
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="prose prose-lg max-w-none">
          <BlockContent content={block.content} />
        </div>
      </div>
    </section>
  )
}

export default RichTextSectionComponent
