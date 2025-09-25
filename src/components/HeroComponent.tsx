import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
  
  // Check if heroImage has a valid image (support multiple data structures)
  const hasValidSanityImage = heroImage && (
    heroImage.asset?._ref ||    // Reference structure: {asset: {_ref: "..."}}
    heroImage._ref ||           // Legacy structure: {_ref: "..."}
    heroImage.asset?._id ||     // Expanded structure: {asset: {_id: "...", url: "..."}}
    heroImage.asset?.url        // Direct URL structure: {asset: {url: "..."}}
  );
  
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
        if (hasBackgroundUrl || hasValidSanityImage) {
          return {
            background: 'linear-gradient(to bottom right, rgba(0, 26, 18, 0.9) 0%, rgba(132, 219, 65, 0.8) 100%)'
          };
        }
        return { backgroundColor: '#ffffff' };
    }
  };

  // Determine text color based on background with proper contrast
  const getTextColorClass = () => {
    // Manual overrides from Sanity
    if (textColor === 'light') return 'text-white';
    if (textColor === 'dark') return 'text-gray-900';
    
    // Only treat image as background if the selected style allows it
    const allowsBackgroundImage = backgroundStyle === 'default' || backgroundStyle === 'gradientClassic'
    // If there's an image with any meaningful overlay (30%+) and style allows it, use white text
    if (allowsBackgroundImage && (hasBackgroundUrl || hasValidSanityImage) && overlayOpacity >= 30) {
      return 'text-white';
    }
    
    // Check if we're using the fallback dark gradient 
    // (when backgroundStyle is missing/unknown but there's an image)
    if (!backgroundStyle && (hasBackgroundUrl || hasValidSanityImage)) {
      return 'text-white';
    }
    
    // Explicit dark backgrounds that ALWAYS need white text
    if (backgroundStyle === 'solidDark' || backgroundStyle === 'gradientClassic') {
      return 'text-white';
    }
    
    // Explicit light backgrounds that ALWAYS need dark text
    const lightBackgrounds = [
      'default',           // White
      'lightGray',         // Light gray
      'gradientGreenMist', // White to 5% green
      'gradientOceanBreeze', // Light blue to white
      'gradientSunriseGlow', // Light orange/yellow
      'gradientNordicSky',   // Light gray/blue
      'solidGreen'           // Bright green needs dark text
    ];
    
    if (lightBackgrounds.includes(backgroundStyle)) {
      return 'text-gray-900';
    }
    
    // Default: if no background style and no image, assume white background
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

  // Only render an image background for styles that support it
  const allowsBackgroundImage = backgroundStyle === 'default' || backgroundStyle === 'gradientClassic'
  const showBackgroundImage = allowsBackgroundImage && (hasValidSanityImage || hasBackgroundUrl)

  return (
    // The outer wrapper provides padding on desktop screens only
    <div className="md:p-4">
      {/* Main container with background style */}
      <div className="relative md:rounded-2xl overflow-hidden" style={{...getBackgroundStyle(), ...minHeightStyle}}>
        
        {/* Layer 1: Background Image (if provided) */}
        {showBackgroundImage && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: hasBackgroundUrl 
                ? `url(${backgroundImageUrl})`
                : hasValidSanityImage 
                ? `url(${urlFor(heroImage).width(1920).height(1080).quality(85).url()})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
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
              {imageCredit && (hasValidSanityImage || hasBackgroundUrl) && (
                <p className={`absolute bottom-2 right-2 text-xs ${
                  isLightText ? 'text-white/60' : 'text-gray-500'
                }`}>
                  {imageCredit}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Layer 3: Preview shortcuts */}
        <div className="hidden md:flex absolute bottom-6 right-6 z-20 gap-4">
          <HeroPreviewCard
            href="#daily-price-chart"
            title="Dagens elpris"
            description="Se døgnets udsving"
            preview={<DailyPricePreview />}
          />
          <HeroPreviewCard
            href="#provider-list"
            title="Prissammenligning"
            description="Find bedste udbyder"
            preview={<ProviderListPreview />}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroComponent;

interface HeroPreviewCardProps {
  href: string;
  title: string;
  description: string;
  preview: React.ReactNode;
}

const HeroPreviewCard: React.FC<HeroPreviewCardProps> = ({ href, title, description, preview }) => {
  return (
    <Link
      href={href}
      className="group w-[207px] h-[124px] overflow-hidden rounded-2xl border border-white/50 bg-white/80 backdrop-blur-sm shadow-xl transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
    >
      <div className="flex h-full flex-col p-4">
        <div className="flex items-start justify-between text-xs font-semibold text-gray-700">
          <div>
            <p>{title}</p>
            <p className="text-[11px] font-normal text-gray-500">{description}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-brand-green transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <div className="mt-3 flex-1 overflow-hidden text-[11px] text-gray-600">
          {preview}
        </div>
      </div>
    </Link>
  );
};

const DailyPricePreview: React.FC = () => {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-gray-400">
        <span>DK2</span>
        <span>KR/kWh</span>
      </div>
      <div className="relative mt-1 h-16 w-full">
        <svg viewBox="0 0 120 48" className="h-full w-full">
          <defs>
            <linearGradient id="dailyPriceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(132, 219, 65, 0.5)" />
              <stop offset="100%" stopColor="rgba(132, 219, 65, 0.05)" />
            </linearGradient>
          </defs>
          <path
            d="M0 36 C 10 12, 26 8, 40 18 S 70 42, 90 20 S 110 6, 120 18 L120 48 L0 48 Z"
            fill="url(#dailyPriceGradient)"
          />
          <path
            d="M0 36 C 10 12, 26 8, 40 18 S 70 42, 90 20 S 110 6, 120 18"
            stroke="rgba(34, 146, 92, 0.9)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="96" cy="18" r="3" fill="#ef4444" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>
      <div className="mt-1 grid grid-cols-4 gap-1 text-[10px] font-medium text-gray-500">
        <span>Nat</span>
        <span>Morgen</span>
        <span>Dag</span>
        <span>Aften</span>
      </div>
    </div>
  );
};

const ProviderListPreview: React.FC = () => {
  const rows = [
    { provider: "Vindstød", price: "1,82", highlight: true },
    { provider: "EWII", price: "1,94" },
    { provider: "Norlys", price: "2,05" }
  ];

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.provider}
            className={`flex items-center justify-between rounded-lg border border-gray-100 px-2 py-1.5 ${row.highlight ? 'bg-brand-green/10 border-brand-green/30 text-gray-800' : 'bg-white/70 text-gray-600'}`}
          >
            <span className="text-[11px] font-semibold">{row.provider}</span>
            <span className="text-[11px] font-mono">{row.price}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-lg bg-gray-100/80 p-2 text-[10px] text-gray-500">
        Personlig filter klar · Opdateret i dag
      </div>
    </div>
  );
};
