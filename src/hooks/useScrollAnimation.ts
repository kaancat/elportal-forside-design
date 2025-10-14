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
  // Start with false (server-safe) and update on client mount to avoid hydration mismatch
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Set initial values on mount
    setIsMobile(isMobileDevice())
    setShouldReduceMotion(prefersReducedMotion())

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
  const duration = options?.duration ?? 0.4 // Faster default duration
  const distance = options?.distance ?? 20 // Smaller movement distance
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
    const professionalEase: [number, number, number, number] = [0.22, 1, 0.36, 1] // Smooth deceleration

    switch (animationType) {
      case 'fadeUp':
        // Slide up animation (no opacity change to prevent blinking)
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
              ease: professionalEase
            }
          }
        }

      case 'fadeIn':
        // Subtle zoom in (no opacity to prevent blinking)
        return {
          hidden: {
            opacity: 1,
            scale: 0.95
          },
          visible: {
            opacity: 1,
            scale: 1,
            transition: {
              duration: isMobile ? mobileDuration * 0.8 : duration * 0.8,
              delay,
              ease: 'easeOut' as const
            }
          }
        }

      case 'slideUp':
        // Stronger slide animation (no opacity)
        return {
          hidden: {
            opacity: 1,
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
        // Hero animation with scale and slide (no opacity)
        return {
          hidden: {
            opacity: 1,
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
        // Slide in from left (no opacity)
        return {
          hidden: {
            opacity: 1,
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
        // Slide in from right (no opacity)
        return {
          hidden: {
            opacity: 1,
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
        // Subtle scale animation (no opacity)
        return {
          hidden: {
            opacity: 1,
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
        // For staggered list animations (no opacity)
        return {
          hidden: {
            opacity: 1,
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
        // Default to slideUp (no opacity)
        return {
          hidden: {
            opacity: 1,
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
      margin: isMobile ? "50px" : "100px", // Positive margin to trigger earlier
      amount: isMobile ? 0.05 : 0.1 // Trigger when less of element is visible
    },
    initial: "hidden",
    whileInView: "visible"
  }
}

// Utility function for simple scale animations (no opacity to prevent blinking)
export const fadeInAnimation = (delay = 0) => {
  // Use server-safe default for SSR
  const isMobile = typeof window !== 'undefined' ? isMobileDevice() : false

  return {
    initial: { opacity: 1, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: {
      duration: isMobile ? 0.4 : 0.6,
      delay,
      ease: "easeOut" as const
    }
  }
}

// Utility function for staggered animations (no opacity to prevent blinking)
export const staggerContainer = {
  hidden: { opacity: 1 },
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
  hero: { duration: 0.6, distance: 30, type: 'hero' as AnimationType },
  content: { duration: 0.4, distance: 20, type: 'fadeUp' as AnimationType },
  card: { duration: 0.3, type: 'fadeIn' as AnimationType },
  image: { duration: 0.5, type: 'scale' as AnimationType },
  nav: { duration: 0.2, distance: 15, type: 'fadeUp' as AnimationType }
}

// CSS class for will-change optimization
export const animationClasses = "will-change-transform"