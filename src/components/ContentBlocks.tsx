import React from 'react'
import { PageSection, FAQItem, PriceExampleTable, VideoSection, FaqGroup, RichTextSection, CallToActionSection, LivePriceGraph, RealPriceComparisonTable, RenewableEnergyForecast, CO2EmissionsChart, DeclarationProduction, ConsumptionMap, PriceCalculator, HeroWithCalculator, ContentBlock, MonthlyProductionChartBlock, ProviderListBlock, FeatureListBlock, ValuePropositionBlock } from '@/types/sanity'
import { debug } from '@/utils/debug'
import PageSectionComponent from './PageSectionComponent'
import FAQItemComponent from './FAQItemComponent'
import PriceExampleTableComponent from './PriceExampleTableComponent'
import VideoSectionComponent from './VideoSectionComponent'
import FaqGroupComponent from './FaqGroupComponent'
import RichTextSectionComponent from './RichTextSectionComponent'
import CallToActionSectionComponent from './CallToActionSectionComponent'
import LivePriceGraphComponent from './LivePriceGraphComponent'
import RealPriceComparisonTableComponent from './RealPriceComparisonTable'
import RenewableEnergyForecastComponent from './RenewableEnergyForecast'
import CO2EmissionsChartComponent from './CO2EmissionsChart'
import DeclarationProductionChart from './DeclarationProductionChart'
import ConsumptionMapComponent from './ConsumptionMap'
import PriceCalculatorWidget from './PriceCalculatorWidget'
import HeroSection from './HeroSection'
import MonthlyProductionChart from './MonthlyProductionChart'
import ProviderList from './ProviderList'
import { FeatureListComponent } from './FeatureListComponent'
import { ValuePropositionComponent } from './ValuePropositionComponent'
import HeroComponent from './HeroComponent'

interface ContentBlocksProps {
  blocks: ContentBlock[]
}

// Component registration check
debug.component('ContentBlocks', 'Component loaded', {
  ConsumptionMapComponentImported: !!ConsumptionMapComponent,
  hasDebugUtil: true
});

