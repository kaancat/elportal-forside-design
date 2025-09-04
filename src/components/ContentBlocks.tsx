'use client'

import React from 'react'
// import { div } from 'framer-motion' // Temporarily disabled for Next.js compatibility
import { PageSection, FAQItem, VideoSection, FaqGroup, RichTextSection, CallToActionSection, LivePriceGraph, RealPriceComparisonTable, RenewableEnergyForecast, CO2EmissionsChart, DeclarationProduction, DeclarationGridmix as DeclarationGridmixType, ConsumptionMap, PriceCalculator, HeroWithCalculator, ContentBlock, MonthlyProductionChartBlock, ProviderListBlock, FeatureListBlock, ValuePropositionBlock } from '@/types/sanity'
import PageSectionComponent from './PageSectionComponent'
import FAQItemComponent from './FAQItemComponent'
import VideoSectionComponent from './VideoSectionComponent'
import FaqGroupComponent from './FaqGroupComponent'
import RichTextSectionComponent from './RichTextSectionComponent'
import CallToActionSectionComponent from './CallToActionSectionComponent'
import LivePriceGraphComponent from './LivePriceGraphComponent'
import RealPriceComparisonTableComponent from './RealPriceComparisonTable'
import RenewableEnergyForecastComponent from './RenewableEnergyForecast'
import CO2EmissionsChartComponent from './CO2EmissionsChart'
import DeclarationProductionChart from './DeclarationProductionChart'
import DeclarationGridmix from './DeclarationGridmix'
import ConsumptionMapComponent from './ConsumptionMap'
import { ForbrugTracker } from './forbrugTracker/ForbrugTracker'
import PriceCalculatorWidget from './PriceCalculatorWidget'
import HeroSection from './HeroSection'
import MonthlyProductionChart from './MonthlyProductionChart'
import ProviderList from './ProviderList'
import { FeatureListComponent } from './FeatureListComponent'
import { ValuePropositionComponent } from './ValuePropositionComponent'
import HeroComponent from './HeroComponent'
import { ApplianceCalculatorSection } from './ApplianceCalculatorSection'
import { EnergyTipsSection } from './EnergyTipsSection'
import ChargingBoxShowcase, { ChargingBoxShowcaseBlock } from './ChargingBoxShowcase'
import RegionalComparison from './RegionalComparison'
import PricingComparison from './PricingComparison'
import DailyPriceTimeline from './DailyPriceTimeline'
import InfoCardsSection from './InfoCardsSection'
// import { ForbrugTracker } from './forbrugTracker/ForbrugTracker' // TODO: Add to ContentBlock type
import ErrorBoundary from './ErrorBoundary'
import { ContentErrorFallback, ChartErrorFallback, CalculatorErrorFallback } from './ErrorFallbacks'
import { reportError } from '@/lib/errorReporting'

interface ContentBlocksProps {
  blocks: ContentBlock[]
  enableErrorBoundaries?: boolean
}

// Component wrapper with error boundary for different content types
const SafeContentBlock: React.FC<{
  block: ContentBlock | FAQItem[];
  index: number;
}> = ({ block, index }) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    reportError(error, {
      component: 'ContentBlock',
      action: 'render',
      props: { 
        blockType: Array.isArray(block) ? 'faqGroup' : block._type,
        blockIndex: index 
      }
    });
  };

  const getErrorFallback = (blockType: string) => {
    // Return appropriate error fallback based on content type
    switch (blockType) {
      case 'livePriceGraph':
      case 'realPriceComparisonTable':
      case 'renewableEnergyForecast':
      case 'co2EmissionsChart':
      case 'declarationProduction':
      case 'declarationGridmix':
      case 'monthlyProductionChart':
      case 'consumptionMap':
        return <ChartErrorFallback 
          onRetry={() => window.location.reload()} 
          title="Diagram kunne ikke indlæses"
        />;
      
      case 'priceCalculator':
      case 'heroWithCalculator':
      case 'applianceCalculator':
        return <CalculatorErrorFallback 
          onRetry={() => window.location.reload()}
          onReset={() => window.location.reload()}
        />;
      
      default:
        return <ContentErrorFallback 
          onRetry={() => window.location.reload()}
          message="Dette indhold kunne ikke vises"
        />;
    }
  };

  if (Array.isArray(block)) {
    // FAQ group
    return (
      <ErrorBoundary
        level="component"
        fallback={getErrorFallback('faqGroup')}
        onError={handleError}
      >
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6">Ofte stillede spørgsmål</h2>
          <div className="max-w-3xl">
            {block.map((faqItem, faqIndex) => (
              <ErrorBoundary
                key={faqItem?._key || `faq-${faqIndex}`}
                level="component"
                fallback={<ContentErrorFallback message="Spørgsmål kunne ikke vises" />}
              >
                <FAQItemComponent item={faqItem} />
              </ErrorBoundary>
            ))}
          </div>
        </section>
      </ErrorBoundary>
    );
  }

  const blockType = block._type;
  const fallback = getErrorFallback(blockType);

  return (
    <ErrorBoundary
      level="component"
      fallback={fallback}
      onError={handleError}
    >
      {renderContentBlock(block)}
    </ErrorBoundary>
  );
};

