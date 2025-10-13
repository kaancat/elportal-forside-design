'use client'

import React, { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { getSanityImageUrl } from '@/lib/sanityImage';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | { _ref?: string; asset?: any };
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean; // For above-the-fold images
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  aspectRatio?: string; // e.g., "16/9"
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  className,
  onLoad,
  aspectRatio,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URLs
  const getOptimizedSrc = (imgWidth?: number) => {
    if (typeof src === 'string') {
      // Regular image URL
      if (src.includes('cdn.sanity.io') || src.includes('images.unsplash.com')) {
        // For external CDN images, add optimization params
        const url = new URL(src);
        if (imgWidth) url.searchParams.set('w', imgWidth.toString());
        url.searchParams.set('q', quality.toString());
        url.searchParams.set('fm', 'webp');
        url.searchParams.set('fit', 'max');
        return url.toString();
      }
      return src;
    } else if (typeof src === 'object' && src !== null) {
      // Handle various Sanity image object formats
      let ref = '';
      
      // Check for different possible structures
      if (src._ref) {
        // Direct reference object
        ref = src._ref;
      } else if (src.asset && typeof src.asset === 'object' && '_ref' in src.asset && src.asset._ref) {
        // Full image object with asset reference
        ref = src.asset._ref;
      } else if (src.asset && typeof src.asset === 'string') {
        // Asset as string reference
        ref = src.asset;
      }
      
      if (ref) {
        return getSanityImageUrl(ref, {
          width: imgWidth || width,
          quality,
          format: 'webp'
        });
      }
    }
    return '';
  };

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    const widths = [320, 640, 768, 1024, 1280, 1536, 1920];
    return widths
      .filter(w => !width || w <= width * 2) // Don't generate larger than 2x original
      .map(w => `${getOptimizedSrc(w)} ${w}w`)
      .join(', ');
  };

  // Generate placeholder/blur image
  const getPlaceholderSrc = () => {
    if (blurDataURL) return blurDataURL;
    if (placeholder === 'blur') {
      // Generate a tiny blurred version (20px wide)
      return getOptimizedSrc(20);
    }
    return '';
  };

  useEffect(() => {
    if (!priority && imgRef.current && !observerRef.current) {
      // Set up Intersection Observer for lazy loading
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsInView(true);
              // Disconnect after image is in view
              observerRef.current?.disconnect();
            }
          });
        },
        {
          // Start loading 50px before the image enters viewport
          rootMargin: '50px',
          threshold: 0.01
        }
      );

      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  useEffect(() => {
    if (isInView) {
      // Load the full image when in view
      const fullSrc = getOptimizedSrc(width);
      
      if (priority) {
        // For priority images, set src immediately
        setCurrentSrc(fullSrc);
      } else {
        // For lazy loaded images, preload first
        const img = new Image();
        img.onload = () => {
          setCurrentSrc(fullSrc);
          setIsLoaded(true);
          onLoad?.();
        };
        img.src = fullSrc;
      }
    }
  }, [isInView, src, width, quality, priority, onLoad]);

  // Calculate aspect ratio padding for responsive containers
  const getAspectRatioPadding = () => {
    if (aspectRatio) {
      const [w, h] = aspectRatio.split('/').map(Number);
      return `${(h / w) * 100}%`;
    } else if (width && height) {
      return `${(height / width) * 100}%`;
    }
    return undefined;
  };

  const paddingBottom = getAspectRatioPadding();

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={paddingBottom ? { paddingBottom, height: 0 } : {}}
    >
      {/* Placeholder/blur image */}
      {placeholder && !isLoaded && (
        <img
          src={getPlaceholderSrc()}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            placeholder === 'blur' ? "blur-xl scale-110" : "",
            "transition-opacity duration-300",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={currentSrc || (priority ? getOptimizedSrc(width) : '')}
        srcSet={isInView ? generateSrcSet() : undefined}
        sizes={sizes || `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        className={cn(
          paddingBottom ? "absolute inset-0 w-full h-full object-cover" : "",
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
        {...props}
      />

      {/* Loading skeleton */}
      {!isLoaded && !placeholder && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default OptimizedImage;

// HOC for easy migration from regular img tags
export const withOptimizedImage = (Component: React.ComponentType<any>) => {
  return React.forwardRef((props: any, ref) => {
    if (props.src && typeof props.src === 'string' && props.src.startsWith('http')) {
      return <OptimizedImage {...props} ref={ref} />;
    }
    return <Component {...props} ref={ref} />;
  });
};