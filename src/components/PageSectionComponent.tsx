import React from 'react'
import { motion } from 'framer-motion'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import LivePriceGraphComponent from './LivePriceGraphComponent'
import RenewableEnergyForecastComponent from './RenewableEnergyForecast'
import PriceCalculatorWidget from './PriceCalculatorWidget'
import type { PageSection, LivePriceGraph, RenewableEnergyForecast, PriceCalculator } from '@/types/sanity'

interface PageSectionProps {
  section: PageSection;
}

const PageSectionComponent: React.FC<PageSectionProps> = ({ section }) => {
  const { title, content, image, imagePosition = 'left', theme, cta, settings, headerAlignment } = section;

  // Define custom components for embedded blocks in Portable Text
  const customComponents = {
    types: {
      livePriceGraph: ({ value }: { value: LivePriceGraph }) => (
        <div className="not-prose -mx-4 sm:-mx-6 lg:-mx-16 my-12">
          <LivePriceGraphComponent block={value} />
        </div>
      ),
      renewableEnergyForecast: ({ value }: { value: RenewableEnergyForecast }) => (
        <div className="not-prose -mx-4 sm:-mx-6 lg:-mx-16 my-12">
          <RenewableEnergyForecastComponent block={value} />
        </div>
      ),
      priceCalculator: ({ value }: { value: PriceCalculator }) => (
         <div className="my-12">
           <PriceCalculatorWidget block={value} variant="standalone" />
         </div>
      ),
    },
    block: {
      h1: ({ children }: { children: React.ReactNode }) => (
        <h1 className="text-3xl font-bold mb-4 text-brand-dark">{children}</h1>
      ),
      h2: ({ children }: { children: React.ReactNode }) => (
        <h2 className="text-2xl font-bold mb-3 text-brand-dark">{children}</h2>
      ),
      h3: ({ children }: { children: React.ReactNode }) => (
        <h3 className="text-xl font-bold mb-2 text-brand-dark">{children}</h3>
      ),
      blockquote: ({ children }: { children: React.ReactNode }) => (
        <blockquote className="border-l-4 border-brand-green pl-4 italic mb-4 text-neutral-600">{children}</blockquote>
      ),
      normal: ({ children }: { children: React.ReactNode }) => (
        <p className="mb-4 text-neutral-600 leading-relaxed">{children}</p>
      ),
    },
    marks: {
      strong: ({ children }: { children: React.ReactNode }) => <strong className="text-brand-dark">{children}</strong>,
      em: ({ children }: { children: React.ReactNode }) => <em>{children}</em>,
    },
  }
  
  // Define styles from theme
  const sectionStyle = {
    backgroundColor: theme?.background || 'transparent',
  };

  // Get text alignment class - headerAlignment takes priority over settings.textAlignment
  const getTextAlignClass = () => {
    const alignment = headerAlignment || settings?.textAlignment;
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      case 'center':
      default:
        return 'text-center';
    }
  };
  
  const textAlignClass = getTextAlignClass();

  // Check if this is a text-only section (no image)
  const isTextOnly = !image;

  return (
    <section style={sectionStyle} className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {isTextOnly ? (
          // Text-only layout
          <div className={`max-w-4xl mx-auto ${textAlignClass}`}>
            {title && (
              <h2 className={`text-3xl md:text-4xl font-bold tracking-tight text-brand-dark mb-6`}>
                {title}
              </h2>
            )}
            <div className="prose prose-lg max-w-none">
              {content && <PortableText value={content} components={customComponents} />}
            </div>
            {cta && cta.text && cta.url && (
              <div className={`mt-8 ${settings?.textAlignment === 'center' ? 'flex justify-center' : settings?.textAlignment === 'right' ? 'flex justify-end' : ''}`}>
                <a 
                  href={cta.url} 
                  className="inline-flex items-center px-6 py-3 bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold rounded-lg transition-colors duration-200"
                >
                  {cta.text}
                </a>
              </div>
            )}
          </div>
        ) : (
          // Image + text layout
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Image Column */}
            <div className={`order-1 ${imagePosition === 'right' ? 'md:order-2' : ''}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <img
                  src={urlFor(image).width(1000).quality(85).url()}
                  alt={image.alt || title}
                  className="rounded-xl w-full h-auto shadow-xl shadow-black/10"
                />
              </motion.div>
            </div>

            {/* Text Column */}
            <div className={`order-2 ${imagePosition === 'right' ? 'md:order-1' : ''} ${textAlignClass}`}>
              {title && (
                <h2 className={`text-3xl md:text-4xl font-bold tracking-tight text-brand-dark mb-6`}>
                  {title}
                </h2>
              )}
              <div className="prose prose-lg max-w-none">
                {content && <PortableText value={content} components={customComponents} />}
              </div>
              {cta && cta.text && cta.url && (
                <div className={`mt-8 ${settings?.textAlignment === 'center' ? 'flex justify-center' : settings?.textAlignment === 'right' ? 'flex justify-end' : ''}`}>
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
        )}
      </div>
    </section>
  );
}

export default PageSectionComponent
