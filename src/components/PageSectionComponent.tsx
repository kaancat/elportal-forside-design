
import React from 'react'
import { PageSection } from '@/types/sanity'
import { urlFor } from '@/lib/sanity'
import BlockContent from './BlockContent'

interface PageSectionComponentProps {
  section: PageSection
}

const PageSectionComponent: React.FC<PageSectionComponentProps> = (props) => {
  console.log('Props received by PageSectionComponent:', props)
  
  const { section } = props
  const { title, content, image, imagePosition } = section

  console.log('Extracted section data:', { title, content, image, imagePosition })
  console.log('PageSection image data:', image)
  
  const imageElement = image && (
    <div className="flex-shrink-0 w-full md:w-auto md:max-w-md">
      {(() => {
        const imageUrl = urlFor(image).width(400).height(300).url()
        console.log('Generated image URL:', imageUrl)
        return (
          <img
            src={imageUrl}
            alt={image.alt || ''}
            className="w-full h-auto rounded-lg shadow-md"
            onError={(e) => {
              console.error('Image failed to load:', imageUrl)
              console.error('Image error event:', e)
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', imageUrl)
            }}
          />
        )
      })()}
    </div>
  )

  const contentElement = (
    <div className="flex-1 min-w-0">
      {title && (
        <h2 className="text-2xl font-bold text-brand-dark mb-4">{title}</h2>
      )}
      <BlockContent content={content} />
    </div>
  )

  if (!image || imagePosition === 'none') {
    console.log('Rendering section without image')
    return (
      <section className="mb-12">
        {contentElement}
      </section>
    )
  }

  console.log('Rendering section with image, position:', imagePosition)
  return (
    <section className="mb-12">
      <div className={`flex gap-8 items-start ${
        imagePosition === 'left' 
          ? 'flex-col md:flex-row' 
          : 'flex-col md:flex-row-reverse'
      }`}>
        {imageElement}
        {contentElement}
      </div>
    </section>
  )
}

export default PageSectionComponent
