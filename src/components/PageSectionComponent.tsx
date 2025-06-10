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

const PageSectionComponent: React.FC<PageSectionComponentProps> = ({ section }) => {
  // Define custom components for embedded blocks in Portable Text
  const customComponents = {
    types: {
      livePriceGraph: ({ value }: { value: any }) => (
        <div className="not-prose -mx-4 sm:-mx-6 lg:-mx-16 my-12">
          <LivePriceGraphComponent block={value} />
        </div>
      ),
      renewableEnergyForecast: ({ value }: { value: any }) => (
        <div className="not-prose -mx-4 sm:-mx-6 lg:-mx-16 my-12">
          <RenewableEnergyForecastComponent block={value} />
        </div>
      ),
      // A component that should STAY inside the narrow text column
      priceCalculator: ({ value }: { value: any }) => (
         <div className="my-12">
           <PriceCalculatorWidget block={value} variant="standalone" />
         </div>
      ),
    },
    block: {
      // Customize text block styles
      h1: ({ children }: any) => (
        <h1 className="text-3xl font-display font-bold mb-4">{children}</h1>
      ),
      h2: ({ children }: any) => (
        <h2 className="text-2xl font-display font-bold mb-3">{children}</h2>
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
  
  // Define styles from theme
  const sectionStyle = {
    backgroundColor: section?.theme?.background || 'transparent',
  };
  const textStyle = {
    color: section?.theme?.text,
  };

  // Generate image URL if image exists
  const imageUrl = section?.image 
    ? urlFor(section.image).width(600).height(450).auto('format').url() 
    : null;

  // Define the content block
  const contentBlock = (
    <div className="flex-1">
      {section?.title && <h2 className="text-3xl lg:text-4xl font-display font-bold mb-8" style={textStyle}>{section.title}</h2>}
      <div className="prose prose-lg max-w-none" style={textStyle}>
        {section?.content && <PortableText value={section.content} components={customComponents} />}
      </div>
      {section?.cta && section.cta.text && section.cta.url && (
        <div className="mt-8">
          <a href={section.cta.url} className="inline-block bg-green-500 text-white font-bold py-3 px-8 rounded-lg">
            {section.cta.text}
          </a>
        </div>
      )}
    </div>
  );

  // Define the image block
  const imageBlock = imageUrl ? (
    <div className="flex-1 flex justify-center items-center">
      <img src={imageUrl} alt={section?.image?.alt || ''} className="rounded-lg shadow-xl" />
    </div>
  ) : null;

  return (
    <section style={sectionStyle} className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Main layout container with conditional flex-direction */}
        <div className={`flex flex-col md:flex-row gap-12 lg:gap-16 items-center ${
          section?.imagePosition === 'left' ? 'md:flex-row-reverse' : ''
        }`}>
          {/* Always render the content block */}
          {contentBlock}
          {/* Only render the image block if it exists */}
          {imageBlock}
        </div>
      </div>
    </section>
  );
}

export default PageSectionComponent
