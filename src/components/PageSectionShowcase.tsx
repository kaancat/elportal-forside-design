import React from 'react'
import PageSectionComponent from './PageSectionComponent'
import type { PageSection } from '@/types/sanity'

// Example showcasing all the new visual design options for PageSection
const PageSectionShowcase = () => {
  const showcaseSections: PageSection[] = [
    {
      _type: 'pageSection',
      _key: 'default-theme',
      title: 'Default Theme - Clean & Professional',
      headerAlignment: 'center',
      content: [
        {
          _type: 'block',
          _key: 'block-1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Dette er standard temaet med en ren og professionel stil. Perfekt til generelt indhold med god læsbarhed og klassisk design.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      settings: {
        theme: 'default',
        padding: 'medium'
      }
    },
    {
      _type: 'pageSection',
      _key: 'brand-gradient',
      title: 'Brand Gradient - Subtil Branding',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: 'block-2',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Brand gradient temaet tilføjer en subtil gradient baggrund med vores brand farver. Det giver en blød og moderne følelse uden at være for dominerende.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      cta: {
        text: 'Se Vores Priser',
        url: '/priser'
      },
      settings: {
        theme: 'brand',
        padding: 'large'
      }
    },
    {
      _type: 'pageSection',
      _key: 'dark-theme',
      title: 'Dark Mode - Premium & Elegant',
      headerAlignment: 'center',
      content: [
        {
          _type: 'block',
          _key: 'block-3',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Dark mode temaet giver en premium og elegant følelse. Perfekt til at fremhæve vigtige beskeder eller skabe kontrast på siden.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      cta: {
        text: 'Start Her',
        url: '/kom-i-gang'
      },
      settings: {
        theme: 'dark',
        padding: 'large'
      }
    },
    {
      _type: 'pageSection',
      _key: 'accent-theme',
      title: 'Accent Theme - Livlig & Energisk',
      headerAlignment: 'right',
      content: [
        {
          _type: 'block',
          _key: 'block-4',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Accent temaet tilføjer dekorative elementer og gradient accenter. Det skaber en mere livlig og energisk atmosfære med subtile visuelle effekter.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      settings: {
        theme: 'accent',
        padding: 'medium'
      }
    },
    {
      _type: 'pageSection',
      _key: 'pattern-overlay',
      title: 'Pattern Overlay - Tekstur & Dybde',
      headerAlignment: 'center',
      content: [
        {
          _type: 'block',
          _key: 'block-5',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Pattern overlay temaet tilføjer en subtil mønster tekstur i baggrunden. Det giver visuelt dybde uden at distrahere fra indholdet.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      settings: {
        theme: 'pattern',
        padding: 'medium'
      }
    },
    {
      _type: 'pageSection',
      _key: 'with-image',
      title: 'Med Billede - Visuel Fortælling',
      headerAlignment: 'left',
      content: [
        {
          _type: 'block',
          _key: 'block-6',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Sektioner med billeder har nu forbedrede hover effekter, skygger og animationer. Billedet skalerer let ved hover og har en gradient overlay effekt.',
              marks: []
            }
          ],
          markDefs: []
        }
      ],
      image: {
        _type: 'image',
        asset: {
          _ref: 'image-placeholder',
          _type: 'reference'
        },
        alt: 'Vindmøller i dansk landskab'
      },
      imagePosition: 'right',
      cta: {
        text: 'Læs Mere Om Grøn Energi',
        url: '/groen-energi'
      },
      settings: {
        theme: 'subtle',
        padding: 'large'
      }
    }
  ]

  return (
    <div className="min-h-screen">
      <div className="py-12 px-4 text-center bg-gradient-to-b from-brand-green/10 to-white">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4">
          PageSection Design Showcase
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Demonstrerer de nye visuelle forbedringer til PageSection komponenten
        </p>
      </div>
      
      {showcaseSections.map((section) => (
        <PageSectionComponent key={section._key} section={section} />
      ))}
      
      <div className="py-8 px-4 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Design Forbedringer</h2>
        <ul className="text-left max-w-2xl mx-auto space-y-2 text-gray-600">
          <li>• 8 forskellige temaer: default, light, brand, dark, subtle, accent, pattern</li>
          <li>• Gradient baggrunde og mønstre for visuel interesse</li>
          <li>• Forbedrede animationer med Framer Motion</li>
          <li>• Hover effekter på billeder med skalering og gradient overlay</li>
          <li>• Dekorative elementer som understreger og gradient accenter</li>
          <li>• Forbedrede CTA knapper med shimmer effekter</li>
          <li>• Responsive spacing og typography hierarki</li>
          <li>• Valgfri sektions separatorer</li>
        </ul>
      </div>
    </div>
  )
}

export default PageSectionShowcase