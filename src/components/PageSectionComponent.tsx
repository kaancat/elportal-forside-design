
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
  
  // Temporary placeholder data for styling purposes
  const placeholderData = {
    title: "Elpriser kan være en jungle – vi giver dig overblikket",
    content: "Det kan være svært at navigere i de mange elaftaler med variable priser, tillæg og gebyrer. Vores mission er at gøre det simpelt for dig at sammenligne dine muligheder og træffe et informeret valg, der kan spare dig for tusindvis af kroner hvert år.",
    imagePosition: 'right' as const
  }

  // Use actual section data but fall back to placeholder for missing fields
  const title = section?.title || placeholderData.title
  const content = section?.content || null
  const image = section?.image
  const imagePosition = section?.imagePosition || placeholderData.imagePosition

  console.log('Extracted section data:', { title, content, image, imagePosition })
  console.log('PageSection image data:', image)

  // Don't render anything if there's no section
  if (!section) return null

  // Determine if there's an image to show
  const hasImage = !!image?.asset
  console.log('Has image:', hasImage)

  const imageElement = hasImage && (
    <div className="w-full lg:w-1/2 flex-shrink-0">
      {(() => {
        const imageUrl = urlFor(image).width(600).height(450).auto('format').url()
        console.log('Generated image URL:', imageUrl)
        return (
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={imageUrl}
              alt={image.alt || ''}
              className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                console.error('Image failed to load:', imageUrl)
                console.error('Image error event:', e)
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', imageUrl)
              }}
            />
          </div>
        )
      })()}
    </div>
  )

  const textElement = (
    <div className={`w-full ${hasImage ? 'lg:w-1/2' : 'lg:w-full'} flex flex-col justify-center`}>
      <div className="max-w-xl">
        {title && (
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-dark mb-8 leading-tight">
            {title}
          </h2>
        )}
        {content ? (
          <div className="prose prose-xl max-w-none text-gray-700 leading-relaxed">
            <BlockContent content={content} />
          </div>
        ) : (
          <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed">
            {placeholderData.content}
          </p>
        )}
      </div>
    </div>
  )

  console.log('Rendering section with image position:', imagePosition)

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-20 lg:py-32">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        <div className={`flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 ${
          imagePosition === 'right' ? 'lg:flex-row-reverse' : ''
        }`}>
          {/* Text Content */}
          {textElement}
          
          {/* Image Content (only if it exists) */}
          {imageElement}
        </div>
      </div>
    </section>
  )
}

export default PageSectionComponent
