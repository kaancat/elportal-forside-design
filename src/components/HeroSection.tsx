import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PriceCalculatorWidget from '@/components/PriceCalculatorWidget';
import { HeroWithCalculator } from '@/types/sanity';
import { PortableText } from '@portabletext/react';

interface HeroSectionProps {
  block?: HeroWithCalculator;
}

const HeroSection: React.FC<HeroSectionProps> = ({ block }) => {
  // Get values from block or use defaults
  const headline = block?.headline || block?.title || "Elpriser - Find og sammenlign elpriser";
  const subheadline = block?.subheadline || block?.subtitle || "Sammenlign elpriser og se, om du kan finde en bedre elpris ud fra dit estimerede forbrug.";
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
      {/* Background overlay with windmill image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{
        backgroundImage: "url('/lovable-uploads/e68808e9-f324-4925-93ed-3433c3de4cd9.png')"
      }}>
        <div className="absolute inset-0 bg-brand-dark bg-opacity-70"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left column with hero content */}
          <motion.div 
            className="lg:w-1/2 text-white"
            {...useScrollAnimation(animationPresets.hero)}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              {headline.includes('sammenlign') ? (
                <>
                  {headline.split('sammenlign')[0]}<span className="text-brand-green">sammenlign</span>{headline.split('sammenlign')[1]}
                </>
              ) : (
                headline
              )}
            </h1>
            {subheadline && (
              <div className="text-xl mb-8">
                {typeof subheadline === 'string' ? (
                  <p>{subheadline}</p>
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
            <motion.div 
              className="flex flex-wrap gap-8 mb-10"
              {...useScrollAnimation({ duration: 0.6, type: 'fadeUp', delay: 0.3 })}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl lg:text-4xl font-display font-bold text-brand-green">{stat.value}</p>
                  <p className="text-sm lg:text-base">{stat.label}</p>
                </div>
              ))}
            </motion.div>
            
            <div>
              <Button size="lg" className="bg-brand-green hover:bg-opacity-90 text-white rounded-md px-8 py-6 text-lg font-medium">
                Begynd <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
          
          {/* Right column with calculator */}
          <motion.div 
            className="lg:w-1/2"
            {...useScrollAnimation({ duration: 0.8, type: 'scale', delay: 0.2 })}
          >
            <PriceCalculatorWidget 
              block={calculatorBlock} 
              variant="hero"
              showLivePrice={showLivePrice}
              showProviderComparison={showProviderComparison}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
