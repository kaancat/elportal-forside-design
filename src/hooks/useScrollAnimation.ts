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

type AnimationType = 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'elastic' | 'scale' | 'slideScale' | 'scaleRotate' | 'reveal' | 'lift' | 'emphasis'

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
  const duration = options?.duration ?? 0.3 // Faster, more professional
  const distance = options?.distance ?? 10 // Much smaller movement
  const animationType = options?.type ?? 'reveal' // Default to subtle reveal

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
    const mobileDuration = duration * 0.9 // Less difference between mobile/desktop
    const mobileDistance = Math.min(distance, 8) // Even smaller on mobile

    switch (animationType) {
      case 'slideUp':
        // Pure upward slide - no opacity change
        return {
          hidden: { 
            opacity: 1,
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

      case 'slideDown':
        // Pure downward slide - no opacity change
        return {
          hidden: { 
            opacity: 1,
            y: isMobile ? -mobileDistance : -distance
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

      case 'slideScale':
        // Combines subtle scale with upward slide - no opacity or blur
        return {
          hidden: { 
            opacity: 1,
            scale: 0.98, // More subtle
            y: isMobile ? mobileDistance * 0.5 : distance * 0.5
          },
          visible: { 
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }
        }

      case 'scaleRotate':
        // Subtle scale with tiny rotation for dynamic effect
        return {
          hidden: { 
            opacity: 1,
            scale: 0.98, // More subtle
            rotate: isMobile ? -0.5 : -1 // Barely noticeable rotation
          },
          visible: { 
            opacity: 1,
            scale: 1,
            rotate: 0,
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
        // Simple scale animation - very subtle
        return {
          hidden: { 
            opacity: 1,
            scale: isMobile ? 0.98 : 0.99 // Much more subtle
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

      case 'reveal':
        // Professional reveal animation - gentle fade with minimal movement
        return {
          hidden: { 
            opacity: 0.7,
            y: isMobile ? 5 : 8
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

      case 'lift':
        // Subtle lift effect with shadow
        return {
          hidden: { 
            opacity: 1,
            y: 0,
            scale: 1
          },
          visible: { 
            opacity: 1,
            y: isMobile ? -2 : -3,
            scale: 1.01, // Very subtle scale
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }
        }

      case 'emphasis':
        // Subtle emphasis animation for cards
        return {
          hidden: { 
            opacity: 1,
            scale: 1
          },
          visible: { 
            opacity: 1,
            scale: isMobile ? 1.015 : 1.02, // Very subtle 1.5-2% scale
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: [0.22, 1, 0.36, 1]
            }
          }
        }

      default:
        // Default to reveal animation
        return {
          hidden: { 
            opacity: 0.7,
            y: isMobile ? 5 : 8
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
      margin: isMobile ? "0px" : "-20px", // Smaller negative margin
      amount: isMobile ? 0.15 : 0.25 // Trigger when more of element is visible
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