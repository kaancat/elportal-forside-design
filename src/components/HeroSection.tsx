import React from 'react';
import PriceCalculatorWidget from '@/components/PriceCalculatorWidget';
import { HeroWithCalculator } from '@/types/sanity';
import { PortableText } from '@portabletext/react';
import OptimizedImage from '@/components/OptimizedImage';
import { 
  getBackgroundStyle, 
  getTextColorClass, 
  getPaddingClass, 
  getAlignmentClass,
  getOptimizedImageUrl,
  isLightText
} from '@/lib/backgroundStyles';

interface HeroSectionProps {
  block?: HeroWithCalculator;
}

// Helper function to render headline with green highlighted words
const renderHeadlineWithHighlight = (text: string, highlightWords?: string[]) => {
  // If no highlight words are defined, return plain text
  if (!highlightWords || highlightWords.length === 0) {
    return text;
  }
  
  // Create a regex pattern that matches any of the highlight words (case-insensitive)
  const pattern = highlightWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  
  // Split the text by the pattern
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, index) => {
        // Check if this part matches any of the highlight words (case-insensitive)
        const isHighlighted = highlightWords.some(
          word => part.toLowerCase() === word.toLowerCase()
        );
        
        if (isHighlighted) {
          return <span key={index} className="text-brand-green">{part}</span>;
        }
        return part;
      })}
    </>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ block }) => {
  // Get values from block or use defaults
  const headline = block?.headline || "Elpriser - Find og sammenlign elpriser";
  const subheadline = block?.subheadline || "Sammenlign elpriser og se, om du kan finde en bedre elpris ud fra dit estimerede forbrug.";
  const calculatorTitle = block?.calculatorTitle || "Beregn dit forbrug";
  const showLivePrice = block?.showLivePrice ?? true;
  const showProviderComparison = block?.showProviderComparison ?? true;
  const stats = block?.stats || [
    { value: "10.000+", label: "Brugere dagligt" },
    { value: "30+", label: "Elaftaler" },
    { value: "2 ud af 3", label: "Kan spare ved at skifte" }
  ];

  // Background style configuration - defaults to solidDark to maintain existing appearance
  const backgroundStyle = block?.backgroundStyle || 'solidDark';
  const textColor = block?.textColor || 'auto';
  const overlayOpacity = block?.overlayOpacity ?? 40;
  const padding = block?.padding || 'large';
  const alignment = block?.alignment || 'center';
  const image = block?.image;

  // Generate style classes and properties
  const backgroundStyleProps = getBackgroundStyle({ backgroundStyle, image });
  const textColorClass = getTextColorClass({ 
    textColor, 
    backgroundStyle, 
    image, 
    overlayOpacity 
  });
  const paddingClass = getPaddingClass(padding);
  const alignmentClass = getAlignmentClass(alignment);
  const optimizedImageUrl = image ? getOptimizedImageUrl(image) : null;
  const isTextLight = isLightText(textColorClass);

  // Create a minimal block object for the calculator widget in hero section
  const calculatorBlock = {
    _type: 'priceCalculator' as const,
    _key: 'hero-calculator',
    title: calculatorTitle
  };

  return (
    // The outer wrapper provides padding on desktop screens only
    <div className="md:p-4">
      {/* Main container with dynamic background style */}
      <section 
        className="relative md:rounded-2xl overflow-hidden" 
        style={backgroundStyleProps}
      >
        
        {/* Layer 1: Background Image (if provided) */}
        {optimizedImageUrl && (
          <div className="absolute inset-0">
            <OptimizedImage
              src={optimizedImageUrl}
              alt={image?.alt || "Hero background"}
              className="w-full h-full object-cover"
              priority={true}
              width={1920}
              height={1080}
            />
            
            {/* Dark overlay for text readability - only if there's an image */}
            <div 
              className="absolute inset-0 bg-black"
              style={{ opacity: overlayOpacity / 100 }}
            />
          </div>
        )}
        
        {/* Layer 2: Content */}
        <div 
          className={`relative z-10 container mx-auto px-4 ${paddingClass} ${textColorClass}`}
        >
          <div className={`flex flex-col lg:flex-row items-center gap-8 ${alignmentClass}`}>
            {/* Left column with hero content */}
            <div className="lg:w-1/2">
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 ${
                isTextLight ? 'drop-shadow-lg' : ''
              }`}>
                {renderHeadlineWithHighlight(headline, block?.highlightWords)}
              </h1>
              {subheadline && (
                <div className={`text-xl mb-8 ${isTextLight ? 'opacity-95 drop-shadow' : 'opacity-80'}`}>
                  {typeof subheadline === 'string' ? (
                    <p>{renderHeadlineWithHighlight(subheadline, block?.highlightWords)}</p>
                  ) : (
                    <div className={`prose max-w-none ${isTextLight ? 'prose-invert' : ''}`}>
                      <PortableText value={subheadline} />
                    </div>
                  )}
                </div>
              )}
              
              {/* Rich content section */}
              {block?.content && (
                <div className={`text-lg mb-8 prose max-w-none ${
                  isTextLight ? 'prose-invert opacity-90' : 'opacity-70'
                }`}>
                  <PortableText value={block.content} />
                </div>
              )}
              
              {/* Statistics display */}
              <div className="flex flex-col min-[480px]:flex-row min-[480px]:flex-wrap lg:flex-nowrap gap-4 min-[480px]:gap-6 lg:gap-8 mb-10">
                {stats.map((stat, index) => (
                  <div key={index} className={`${
                    alignment === 'center' 
                      ? 'text-left min-[480px]:text-center' 
                      : alignment === 'right' 
                        ? 'text-right' 
                        : 'text-left'
                  } flex-shrink-0 min-[480px]:flex-1 min-w-0`}>
                    <p className="text-2xl min-[480px]:text-3xl lg:text-4xl font-display font-bold text-brand-green">{stat.value}</p>
                    <p className={`text-sm min-[480px]:text-sm lg:text-base ${
                      isTextLight ? 'opacity-90' : 'opacity-70'
                    }`}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          
            
            {/* Right column with calculator */}
            <div className="lg:w-1/2">
              <PriceCalculatorWidget 
                block={calculatorBlock} 
                variant="hero"
                showLivePrice={showLivePrice}
                showProviderComparison={showProviderComparison}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
