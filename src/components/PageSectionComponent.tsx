
import React from 'react'
import { PageSection } from '@/types/sanity'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import LivePriceGraphComponent from './LivePriceGraphComponent'
import RenewableEnergyForecastComponent from './RenewableEnergyForecast'
import PriceCalculatorWidget from './PriceCalculatorWidget'
import { Container, WideContainer, FullBleedContainer } from './Container'

interface PageSectionComponentProps {
  section: PageSection
}

const PageSectionComponent: React.FC<PageSectionComponentProps> = ({ section }) => {
  console.log('Props received by PageSectionComponent:', { section })

  // Define custom components for embedded blocks in Portable Text
  const customComponents = {
    types: {
      livePriceGraph: ({ value }: { value: any }) => (
        <div className="my-12">
          <LivePriceGraphComponent block={value} />
        </div>
      ),
      renewableEnergyForecast: ({ value }: { value: any }) => (
        <div className="my-12">
          <RenewableEnergyForecastComponent block={value} />
        </div>
      ),
      priceCalculator: ({ value }: { value: any }) => (
        <div className="my-12">
          <PriceCalculatorWidget block={value} variant="standalone" />
        </div>
      ),
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
  
  // Don't render anything if there's no section
  if (!section) return null

  // Theme colors with ElPortal brand defaults
  const sectionStyle = {
    backgroundColor: section.theme?.background || 'transparent',
    color: section.theme?.text || '#001a12',
  }

  // Choose the container based on the 'fullWidth' setting
  const ContainerComponent = section.fullWidth ? FullBleedContainer : Container

  return (
    <section style={sectionStyle}>
      <ContainerComponent className="py-16 lg:py-24">
        {/* Title */}
        {section.title && (
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight text-center">
            {section.title}
          </h2>
        )}

        {/* Image */}
        {section.image?.asset && (
          <div className="mb-12 text-center">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl inline-block max-w-2xl">
              <img
                src={urlFor(section.image).width(800).height(600).auto('format').url()}
                alt={section.image.alt || ''}
                className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        )}

        {/* The PortableText component for rendering the content array */}
        {section.content && (
          <div className="prose prose-lg mx-auto max-w-3xl">
            <PortableText 
              value={section.content} 
              components={customComponents} 
            />
          </div>
        )}

      </ContainerComponent>
    </section>
  )
}

export default PageSectionComponent
