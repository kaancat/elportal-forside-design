
import React from 'react'
import { PageSection } from '@/types/sanity'
import { urlFor } from '@/lib/sanity'
import BlockContent from './BlockContent'

interface PageSectionComponentProps {
  section: PageSection
}

const PageSectionComponent: React.FC<PageSectionComponentProps> = ({ section }) => {
  const { title, content, image, imagePosition } = section

  const imageElement = image && (
    <div className="flex-shrink-0">
      <img
        src={urlFor(image).width(400).height(300).url()}
        alt={image.alt || ''}
        className="rounded-lg shadow-md"
      />
    </div>
  )

  const contentElement = (
    <div className="flex-1">
      {title && (
        <h2 className="text-2xl font-bold text-brand-dark mb-4">{title}</h2>
      )}
      <BlockContent content={content} />
    </div>
  )

  if (!image || imagePosition === 'none') {
    return (
      <section className="mb-12">
        {contentElement}
      </section>
    )
  }

  return (
    <section className="mb-12">
      <div className={`flex gap-8 items-start ${
        imagePosition === 'left' ? 'flex-row' : 'flex-row-reverse'
      } ${imagePosition === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} flex-col md:flex-row`}>
        {imageElement}
        {contentElement}
      </div>
    </section>
  )
}

export default PageSectionComponent
