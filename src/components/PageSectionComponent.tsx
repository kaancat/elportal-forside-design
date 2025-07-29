import React from 'react'
import { motion } from 'framer-motion'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import LivePriceGraphComponent from './LivePriceGraphComponent'
import RenewableEnergyForecastComponent from './RenewableEnergyForecast'
import PriceCalculatorWidget from './PriceCalculatorWidget'
import type { PageSection, LivePriceGraph, RenewableEnergyForecast, PriceCalculator } from '@/types/sanity'
import { cn } from '@/lib/utils'
import { useScrollAnimation, animationClasses } from '@/hooks/useScrollAnimation'

interface PageSectionProps {
  section: PageSection;
}

const PageSectionComponent: React.FC<PageSectionProps> = ({ section }) => {
  const { title, content, image, imagePosition = 'left', theme, cta, settings, headerAlignment } = section;
  
  // Use custom scroll animation hook
  const scrollAnimation = useScrollAnimation({ duration: 0.6 });
  const textScrollAnimation = useScrollAnimation({ duration: 0.5, delay: 0.2, distance: 15 });

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
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark leading-tight">{children}</h1>
      ),
      h2: ({ children }: { children: React.ReactNode }) => (
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-brand-dark leading-tight">{children}</h2>
      ),
      h3: ({ children }: { children: React.ReactNode }) => (
        <h3 className="text-xl md:text-2xl font-bold mb-3 text-brand-dark leading-tight">{children}</h3>
      ),
      blockquote: ({ children }: { children: React.ReactNode }) => (
        <blockquote className="relative border-l-4 border-brand-green pl-6 py-2 italic mb-6 text-neutral-700 bg-brand-green/5 rounded-r-lg">
          <div className="absolute -left-1 top-0 w-8 h-8 bg-brand-green/20 rounded-full blur-xl" />
          {children}
        </blockquote>
      ),
      normal: ({ children }: { children: React.ReactNode }) => (
        <p className="mb-6 text-neutral-600 leading-relaxed text-lg">{children}</p>
      ),
    },
    marks: {
      strong: ({ children }: { children: React.ReactNode }) => <strong className="font-semibold text-brand-dark">{children}</strong>,
      em: ({ children }: { children: React.ReactNode }) => <em className="italic">{children}</em>,
      link: ({ value, children }: { value?: { href: string }, children: React.ReactNode }) => (
        <a 
          href={value?.href} 
          className="text-brand-green hover:text-brand-green-dark underline decoration-brand-green/30 hover:decoration-brand-green transition-colors duration-200"
          target={value?.href?.startsWith('http') ? '_blank' : undefined}
          rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      ),
    },
  }
  
  // Enhanced theme system with more visual options
  const getThemeClasses = () => {
    const themeType = settings?.theme || 'default';
    const themes = {
      default: 'bg-white',
      light: 'bg-gradient-to-br from-gray-50 to-white',
      brand: 'bg-gradient-to-br from-brand-green/5 to-white',
      dark: 'bg-gradient-to-br from-brand-dark to-brand-dark-lighter text-white',
      subtle: 'bg-gradient-to-br from-gray-50 via-white to-gray-50',
      accent: 'bg-gradient-to-br from-brand-green/10 via-white to-brand-green/5',
      pattern: 'bg-white bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-green/5 via-transparent to-transparent',
    }
    return themes[themeType as keyof typeof themes] || themes.default;
  };

  // Get padding classes based on settings
  const getPaddingClasses = () => {
    const padding = settings?.padding || 'medium';
    const paddings = {
      none: 'py-0',
      small: 'py-8 md:py-12',
      medium: 'py-16 md:py-24',
      large: 'py-24 md:py-32',
    }
    return paddings[padding] || paddings.medium;
  };

  // Background pattern overlay for visual interest
  const getPatternOverlay = () => {
    if (settings?.theme === 'pattern' || settings?.theme === 'accent') {
      return (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
      );
    }
    return null;
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
  
  // Add visual separator between sections
  const hasSeparator = settings?.separator !== false;

  return (
    <motion.section 
      {...scrollAnimation}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        getThemeClasses(),
        getPaddingClasses(),
        animationClasses
      )}
      style={theme?.background ? { backgroundColor: theme.background } : {}}
    >
      {getPatternOverlay()}
      <div className="container mx-auto px-4 relative z-10">
        {isTextOnly ? (
          // Text-only layout
          <div className={`max-w-4xl mx-auto ${textAlignClass}`}>
            {title && (
              <motion.div {...textScrollAnimation}>
                <h2 className={cn(
                  "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8",
                  "bg-gradient-to-r from-brand-dark to-brand-dark-light bg-clip-text",
                  settings?.theme === 'dark' ? "text-white from-white to-gray-200" : "text-brand-dark"
                )}>
                  {title}
                </h2>
                {/* Decorative underline for center-aligned headers */}
                {textAlignClass === 'text-center' && (
                  <div className="w-24 h-1 bg-gradient-to-r from-brand-green to-brand-green-light mx-auto mb-8 rounded-full" />
                )}
              </motion.div>
            )}
            <motion.div 
              {...textScrollAnimation}
              className={cn(
                "prose prose-lg max-w-none",
                settings?.theme === 'dark' && "prose-invert"
              )}
            >
              {content && <PortableText value={content} components={customComponents} />}
            </motion.div>
            {cta && cta.text && cta.url && (
              <motion.div 
                {...textScrollAnimation}
                className={`mt-10 ${settings?.textAlignment === 'center' ? 'flex justify-center' : settings?.textAlignment === 'right' ? 'flex justify-end' : ''}`}
              >
                <a 
                  href={cta.url} 
                  className={cn(
                    "group relative inline-flex items-center px-8 py-4 font-semibold rounded-xl transition-all duration-300",
                    "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
                    settings?.theme === 'dark' 
                      ? "bg-brand-green text-brand-dark hover:bg-brand-green-light" 
                      : "bg-gradient-to-r from-brand-green to-brand-green-light text-brand-dark hover:from-brand-green-light hover:to-brand-green"
                  )}
                >
                  <span className="relative z-10">{cta.text}</span>
                  <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                </a>
              </motion.div>
            )}
          </div>
        ) : (
          // Image + text layout
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
            {/* Image Column */}
            <motion.div 
              className={`order-1 ${imagePosition === 'right' ? 'md:order-2' : ''}`}
              {...scrollAnimation}
            >
              <div className="relative group">
                {/* Image container with enhanced effects */}
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={urlFor(image).width(1000).quality(85).url()}
                    alt={image.alt || title}
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                {/* Enhanced shadow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-green/20 to-brand-green-light/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                {/* Decorative corner accent */}
                <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-brand-green to-brand-green-light rounded-full blur-2xl opacity-30" />
              </div>
            </motion.div>

            {/* Text Column */}
            <motion.div 
              className={`order-2 ${imagePosition === 'right' ? 'md:order-1' : ''} ${textAlignClass}`}
              {...textScrollAnimation}
            >
              {title && (
                <div className="mb-8">
                  <h2 className={cn(
                    "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4",
                    "bg-gradient-to-r from-brand-dark to-brand-dark-light bg-clip-text",
                    settings?.theme === 'dark' ? "text-white from-white to-gray-200" : "text-brand-dark"
                  )}>
                    {title}
                  </h2>
                  {/* Decorative underline for left-aligned headers */}
                  {textAlignClass === 'text-left' && (
                    <div className="w-20 h-1 bg-gradient-to-r from-brand-green to-brand-green-light rounded-full" />
                  )}
                </div>
              )}
              <div className={cn(
                "prose prose-lg max-w-none",
                settings?.theme === 'dark' && "prose-invert"
              )}>
                {content && <PortableText value={content} components={customComponents} />}
              </div>
              {cta && cta.text && cta.url && (
                <div className={`mt-10 ${settings?.textAlignment === 'center' ? 'flex justify-center' : settings?.textAlignment === 'right' ? 'flex justify-end' : ''}`}>
                  <a 
                    href={cta.url} 
                    className={cn(
                      "group relative inline-flex items-center px-8 py-4 font-semibold rounded-xl transition-all duration-300",
                      "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
                      settings?.theme === 'dark' 
                        ? "bg-brand-green text-brand-dark hover:bg-brand-green-light" 
                        : "bg-gradient-to-r from-brand-green to-brand-green-light text-brand-dark hover:from-brand-green-light hover:to-brand-green"
                    )}
                  >
                    <span className="relative z-10">{cta.text}</span>
                    <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
      
      {/* Optional decorative elements */}
      {settings?.theme === 'accent' && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-green/10 to-transparent rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-brand-green/10 to-transparent rounded-full blur-3xl -z-10" />
        </>
      )}
      
      {/* Subtle separator between sections */}
      {hasSeparator && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      )}
    </motion.section>
  );
}

export default PageSectionComponent
