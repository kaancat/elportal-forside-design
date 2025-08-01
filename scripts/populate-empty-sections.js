import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = createClient({
  projectId: 'yxesi03x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_TOKEN
});

function generateKey() {
  return Math.random().toString(36).substring(2, 15);
}

async function populateEmptySections() {
  try {
    // Fetch the page
    const page = await client.fetch('*[_type == "page" && slug.current == "hvordan-vaelger-du-elleverandoer"][0]');
    
    if (!page) {
      console.log('Page not found');
      return;
    }
    
    console.log('Found page:', page.slug?.current);
    console.log('Current content blocks:', page.contentBlocks?.length || 0);
    
    // Look for empty sections that need content
    const emptyFaqGroup = page.contentBlocks?.find(block => 
      block._type === 'faqGroup' && (!block.faqs || block.faqs.length === 0)
    );
    
    const emptyCta = page.contentBlocks?.find(block => 
      block._type === 'callToActionSection' && (!block.buttonText || !block.buttonUrl)
    );
    
    let updatedContentBlocks = [...page.contentBlocks];
    
    // Populate FAQ section
    if (emptyFaqGroup) {
      console.log('Found empty FAQ group, populating...');
      
      const faqContent = [
        {
          _key: generateKey(),
          _type: 'faq',
          question: 'Hvad skal jeg være opmærksom på, når jeg vælger elleverandør?',
          answer: [
            {
              _key: generateKey(),
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _key: generateKey(),
                  _type: 'span',
                  text: 'Når du vælger elleverandør, skal du primært fokusere på den samlede pris pr. kWh, som inkluderer både spotpris, leverandørens tillæg og alle afgifter. Vær også opmærksom på kontraktvilkår, bindingsperiode og eventuelle skjulte gebyrer.'
                }
              ]
            }
          ]
        },
        {
          _key: generateKey(),
          _type: 'faq',
          question: 'Hvordan kan jeg spare penge på min elregning?',
          answer: [
            {
              _key: generateKey(),
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _key: generateKey(),
                  _type: 'span',
                  text: 'Du kan spare penge ved at vælge den billigste elleverandør, optimere dit elforbrug til tider med lave spotpriser, og investere i energibesparende løsninger som LED-pærer og effektive hvidevarer.'
                }
              ]
            }
          ]
        },
        {
          _key: generateKey(),
          _type: 'faq',
          question: 'Kan jeg skifte elleverandør, selvom jeg har kontrakt?',
          answer: [
            {
              _key: generateKey(),
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _key: generateKey(),
                  _type: 'span',
                  text: 'Ja, du kan altid skifte elleverandør med 2 ugers varsel, selvom du har en bindingsperiode. Dog kan der være økonomiske konsekvenser som afbrudsbetaling ved kontraktbrud.'
                }
              ]
            }
          ]
        },
        {
          _key: generateKey(),
          _type: 'faq',
          question: 'Hvad er forskellen på spotpris og fast pris?',
          answer: [
            {
              _key: generateKey(),
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _key: generateKey(),
                  _type: 'span',
                  text: 'Spotpris følger den aktuelle markedspris for el og ændrer sig hver time, hvilket giver mulighed for besparelser ved fleksibelt forbrug. Fast pris er en foruddefineret pris, der giver stabilitet og forudsigelighed i din elregning.'
                }
              ]
            }
          ]
        },
        {
          _key: generateKey(),
          _type: 'faq',
          question: 'Hvorfor anbefaler I Vindstød som elleverandør?',
          answer: [
            {
              _key: generateKey(),
              _type: 'block',
              style: 'normal',
              children: [
                {
                  _key: generateKey(),
                  _type: 'span',
                  text: 'Vindstød tilbyder konkurrencedygtige priser kombineret med 100% grøn energi fra danske vindmøller. De har transparente vilkår, ingen skjulte gebyrer og fremragende kundeservice. Deres fokus på bæredygtig energi gør dem til et fremtidssikret valg.'
                }
              ]
            }
          ]
        }
      ];
      
      // Update the FAQ group
      updatedContentBlocks = updatedContentBlocks.map(block => {
        if (block._key === emptyFaqGroup._key) {
          return {
            ...block,
            heading: 'Ofte stillede spørgsmål',
            faqs: faqContent
          };
        }
        return block;
      });
    }
    
    // Populate CTA section
    if (emptyCta) {
      console.log('Found empty CTA section, populating...');
      
      updatedContentBlocks = updatedContentBlocks.map(block => {
        if (block._key === emptyCta._key) {
          return {
            ...block,
            heading: 'Tag kontrollen over dine elomkostninger i dag',
            description: [
              {
                _key: generateKey(),
                _type: 'block',
                style: 'normal',
                children: [
                  {
                    _key: generateKey(),
                    _type: 'span',
                    text: 'Brug vores gratis elberegner til at sammenligne priser og find den billigste elleverandør. Det tager kun 2 minutter at få overblik over dine besparelsesmuligheder.'
                  }
                ]
              }
            ],
            buttonText: 'Beregn dine besparelser',
            buttonUrl: '/elprisberegner'
          };
        }
        return block;
      });
    }
    
    // Update the page
    const result = await client
      .patch(page._id)
      .set({ contentBlocks: updatedContentBlocks })
      .commit();
    
    console.log('Successfully updated page:', result._id);
    console.log('Populated empty content sections');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

populateEmptySections();