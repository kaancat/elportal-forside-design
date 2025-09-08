'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ReadingProgressProps {
  className?: string;
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({
  className,
  color = 'bg-yellow-400',
  height = 5,
  showPercentage = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const lastScrollY = useRef(0);
  const contentStartRef = useRef<number>(0);
  const contentEndRef = useRef<number>(0);

  // Throttled scroll handler using requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Find the main content area (exclude navigation and footer)
      const mainContent = document.querySelector('main');
      const footer = document.querySelector('footer');
      
      if (!mainContent) {
        setIsVisible(false);
        return;
      }

      // Calculate content boundaries
      const mainRect = mainContent.getBoundingClientRect();
      const mainTop = mainRect.top + currentScrollY;
      
      // Start tracking after the navigation (approximately 64px)
      const startOffset = Math.max(mainTop, 64);
      
      // End tracking when footer comes into view
      let endOffset = documentHeight - windowHeight;
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const footerTop = footerRect.top + currentScrollY;
        endOffset = footerTop - windowHeight;
      }

      contentStartRef.current = startOffset;
      contentEndRef.current = endOffset;

      // Calculate readable content height
      const readableHeight = endOffset - startOffset;
      
      // Only show progress bar if there's enough content to scroll
      if (readableHeight < windowHeight * 0.5) {
        setIsVisible(false);
        return;
      }

      // Calculate progress
      const scrolled = currentScrollY - startOffset;
      const progressPercentage = Math.min(Math.max((scrolled / readableHeight) * 100, 0), 100);
      
      // Show/hide based on scroll position
      if (currentScrollY > startOffset && currentScrollY < endOffset + windowHeight) {
        setIsVisible(true);
        setProgress(progressPercentage);
      } else if (currentScrollY >= endOffset + windowHeight) {
        // Hide when footer is fully visible
        setIsVisible(false);
      } else {
        setIsVisible(false);
        setProgress(0);
      }

      lastScrollY.current = currentScrollY;

      // Announce progress to screen readers at key points
      if (progressRef.current) {
        const roundedProgress = Math.round(progressPercentage);
        if (roundedProgress === 0 || roundedProgress === 25 || roundedProgress === 50 || 
            roundedProgress === 75 || roundedProgress === 100) {
          progressRef.current.setAttribute('aria-valuenow', roundedProgress.toString());
        }
      }
    });
  }, []);

  // Setup scroll listener
  useEffect(() => {
    // Initial calculation
    handleScroll();

    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Handle window resize
    const handleResize = () => {
      handleScroll();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-40 transition-opacity duration-300',
        'top-[64px]', // Position below navigation
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
      style={{ height: `${height}px` }}
    >
      {/* Progress bar background track */}
      <div 
        className="absolute inset-0 bg-black/10"
        aria-hidden="true"
      />
      
      {/* Progress bar fill */}
      <div
        ref={progressRef}
        className={cn(
          'absolute left-0 top-0 h-full transition-all duration-100 ease-out',
          color
        )}
        style={{
          width: `${progress}%`,
          transform: 'translateZ(0)', // Force GPU acceleration
          willChange: 'width',
        }}
        role="progressbar"
        aria-label="Reading progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Optional percentage display */}
        {showPercentage && progress > 5 && (
          <span 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-medium"
            aria-hidden="true"
          >
            {Math.round(progress)}%
          </span>
        )}
      </div>

      {/* Screen reader only progress announcement */}
      <span className="sr-only">
        Reading progress: {Math.round(progress)} percent
      </span>
    </div>
  );
};

export default ReadingProgress;