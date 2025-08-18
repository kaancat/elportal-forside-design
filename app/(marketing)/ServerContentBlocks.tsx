/**
 * Server-side content blocks for SSR
 * These components render on the server for SEO
 */

import { PortableText } from '@portabletext/react'
import { urlFor } from '@/server/sanity'

interface ServerContentBlocksProps {
  blocks: any[]
  showReadingProgress?: boolean
}

export default function ServerContentBlocks({ blocks, showReadingProgress }: ServerContentBlocksProps) {
  return (
    <>
      {blocks.map((block) => {
        switch (block._type) {
          case 'hero':
            return <HeroBlock key={block._key} block={block} />
          case 'heroWithCalculator':
            return <HeroWithCalculatorBlock key={block._key} block={block} />
          case 'pageSection':
            return <PageSectionBlock key={block._key} block={block} />
          case 'valueProposition':
            return <ValuePropositionBlock key={block._key} block={block} />
          case 'faqGroup':
            return <FAQGroupBlock key={block._key} block={block} />
          case 'callToActionSection':
            return <CTASectionBlock key={block._key} block={block} />
          case 'energyTipsSection':
            return <EnergyTipsBlock key={block._key} block={block} />
          case 'infoCards':
            return <InfoCardsBlock key={block._key} block={block} />
          default:
            return null
        }
      })}
    </>
  )
}

// Hero Block
function HeroBlock({ block }: { block: any }) {
  const bgImageUrl = block.backgroundImage ? urlFor(block.backgroundImage).url() : null
  
  return (
    <section 
      className="relative min-h-[600px] flex items-center justify-center text-white"
      style={{
        backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : undefined,
        backgroundColor: !bgImageUrl ? '#001a12' : undefined,
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 container mx-auto px-4 text-center">
        {block.headline && (
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{block.headline}</h1>
        )}
        {block.subheadline && (
          <p className="text-xl md:text-2xl mb-8">{block.subheadline}</p>
        )}
        {block.ctaButtonText && (
          <a 
            href={block.ctaButtonLink || '#'}
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            {block.ctaButtonText}
          </a>
        )}
      </div>
    </section>
  )
}

// Hero with Calculator placeholder
function HeroWithCalculatorBlock({ block }: { block: any }) {
  const bgImageUrl = block.backgroundImage ? urlFor(block.backgroundImage).url() : null
  
  return (
    <section 
      className="relative min-h-[700px] flex items-center"
      style={{
        backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : undefined,
        backgroundColor: !bgImageUrl ? '#001a12' : undefined,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            {block.headline && (
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{block.headline}</h1>
            )}
            {block.subheadline && (
              <p className="text-xl md:text-2xl mb-8">{block.subheadline}</p>
            )}
          </div>
          <div className="bg-white rounded-lg p-6 shadow-xl">
            {/* Calculator will be rendered client-side */}
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              <p>Prisberegner indlæses...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Page Section Block
function PageSectionBlock({ block }: { block: any }) {
  const imageUrl = block.image ? urlFor(block.image).url() : null
  const alignmentClass = block.headerAlignment === 'center' ? 'text-center' : 
                         block.headerAlignment === 'right' ? 'text-right' : 'text-left'
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {block.title && (
          <h2 className={`text-3xl md:text-4xl font-bold mb-8 ${alignmentClass}`}>
            {block.title}
          </h2>
        )}
        
        <div className={`grid ${imageUrl ? 'md:grid-cols-2' : ''} gap-8 items-center`}>
          {block.content && (
            <div className="prose prose-lg max-w-none">
              <PortableText value={block.content} />
            </div>
          )}
          
          {imageUrl && (
            <div className={block.imagePosition === 'left' ? 'order-first' : ''}>
              <img 
                src={imageUrl} 
                alt={block.imageAlt || block.title || ''} 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          )}
        </div>
        
        {block.cta && (
          <div className="mt-8">
            <a 
              href={block.cta.link || '#'}
              className={`inline-block px-6 py-3 rounded-lg font-semibold transition-colors
                ${block.cta.variant === 'secondary' 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' 
                  : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              {block.cta.text}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

// Value Proposition Block
function ValuePropositionBlock({ block }: { block: any }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {block.heading && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {block.heading}
          </h2>
        )}
        {block.subheading && (
          <p className="text-xl text-center text-gray-600 mb-12">
            {block.subheading}
          </p>
        )}
        
        <div className="grid md:grid-cols-3 gap-8">
          {block.valueItems?.map((item: any) => (
            <div key={item._key} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// FAQ Group Block
function FAQGroupBlock({ block }: { block: any }) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        {block.title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {block.title}
          </h2>
        )}
        {block.subtitle && (
          <p className="text-xl text-center text-gray-600 mb-12">
            {block.subtitle}
          </p>
        )}
        
        <div className="space-y-4">
          {block.faqItems?.map((item: any) => (
            <details key={item._key} className="border border-gray-200 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">
                {item.question}
              </summary>
              <div className="mt-4 text-gray-600 prose max-w-none">
                <PortableText value={item.answer} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

// Call to Action Section
function CTASectionBlock({ block }: { block: any }) {
  const bgImageUrl = block.backgroundImage ? urlFor(block.backgroundImage).url() : null
  
  return (
    <section 
      className="py-20 text-white"
      style={{
        backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : undefined,
        backgroundColor: block.backgroundColor || '#001a12',
      }}
    >
      <div className="container mx-auto px-4 text-center">
        {block.headline && (
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {block.headline}
          </h2>
        )}
        {block.subheadline && (
          <p className="text-xl md:text-2xl mb-8">
            {block.subheadline}
          </p>
        )}
        
        <div className="flex flex-wrap gap-4 justify-center">
          {block.ctaButtons?.map((button: any) => (
            <a
              key={button._key}
              href={button.link || '#'}
              className={`inline-block px-8 py-3 rounded-lg font-semibold transition-colors
                ${button.variant === 'secondary' 
                  ? 'bg-white text-gray-900 hover:bg-gray-100' 
                  : 'bg-green-500 text-white hover:bg-green-600'}`}
            >
              {button.text}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// Energy Tips Section
function EnergyTipsBlock({ block }: { block: any }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {block.title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {block.title}
          </h2>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {block.tips?.map((tip: any) => (
            <div key={tip._key} className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{tip.title}</h3>
              <p className="text-gray-600 mb-4">{tip.description}</p>
              {tip.savings && (
                <p className="text-green-600 font-semibold">
                  Spar op til {tip.savings} kr/år
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Info Cards Block
function InfoCardsBlock({ block }: { block: any }) {
  const columns = block.columns || 3
  
  // Map column count to Tailwind classes
  const gridColsClass = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
  }[columns] || 'md:grid-cols-3'
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {block.title && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {block.title}
          </h2>
        )}
        
        <div className={`grid ${gridColsClass} gap-6`}>
          {block.cards?.map((card: any) => (
            <div 
              key={card._key} 
              className="rounded-lg p-6 shadow-sm"
              style={{ backgroundColor: card.backgroundColor || '#f9fafb' }}
            >
              <h3 className="text-xl font-semibold mb-4">{card.title}</h3>
              <div className="prose max-w-none">
                <PortableText value={card.content} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}