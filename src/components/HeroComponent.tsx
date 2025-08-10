import React from "react";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/lib/sanity";
import OptimizedImage from "@/components/OptimizedImage";

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
    imageCredit,
    // New style fields
    backgroundStyle = 'default',
    textColor = 'auto',
    overlayOpacity = 40,
    padding = 'large',
    alignment = 'center'
  } = block;
  
  // Handle multiple image sources: direct URL, single image (schema), or images array (legacy)
  const heroImage = image || (images && images.length > 0 ? images[0] : null);
  const hasBackgroundUrl = backgroundImageUrl && backgroundImageUrl.length > 0;
  
  // Define gradient styles
  const getBackgroundClass = () => {
    switch (backgroundStyle) {
      case 'gradientGreenMist':
        // The nice gradient from forbrug-tracker page
        return 'bg-gradient-to-br from-white via-white to-brand-green/5';
      case 'gradientOceanBreeze':
        return 'bg-gradient-to-br from-blue-50 via-white to-brand-green/10';
      case 'gradientSunriseGlow':
        return 'bg-gradient-to-br from-orange-50/30 via-white to-yellow-50/40';
      case 'gradientNordicSky':
        return 'bg-gradient-to-br from-slate-100 via-blue-50/30 to-white';
      case 'lightGray':
        return 'bg-gray-50';
      case 'solidGreen':
        return 'bg-brand-green';
      case 'solidDark':
        return 'bg-brand-dark';
      default:
        // Default gradient (for backward compatibility)
        return hasBackgroundUrl || heroImage 
          ? 'bg-gradient-to-br from-brand-dark to-brand-green/80'
          : 'bg-white';
    }
  };

  // Determine text color based on background
  const getTextColorClass = () => {
    if (textColor === 'light') return 'text-white';
    if (textColor === 'dark') return 'text-brand-dark';
    
    // Auto mode - determine based on background style
    if (backgroundStyle === 'solidGreen' || backgroundStyle === 'solidDark') {
      return 'text-white';
    }
    
    // For gradients and light backgrounds, use dark text
    return 'text-brand-dark';
  };

  // Get padding classes
  const getPaddingClass = () => {
    switch (padding) {
      case 'small':
        return 'py-12 md:py-16';
      case 'medium':
        return 'py-16 md:py-20';
      case 'xlarge':
        return 'py-24 md:py-32';
      default: // large
        return 'py-20 md:py-24';
    }
  };

  // Get alignment classes
  const getAlignmentClass = () => {
    switch (alignment) {
      case 'left':
        return 'text-left items-start';
      case 'right':
        return 'text-right items-end';
      default: // center
        return 'text-center items-center';
    }
  };

  // Full viewport height minus header space
  const minHeightStyle = { minHeight: 'calc(100vh - 8rem)' };

  const isLightText = getTextColorClass().includes('white');

  return (
    // The outer wrapper provides padding on desktop screens only
    <div className="md:p-4">
      {/* Main container with background style */}
      <div className={`relative md:rounded-2xl overflow-hidden ${getBackgroundClass()}`}>
        
        {/* Layer 1: Background Image (if provided) */}
        {(heroImage || hasBackgroundUrl) && (
          <div className="absolute inset-0">
            {hasBackgroundUrl ? (
              // Direct URL image (e.g., from Unsplash)
              <OptimizedImage
                src={backgroundImageUrl}
                alt={imageAlt || "Hero background"}
                className="w-full h-full object-cover"
                priority={true}
                width={1920}
                height={1080}
              />
            ) : heroImage ? (
              // Sanity image
              <OptimizedImage
                src={urlFor(heroImage).width(1920).height(1080).quality(85).url()}
                alt={heroImage.alt || imageAlt || "Hero background"}
                className="w-full h-full object-cover"
                priority={true}
                width={1920}
                height={1080}
              />
            ) : null}
            
            {/* Dark overlay for text readability - only if there's an image */}
            <div 
              className="absolute inset-0 bg-black"
              style={{ opacity: overlayOpacity / 100 }}
            />
          </div>
        )}
        
        {/* Layer 2: Content */}
        <div 
          className={`relative z-10 flex flex-col justify-center ${getPaddingClass()} px-4 sm:px-6 lg:px-8 ${getTextColorClass()}`}
          style={minHeightStyle}
        >
          <div className="container mx-auto max-w-6xl">
            <div className={`flex flex-col ${getAlignmentClass()} space-y-6`}>
              
              {/* Main headline */}
              {headline && (
                <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight ${
                  isLightText ? 'drop-shadow-lg' : ''
                }`}>
                  {headline}
                </h1>
              )}
              
              {/* Subheadline */}
              {subheadline && (
                <p className={`text-xl sm:text-2xl max-w-3xl ${
                  alignment === 'center' ? 'mx-auto' : ''
                } ${isLightText ? 'opacity-95 drop-shadow' : 'opacity-80'}`}>
                  {subheadline}
                </p>
              )}
              
              {/* Description (if provided) */}
              {description && (
                <p className={`text-base sm:text-lg max-w-2xl ${
                  alignment === 'center' ? 'mx-auto' : ''
                } ${isLightText ? 'opacity-90' : 'opacity-70'}`}>
                  {description}
                </p>
              )}
              
              {/* CTA Button */}
              {cta && (
                <div className={`mt-8 ${alignment === 'center' ? 'mx-auto' : ''}`}>
                  <Button 
                    size="lg"
                    className={`${
                      isLightText 
                        ? 'bg-white text-brand-dark hover:bg-gray-100' 
                        : 'bg-brand-green text-white hover:bg-brand-green/90'
                    } font-semibold px-8 py-3 text-lg rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl`}
                    onClick={() => {
                      if (cta.url) {
                        window.location.href = cta.url;
                      }
                    }}
                  >
                    {cta.text || 'Get Started'}
                  </Button>
                </div>
              )}
              
              {/* Image credit (if provided) */}
              {imageCredit && (heroImage || hasBackgroundUrl) && (
                <p className={`absolute bottom-2 right-2 text-xs ${
                  isLightText ? 'text-white/60' : 'text-gray-500'
                }`}>
                  {imageCredit}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroComponent;