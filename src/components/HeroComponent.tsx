import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { urlFor } from "@/lib/sanity";
import { HeroBlock } from "@/types/sanity";

interface HeroProps {
  block: HeroBlock;
}

const HeroComponent: React.FC<HeroProps> = ({ block }) => {
  const { headline, subheadline, cta, images } = block;

  const backgroundStyle = {
    background: `radial-gradient(ellipse 70% 50% at 50% -10%, rgba(132, 219, 65, 0.15), transparent 70%)`
  };

  return (
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
        
        {/* CLEAN, SIMPLE, AND ROBUST FLEXBOX LAYOUT */}
        {images && images.length > 0 && (
          <div className="mt-16">
            <div className="flex justify-center items-center gap-6">
              {images.map((image, index) => (
                <motion.div
                  key={image.asset._ref || index}
                  className="flex-shrink-0" // Prevents images from squishing
                  whileHover={{ scale: 1.05, y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <img
                    src={urlFor(image).width(800).quality(85).url()}
                    alt={image.alt || `Hero image ${index + 1}`}
                    className="rounded-xl border border-neutral-200 bg-white p-2 shadow-xl shadow-black/10"
                    style={{ maxHeight: "400px", width: "auto" }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroComponent;
