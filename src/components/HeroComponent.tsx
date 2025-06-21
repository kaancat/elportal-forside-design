import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { urlFor } from '@/lib/sanity';
import { HeroBlock } from '@/types/sanity';

interface HeroProps {
  block: HeroBlock; 
}

const HeroComponent: React.FC<HeroProps> = ({ block }) => {
  const { headline, subheadline, cta, images } = block;

  // Using the brand green for a subtle gradient on a light background
  const brandGreen = '#A3F596'; 
  const backgroundStyle = {
    background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(163, 245, 150, 0.3), transparent)`
  };

  return (
    // NEW: Light background with a subtle top-down radial gradient
    <section className="relative py-16 md:py-24 text-center bg-white" style={backgroundStyle}>
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-brand-dark mb-6">
          {headline}
        </h1>
        {subheadline && (
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-neutral-600 mb-8">
            {subheadline}
          </p>
        )}
        {cta?.text && cta?.link && (
          <Button asChild size="lg" className="bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold rounded-full px-8 py-6 text-lg">
            <a href={cta.link}>{cta.text}</a>
          </Button>
        )}
        
        {/* NEW: Reliable Flexbox Layout for Staggered Images */}
        {images && images.length > 0 && (
          <div className="mt-16 flex justify-center items-center space-x-[-15%]">
            {images.map((image, index) => {
              let transformClass = '';
              // Logic for a 3-image layout
              if (images.length === 3) {
                if (index === 0) transformClass = '-rotate-6';
                if (index === 1) transformClass = 'z-10 scale-110'; // Middle image is in front and larger
                if (index === 2) transformClass = 'rotate-6';
              }

              return (
                <motion.div
                  key={image.asset._ref || index}
                  className={`relative ${transformClass}`}
                  whileHover={{ scale: 1.15, zIndex: 20, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <img
                    src={urlFor(image).width(600).quality(80).url()}
                    alt={image.alt || `Hero image ${index + 1}`}
                    className="rounded-xl border border-neutral-200 bg-white p-1 shadow-2xl shadow-black/10 w-full"
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroComponent; 