import React from 'react'
import { motion } from 'framer-motion'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { Card } from '@/components/ui/card'

const AnimationDemo: React.FC = () => {
  // Create different animation types for demonstration
  const fadeSlideAnimation = useScrollAnimation({ type: 'fadeSlide', duration: 0.6 })
  const blurAnimation = useScrollAnimation({ type: 'blur', duration: 0.8 })
  const slideLeftAnimation = useScrollAnimation({ type: 'slideLeft', duration: 0.6 })
  const slideRightAnimation = useScrollAnimation({ type: 'slideRight', duration: 0.6 })
  const elasticAnimation = useScrollAnimation({ type: 'elastic' })
  const scaleAnimation = useScrollAnimation({ type: 'scale', duration: 0.6 })

  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      <h2 className="text-3xl font-bold text-center mb-12">Animation Showcase</h2>

      {/* Fade + Slide Animation */}
      <motion.div {...fadeSlideAnimation}>
        <Card className="p-8">
          <h3 className="text-2xl font-semibold mb-4">Fade + Slide Animation</h3>
          <p className="text-gray-600">
            This is the default animation - a subtle fade combined with an upward slide. 
            Perfect for text content and general use. Elegant and professional.
          </p>
        </Card>
      </motion.div>

      {/* Blur to Focus Animation */}
      <motion.div {...blurAnimation}>
        <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-2xl font-semibold mb-4">Blur to Focus Animation</h3>
          <p className="text-gray-600">
            Modern blur effect that transitions to sharp focus. Great for images 
            and featured content that you want to draw attention to.
          </p>
        </Card>
      </motion.div>

      {/* Slide from Left */}
      <motion.div {...slideLeftAnimation}>
        <Card className="p-8 bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 className="text-2xl font-semibold mb-4">Slide from Left</h3>
          <p className="text-gray-600">
            Content slides in from the left with no opacity change. 
            Perfect for sequential content or timeline items.
          </p>
        </Card>
      </motion.div>

      {/* Slide from Right */}
      <motion.div {...slideRightAnimation}>
        <Card className="p-8 bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-2xl font-semibold mb-4">Slide from Right</h3>
          <p className="text-gray-600">
            Content slides in from the right. Great for alternating 
            content sections or creating visual rhythm.
          </p>
        </Card>
      </motion.div>

      {/* Elastic Scale */}
      <motion.div {...elasticAnimation}>
        <Card className="p-8 bg-gradient-to-r from-yellow-50 to-orange-50">
          <h3 className="text-2xl font-semibold mb-4">Elastic Scale Animation</h3>
          <p className="text-gray-600">
            Playful spring physics animation with a subtle bounce. 
            Perfect for cards, buttons, and interactive elements.
          </p>
        </Card>
      </motion.div>

      {/* Simple Scale */}
      <motion.div {...scaleAnimation}>
        <Card className="p-8 bg-gradient-to-r from-red-50 to-rose-50">
          <h3 className="text-2xl font-semibold mb-4">Simple Scale Animation</h3>
          <p className="text-gray-600">
            The current animation but smoother - a simple scale effect 
            without the "pop" you didn't like. Subtle and clean.
          </p>
        </Card>
      </motion.div>
    </div>
  )
}

export default AnimationDemo