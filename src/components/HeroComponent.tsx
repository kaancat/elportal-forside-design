import React from "react";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/lib/sanity";
// Note: We don't need the carousel for this simpler, more robust design.

interface HeroProps {
  block: any;
}

const HeroComponent: React.FC<HeroProps> = ({ block }) => {
  const { headline, subheadline, cta, images } = block;
  // We will consistently use the first image for this component.
  const heroImage = images && images.length > 0 ? images[0] : null;

  // Full viewport height minus header space
  const minHeightStyle = { minHeight: 'calc(100vh - 8rem)' };

  return (
    // The outer wrapper provides padding on desktop screens only
    <div className="md:p-4">
      {/* Main container with full background on all screen sizes */}
      <div className="relative md:rounded-2xl md:overflow-hidden overflow-hidden">
        
        {/* Layer 1: Background Image (All screen sizes) */}
        {heroImage && (
          <div className="absolute inset-0">
            <img
              src={urlFor(heroImage).width(1600).quality(80).url()}
              alt={heroImage.alt || "Hero background"}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Layer 2: Dark Overlay (All screen sizes) */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Layer 3: Text Content */}
        <div 
          className="relative z-10 flex flex-col items-center justify-center text-center py-16 px-4 md:py-16 md:px-8"
          style={minHeightStyle}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-6">
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
  );
};

export default HeroComponent;
