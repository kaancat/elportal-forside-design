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
        
        {/* ENHANCED BROWSER FRAME LAYOUT */}
        {images && images.length > 0 && (
          <div className="mt-16">
            <div className="flex justify-center items-center gap-6">
              {images.map((image, index) => (
                <motion.div
                  key={image.asset._ref || index}
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.05, y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{
                    // Make the single image larger
                    maxWidth: images.length === 1 ? "768px" : "400px",
                    width: "100%",
                  }}
                >
                  {/* --- NEW BROWSER FRAME WRAPPER --- */}
                  <div className="rounded-xl border border-neutral-200 bg-white shadow-2xl shadow-black/10">
                    {/* Mock browser header */}
                    <div className="flex items-center p-3 border-b border-neutral-200">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                      </div>
                    </div>
                    {/* The Image Itself */}
                    <img
                      src={urlFor(image).width(1200).quality(85).url()}
                      alt={image.alt || `Hero image ${index + 1}`}
                      className="w-full h-auto" // No rounded corners on the image itself anymore
                    />
                  </div>
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