// Render individual content block
const renderContentBlock = (block: ContentBlock) => {
  // Temporary type guard until all schema unions are fully aligned in TS
  if ((block as any)?._type === 'forbrugTracker') {
    const anyBlock: any = block as any
    const description = Array.isArray(anyBlock?.description) ? '' : anyBlock?.description
    return (
      <ForbrugTracker 
        title={(block as any).title}
        description={description}
        headerAlignment={(block as any).headerAlignment}
      />
    )
  }
  switch (block._type) {
    case 'faqGroup':
      return <FaqGroupComponent block={block as FaqGroup} />;
    
    case 'videoSection':
      return <VideoSectionComponent block={block as VideoSection} />;
    
    case 'richTextSection':
      return <RichTextSectionComponent block={block as RichTextSection} />;
    
    case 'callToActionSection':
      return <CallToActionSectionComponent block={block as CallToActionSection} />;
    
    case 'livePriceGraph':
      return <LivePriceGraphComponent block={block as LivePriceGraph} />;
    
    case 'realPriceComparisonTable':
      return <RealPriceComparisonTableComponent block={block as RealPriceComparisonTable} />;
    
    case 'renewableEnergyForecast':
      return <RenewableEnergyForecastComponent block={block as RenewableEnergyForecast} />;
    
    case 'co2EmissionsChart':
      return <CO2EmissionsChartComponent block={block as CO2EmissionsChart} />;
    
    case 'declarationProduction':
      return <DeclarationProductionChart block={block as DeclarationProduction} />;
    
    case 'declarationGridmix':
      return <DeclarationGridmix block={block as DeclarationGridmixType} />;
    
    case 'priceCalculator':
      return <PriceCalculatorWidget block={block as PriceCalculator} />;
    
    case 'heroWithCalculator':
      return <HeroSection block={block as HeroWithCalculator} />;
    
    case 'hero':
      return <HeroComponent block={block} />;
    
    case 'monthlyProductionChart':
      return <MonthlyProductionChart block={block as MonthlyProductionChartBlock} />;
    
    case 'providerList':
      return <ProviderList block={block as ProviderListBlock} />;
    
    case 'featureList':
      return <FeatureListComponent block={block as FeatureListBlock} />;
    
    case 'valueProposition':
      return <ValuePropositionComponent block={block as ValuePropositionBlock} />;
    
    case 'consumptionMap':
      return <ConsumptionMapComponent block={block as ConsumptionMap} />;
    
    
    case 'pageSection':
      return <PageSectionComponent section={block as PageSection} />;
    
    case 'applianceCalculator':
      return <ApplianceCalculatorSection block={block} />;
    
    case 'energyTipsSection':
      return <EnergyTipsSection block={block} />;
    
    case 'chargingBoxShowcase':
      return <ChargingBoxShowcase block={block as ChargingBoxShowcaseBlock} />;
    
    case 'regionalComparison':
      return <RegionalComparison block={block} />;
    
    case 'pricingComparison':
      return <PricingComparison block={block} />;
    
    case 'dailyPriceTimeline':
      return <DailyPriceTimeline block={block} />;
    
    case 'infoCardsSection':
      return <InfoCardsSection block={block} />;
    
    // TODO: Add forbrugTracker to ContentBlock type union in sanity.ts
    // case 'forbrugTracker':
    //   return <ForbrugTracker {...(block as any)} />;
    
    default:
      // Handle unknown block types
      const unknownBlock = block as any;
      console.warn('Unknown content block type:', unknownBlock._type);
      
      return (
        <div className="p-4 border border-yellow-300 rounded-lg bg-yellow-50 text-center">
          <p className="text-yellow-800 font-medium">Ukendt indholdstype</p>
          <p className="text-yellow-600 text-sm mt-1">
            Indholdstypen "{unknownBlock._type}" er ikke understøttet.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2 text-left">
              <summary className="cursor-pointer text-yellow-600 hover:underline">
                Debug info (kun i udvikling)
              </summary>
              <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto">
                {JSON.stringify(unknownBlock, null, 2)}
              </pre>
            </details>
          )}
        </div>
      );
  }
};

