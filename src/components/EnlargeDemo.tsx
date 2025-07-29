import React from 'react'
import Enlarge from './Enlarge'
import { Card } from '@/components/ui/card'

const EnlargeDemo: React.FC = () => {
  return (
    <section className="py-20">
      {/* Header section with scroll indicator */}
      <div className="flex min-h-[420px] items-center justify-center mb-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Enlarge Scroll Effect</h2>
          <span className="font-semibold uppercase text-neutral-500 animate-bounce inline-block">
            ↓ Scroll ↓
          </span>
        </div>
      </div>

      {/* Enlarge items */}
      <div className="container mx-auto px-4 space-y-20">
        {[
          {
            title: "Electricity Price Monitoring",
            description: "Real-time tracking of electricity prices across Denmark's grid areas. Our advanced monitoring system provides up-to-the-minute data.",
            bg: "from-blue-50 to-indigo-50",
            borderColor: "border-blue-200"
          },
          {
            title: "Green Energy Solutions",
            description: "Sustainable power options for environmentally conscious consumers. We partner with renewable energy providers to offer clean electricity.",
            bg: "from-green-50 to-emerald-50",
            borderColor: "border-green-200"
          },
          {
            title: "Smart Grid Technology",
            description: "Intelligent distribution systems that optimize energy usage. Our platform integrates with modern smart grid infrastructure.",
            bg: "from-purple-50 to-pink-50",
            borderColor: "border-purple-200"
          },
          {
            title: "Cost Savings Analysis",
            description: "Comprehensive analysis of your electricity consumption patterns. Discover opportunities to reduce your monthly energy bills.",
            bg: "from-amber-50 to-yellow-50",
            borderColor: "border-amber-200"
          }
        ].map((item, index) => (
          <Enlarge key={index}>
            <Card className={`p-12 bg-gradient-to-br ${item.bg} ${item.borderColor} border-2 transform-gpu`}>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {item.description}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm text-gray-500">Item {index + 1} of 4</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
            </Card>
          </Enlarge>
        ))}
      </div>

      {/* Footer spacer */}
      <div className="h-96 flex items-center justify-center mt-20">
        <p className="text-gray-400">End of demo</p>
      </div>
    </section>
  )
}

export default EnlargeDemo