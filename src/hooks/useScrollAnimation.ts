import { useEffect, useState } from 'react'
import { Variants } from 'framer-motion'

// Check if user prefers reduced motion
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Check if device is mobile
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 768 || 'ontouchstart' in window
}

interface ScrollAnimationOptions {
  disabled?: boolean
  delay?: number
  duration?: number
  distance?: number
}

export const useScrollAnimation = (options?: ScrollAnimationOptions) => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(prefersReducedMotion())
  const [isMobile, setIsMobile] = useState(isMobileDevice())

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(isMobileDevice())
    }

    const checkMotionPreference = () => {
      setShouldReduceMotion(prefersReducedMotion())
    }

    window.addEventListener('resize', checkDevice)
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    // Check if addEventListener is supported (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', checkMotionPreference)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(checkMotionPreference)
    }

    return () => {
      window.removeEventListener('resize', checkDevice)
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', checkMotionPreference)
      } else {
        mediaQuery.removeListener(checkMotionPreference)
      }
    }
  }, [])

  const delay = options?.delay ?? 0
  const duration = options?.duration ?? 0.6
  const distance = options?.distance ?? 20

  // If motion should be reduced or disabled, return static variants
  if (shouldReduceMotion || options?.disabled) {
    return {
      variants: {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
      } as Variants,
      viewport: { once: true },
      initial: "visible",
      whileInView: "visible"
    }
  }

  // Mobile-optimized variants
  const mobileVariants: Variants = {
    hidden: { 
      opacity: 0.01, // Slightly visible to prevent flash
      y: Math.min(distance, 10) // Reduced movement on mobile
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: duration * 0.8, // Faster on mobile
        delay,
        ease: [0.25, 0.1, 0.25, 1] // Custom easing for smoother motion
      }
    }
  }

  // Desktop variants
  const desktopVariants: Variants = {
    hidden: { 
      opacity: 0,
      y: distance
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration,
        delay,
        ease: "easeOut"
      }
    }
  }

  return {
    variants: isMobile ? mobileVariants : desktopVariants,
    viewport: { 
      once: true, 
      margin: isMobile ? "0px" : "-50px", // No negative margin on mobile
      amount: isMobile ? 0.1 : 0.2 // Trigger earlier on mobile
    },
    initial: "hidden",
    whileInView: "visible"
  }
}

// Utility function for simple fade animations
export const fadeInAnimation = (delay = 0) => {
  const isMobile = isMobileDevice()
  
  return {
    initial: { opacity: isMobile ? 0.01 : 0 },
    animate: { opacity: 1 },
    transition: { 
      duration: isMobile ? 0.3 : 0.5,
      delay,
      ease: "easeOut"
    }
  }
}

// CSS class for will-change optimization
export const animationClasses = "will-change-transform"