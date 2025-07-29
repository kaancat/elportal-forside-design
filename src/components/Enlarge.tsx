import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

interface EnlargeProps {
  children: React.ReactNode
  className?: string
}

/**
 * Enlarge component that scales content based on scroll position
 * Elements scale up as they approach the center of the viewport
 * and scale down as they move away
 */
const Enlarge: React.FC<EnlargeProps> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null)
  
  // Track scroll progress of this specific element
  const { scrollYProgress } = useScroll({
    target: ref,
    // Start tracking when element enters bottom of viewport
    // Stop tracking when element leaves top of viewport
    offset: ["start end", "end start"]
  })
  
  // Transform scroll progress to scale
  // When element is at bottom (0), scale is 0.8
  // When element is in center (0.5), scale is 1.15
  // When element is at top (1), scale is 0.8
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.8, 1.15, 0.8]
  )
  
  // Add spring physics for smoother animation
  const smoothScale = useSpring(scale, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })
  
  return (
    <motion.div
      ref={ref}
      style={{ scale: smoothScale }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default Enlarge