'use client'

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  MetaTagsConfig, 
  injectMetaTags, 
  removeAllMetaTags,
  generateDanishMetaTags 
} from '@/utils/metaTags';
import { generateCanonicalUrl } from '@/utils/canonicalUrl';
import { getSanityImageUrl } from '@/lib/sanityImage';

interface MetaTagsProps extends Partial<MetaTagsConfig> {
  /**
   * Whether to use Danish SEO defaults
   */
  useDanishDefaults?: boolean;
  /**
   * Sanity image reference for OG image
   */
  sanityImage?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
}

/**
 * Component that manages all meta tags for SEO
 * Handles Open Graph, Twitter Card, and standard meta tags
 */
const MetaTags: React.FC<MetaTagsProps> = ({ 
  useDanishDefaults = true,
  sanityImage,
  ...config 
}) => {
  const pathname = usePathname();
  
  useEffect(() => {
    let finalConfig: MetaTagsConfig;
    
    // Generate Danish defaults if enabled
    if (useDanishDefaults && config.title && config.description) {
      finalConfig = {
        ...generateDanishMetaTags(
          config.title,
          config.description,
          config.keywords
        ),
        ...config
      };
    } else {
      finalConfig = config as MetaTagsConfig;
    }
    
    // Handle Sanity image
    if (sanityImage?.asset && '_ref' in sanityImage.asset && sanityImage.asset._ref) {
      const imageUrl = getSanityImageUrl(sanityImage.asset._ref, {
        width: 1200,
        height: 630,
        format: 'jpg'
      });
      
      finalConfig.ogImage = imageUrl;
      finalConfig.ogImageWidth = 1200;
      finalConfig.ogImageHeight = 630;
      finalConfig.ogImageAlt = sanityImage.alt || finalConfig.ogTitle || finalConfig.title;
      finalConfig.twitterImage = imageUrl;
      finalConfig.twitterImageAlt = sanityImage.alt || finalConfig.twitterTitle || finalConfig.title;
    }
    
    // Set canonical URL if not provided
    if (!finalConfig.canonical) {
      finalConfig.canonical = generateCanonicalUrl(pathname);
    }
    
    // Set OG URL if not provided
    if (!finalConfig.ogUrl) {
      finalConfig.ogUrl = finalConfig.canonical;
    }
    
    // Inject the meta tags
    injectMetaTags(finalConfig);
    
    // Cleanup on unmount
    return () => {
      // Don't remove all meta tags, just reset to defaults
      // This prevents flickering when navigating between pages
    };
  }, [pathname, useDanishDefaults, sanityImage, config]);
  
  return null; // This component doesn't render anything
};

export default MetaTags;

/**
 * Hook for using meta tags
 */
export function useMetaTags(config: MetaTagsProps) {
  const pathname = usePathname();
  
  useEffect(() => {
    let finalConfig: MetaTagsConfig;
    
    if (config.useDanishDefaults && config.title && config.description) {
      finalConfig = {
        ...generateDanishMetaTags(
          config.title,
          config.description,
          config.keywords
        ),
        ...config
      };
    } else {
      finalConfig = config as MetaTagsConfig;
    }
    
    // Handle Sanity image
    if (config.sanityImage?.asset && '_ref' in config.sanityImage.asset && config.sanityImage.asset._ref) {
      const imageUrl = getSanityImageUrl(config.sanityImage.asset._ref, {
        width: 1200,
        height: 630,
        format: 'jpg'
      });
      
      finalConfig.ogImage = imageUrl;
      finalConfig.ogImageWidth = 1200;
      finalConfig.ogImageHeight = 630;
      finalConfig.ogImageAlt = config.sanityImage.alt || finalConfig.ogTitle || finalConfig.title;
      finalConfig.twitterImage = imageUrl;
      finalConfig.twitterImageAlt = config.sanityImage.alt || finalConfig.twitterTitle || finalConfig.title;
    }
    
    // Set canonical URL if not provided
    if (!finalConfig.canonical) {
      finalConfig.canonical = generateCanonicalUrl(pathname);
    }
    
    // Set OG URL if not provided
    if (!finalConfig.ogUrl) {
      finalConfig.ogUrl = finalConfig.canonical;
    }
    
    injectMetaTags(finalConfig);
  }, [pathname, config]);
}

/**
 * Page-specific meta tags presets
 */
export const META_PRESETS = {
  homepage: {
    title: 'Sammenlign Elpriser - Find Billigste Elaftale | DinElportal',
    description: 'Spar penge på din elregning! Sammenlign aktuelle elpriser og find den bedste elaftale. Gratis sammenligning af danske eludbydere. Vindstød anbefales.',
    keywords: [
      'elpriser', 'sammenlign el', 'billig el', 'elselskaber',
      'elaftale', 'vindstød', 'grøn energi', 'spotpris',
      'elmarked', 'strømpriser', 'energipriser', 'elforbrug'
    ],
    ogType: 'website' as const
  },
  
  priceComparison: {
    title: 'Sammenlign Elpriser i Danmark - Aktuelle Priser',
    description: 'Se og sammenlign aktuelle elpriser fra alle danske elselskaber. Find den billigste elaftale og spar op til 2000 kr årligt.',
    keywords: [
      'sammenlign elpriser', 'elpriser danmark', 'billigste el',
      'elselskaber sammenligning', 'aktuelle elpriser', 'spotpriser'
    ],
    ogType: 'website' as const
  },
  
  calculator: {
    title: 'Elregning Beregner - Beregn Din Elpris',
    description: 'Beregn din elregning og se hvor meget du kan spare. Gratis elberegner med aktuelle priser fra alle danske elselskaber.',
    keywords: [
      'elregning beregner', 'beregn elpris', 'elforbrug beregner',
      'elregning', 'spare på el', 'elberegner'
    ],
    ogType: 'website' as const
  },
  
  greenEnergy: {
    title: 'Grøn Energi og Vindstød - Bæredygtig Elaftale',
    description: 'Vælg grøn energi og støt bæredygtighed. Vindstød tilbyder 100% vedvarende energi fra danske vindmøller.',
    keywords: [
      'grøn energi', 'vindstød', 'vedvarende energi', 'vindmøller',
      'bæredygtig el', 'CO2 neutral', 'klimavenlig el', 'grøn strøm'
    ],
    ogType: 'website' as const
  },
  
  article: {
    ogType: 'article' as const,
    twitterCard: 'summary_large_image' as const
  }
};