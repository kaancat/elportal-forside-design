import React from "react";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/lib/sanity";
import { HeroBlock } from "@/types/sanity";

interface HeroProps {
  block: HeroBlock;
}

const HeroComponent: React.FC<HeroProps> = ({ block }) => {
  // We will only use the FIRST image from the array for the background
  const { headline, subheadline, cta, images } = block;
  const backgroundImage = images && images.length > 0 ? images[0] : null;

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Main container with rounded corners and overflow hidden */}
        <div className="relative rounded-2xl overflow-hidden">
          
          {/* Layer 1: Background Image */}
          {backgroundImage && (
            <img
              src={urlFor(backgroundImage).width(1400).quality(85).url()}
              alt={backgroundImage.alt || "Hero background"}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Layer 2: Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Layer 3: Text Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 md:p-16 text-white min-h-[400px]">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
              {headline}
            </h1>
            {subheadline && (
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-200 mb-8">
                {subheadline}
              </p>
            )}
            {cta?.text && cta?.link && (
              <Button asChild size="lg" className="bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold rounded-full px-8 py-6 text-lg">
                <a href={cta.link}>{cta.text}</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroComponent;
