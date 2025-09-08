
'use client'

import React, { useState } from 'react'
import { FAQItem } from '@/types/sanity'
import BlockContent from './BlockContent'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItemComponentProps {
  item: FAQItem
}

const FAQItemComponent: React.FC<FAQItemComponentProps> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-semibold text-brand-dark">{item.question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <BlockContent content={item.answer} />
        </div>
      )}
    </div>
  )
}

export default FAQItemComponent
