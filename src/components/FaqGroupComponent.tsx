
import React from 'react'
import { FaqGroup } from '@/types/sanity'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import BlockContent from './BlockContent'

interface FaqGroupComponentProps {
  block: FaqGroup
}

const FaqGroupComponent: React.FC<FaqGroupComponentProps> = ({ block }) => {
  console.log('FaqGroupComponent received block:', block)

  if (!block?.faqItems || block.faqItems.length === 0) {
    console.warn('FaqGroupComponent: No FAQ items provided')
    return null
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {block.title && (
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-8 text-center">
            {block.title}
          </h2>
        )}
        
        <Accordion type="single" collapsible className="space-y-4">
          {block.faqItems.map((item) => (
            <AccordionItem 
              key={item._key} 
              value={item._key}
              className="border border-gray-200 rounded-lg px-6 py-2 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <AccordionTrigger className="text-left font-semibold text-brand-dark hover:text-brand-green transition-colors duration-200 py-4">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="text-gray-700">
                  <BlockContent content={item.answer} />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

export default FaqGroupComponent