const ContentBlocks: React.FC<ContentBlocksProps> = ({ blocks, enableErrorBoundaries = false }) => {

  // Group consecutive FAQ items together
  const groupedBlocks: Array<ContentBlock | FAQItem[]> = [];
  let currentFAQGroup: FAQItem[] = [];

  // Filter out null/undefined blocks first
  const validBlocks = blocks.filter(Boolean);
  
  validBlocks.forEach((block, index) => {
    if (block._type === 'faqItem') {
      currentFAQGroup.push(block as FAQItem);
    } else {
      if (currentFAQGroup.length > 0) {
        groupedBlocks.push([...currentFAQGroup]);
        currentFAQGroup = [];
      }
      groupedBlocks.push(block);
    }
  });

  // Don't forget the last FAQ group
  if (currentFAQGroup.length > 0) {
    groupedBlocks.push([...currentFAQGroup]);
  }

  const handleContentError = (error: Error, errorInfo: React.ErrorInfo) => {
    reportError(error, {
      component: 'ContentBlocks',
      action: 'render_content',
      props: { blocksCount: blocks.length }
    });
  };

  // If error boundaries are enabled, wrap with error boundary
  if (enableErrorBoundaries) {
    return (
      <ErrorBoundary
        level="component"
        onError={handleContentError}
        fallback={
          <div className="container mx-auto px-4 py-8 text-center">
            <ContentErrorFallback 
              onRetry={() => window.location.reload()}
              message="Siden kunne ikke indlæses korrekt"
            />
          </div>
        }
      >
        <div>
          {groupedBlocks.map((block, index) => {
            // Determine spacing for this block
            const nextBlock = groupedBlocks[index + 1];
            const isDataVisualization = !Array.isArray(block) && ['livePriceGraph', 'co2EmissionsChart', 'renewableEnergyForecast', 'monthlyProductionChart', 'realPriceComparisonTable'].includes(block._type);
            const nextIsDataVisualization = nextBlock && !Array.isArray(nextBlock) && ['livePriceGraph', 'co2EmissionsChart', 'renewableEnergyForecast', 'monthlyProductionChart', 'realPriceComparisonTable'].includes(nextBlock._type);
            const isPageSection = !Array.isArray(block) && block._type === 'pageSection';
            
            // Remove spacing between components to prevent gaps when backgrounds are used
            // Components handle their own internal padding
            const spacingClass = 'mb-0';
            
            // Generate unique layoutId for each block to prevent remounting
            const layoutId = Array.isArray(block) 
              ? `faq-group-${index}` 
              : `${block._type}-${block._key || index}`;
            
            return (
              <div key={layoutId} className={spacingClass}>
                <SafeContentBlock 
                  block={block} 
                  index={index} 
                />
              </div>
            );
          })}
        </div>
      </ErrorBoundary>
    );
  }

  // Default rendering without error boundaries
  return (
    <div>
      {groupedBlocks.map((block, index) => {
        // Determine spacing for this block
        const nextBlock = groupedBlocks[index + 1];
        const isDataVisualization = !Array.isArray(block) && ['livePriceGraph', 'co2EmissionsChart', 'renewableEnergyForecast', 'monthlyProductionChart', 'realPriceComparisonTable'].includes(block._type);
        const nextIsDataVisualization = nextBlock && !Array.isArray(nextBlock) && ['livePriceGraph', 'co2EmissionsChart', 'renewableEnergyForecast', 'monthlyProductionChart', 'realPriceComparisonTable'].includes(nextBlock._type);
        const isPageSection = !Array.isArray(block) && block._type === 'pageSection';
        
        // Remove spacing between components to prevent gaps when backgrounds are used
        // Components handle their own internal padding
        const spacingClass = 'mb-0';
        
        // Generate unique layoutId for each block to prevent remounting
        const layoutId = Array.isArray(block) 
          ? `faq-group-${index}` 
          : `${block._type}-${block._key || index}`;
        
        return (
          <div key={layoutId} className={spacingClass}>
            {Array.isArray(block) ? (
              // This is a group of FAQ items
              <section className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-brand-dark mb-6">Ofte stillede spørgsmål</h2>
                <div className="max-w-3xl">
                  {block.map((faqItem, faqIndex) => (
                    <FAQItemComponent key={faqItem?._key || `faq-${faqIndex}`} item={faqItem} />
                  ))}
                </div>
              </section>
            ) : (
              renderContentBlock(block)
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ContentBlocks
