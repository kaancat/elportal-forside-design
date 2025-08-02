import React, { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion'
import { urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'
import type { PageSection } from '@/types/sanity'
import { cn } from '@/lib/utils'

interface StickyImageSectionProps {
  section: PageSection
  customComponents: any
}

const StickyImageSection: React.FC<StickyImageSectionProps> = ({ section, customComponents }) => {
  const { title, content, image, imagePosition = 'left', settings, headerAlignment } = section
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  
  // Check if we're on desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768) // md breakpoint
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])
  
  // Get layout settings
  const layoutRatio = settings?.layoutRatio || '50/50'
  const textAlignClass = headerAlignment === 'left' ? 'text-left' : headerAlignment === 'right' ? 'text-right' : 'text-center'
  
  // Set up scroll tracking (only used on desktop)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  // Transform scroll progress to sticky behavior (only on desktop)
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", "50%"]
  )
  
  // Use a static value for mobile
  const staticY = useMotionValue("0%")
  
  // Get grid classes based on ratio
  const getGridClasses = () => {
    switch (layoutRatio) {
      case '60/40':
        return 'md:grid-cols-12'
      case '40/60':
        return 'md:grid-cols-12'
      case '50/50':
      default:
        return 'md:grid-cols-2'
    }
  }
  
  // Get column span classes
  const getTextColumnClasses = () => {
    switch (layoutRatio) {
      case '60/40':
        return 'md:col-span-7'
      case '40/60':
        return 'md:col-span-5'
      case '50/50':
      default:
        return ''
    }
  }
  
  const getImageColumnClasses = () => {
    switch (layoutRatio) {
      case '60/40':
        return 'md:col-span-5'
      case '40/60':
        return 'md:col-span-7'
      case '50/50':
      default:
        return ''
    }
  }
  
  if (!image) return null
  
  return (
    <div ref={containerRef} className="relative">
      <div className={cn(
        "container mx-auto px-4",
        "grid gap-12 md:gap-16 lg:gap-20",
        getGridClasses()
      )}>
        {/* Image Column - Sticky only on desktop */}
        <div 
          className={cn(
            "order-1 relative",
            imagePosition === 'right' ? 'md:order-2' : '',
            getImageColumnClasses(),
            // Desktop sticky styles
            "md:sticky md:top-20 md:h-[calc(100vh-8rem)]",
            // Mobile styles
            "h-auto"
          )}
        >
          <div className={cn(
            "relative w-full",
            "md:h-full md:flex md:items-center"
          )}>
            <motion.div 
              className="relative w-full"
              style={{ y: isDesktop ? imageY : staticY }}
            >
              <img
                src={urlFor(image).width(1000).quality(85).url()}
                alt={image.alt || title}
                className={cn(
                  "w-full h-auto rounded-2xl object-cover",
                  "md:max-h-[calc(100vh-10rem)]"
                )}
              />
            </motion.div>
          </div>
        </div>

        {/* Text Column - Scrolls normally */}
        <div className={cn(
          "order-2",
          imagePosition === 'right' ? 'md:order-1' : '',
          textAlignClass,
          getTextColumnClasses(),
          "py-8 md:py-32" // Normal padding on mobile, extra on desktop for scroll effect
        )}>
          {title && (
            <h2 className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8",
              settings?.theme === 'dark' ? "text-white" : "text-brand-dark"
            )}>
              {title}
            </h2>
          )}
          <div className={cn(
            "prose prose-lg",
            layoutRatio === '60/40' ? 'max-w-prose' : 'max-w-none',
            settings?.theme === 'dark' && "prose-invert",
            "space-y-6" // Better paragraph spacing
          )}>
            {content && Array.isArray(content) && content.length > 0 && (
              <PortableText value={content} components={customComponents} />
            )}
          </div>
          {section.cta && section.cta.text && section.cta.url && (
            <div className={cn(
              "mt-10",
              textAlignClass === 'text-center' ? 'flex justify-center' : 
              textAlignClass === 'text-right' ? 'flex justify-end' : ''
            )}>
              <a 
                href={section.cta.url} 
                className={cn(
                  "inline-flex items-center px-8 py-4 font-semibold rounded-xl transition-colors duration-200",
                  "shadow-lg",
                  settings?.theme === 'dark' 
                    ? "bg-brand-green text-brand-dark hover:bg-brand-green-light" 
                    : "bg-brand-green text-white hover:bg-brand-green-dark"
                )}
              >
                {section.cta.text}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StickyImageSection