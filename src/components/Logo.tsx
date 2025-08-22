'use client'

import React, { useState, useEffect, useRef } from 'react';
import { FALLBACK_LOGO, FALLBACK_ALT } from '@/constants/branding';
import { cn } from '@/lib/utils';

interface LogoProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  onClick?: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

const Logo: React.FC<LogoProps> = ({
  src,
  alt = FALLBACK_ALT,
  className = 'h-8 sm:h-10',
  fallbackClassName,
  onClick,
  maxRetries = 3,
  retryDelay = 1000,
}) => {
  // Show fallback immediately; swap to remote when it's ready
  const [currentSrc, setCurrentSrc] = useState<string>(FALLBACK_LOGO);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Preload images
  useEffect(() => {
    // Preload fallback logo on component mount
    const fallbackImg = new Image();
    fallbackImg.src = FALLBACK_LOGO;
    
    // Preload primary logo if available
    if (src && src !== FALLBACK_LOGO) {
      const primaryImg = new Image();
      primaryImg.src = src;
    }
  }, [src]);

  // When a remote src is provided, preload it and then swap in
  useEffect(() => {
    if (!src) {
      setCurrentSrc(FALLBACK_LOGO);
      setHasError(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const preloader = new Image();
    preloader.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
      setHasError(false);
    };
    preloader.onerror = () => {
      handleFallback();
    };
    preloader.src = src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleError = () => {
    console.warn(`[Logo] Failed to load image: ${currentSrc}, attempt ${retryCount + 1}/${maxRetries}`);
    
    if (retryCount < maxRetries - 1 && currentSrc !== FALLBACK_LOGO) {
      // Retry loading the same image
      setRetryCount(prev => prev + 1);
      
      // Force reload by temporarily clearing src
      retryTimeoutRef.current = setTimeout(() => {
        if (imgRef.current) {
          // Create a new image element to test loading
          const testImg = new Image();
          testImg.onload = () => {
            // If test load succeeds, update the actual image
            setIsLoading(false);
            setHasError(false);
            if (imgRef.current) {
              imgRef.current.src = currentSrc;
            }
          };
          testImg.onerror = () => {
            // If still failing, move to fallback
            handleFallback();
          };
          testImg.src = currentSrc + '?retry=' + retryCount; // Add cache buster
        }
      }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
    } else {
      // Max retries reached or already using fallback
      handleFallback();
    }
  };

  const handleFallback = () => {
    if (currentSrc !== FALLBACK_LOGO) {
      console.info('[Logo] Switching to fallback logo');
      setCurrentSrc(FALLBACK_LOGO);
      setRetryCount(0);
      setIsLoading(true);
    } else {
      // Even fallback failed, show text fallback
      console.error('[Logo] Even fallback logo failed to load');
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    console.log('[Logo] Successfully loaded:', currentSrc);
  };

  // If even the fallback fails, show text
  if (hasError && currentSrc === FALLBACK_LOGO) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-brand-green text-brand-dark font-bold rounded px-2',
          fallbackClassName || className
        )}
        onClick={onClick}
      >
        <span className="text-xs sm:text-sm">DinElportal</span>
      </div>
    );
  }

  return (
    <>
      {/* Always render the image element to maintain layout */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={cn(
          className,
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100 transition-opacity duration-300'
        )}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        loading="eager" // Logo should load immediately
        decoding="async" // Prevent main-thread blocking during initial paint
      />
      
      {/* Optional overlay while switching to remote; avoid covering fallback */}
      {isLoading && currentSrc !== FALLBACK_LOGO && (
        <div 
          className={cn(
            'absolute inset-0 bg-white/20 rounded animate-pulse',
            className
          )}
        />
      )}
    </>
  );
};

export default Logo;