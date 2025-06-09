
import React from 'react'
import { PageSection } from '@/types/sanity'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import LivePriceGraphComponent from './LivePriceGraphComponent'
import RenewableEnergyForecastComponent from './RenewableEnergyForecast'
import PriceCalculatorWidget from './PriceCalculatorWidget'

interface PageSectionComponentProps {
  section: PageSection
}

const PageSectionComponent: React.FC<PageSectionComponentProps> = (props) => {
  console.log('Props received by PageSectionComponent:', props)
  
  const { section } = props

  // Define custom components for embedded blocks in Portable Text
  const customComponents = {
    types: {
      livePriceGraph: ({ value }: { value: any }) => {
        console.log('Rendering embedded livePriceGraph:', value)
        return <LivePriceGraphComponent block={value} />
      },
      renewableEnergyForecast: ({ value }: { value: any }) => {
        console.log('Rendering embedded renewableEnergyForecast:', value)
        return <RenewableEnergyForecastComponent block={value} />
      },
      priceCalculator: ({ value }: { value: any }) => {
        console.log('Rendering embedded priceCalculator:', value)
        return <PriceCalculatorWidget block={value} variant="standalone" />
      },
    },
    block: {
      // Customize text block styles
      h1: ({ children }: any) => (
        <h1 className="text-3xl font-bold mb-4">{children}</h1>
      ),
      h2: ({ children }: any) => (
        <h2 className="text-2xl font-bold mb-3">{children}</h2>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-xl font-bold mb-2">{children}</h3>
      ),
      blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-brand-green pl-4 italic mb-4">{children}</blockquote>
      ),
      normal: ({ children }: any) => (
        <p className="mb-4">{children}</p>
      ),
    },
    marks: {
      strong: ({ children }: any) => <strong>{children}</strong>,
      em: ({ children }: any) => <em>{children}</em>,
    },
  }
  
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

  // Theme colors with ElPortal brand defaults
  const sectionStyle = {
    backgroundColor: section.theme?.background || '#FFFFFF', // Default to white
    color: section.theme?.text || '#001a12', // Default to brand dark
  }
  
  // Primary color for accents (can be used for buttons, links, etc.)
  const primaryColor = section.theme?.primary || '#84db41' // Default to brand green

  console.log('Extracted section data:', { title, content, image, imagePosition })
  console.log('PageSection image data:', image)
  console.log('PageSection theme data:', section.theme)
  console.log('Applied section style:', sectionStyle)

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
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight" style={{ color: section.theme?.text || '#001a12' }}>
            {title}
          </h2>
        )}
        {content ? (
          <div className="prose prose-xl max-w-none leading-relaxed" style={{ color: section.theme?.text || '#374151' }}>
            <PortableText value={content} components={customComponents} />
          </div>
        ) : (
          <p className="text-xl lg:text-2xl leading-relaxed" style={{ color: section.theme?.text || '#374151' }}>
            {placeholderData.content}
          </p>
        )}
      </div>
    </div>
  )

  console.log('Rendering section with image position:', imagePosition)

  return (
    <section style={sectionStyle} className="py-20 lg:py-32">
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
