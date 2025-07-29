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
  const duration = options?.duration ?? 0.8

  // If motion should be reduced or disabled, return static variants
  if (shouldReduceMotion || options?.disabled) {
    return {
      variants: {
        hidden: { opacity: 1, scale: 1 },
        visible: { opacity: 1, scale: 1 }
      } as Variants,
      viewport: { once: false },
      initial: "visible",
      whileInView: "visible"
    }
  }

  // Enlarge scroll animation - the only animation now
  const variants: Variants = {
    hidden: { 
      opacity: 1,
      scale: isMobile ? 0.85 : 0.8,
      y: isMobile ? 10 : 15
    },
    visible: { 
      opacity: 1,
      scale: isMobile ? 1.05 : 1.1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay,
        duration: isMobile ? duration * 0.9 : duration
      }
    }
  }

  return {
    variants,
    viewport: {
      once: false, // Allow re-triggering for enlarge effect
      margin: isMobile ? "-10%" : "-20%", // Trigger when closer to center
      amount: 0.5 // Trigger when 50% of element is in view
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