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

  // Brand colors from tailwind.config.ts
  const brandDark = '#001a12';
  const brandGreen = '#84db41';

  const backgroundStyle = {
    background: `radial-gradient(circle at 50% 50%, ${brandGreen}15 0%, ${brandDark} 40%)`
  };

  return (
    // Add relative positioning and the gradient background style
    <section className="relative py-16 md:py-24 text-center overflow-hidden" style={backgroundStyle}>
      <div className="container mx-auto px-4">
        {/* The text and CTA part remains the same */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">
          {headline}
        </h1>
        {subheadline && (
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-neutral-300 mb-8">
            {subheadline}
          </p>
        )}
        {cta?.text && cta?.link && (
          <Button asChild size="lg" className="bg-brand-green hover:bg-brand-green/90 text-brand-dark rounded-full px-8 py-6 text-lg font-semibold">
            <a href={cta.link}>{cta.text}</a>
          </Button>
        )}
        
        {/* --- NEW STAGGERED IMAGE LAYOUT --- */}
        {images && images.length > 0 && (
          <div className="mt-16 relative h-96 flex justify-center items-center">
            {images.map((image, index) => {
              let styles = {};
              // This logic is for a 3-image layout. It can be adjusted.
              if (images.length === 3) {
                if (index === 0) styles = { transform: 'rotate(-6deg) translateY(10px)', zIndex: 10 };
                if (index === 1) styles = { transform: 'scale(1.1)', zIndex: 20 }; // Middle image is larger and in front
                if (index === 2) styles = { transform: 'rotate(6deg) translateY(10px)', zIndex: 10 };
              }

              return (
                <motion.div
                  key={image.asset._ref || index}
                  className="absolute"
                  style={styles}
                  whileHover={{ scale: 1.15, y: -15, zIndex: 30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  // Stagger the animation of each image
                  custom={index}
                  variants={{
                    animate: (i) => ({
                      opacity: 1,
                      y: 0,
                      transition: { delay: i * 0.2 },
                    }),
                  }}
                >
                  <img
                    src={urlFor(image).width(600).quality(80).url()}
                    alt={image.alt || `Hero image ${index + 1}`}
                    className="rounded-xl border border-neutral-200/50 shadow-2xl shadow-black/20 w-auto"
                    style={{ maxHeight: '320px' }}
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