const ContentBlocks: React.FC<ContentBlocksProps> = ({ blocks }) => {
  // Debug: Log all block types
  debug.log('ContentBlocks received blocks:', blocks.map(b => ({ 
    type: b._type, 
    key: b._key,
    hasType: '_type' in b,
    typeValue: b._type
  })));

  // Group consecutive FAQ items together
  const groupedBlocks: Array<ContentBlock | FAQItem[]> = []
  let currentFAQGroup: FAQItem[] = []

  blocks.forEach((block, index) => {
    
    if (block._type === 'faqItem') {
      currentFAQGroup.push(block as FAQItem)
    } else {
      if (currentFAQGroup.length > 0) {
        groupedBlocks.push([...currentFAQGroup])
        currentFAQGroup = []
      }
      groupedBlocks.push(block)
    }
  })

  // Don't forget the last FAQ group
  if (currentFAQGroup.length > 0) {
    groupedBlocks.push([...currentFAQGroup])
  }


  return (
    <div className="space-y-6">
      {groupedBlocks.map((block, index) => {
        debug.trace(`Rendering block ${index}`, { 
          isArray: Array.isArray(block),
          type: Array.isArray(block) ? 'FAQ Group' : (block as any)._type 
        });
        
        if (Array.isArray(block)) {
          // This is a group of FAQ items
          return (
            <section key={index} className="container mx-auto px-4 py-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-6">Ofte stillede spørgsmål</h2>
              <div className="max-w-3xl">
                {block.map((faqItem) => (
                  <FAQItemComponent key={faqItem._key} item={faqItem} />
                ))}
              </div>
            </section>
          )
        } else if (block._type === 'faqGroup') {
          return <FaqGroupComponent key={block._key} block={block as FaqGroup} />
        } else if (block._type === 'priceExampleTable') {
          return <PriceExampleTableComponent key={block._key} block={block as PriceExampleTable} />
        } else if (block._type === 'videoSection') {
          return <VideoSectionComponent key={block._key} block={block as VideoSection} />
        } else if (block._type === 'richTextSection') {
          return <RichTextSectionComponent key={block._key} block={block as RichTextSection} />
        } else if (block._type === 'callToActionSection') {
          return <CallToActionSectionComponent key={block._key} block={block as CallToActionSection} />
        } else if (block._type === 'livePriceGraph') {
          return <LivePriceGraphComponent key={block._key} block={block as LivePriceGraph} />
        } else if (block._type === 'realPriceComparisonTable') {
          return <RealPriceComparisonTableComponent key={block._key} block={block as RealPriceComparisonTable} />
        } else if (block._type === 'renewableEnergyForecast') {
          return <RenewableEnergyForecastComponent key={block._key} block={block as RenewableEnergyForecast} />
        } else if (block._type === 'co2EmissionsChart') {
          return <CO2EmissionsChartComponent key={block._key} block={block as CO2EmissionsChart} />
        } else if (block._type === 'declarationProduction') {
          return <DeclarationProductionChart key={block._key} block={block as DeclarationProduction} />
        } else if (block._type === 'consumptionMap') {
          debug.component('ConsumptionMap', 'Type matched!', block);
          try {
            return <ConsumptionMapComponent key={block._key} block={block as ConsumptionMap} />
          } catch (error) {
            debug.error('Error rendering ConsumptionMap:', error);
            return (
              <div key={block._key} className="bg-red-100 p-4 rounded">
                <p>Error loading consumption map: {String(error)}</p>
              </div>
            )
          }
        } else if (block._type === 'municipalityConsumptionMap') {
          debug.component('MunicipalityConsumptionMap', 'Type matched!', block);
          try {
            return <ConsumptionMapComponent key={block._key} block={block as ConsumptionMap} />
          } catch (error) {
            debug.error('Error rendering MunicipalityConsumptionMap:', error);
            return (
              <div key={block._key} className="bg-red-100 p-4 rounded">
                <p>Error loading municipality consumption map: {String(error)}</p>
              </div>
            )
          }
        } else if (block._type === 'priceCalculator') {
          return <PriceCalculatorWidget key={block._key} block={block as PriceCalculator} />
        } else if (block._type === 'heroWithCalculator') {
          return <HeroSection key={block._key} />
        } else if (block._type === 'hero') {
          return <HeroComponent key={block._key} block={block} />
        } else if (block._type === 'monthlyProductionChart') {
          return <MonthlyProductionChart key={block._key} block={block as MonthlyProductionChartBlock} />
        } else if (block._type === 'providerList') {
          return <ProviderList key={block._key} block={block as ProviderListBlock} />
        } else if (block._type === 'featureList') {
          return <FeatureListComponent key={block._key} block={block as FeatureListBlock} />
        } else if (block._type === 'valueProposition') {
          return <ValuePropositionComponent key={block._key} block={block as ValuePropositionBlock} />
        } else if (block._type === 'pageSection') {
          return <PageSectionComponent key={block._key} section={block as PageSection} />
        } else {
          // Handle unknown block types with a clear error message instead of silent fallback
          const unknownBlock = block as ContentBlock & { _type: string; _key?: string }
          
          // Log detailed information about the unknown block
          debug.error('Unknown content block type:', {
            type: unknownBlock._type,
            typeLength: unknownBlock._type?.length,
            typeCharCodes: unknownBlock._type ? Array.from(unknownBlock._type).map(c => c.charCodeAt(0)) : [],
            hasWhitespace: unknownBlock._type?.includes(' '),
            trimmedType: unknownBlock._type?.trim(),
            fullBlock: unknownBlock
          });
          
          // Check if it's a case sensitivity issue
          const lowerType = unknownBlock._type?.toLowerCase();
          if (lowerType === 'consumptionmap') {
            debug.warn('Case sensitivity issue detected! Type is:', unknownBlock._type);
          }
          
          return (
            <div key={unknownBlock._key || `unknown-${index}`} className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg mx-4 my-4">
              <h3 className="font-bold text-lg mb-2">⚠️ Unknown Component Type</h3>
              <p className="mb-2"><strong>Block Type:</strong> <code className="bg-red-200 px-2 py-1 rounded">{unknownBlock._type}</code></p>
              <p className="text-sm">This component type needs to be added to ContentBlocks.tsx renderer.</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium">Show Block Data</summary>
                <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(unknownBlock, null, 2)}
                </pre>
              </details>
            </div>
          )
        }
      })}
    </div>
  )
}

export default ContentBlocks
