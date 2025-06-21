import React from 'react'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import LivePriceGraphComponent from './LivePriceGraphComponent'
import RenewableEnergyForecastComponent from './RenewableEnergyForecast'
import PriceCalculatorWidget from './PriceCalculatorWidget'

// We'll need to add a 'PageSectionBlock' type to sanity.ts later
interface PageSectionProps {
  section: any;
}

const PageSectionComponent: React.FC<PageSectionProps> = ({ section }) => {
  const { title, content, image, imagePosition = 'left', theme, cta } = section;

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
      priceCalculator: ({ value }: { value: any }) => (
         <div className="my-12">
           <PriceCalculatorWidget block={value} variant="standalone" />
         </div>
      ),
    },
    block: {
      h1: ({ children }: any) => (
        <h1 className="text-3xl font-bold mb-4 text-brand-dark">{children}</h1>
      ),
      h2: ({ children }: any) => (
        <h2 className="text-2xl font-bold mb-3 text-brand-dark">{children}</h2>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-xl font-bold mb-2 text-brand-dark">{children}</h3>
      ),
      blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-brand-green pl-4 italic mb-4 text-neutral-600">{children}</blockquote>
      ),
      normal: ({ children }: any) => (
        <p className="mb-4 text-neutral-600 leading-relaxed">{children}</p>
      ),
    },
    marks: {
      strong: ({ children }: any) => <strong className="text-brand-dark">{children}</strong>,
      em: ({ children }: any) => <em>{children}</em>,
    },
  }
  
  // Define styles from theme
  const sectionStyle = {
    backgroundColor: theme?.background || 'transparent',
  };

  return (
    <section style={sectionStyle} className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          
          {/* Image Column */}
          <div className={`order-1 ${imagePosition === 'right' ? 'md:order-2' : ''}`}>
            {image && (
              <div className="rounded-xl border border-neutral-200 bg-white shadow-xl shadow-black/10 p-2">
                <img
                  src={urlFor(image).width(1000).quality(85).url()}
                  alt={image.alt || title}
                  className="rounded-lg w-full h-auto"
                />
              </div>
            )}
          </div>

          {/* Text Column */}
          <div className={`order-2 ${imagePosition === 'right' ? 'md:order-1' : ''}`}>
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-dark mb-6">
                {title}
              </h2>
            )}
            <div className="prose prose-lg max-w-none">
              {content && <PortableText value={content} components={customComponents} />}
            </div>
            {cta && cta.text && cta.url && (
              <div className="mt-8">
                <a 
                  href={cta.url} 
                  className="inline-flex items-center px-6 py-3 bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold rounded-lg transition-colors duration-200"
                >
                  {cta.text}
                </a>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

export default PageSectionComponent
