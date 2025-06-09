
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
  // The new, correct customComponents object
  const customComponents = {
    types: {
      livePriceGraph: ({ value }: { value: any }) => (
        // This div breaks out of the `prose` max-width constraint
        <div className="not-prose -mx-4 sm:-mx-6 lg:-mx-8 my-12">
          <LivePriceGraphComponent block={value} />
        </div>
      ),
      renewableEnergyForecast: ({ value }: { value: any }) => (
        <div className="not-prose -mx-4 sm:-mx-6 lg:-mx-8 my-12">
          <RenewableEnergyForecastComponent block={value} />
        </div>
      ),
      priceCalculator: ({ value }: { value: any }) => (
         // This one should probably stay contained within the prose width
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
  
  const sectionStyle = {
    backgroundColor: section?.theme?.background || 'transparent',
  };
  
  return (
    <section style={sectionStyle} className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Title can be here, centered */}
        {section.title && (
          <h2 className="text-3xl font-bold text-center mb-12" style={{color: section?.theme?.text}}>
            {section.title}
          </h2>
        )}

        {/* Main Content Area */}
        <div className="prose prose-lg max-w-4xl mx-auto" style={{color: section?.theme?.text}}>
          <PortableText 
            value={section.content} 
            components={customComponents} 
          />
        </div>
      </div>
    </section>
  );
}

export default PageSectionComponent
