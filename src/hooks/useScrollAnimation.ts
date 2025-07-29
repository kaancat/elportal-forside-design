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

type AnimationType = 'fadeUp' | 'fadeIn' | 'slideUp' | 'hero' | 'fadeLeft' | 'fadeRight' | 'scale' | 'stagger'

interface ScrollAnimationOptions {
  disabled?: boolean
  delay?: number
  duration?: number
  distance?: number
  type?: AnimationType
  staggerDelay?: number // For staggered animations
  index?: number // Item index for stagger
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
  const duration = options?.duration ?? 0.5 // Professional duration
  const distance = options?.distance ?? 30 // Noticeable movement
  const animationType = options?.type ?? 'fadeUp' // Default to classic fade up
  const staggerDelay = options?.staggerDelay ?? 0.1
  const index = options?.index ?? 0

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
    const mobileDuration = duration * 0.9
    const mobileDistance = isMobile ? distance * 0.7 : distance
    const professionalEase = [0.22, 1, 0.36, 1] // Smooth deceleration

    switch (animationType) {
      case 'fadeUp':
        // Classic fade up - the most professional animation
        return {
          hidden: { 
            opacity: 0,
            y: isMobile ? mobileDistance : distance
          },
          visible: { 
            opacity: 1,
            y: 0,
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: professionalEase
            }
          }
        }

      case 'fadeIn':
        // Pure fade without movement
        return {
          hidden: { 
            opacity: 0
          },
          visible: { 
            opacity: 1,
            transition: {
              duration: isMobile ? mobileDuration * 0.8 : duration * 0.8,
              delay,
              ease: 'easeOut'
            }
          }
        }

      case 'slideUp':
        // Stronger slide with fade for impact
        return {
          hidden: { 
            opacity: 0,
            y: isMobile ? 40 : 50
          },
          visible: { 
            opacity: 1,
            y: 0,
            transition: {
              duration: isMobile ? mobileDuration * 1.2 : duration * 1.2,
              delay,
              ease: professionalEase
            }
          }
        }

      case 'hero':
        // Special animation for hero sections
        return {
          hidden: { 
            opacity: 0,
            scale: 0.98,
            y: 20
          },
          visible: { 
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              duration: isMobile ? 0.6 : 0.8,
              delay,
              ease: professionalEase
            }
          }
        }

      case 'fadeLeft':
        // Fade in from left
        return {
          hidden: { 
            opacity: 0,
            x: isMobile ? -20 : -30
          },
          visible: { 
            opacity: 1,
            x: 0,
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: professionalEase
            }
          }
        }

      case 'fadeRight':
        // Fade in from right
        return {
          hidden: { 
            opacity: 0,
            x: isMobile ? 20 : 30
          },
          visible: { 
            opacity: 1,
            x: 0,
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: professionalEase
            }
          }
        }

      case 'scale':
        // Subtle scale with fade
        return {
          hidden: { 
            opacity: 0,
            scale: 0.95
          },
          visible: { 
            opacity: 1,
            scale: 1,
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: professionalEase
            }
          }
        }

      case 'stagger':
        // For staggered list animations
        return {
          hidden: { 
            opacity: 0,
            y: 20
          },
          visible: { 
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.4,
              delay: delay + (index * staggerDelay),
              ease: professionalEase
            }
          }
        }

      default:
        // Default to fadeUp
        return {
          hidden: { 
            opacity: 0,
            y: isMobile ? 20 : 30
          },
          visible: { 
            opacity: 1,
            y: 0,
            transition: {
              duration: isMobile ? mobileDuration : duration,
              delay,
              ease: professionalEase
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
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { 
      duration: isMobile ? 0.4 : 0.6,
      delay,
      ease: "easeOut"
    }
  }
}

// Utility function for staggered animations
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

// Professional animation presets
export const animationPresets = {
  hero: { duration: 0.8, distance: 40, type: 'hero' as AnimationType },
  content: { duration: 0.6, distance: 30, type: 'fadeUp' as AnimationType },
  card: { duration: 0.5, type: 'fadeIn' as AnimationType },
  image: { duration: 0.7, type: 'scale' as AnimationType },
  nav: { duration: 0.3, distance: 20, type: 'fadeUp' as AnimationType }
}

// CSS class for will-change optimization
export const animationClasses = "will-change-transform"