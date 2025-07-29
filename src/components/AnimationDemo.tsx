import React from 'react'
import { motion } from 'framer-motion'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { Card } from '@/components/ui/card'

const AnimationDemo: React.FC = () => {
  // Create different animation types for demonstration
  const slideUpAnimation = useScrollAnimation({ type: 'slideUp', duration: 0.6 })
  const slideDownAnimation = useScrollAnimation({ type: 'slideDown', duration: 0.6 })
  const slideScaleAnimation = useScrollAnimation({ type: 'slideScale', duration: 0.8 })
  const scaleRotateAnimation = useScrollAnimation({ type: 'scaleRotate', duration: 0.6 })
  const slideLeftAnimation = useScrollAnimation({ type: 'slideLeft', duration: 0.6 })
  const slideRightAnimation = useScrollAnimation({ type: 'slideRight', duration: 0.6 })
  const elasticAnimation = useScrollAnimation({ type: 'elastic' })
  const scaleAnimation = useScrollAnimation({ type: 'scale', duration: 0.6 })
  const enlargeScrollAnimation = useScrollAnimation({ type: 'enlargeScroll' })

  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      <h2 className="text-3xl font-bold text-center mb-12">Animation Showcase</h2>

      {/* Enlarge Scroll Animation - Featured */}
      <motion.div {...enlargeScrollAnimation}>
        <Card className="p-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-purple-200 shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 text-purple-900">🌟 Enlarge Scroll Animation</h3>
          <p className="text-gray-700">
            Watch this card grow larger as it reaches the center of your screen! 
            This effect draws natural attention to content as users scroll. 
            Starts at 80% scale, grows to 110% when centered, then shrinks back.
          </p>
          <p className="text-sm text-purple-600 mt-2">
            Perfect for featured content, images, or call-to-action sections.
          </p>
        </Card>
      </motion.div>

      {/* Slide Up Animation */}
      <motion.div {...slideUpAnimation}>
        <Card className="p-8">
          <h3 className="text-2xl font-semibold mb-4">Slide Up Animation</h3>
          <p className="text-gray-600">
            The default animation - pure upward slide with no opacity change. 
            Clean, smooth, and prevents any blinking issues on mobile.
          </p>
        </Card>
      </motion.div>

      {/* Slide Down Animation */}
      <motion.div {...slideDownAnimation}>
        <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-2xl font-semibold mb-4">Slide Down Animation</h3>
          <p className="text-gray-600">
            Content slides down from above. Great for headers or 
            elements that should feel like they're dropping into place.
          </p>
        </Card>
      </motion.div>

      {/* Slide + Scale Animation */}
      <motion.div {...slideScaleAnimation}>
        <Card className="p-8 bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 className="text-2xl font-semibold mb-4">Slide + Scale Animation</h3>
          <p className="text-gray-600">
            Combines subtle scale with upward slide. Perfect for images 
            and featured content. More dynamic than pure slide.
          </p>
        </Card>
      </motion.div>

      {/* Scale + Rotate Animation */}
      <motion.div {...scaleRotateAnimation}>
        <Card className="p-8 bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-2xl font-semibold mb-4">Scale + Rotate Animation</h3>
          <p className="text-gray-600">
            Subtle scale with tiny rotation for a dynamic effect. 
            Adds personality without being too playful.
          </p>
        </Card>
      </motion.div>

      {/* Slide from Left */}
      <motion.div {...slideLeftAnimation}>
        <Card className="p-8 bg-gradient-to-r from-yellow-50 to-orange-50">
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

      {/* Multiple Enlarge Scroll Examples */}
      <div className="space-y-12 mt-20">
        <h3 className="text-xl font-semibold text-center text-gray-700">More Enlarge Scroll Examples</h3>
        
        {[
          { 
            title: "Image Gallery Item", 
            bg: "from-cyan-50 to-blue-50",
            content: "Perfect for image galleries where you want photos to subtly enlarge as users browse."
          },
          { 
            title: "Feature Highlight", 
            bg: "from-green-50 to-emerald-50",
            content: "Draw attention to key features or benefits as they scroll into the spotlight."
          },
          { 
            title: "Testimonial Card", 
            bg: "from-amber-50 to-yellow-50",
            content: "Make testimonials stand out by enlarging them when they're in focus."
          }
        ].map((item, index) => (
          <motion.div key={index} {...enlargeScrollAnimation}>
            <Card className={`p-6 bg-gradient-to-r ${item.bg} transform-gpu`}>
              <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
              <p className="text-gray-600 text-sm">{item.content}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AnimationDemo