import { SanityImage } from '@/types/sanity';
import { urlFor } from '@/lib/sanity';

// Background style types
export type BackgroundStyle = 
  | 'default' 
  | 'lightGray' 
  | 'gradientGreenMist' 
  | 'gradientOceanBreeze' 
  | 'gradientSunriseGlow' 
  | 'gradientNordicSky' 
  | 'gradientClassic' 
  | 'solidGreen' 
  | 'solidDark';

export type TextColor = 'auto' | 'dark' | 'light';
export type Padding = 'small' | 'medium' | 'large' | 'xlarge';
export type Alignment = 'left' | 'center' | 'right';

export interface BackgroundStyleProps {
  backgroundStyle?: BackgroundStyle;
  textColor?: TextColor;
  overlayOpacity?: number;
  padding?: Padding;
  alignment?: Alignment;
  image?: SanityImage;
  backgroundImageUrl?: string;
}

/**
 * Get background style CSS properties based on the selected style
 */
export const getBackgroundStyle = ({
  backgroundStyle = 'default',
  image,
  backgroundImageUrl
}: Pick<BackgroundStyleProps, 'backgroundStyle' | 'image' | 'backgroundImageUrl'>) => {
  const hasBackgroundUrl = backgroundImageUrl && backgroundImageUrl.length > 0;
  // Check if image has a valid image (support multiple data structures)
  const hasValidSanityImage = image && (
    image.asset?._ref ||    // Reference structure: {asset: {_ref: "..."}}
    image._ref ||           // Legacy structure: {_ref: "..."}
    image.asset?._id ||     // Expanded structure: {asset: {_id: "...", url: "..."}}
    image.asset?.url        // Direct URL structure: {asset: {url: "..."}}
  );

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

/**
 * Determine text color class based on background with proper contrast
 */
export const getTextColorClass = ({
  textColor = 'auto',
  backgroundStyle = 'default',
  image,
  backgroundImageUrl,
  overlayOpacity = 40
}: BackgroundStyleProps) => {
  const hasBackgroundUrl = backgroundImageUrl && backgroundImageUrl.length > 0;
  // Check if image has a valid image (support multiple data structures)
  const hasValidSanityImage = image && (
    image.asset?._ref ||    // Reference structure: {asset: {_ref: "..."}}
    image._ref ||           // Legacy structure: {_ref: "..."}
    image.asset?._id ||     // Expanded structure: {asset: {_id: "...", url: "..."}}
    image.asset?.url        // Direct URL structure: {asset: {url: "..."}}
  );

  // Manual overrides from Sanity
  if (textColor === 'light') return 'text-white';
  if (textColor === 'dark') return 'text-gray-900';
  
  // CRITICAL: If there's an image with any meaningful overlay (30%+), use white text
  // This handles pages with images that have overlays
  if ((hasBackgroundUrl || hasValidSanityImage) && overlayOpacity >= 30) {
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
  const lightBackgrounds: BackgroundStyle[] = [
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

/**
 * Get padding classes based on padding setting
 */
export const getPaddingClass = (padding: Padding = 'large') => {
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

/**
 * Get alignment classes for content positioning
 */
export const getAlignmentClass = (alignment: Alignment = 'center') => {
  switch (alignment) {
    case 'left':
      return 'text-left items-start';
    case 'right':
      return 'text-right items-end';
    default: // center
      return 'text-center items-center';
  }
};

/**
 * Get optimized image URL for Sanity images
 * Handles reference structures, legacy structures, and expanded asset data
 */
export const getOptimizedImageUrl = (image: any, width = 1920, height = 1080, quality = 85) => {
  if (!image) return null;
  
  // Check for expanded structure: image.asset.url (already expanded by GROQ)
  if (image?.asset?.url) {
    // If we have a direct URL from expanded GROQ query, we can use it directly
    // but we should still process it through urlFor for optimization
    return urlFor(image).width(width).height(height).quality(quality).url();
  }
  
  // Check for reference structure: image.asset._ref
  if (image?.asset?._ref) {
    return urlFor(image).width(width).height(height).quality(quality).url();
  }
  
  // Check for legacy structure: image._ref (direct _ref on image)
  if (image?._ref) {
    return urlFor(image).width(width).height(height).quality(quality).url();
  }
  
  return null;
};

/**
 * Check if the current text color setup results in light text
 */
export const isLightText = (textColorClass: string) => {
  return textColorClass.includes('white');
};

/**
 * All available background style options for UI selectors
 */
export const BACKGROUND_STYLE_OPTIONS = [
  { title: 'Default (White)', value: 'default' as const },
  { title: 'Light Gray', value: 'lightGray' as const },
  { title: 'Gradient - Green Mist', value: 'gradientGreenMist' as const },
  { title: 'Gradient - Ocean Breeze', value: 'gradientOceanBreeze' as const },
  { title: 'Gradient - Sunrise Glow', value: 'gradientSunriseGlow' as const },
  { title: 'Gradient - Nordic Sky', value: 'gradientNordicSky' as const },
  { title: 'Gradient - Classic Dark', value: 'gradientClassic' as const },
  { title: 'Solid - Brand Green', value: 'solidGreen' as const },
  { title: 'Solid - Brand Dark', value: 'solidDark' as const }
] as const;