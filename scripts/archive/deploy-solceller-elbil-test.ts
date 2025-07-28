import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
})

const solcellerElbilPage = {
  _id: 'page.solceller-og-elbil',
  _type: 'page',
  title: 'Solceller og Elbil - Den Perfekte Kombination',
  slug: {
    _type: 'slug',
    current: 'solceller-og-elbil'
  },
  // SEO fields using exact schema field names
  seoMetaTitle: 'Solceller og Elbil - Spar Penge på Grøn Energi | ElPortal',
  seoMetaDescription: 'Lær hvordan solceller og elbil kan arbejde sammen om at reducere dine energiomkostninger og CO2-aftryk. Få tips til optimal udnyttelse.',
  seoKeywords: ['solceller', 'elbil', 'grøn energi', 'opladning', 'solenergi'],
  
  contentBlocks: [
    // Hero section
    {
      _type: 'hero',
      _key: 'hero-1',
      headline: 'Solceller og Elbil - En Bæredygtig Fremtid',
      subheadline: 'Oplad din elbil med gratis solenergi og reducer både elregning og CO2-udledning'
    },
    
    // Main content section
    {
      _type: 'pageSection',
      _key: 'section-1',
      title: 'Hvorfor Solceller og Elbil er det Perfekte Match',
      headerAlignment: 'center',
      content: [
        {
          _type: 'block',
          _key: 'block-1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span-1',
              text: 'Kombinationen af solceller og elbil repræsenterer fremtidens energiløsning for danske husstande. Med stigende elpriser og øget fokus på bæredygtighed, giver det mere mening end nogensinde at producere sin egen strøm.'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block-2',
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: 'span-2',
              text: 'Økonomiske Fordele'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block-3',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span-3',
              text: 'En gennemsnitlig dansk husstand kan spare 15.000-25.000 kr. årligt ved at kombinere solceller med elbil. Solcellerne producerer strøm i dagtimerne, hvor mange elbiler står parkeret hjemme og kan oplades direkte med solenergi.'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block-4',
          style: 'h3',
          children: [
            {
              _type: 'span',
              _key: 'span-4',
              text: 'Miljømæssige Fordele'
            }
          ]
        },
        {
          _type: 'block',
          _key: 'block-5',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'span-5',
              text: 'Ved at oplade din elbil med solenergi reducerer du CO2-udledningen med op til 2.500 kg årligt sammenlignet med benzinbil. Samtidig bidrager du til Danmarks grønne omstilling ved at reducere belastningen på elnettet i spidsbelastningsperioder.'
            }
          ]
        }
      ]
    },
    
    // Value proposition
    {
      _type: 'valueProposition',
      _key: 'value-prop-1',
      title: 'Fordele ved Solceller og Elbil',
      items: [
        {
          _type: 'valueItem',
          _key: 'item-1',
          icon: {
            _type: 'icon.manager',
            name: 'solar-panel',
            provider: 'lucide'
          },
          text: 'Gratis strøm til din elbil i 25+ år'
        },
        {
          _type: 'valueItem',
          _key: 'item-2',
          icon: {
            _type: 'icon.manager',
            name: 'piggy-bank',
            provider: 'lucide'
          },
          text: 'Spar op til 25.000 kr. årligt på energi'
        },
        {
          _type: 'valueItem',
          _key: 'item-3',
          icon: {
            _type: 'icon.manager',
            name: 'leaf',
            provider: 'lucide'
          },
          text: 'Reducer CO2-udledning med 2.500 kg/år'
        },
        {
          _type: 'valueItem',
          _key: 'item-4',
          icon: {
            _type: 'icon.manager',
            name: 'trending-up',
            provider: 'lucide'
          },
          text: 'Øg boligens værdi med grøn teknologi'
        }
      ]
    },
    
    // Call to action
    {
      _type: 'callToActionSection',
      _key: 'cta-1',
      title: 'Klar til at spare på din elregning?',
      buttonText: 'Find din elaftale nu',
      buttonUrl: '/elpriser'
    }
  ]
}

async function deployPage() {
  try {
    console.log('Deploying Solceller og Elbil test page...')
    
    const result = await client.createOrReplace(solcellerElbilPage)
    
    console.log('✅ Page deployed successfully!')
    console.log('Page ID:', result._id)
    console.log('View at: https://dinelportal.sanity.studio/structure/page;page.solceller-og-elbil')
    
  } catch (error) {
    console.error('❌ Deployment failed:', error)
  }
}

// Uncomment to run deployment
// deployPage()

// Export for verification
export { solcellerElbilPage }