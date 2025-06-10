import React from 'react'
import { CallToActionSection } from '@/types/sanity'
import { Button } from '@/components/ui/button'

interface CallToActionSectionComponentProps {
  block: CallToActionSection
}

const CallToActionSectionComponent: React.FC<CallToActionSectionComponentProps> = ({ block }) => {
  console.log('CallToActionSectionComponent received block:', block)

  if (!block?.title || !block?.buttonText || !block?.buttonUrl) {
    console.warn('CallToActionSectionComponent: Missing required fields')
    return null
  }

  const handleButtonClick = () => {
    if (block.buttonUrl.startsWith('http') || block.buttonUrl.startsWith('https')) {
      window.open(block.buttonUrl, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = block.buttonUrl
    }
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-8">
            {block.title}
          </h2>
          <Button
            onClick={handleButtonClick}
            size="lg"
            className="bg-[#84db41] hover:bg-[#75c837] text-white font-semibold px-8 py-4 text-lg"
          >
            {block.buttonText}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CallToActionSectionComponent
