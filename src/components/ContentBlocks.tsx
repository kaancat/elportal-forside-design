import React from 'react'
import { PageSection, FAQItem, PriceExampleTable, VideoSection, FaqGroup, RichTextSection, CallToActionSection, LivePriceGraph, RealPriceComparisonTable, RenewableEnergyForecast, CO2EmissionsChart, DeclarationProduction, DeclarationGridmix, ConsumptionMap, PriceCalculator, HeroWithCalculator, ContentBlock, MonthlyProductionChartBlock, ProviderListBlock, FeatureListBlock, ValuePropositionBlock } from '@/types/sanity'
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
import DeclarationGridmixComp from './DeclarationGridmix'
import ConsumptionMapComponent from './ConsumptionMap'
import PriceCalculatorWidget from './PriceCalculatorWidget'
import HeroSection from './HeroSection'
import MonthlyProductionChart from './MonthlyProductionChart'
import ProviderList from './ProviderList'
import { FeatureListComponent } from './FeatureListComponent'
import { ValuePropositionComponent } from './ValuePropositionComponent'
import HeroComponent from './HeroComponent'
import { ApplianceCalculatorSection } from './ApplianceCalculatorSection'
import { EnergyTipsSection } from './EnergyTipsSection'

// Debug import
if (typeof window !== 'undefined') {
  (window as any).DeclarationGridmixComp = DeclarationGridmixComp;
  console.log('[ContentBlocks] DeclarationGridmixComp imported:', DeclarationGridmixComp);
}

interface ContentBlocksProps {
  blocks: ContentBlock[]
}

// Component registration check
debug.component('ContentBlocks', 'Component loaded', {
  ConsumptionMapComponentImported: !!ConsumptionMapComponent,
  hasDebugUtil: true
});

