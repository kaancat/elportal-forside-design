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
  
  // Define background styles - using inline styles for gradients to ensure they work
  const getBackgroundStyle = () => {
    switch (backgroundStyle) {
      case 'gradientGreenMist':
        // Subtle gradient with very light green tint (5% opacity)
        return {
          background: 'linear-gradient(to bottom right, #ffffff 0%, #ffffff 50%, rgba(132, 219, 65, 0.05) 100%)'
        };
      case 'gradientOceanBreeze':
        // Blue to green gradient
        return {
          background: 'linear-gradient(to bottom right, #dbeafe 0%, #ffffff 50%, rgba(132, 219, 65, 0.1) 100%)'
        };
      case 'gradientSunriseGlow':
        // Warm orange/yellow gradient
        return {
          background: 'linear-gradient(to bottom right, rgba(254, 215, 170, 0.3) 0%, #ffffff 50%, rgba(254, 240, 138, 0.4) 100%)'
        };
      case 'gradientNordicSky':
        // Cool blue/gray gradient
        return {
          background: 'linear-gradient(to bottom right, #f1f5f9 0%, rgba(219, 234, 254, 0.3) 50%, #ffffff 100%)'
        };
      case 'gradientClassic':
        // The original hero gradient that was always visible on the container
        return {
          background: 'linear-gradient(to bottom right, #001a12, rgba(132, 219, 65, 0.8))'
        };
      case 'lightGray':
        // Light gray background
        return { backgroundColor: '#f9fafb' };
      case 'solidGreen':
        // Brand green solid color
        return { backgroundColor: '#84db41' };
      case 'solidDark':
        // Brand dark solid color
        return { backgroundColor: '#001a12' };
      case 'default':
        // Clean white background
        return { backgroundColor: '#ffffff' };
      default:
        // Fallback for backward compatibility
        if (hasBackgroundUrl || heroImage) {
          return {
            background: 'linear-gradient(to bottom right, rgba(0, 26, 18, 0.9) 0%, rgba(132, 219, 65, 0.8) 100%)'
          };
        }
        return { backgroundColor: '#ffffff' };
    }
  };

  // Determine text color based on background with better contrast logic
  const getTextColorClass = () => {
    // Manual override
    if (textColor === 'light') return 'text-white';
    if (textColor === 'dark') return 'text-gray-900';
    
    // Auto mode - determine based on background style
    const needsLightText = [
      'solidGreen',
      'solidDark',
      'gradientClassic'  // Classic gradient also needs light text
    ].includes(backgroundStyle);
    
    // If there's a background image with overlay, check opacity
    const hasImageWithDarkOverlay = (hasBackgroundUrl || heroImage) && overlayOpacity > 50;
    
    if (needsLightText || hasImageWithDarkOverlay) {
      return 'text-white';
    }
    
    // For light backgrounds and gradients, use dark text
    return 'text-gray-900';
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
      <div className="relative md:rounded-2xl overflow-hidden" style={getBackgroundStyle()}>
        
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
                        ? 'bg-white text-gray-900 hover:bg-gray-100' 
                        : 'bg-brand-green text-white hover:bg-brand-green-dark'
                    } font-semibold px-8 py-3 text-lg rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105`}
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