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

type AnimationType = 'fadeSlide' | 'blur' | 'slideLeft' | 'slideRight' | 'elastic' | 'scale'

interface ScrollAnimationOptions {
  disabled?: boolean
  delay?: number
  duration?: number
  distance?: number
  type?: AnimationType
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
  const animationType = options?.type ?? 'fadeSlide'

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

  // Define animation variants for different types
  const getVariants = (isMobile: boolean): Variants => {
    const mobileDuration = duration * 0.8
    const mobileDistance = Math.min(distance, 15)

    switch (animationType) {
      case 'fadeSlide':
        // Subtle fade with upward slide - most elegant
        return {
          hidden: { 
            opacity: 0.5,
            y: isMobile ? mobileDistance : distance
          },
          visible: { 
            opacity: 1,
            y: 0,
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }
        }

      case 'blur':
        // Subtle scale with very minimal blur - much more subtle
        return {
          hidden: { 
            opacity: 1,
            scale: 0.98,
            filter: 'blur(0.5px)'
          },
          visible: { 
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }
        }

      case 'slideLeft':
        // Slide from left - no opacity change
        return {
          hidden: { 
            opacity: 1,
            x: isMobile ? -30 : -50
          },
          visible: { 
            opacity: 1,
            x: 0,
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }
        }

      case 'slideRight':
        // Slide from right - no opacity change
        return {
          hidden: { 
            opacity: 1,
            x: isMobile ? 30 : 50
          },
          visible: { 
            opacity: 1,
            x: 0,
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }
        }

      case 'elastic':
        // Elastic scale with spring physics
        return {
          hidden: { 
            opacity: 1,
            scale: 0.96
          },
          visible: { 
            opacity: 1,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay
            }
          }
        }

      case 'scale':
        // Simple scale animation (current one, but smoother)
        return {
          hidden: { 
            opacity: 1,
            scale: isMobile ? 0.97 : 0.98
          },
          visible: { 
            opacity: 1,
            scale: 1,
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: [0.22, 1, 0.36, 1]
            }
          }
        }

      default:
        // Default to fadeSlide
        return {
          hidden: { 
            opacity: 0.5,
            y: isMobile ? mobileDistance : distance
          },
          visible: { 
            opacity: 1,
            y: 0,
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }
        }
    }
  }

  return {
    variants: getVariants(isMobile),
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