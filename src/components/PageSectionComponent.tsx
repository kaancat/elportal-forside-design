
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

  // Don't render anything if there's no section
  if (!section) return null

  // Determine if there's an image to show
  const hasImage = !!image?.asset
  console.log('Has image:', hasImage)

  const imageElement = hasImage && (
    <div className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0">
      {(() => {
        const imageUrl = urlFor(image).width(500).height(400).auto('format').url()
        console.log('Generated image URL:', imageUrl)
        return (
          <img
            src={imageUrl}
            alt={image.alt || ''}
            className="rounded-lg shadow-lg w-full h-auto"
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

  const textElement = (
    <div className={`w-full ${hasImage ? 'md:w-1/2 lg:w-2/3' : 'md:w-full'}`}>
      {title && (
        <h2 className="text-3xl font-bold text-brand-dark mb-6">{title}</h2>
      )}
      {content && (
        <div className="prose prose-lg max-w-none">
          <BlockContent content={content} />
        </div>
      )}
    </div>
  )

  console.log('Rendering section with image position:', imagePosition)

  return (
    <section className="container mx-auto px-4 py-16">
      <div className={`flex flex-col md:flex-row items-center justify-center gap-8 ${
        imagePosition === 'right' ? 'md:flex-row-reverse' : ''
      }`}>
        {/* Text Content */}
        {textElement}
        
        {/* Image Content (only if it exists) */}
        {imageElement}
      </div>
    </section>
  )
}

export default PageSectionComponent
