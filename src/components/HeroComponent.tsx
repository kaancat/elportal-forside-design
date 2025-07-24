import React from "react";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/lib/sanity";
// Note: We don't need the carousel for this simpler, more robust design.

interface HeroProps {
  block: any;
}

const HeroComponent: React.FC<HeroProps> = ({ block }) => {
  const { headline, subheadline, cta, image, images } = block;
  // Handle both single image (schema) and images array (legacy)
  const heroImage = image || (images && images.length > 0 ? images[0] : null);
  
  // Debug logging - HERO IMAGE DEBUGGING
  console.log('🎨 [HERO DEBUG] Component rendering with block:', block);
  console.log('🎨 [HERO DEBUG] Destructured values:', { headline, image, images, heroImage });
  console.log('🎨 [HERO DEBUG] Direct URL available:', block.directImageUrl);
  
  if (heroImage) {
    console.log('🎨 [HERO DEBUG] Hero image asset:', heroImage.asset);
    try {
      const imageUrl = urlFor(heroImage).width(1600).quality(80).url();
      console.log('🎨 [HERO DEBUG] Generated URL:', imageUrl);
    } catch (error) {
      console.error('🎨 [HERO DEBUG] urlFor failed:', error);
    }
  } else {
    console.log('🎨 [HERO DEBUG] No heroImage found!');
  }

  // Full viewport height minus header space
  const minHeightStyle = { minHeight: 'calc(100vh - 8rem)' };

  return (
    // The outer wrapper provides padding on desktop screens only
    <div className="md:p-4">
      {/* Main container with full background on all screen sizes */}
      <div className="relative md:rounded-2xl md:overflow-hidden overflow-hidden">
        
        {/* Layer 1: Background Image (All screen sizes) */}
        {(heroImage || block.directImageUrl) && (
          <div className="absolute inset-0">
            <img
              src={(() => {
                // Determine image source with logging
                if (heroImage) {
                  try {
                    const url = urlFor(heroImage).width(1600).quality(80).url();
                    console.log('🎨 [HERO DEBUG] Using urlFor result:', url);
                    return url;
                  } catch (error) {
                    console.error('🎨 [HERO DEBUG] urlFor failed, using direct URL:', error);
                    return block.directImageUrl;
                  }
                } else {
                  console.log('🎨 [HERO DEBUG] Using direct URL:', block.directImageUrl);
                  return block.directImageUrl;
                }
              })()}
              alt={(heroImage && heroImage.alt) || "Hero background"}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('🎨 [HERO DEBUG] Image failed to load:', e.currentTarget.src);
                // Try direct URL as fallback
                if (block.directImageUrl && e.currentTarget.src !== block.directImageUrl) {
                  console.log('🎨 [HERO DEBUG] Trying direct URL fallback:', block.directImageUrl);
                  e.currentTarget.src = block.directImageUrl;
                }
              }}
              onLoad={() => {
                console.log('🎨 [HERO DEBUG] Image loaded successfully!');
              }}
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