const ContentBlocks: React.FC<ContentBlocksProps> = ({ blocks }) => {
  // Debug: Log all block types - use window.console to bypass any build optimizations
  if (typeof window !== 'undefined') {
    window.console.log('[ContentBlocks] All blocks:', blocks.map(b => ({ 
      type: b._type, 
      key: b._key,
      typeString: String(b._type),
      typeLength: b._type?.length,
      typeCharCodes: b._type ? Array.from(b._type).map(c => c.charCodeAt(0)) : []
    })));
    
    // Check specifically for declarationGridmix
    const declarationGridmixBlocks = blocks.filter(b => b._type === 'declarationGridmix');
    if (declarationGridmixBlocks.length > 0) {
      window.console.log('[ContentBlocks] Found declarationGridmix blocks:', declarationGridmixBlocks);
    }
    
    // Also check for any blocks containing 'gridmix' in the type
    const gridmixBlocks = blocks.filter(b => b._type?.includes('gridmix'));
    if (gridmixBlocks.length > 0) {
      window.console.log('[ContentBlocks] Found gridmix-related blocks:', gridmixBlocks);
    }
    
    // Check specifically for consumptionMap
    const consumptionMapBlocks = blocks.filter(b => b._type?.includes('consumption'));
    if (consumptionMapBlocks.length > 0) {
      window.console.log('[ContentBlocks] Found consumption-related blocks:', consumptionMapBlocks);
    }
  }

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
    <div>
      {groupedBlocks.map((block, index) => {
        // Determine spacing for this block
        const nextBlock = groupedBlocks[index + 1];
        const isDataVisualization = !Array.isArray(block) && ['livePriceGraph', 'co2EmissionsChart', 'renewableEnergyForecast', 'monthlyProductionChart', 'realPriceComparisonTable'].includes(block._type);
        const nextIsDataVisualization = nextBlock && !Array.isArray(nextBlock) && ['livePriceGraph', 'co2EmissionsChart', 'renewableEnergyForecast', 'monthlyProductionChart', 'realPriceComparisonTable'].includes(nextBlock._type);
        const isPageSection = !Array.isArray(block) && block._type === 'pageSection';
        
        // Use tighter spacing when pageSection is followed by data visualization
        const tightSpacing = isPageSection && nextIsDataVisualization;
        const spacingClass = tightSpacing ? 'mb-2' : (index < groupedBlocks.length - 1 ? 'mb-6' : '');
        
        return (
          <div key={Array.isArray(block) ? `faq-group-${index}` : block._key} className={spacingClass}>
            {(() => {
        // Use window.console to ensure logging works
        if (typeof window !== 'undefined' && !Array.isArray(block)) {
          window.console.log(`[Render] Block ${index} type: "${block._type}" (length: ${block._type?.length})`);
          
          // Debug declarationGridmix specifically
          if (block._type && block._type.includes('gridmix')) {
            window.console.log('[Direct Check] Found gridmix in type!', {
              type: block._type,
              exactMatch: block._type === 'declarationGridmix',
              charCodes: Array.from(block._type).map(c => c.charCodeAt(0))
            });
          }
          
          // Direct check for declarationGridmix - TEMPORARY FIX
          if (block._type === 'declarationGridmix') {
            window.console.log('[Direct Check] Found declarationGridmix! Rendering it now.');
            return <DeclarationGridmixComp key={block._key} block={block as DeclarationGridmix} />
          }
          
          // Direct check for consumptionMap
          if (block._type === 'consumptionMap') {
            window.console.log('[Direct Check] Found consumptionMap! Rendering it now.');
            return <ConsumptionMapComponent key={block._key} block={block as ConsumptionMap} />
          }
        }
        
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
        } else if (block._type === 'declarationGridmix') {
          window.console.log('[ContentBlocks] DeclarationGridmix type matched!', block);
          window.console.log('[ContentBlocks] DeclarationGridmixComp is:', DeclarationGridmixComp);
          
          if (!DeclarationGridmixComp) {
            window.console.error('[ContentBlocks] DeclarationGridmixComp is undefined!');
            return (
              <div key={block._key} className="bg-red-100 p-4 rounded">
                <p>Error: DeclarationGridmixComp component not loaded</p>
              </div>
            );
          }
          
          try {
            return <DeclarationGridmixComp key={block._key} block={block as DeclarationGridmix} />
          } catch (error) {
            window.console.error('[ContentBlocks] Error rendering DeclarationGridmix:', error);
            return (
              <div key={block._key} className="bg-red-100 p-4 rounded">
                <p>Error loading declaration gridmix: {String(error)}</p>
              </div>
            )
          }
        } else if (block._type === 'consumptionMap') {
          window.console.log('[ContentBlocks] ConsumptionMap type matched!', block);
          try {
            return <ConsumptionMapComponent key={block._key} block={block as ConsumptionMap} />
          } catch (error) {
            window.console.error('[ContentBlocks] Error rendering ConsumptionMap:', error);
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
        } else if (block._type === 'applianceCalculator') {
          return <ApplianceCalculatorSection key={block._key} block={block} />
        } else if (block._type === 'energyTipsSection') {
          return <EnergyTipsSection key={block._key} block={block} />
        } else {
          // Handle unknown block types with a clear error message instead of silent fallback
          const unknownBlock = block as ContentBlock & { _type: string; _key?: string }
          
          // Force logging using window.console
          if (typeof window !== 'undefined') {
            window.console.error('[Unknown Block] Detailed info:', {
              type: unknownBlock._type,
              typeofType: typeof unknownBlock._type,
              exactString: `"${unknownBlock._type}"`,
              charCodes: unknownBlock._type ? Array.from(unknownBlock._type).map(c => `${c}(${c.charCodeAt(0)})`) : [],
              equals_consumptionMap: unknownBlock._type === 'consumptionMap',
              includes_consumption: unknownBlock._type?.includes('consumption'),
              blockKeys: Object.keys(unknownBlock || {}),
              fullBlock: JSON.stringify(unknownBlock, null, 2)
            });
          }
          
          // TEMPORARY: Force render for gridmix if type contains 'gridmix'
          if (unknownBlock._type && unknownBlock._type.includes('gridmix')) {
            window.console.warn('[ContentBlocks] Forcing DeclarationGridmix render for:', unknownBlock._type);
            try {
              return <DeclarationGridmixComp key={unknownBlock._key} block={unknownBlock as any} />
            } catch (error) {
              window.console.error('[ContentBlocks] Force render DeclarationGridmix failed:', error);
            }
          }
          
          // TEMPORARY: Force render ConsumptionMap if type contains 'consumptionMap'
          if (unknownBlock._type && unknownBlock._type.includes('consumptionMap')) {
            window.console.warn('[ContentBlocks] Forcing ConsumptionMap render for:', unknownBlock._type);
            try {
              return <ConsumptionMapComponent key={unknownBlock._key} block={unknownBlock as any} />
            } catch (error) {
              window.console.error('[ContentBlocks] Force render failed:', error);
            }
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
              })()}
            </div>
        );
      })}
    </div>
  )
}

export default ContentBlocks
