import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PriceCalculatorWidget from '@/components/PriceCalculatorWidget';
import { HeroWithCalculator } from '@/types/sanity';
import { PortableText } from '@portabletext/react';

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

  // Create a minimal block object for the calculator widget in hero section
  const calculatorBlock = {
    _type: 'priceCalculator' as const,
    _key: 'hero-calculator',
    title: calculatorTitle
  };

  return (
    <section className="relative overflow-hidden bg-brand-dark">
      {/* Background overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-brand-dark"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left column with hero content */}
          <div className="lg:w-1/2 text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              {renderHeadlineWithHighlight(headline, block?.highlightWords)}
            </h1>
            {subheadline && (
              <div className="text-xl mb-8">
                {typeof subheadline === 'string' ? (
                  <p>{renderHeadlineWithHighlight(subheadline, block?.highlightWords)}</p>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <PortableText value={subheadline} />
                  </div>
                )}
              </div>
            )}
            
            {/* Rich content section */}
            {block?.content && (
              <div className="text-lg mb-8 prose prose-invert max-w-none">
                <PortableText value={block.content} />
              </div>
            )}
            
            {/* Statistics display */}
            <div className="flex flex-col min-[480px]:flex-row min-[480px]:flex-wrap lg:flex-nowrap gap-4 min-[480px]:gap-6 lg:gap-8 mb-10">
              {stats.map((stat, index) => (
                <div key={index} className="text-left min-[480px]:text-center flex-shrink-0 min-[480px]:flex-1 min-w-0">
                  <p className="text-2xl min-[480px]:text-3xl lg:text-4xl font-display font-bold text-brand-green">{stat.value}</p>
                  <p className="text-sm min-[480px]:text-sm lg:text-base">{stat.label}</p>
                </div>
              ))}
            </div>
            
            <div>
              <Button size="lg" className="bg-brand-green hover:bg-opacity-90 text-white rounded-md px-8 py-6 text-lg font-medium">
                Begynd <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
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
  );
};

export default HeroSection;
