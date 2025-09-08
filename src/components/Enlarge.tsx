'use client'

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
  // Much more subtle: 1.0 → 1.03 → 1.0 (only 3% scale change)
  // When element is at bottom (0), scale is 1.0
  // When element is in center (0.5), scale is 1.03
  // When element is at top (1), scale is 1.0
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1.0, 1.03, 1.0]
  )
  
  // Gentler spring for professional feel
  const smoothScale = useSpring(scale, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.0001
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