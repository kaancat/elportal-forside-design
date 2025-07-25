import React from 'react'
import { PortableText } from '@portabletext/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { urlFor } from '@/lib/sanity'
import type { ChargingBoxShowcaseBlock } from '@/types/sanity'

// Export the block type for use in ContentBlocks
export type { ChargingBoxShowcaseBlock } from '@/types/sanity'

interface ChargingBoxShowcaseProps {
  block: ChargingBoxShowcaseBlock
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function ChargingBoxShowcase({ block }: ChargingBoxShowcaseProps) {
  const { heading, description, products, headerAlignment = 'center' } = block

  // Debug logging
  console.log('[ChargingBoxShowcase] Rendering with:', {
    heading,
    productsCount: products?.length,
    products: products,
    headerAlignment
  })

  if (!products || products.length === 0) {
    console.log('[ChargingBoxShowcase] No products, returning null')
    return null
  }

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`mb-8 ${alignmentClasses[headerAlignment]}`}>
          <h2 className="text-3xl font-bold mb-4">{heading}</h2>
          {description && (
            <div className="prose prose-lg max-w-none">
              <PortableText value={description} />
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.filter(Boolean).map((product) => (
            <Card key={product._id || Math.random().toString()} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-green-500 text-white hover:bg-green-600">
                    {product.badge}
                  </Badge>
                </div>
              )}

              {/* Product Image */}
              {product.productImage && (
                <div className="aspect-square relative overflow-hidden bg-gray-50">
                  <img
                    src={urlFor(product.productImage).width(400).height(400).url()}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
              )}

              <CardContent className="p-6">
                {/* Product Name */}
                <h3 className="text-xl font-semibold mb-3">{product.name}</h3>

                {/* Description */}
                {product.description && (
                  <div className="prose prose-sm text-gray-600 mb-4">
                    <PortableText value={product.description} />
                  </div>
                )}

                {/* Price */}
                <div className="mb-4">
                  {product.originalPrice && product.currentPrice && product.originalPrice > product.currentPrice && (
                    <span className="text-gray-400 line-through text-sm mr-2">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {product.currentPrice && (
                    <span className="text-2xl font-bold text-brand-dark">
                      {formatPrice(product.currentPrice)}
                    </span>
                  )}
                </div>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA Button */}
                {product.ctaLink && (
                  <Button 
                    asChild 
                    className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
                  >
                    <a 
                      href={product.ctaLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {product.ctaText || 'Køb nu'}
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ChargingBoxShowcase