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

  return (
    <section className="py-16 md:py-24 text-center overflow-x-clip">
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
          <Button asChild size="lg" className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full px-8 py-6 text-lg">
            <a href={cta.link}>{cta.text}</a>
          </Button>
        )}
        
        {images && images.length > 0 && (
          <div className="mt-16 flex justify-center items-center gap-4 md:gap-8">
            {images.map((image, index) => (
              <motion.div
                key={image.asset._ref || index}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                initial="initial"
                animate="animate"
                custom={index}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: (i) => ({
                    opacity: 1,
                    y: 0,
                    transition: { delay: i * 0.1 },
                  }),
                }}
              >
                <img
                  src={urlFor(image).width(800).quality(80).url()}
                  alt={image.alt || `Hero image ${index + 1}`}
                  className="rounded-xl border border-neutral-200/80 shadow-2xl shadow-black/10 mx-auto max-w-full h-auto"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroComponent; 