import React from 'react'
import { PageSection, FAQItem, PriceExampleTable, VideoSection, FaqGroup, RichTextSection, CallToActionSection, LivePriceGraph, RealPriceComparisonTable, RenewableEnergyForecast, CO2EmissionsChart, PriceCalculator, HeroWithCalculator, ContentBlock, MonthlyProductionChartBlock, ProviderListBlock, FeatureListBlock, ValuePropositionBlock } from '@/types/sanity'
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
import PriceCalculatorWidget from './PriceCalculatorWidget'
import HeroSection from './HeroSection'
import MonthlyProductionChart from './MonthlyProductionChart'
import ProviderList from './ProviderList'
import { FeatureListComponent } from './FeatureListComponent'
import { ValuePropositionComponent } from './ValuePropositionComponent'
import HeroComponent from './HeroComponent'
import ErrorBoundary from './ErrorBoundary'
import { ContentErrorFallback, ChartErrorFallback, CalculatorErrorFallback } from './ErrorFallbacks'
import { reportError } from '@/lib/errorReporting'

interface ContentBlocksProps {
  blocks: ContentBlock[]
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
      case 'monthlyProductionChart':
        return <ChartErrorFallback 
          onRetry={() => window.location.reload()} 
          title="Diagram kunne ikke indlæses"
        />;
      
      case 'priceCalculator':
      case 'heroWithCalculator':
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
            {block.map((faqItem) => (
              <ErrorBoundary
                key={faqItem._key}
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
  switch (block._type) {
    case 'faqGroup':
      return <FaqGroupComponent block={block as FaqGroup} />;
    
    case 'priceExampleTable':
      return <PriceExampleTableComponent block={block as PriceExampleTable} />;
    
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
    
    case 'priceCalculator':
      return <PriceCalculatorWidget block={block as PriceCalculator} />;
    
    case 'heroWithCalculator':
      return <HeroSection />;
    
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
    
    case 'pageSection':
      return <PageSectionComponent section={block as PageSection} />;
    
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

const SafeContentBlocks: React.FC<ContentBlocksProps> = ({ blocks }) => {
  // Group consecutive FAQ items together
  const groupedBlocks: Array<ContentBlock | FAQItem[]> = [];
  let currentFAQGroup: FAQItem[] = [];

  blocks.forEach((block, index) => {
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
      <div className="space-y-6">
        {groupedBlocks.map((block, index) => (
          <SafeContentBlock 
            key={Array.isArray(block) ? `faq-group-${index}` : block._key} 
            block={block} 
            index={index} 
          />
        ))}
      </div>
    </ErrorBoundary>
  );
};

export default SafeContentBlocks;