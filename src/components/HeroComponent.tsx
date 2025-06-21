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

  // --- DESKTOP-ONLY STYLES ---
  const desktopMinHeightStyle = { minHeight: 'calc(100vh - 8rem)' };

  return (
    // The outer wrapper provides the 'gap' on desktop screens.
    <div className="md:p-4">
      {/* Main container with styles that adapt to screen size */}
      <div className="relative bg-white md:rounded-2xl md:overflow-hidden">
        
        {/* Layer 1: Background Image (Desktop Only) */}
        {heroImage && (
          <div className="hidden md:block absolute inset-0">
            <img
              src={urlFor(heroImage).width(1600).quality(80).url()}
              alt={heroImage.alt || "Hero background"}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Layer 2: Dark Overlay (Desktop Only) */}
        <div className="hidden md:block absolute inset-0 bg-black/50"></div>

        {/* Layer 3: Text and Image Content */}
        <div 
          className="relative z-10 flex flex-col items-center justify-center"
          style={desktopMinHeightStyle}
        >
          {/* Text content container */}
          <div className="text-center w-full py-16 px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-brand-dark md:text-white">
              {headline}
            </h1>
            {subheadline && (
              <p className="max-w-2xl mx-auto mt-4 text-lg md:text-xl text-neutral-600 md:text-neutral-200">
                {subheadline}
              </p>
            )}
            {cta?.text && cta?.link && (
              <Button asChild size="lg" className="mt-8 bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold rounded-full px-8 py-6 text-lg">
                <a href={cta.link}>{cta.text}</a>
              </Button>
            )}
          </div>

          {/* Image (Mobile Only) */}
          {heroImage && (
            <div className="md:hidden w-full px-4 pb-16">
               <img
                src={urlFor(heroImage).width(800).quality(85).url()}
                alt={heroImage.alt || headline}
                className="rounded-xl shadow-xl w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroComponent;
