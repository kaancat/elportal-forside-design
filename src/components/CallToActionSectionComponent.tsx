import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CallToActionSection } from '@/types/sanity'
import { Button } from '@/components/ui/button'
import { useScrollAnimation, animationClasses } from '@/hooks/useScrollAnimation'
import { TrackedLink } from '@/components/tracking/TrackedLink'

interface CallToActionSectionComponentProps {
  block: CallToActionSection
}

const CallToActionSectionComponent: React.FC<CallToActionSectionComponentProps> = ({ block }) => {
  const navigate = useNavigate()

  if (!block?.title || !block?.buttonText || !block?.buttonUrl) {
    return null
  }

  // Check if this is an external partner link
  const isExternalPartnerLink = (url: string): boolean => {
    return (url.startsWith('http') || url.startsWith('https')) && 
           (url.includes('vindstod') || url.includes('andelenergi') || url.includes('elselskab'));
  }
  
  const handleInternalNavigation = () => {
    navigate(block.buttonUrl);
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 text-center">
        <motion.div 
          className="max-w-2xl mx-auto"
          {...useScrollAnimation({ duration: 0.6, type: 'fadeUp' })}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            {block.title}
          </h2>
          {block.description && (
            <p className="text-lg text-gray-600 mb-8">
              {block.description}
            </p>
          )}
          <motion.div
            {...useScrollAnimation({ duration: 0.5, type: 'fadeUp', delay: 0.2 })}
          >
            {isExternalPartnerLink(block.buttonUrl) ? (
              <TrackedLink
                href={block.buttonUrl}
                partner={new URL(block.buttonUrl).hostname.split('.')[0]} // Extract partner from domain
                component="cta_section"
                variant="hero_cta"
                className="inline-block"
              >
                <Button
                  size="lg"
                  className="bg-brand-green hover:bg-brand-green-hover text-white font-semibold px-8 py-4 text-lg"
                >
                  {block.buttonText}
                </Button>
              </TrackedLink>
            ) : (
              <Button
                onClick={handleInternalNavigation}
                size="lg"
                className="bg-brand-green hover:bg-brand-green-hover text-white font-semibold px-8 py-4 text-lg"
              >
                {block.buttonText}
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default CallToActionSectionComponent
