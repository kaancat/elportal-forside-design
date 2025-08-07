import React from "react";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/lib/sanity";
import OptimizedImage from "@/components/OptimizedImage";
// Note: We don't need the carousel for this simpler, more robust design.

interface HeroProps {
  block: any;
}

const HeroComponent: React.FC<HeroProps> = ({ block }) => {
  const { 
    headline, 
    subheadline, 
    description,
    cta, 
    image, 
    images, 
    backgroundImageUrl,
    imageAlt,
    imageCredit 
  } = block;
  
  // Handle multiple image sources: direct URL, single image (schema), or images array (legacy)
  const heroImage = image || (images && images.length > 0 ? images[0] : null);
  const hasBackgroundUrl = backgroundImageUrl && backgroundImageUrl.length > 0;
  
  

  // Full viewport height minus header space
  const minHeightStyle = { minHeight: 'calc(100vh - 8rem)' };

  return (
    // The outer wrapper provides padding on desktop screens only
    <div className="md:p-4">
      {/* Main container with full background on all screen sizes */}
      <div className="relative md:rounded-2xl md:overflow-hidden overflow-hidden">
        
        {/* Layer 1: Background Image (All screen sizes) */}
        {(heroImage || hasBackgroundUrl) && (
          <div className="absolute inset-0">
            {hasBackgroundUrl ? (
              // Direct URL image (e.g., from Unsplash)
              <OptimizedImage
                src={backgroundImageUrl}
                alt={imageAlt || "Hero background showing Danish offshore wind turbines"}
                className="w-full h-full object-cover"
                priority={true} // Hero images should load immediately
                width={1920}
                height={1080}
                sizes="100vw"
              />
            ) : heroImage ? (
              // Sanity asset image - pass the asset reference or the entire image object
              <OptimizedImage
                src={heroImage.asset || heroImage}
                alt={heroImage.alt || image?.alt || "Hero background"}
                className="w-full h-full object-cover"
                priority={true} // Hero images should load immediately
                width={1920}
                height={1080}
                sizes="100vw"
              />
            ) : null}
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
          {description && description.length > 0 && (
            <div className="max-w-3xl mx-auto text-base md:text-lg text-neutral-300 mb-8">
              {/* Basic description rendering - could be enhanced with PortableText if needed */}
              <p>{description[0]?.children?.[0]?.text}</p>
            </div>
          )}
          {cta?.text && cta?.link && (
            <Button asChild size="lg" className="bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold rounded-full px-8 py-6 text-lg">
              <a href={cta.link}>{cta.text}</a>
            </Button>
          )}
          
          {/* Image Credit (if using external image) */}
          {imageCredit && hasBackgroundUrl && (
            <div className="absolute bottom-4 right-4 text-xs text-white/70 bg-black/30 px-2 py-1 rounded">
              {imageCredit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroComponent;
