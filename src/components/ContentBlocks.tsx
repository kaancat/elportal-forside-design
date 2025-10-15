'use client'

import React, { Suspense, lazy } from 'react'
// import { div } from 'framer-motion' // Temporarily disabled for Next.js compatibility
import { PageSection, FAQItem, VideoSection, PodcastEpisodeBlock, FaqGroup, RichTextSection, CallToActionSection, LivePriceGraph, RealPriceComparisonTable, RenewableEnergyForecast, CO2EmissionsChart, DeclarationProduction, DeclarationGridmix as DeclarationGridmixType, ConsumptionMap, PriceCalculator, HeroWithCalculator, ContentBlock, MonthlyProductionChartBlock, ProviderListBlock, FeatureListBlock, ValuePropositionBlock, ChargingBoxShowcaseBlock } from '@/types/sanity'
// Critical components - loaded immediately
import PageSectionComponent from './PageSectionComponent'
import FAQItemComponent from './FAQItemComponent'
import FaqGroupComponent from './FaqGroupComponent'
import RichTextSectionComponent from './RichTextSectionComponent'
import CallToActionSectionComponent from './CallToActionSectionComponent'
import HeroComponent from './HeroComponent'
import ErrorBoundary from './ErrorBoundary'
import { ContentErrorFallback, ChartErrorFallback, CalculatorErrorFallback } from './ErrorFallbacks'
import { reportError } from '@/lib/errorReporting'

// Heavy components - lazy loaded for better performance
// These components are code-split and only loaded when needed
const VideoSectionComponent = lazy(() => import('./VideoSectionComponent'))
const LivePriceGraphComponent = lazy(() => import('./LivePriceGraphComponent'))
const RealPriceComparisonTableComponent = lazy(() => import('./RealPriceComparisonTable'))
const RenewableEnergyForecastComponent = lazy(() => import('./RenewableEnergyForecast'))
const CO2EmissionsChartComponent = lazy(() => import('./CO2EmissionsChart'))
const DeclarationProductionChart = lazy(() => import('./DeclarationProductionChart'))
const DeclarationGridmix = lazy(() => import('./DeclarationGridmix'))
const ConsumptionMapComponent = lazy(() => import('./ConsumptionMap'))
const ForbrugTracker = lazy(() => import('./forbrugTracker/ForbrugTracker').then(m => ({ default: m.ForbrugTracker })))
const PriceCalculatorWidget = lazy(() => import('./PriceCalculatorWidget'))
const HeroSection = lazy(() => import('./HeroSection'))
const MonthlyProductionChart = lazy(() => import('./MonthlyProductionChart'))
const ProviderList = lazy(() => import('./ProviderList').then(m => ({ default: m.ProviderList })))
const FeatureListComponent = lazy(() => import('./FeatureListComponent').then(m => ({ default: m.FeatureListComponent })))
const ValuePropositionComponent = lazy(() => import('./ValuePropositionComponent').then(m => ({ default: m.ValuePropositionComponent })))
const ApplianceCalculatorSection = lazy(() => import('./ApplianceCalculatorSection').then(m => ({ default: m.ApplianceCalculatorSection })))
const EnergyTipsSection = lazy(() => import('./EnergyTipsSection').then(m => ({ default: m.EnergyTipsSection })))
const ChargingBoxShowcase = lazy(() => import('./ChargingBoxShowcase'))
const RegionalComparison = lazy(() => import('./RegionalComparison'))
const PricingComparison = lazy(() => import('./PricingComparison'))
const DailyPriceTimeline = lazy(() => import('./DailyPriceTimeline'))
const InfoCardsSection = lazy(() => import('./InfoCardsSection'))
const PodcastEpisode = lazy(() => import('./PodcastEpisode'))

// Loading fallback component for Suspense
// Provides visual feedback while components are being loaded
// Uses min-height skeleton to prevent Cumulative Layout Shift (CLS)
const LoadingFallback: React.FC<{ type?: string; minHeight?: string }> = ({ type, minHeight = '400px' }) => (
  <div 
    className="w-full flex items-center justify-center animate-pulse bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg" 
    style={{ minHeight }}
  >
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Indlæser {type || 'indhold'}...</p>
    </div>
  </div>
)

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

  // Normalize legacy/alternate type names to current component keys (tolerate unknown string)
  const blockType = ((block as any)._type === 'co2EmissionsDisplay') ? 'co2EmissionsChart' : block._type;
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

// Render individual content block with Suspense wrapper for lazy-loaded components
// This function determines whether each component type should be lazy-loaded or loaded immediately
const renderContentBlock = (block: ContentBlock) => {
  // Helper function to wrap lazy components with Suspense
  // Uses skeleton placeholders with min-height to prevent CLS (Cumulative Layout Shift)
  const withSuspense = (component: React.ReactNode, fallbackType?: string, minHeight: string = '400px') => (
    <Suspense fallback={<LoadingFallback type={fallbackType} minHeight={minHeight} />}>
      {component}
    </Suspense>
  );

  // Temporary type guard until all schema unions are fully aligned in TS
  if ((block as any)?._type === 'forbrugTracker') {
    const anyBlock: any = block as any
    const description = Array.isArray(anyBlock?.description) ? '' : anyBlock?.description
    return withSuspense(
      <ForbrugTracker
        title={(block as any).title}
        description={description}
        headerAlignment={(block as any).headerAlignment}
      />,
      'forbrugsdata'
    )
  }

  switch (block._type) {
    // Critical components - loaded immediately without Suspense
    case 'faqGroup':
      return <FaqGroupComponent block={block as FaqGroup} />;

    case 'richTextSection':
      return <RichTextSectionComponent block={block as RichTextSection} />;

    case 'callToActionSection':
      return <CallToActionSectionComponent block={block as CallToActionSection} />;

    case 'hero':
      return <HeroComponent block={block} />;

    case 'pageSection':
      return <PageSectionComponent section={block as PageSection} />;

    // Heavy components - lazy loaded with Suspense for code splitting
    case 'videoSection':
      return withSuspense(<VideoSectionComponent block={block as VideoSection} />, 'video');

    case 'podcastEpisode':
      return withSuspense(<PodcastEpisode block={block as PodcastEpisodeBlock} />, 'podcast');

    case 'livePriceGraph':
      return withSuspense(<LivePriceGraphComponent block={block as LivePriceGraph} />, 'prisgraf', '500px');

    case 'realPriceComparisonTable':
      return withSuspense(<RealPriceComparisonTableComponent block={block as RealPriceComparisonTable} />, 'prissammenligning', '600px');

    case 'renewableEnergyForecast':
      return withSuspense(<RenewableEnergyForecastComponent block={block as RenewableEnergyForecast} />, 'energiprognose', '500px');

    case 'co2EmissionsChart':
      return withSuspense(<CO2EmissionsChartComponent block={block as CO2EmissionsChart} />, 'CO2-data', '500px');

    case 'declarationProduction':
      return withSuspense(<DeclarationProductionChart block={block as DeclarationProduction} />, 'produktionsdata', '500px');

    case 'declarationGridmix':
      return withSuspense(<DeclarationGridmix block={block as DeclarationGridmixType} />, 'net-data', '500px');

    case 'priceCalculator':
      return withSuspense(<PriceCalculatorWidget block={block as PriceCalculator} />, 'beregner', '650px');

    case 'heroWithCalculator':
      return withSuspense(<HeroSection block={block as HeroWithCalculator} />, 'beregner', '700px');

    case 'monthlyProductionChart':
      return withSuspense(<MonthlyProductionChart block={block as MonthlyProductionChartBlock} />, 'produktionsgraf', '500px');

    case 'providerList':
      return withSuspense(<ProviderList block={block as ProviderListBlock} />, 'udbyderliste', '800px');

    case 'featureList':
      return withSuspense(<FeatureListComponent block={block as FeatureListBlock} />, 'funktioner');

    case 'valueProposition':
      return withSuspense(<ValuePropositionComponent block={block as ValuePropositionBlock} />, 'værditilbud');

    case 'consumptionMap':
      return withSuspense(<ConsumptionMapComponent block={block as ConsumptionMap} />, 'forbrugskort');

    case 'applianceCalculator':
      return withSuspense(<ApplianceCalculatorSection block={block} />, 'apparatberegner');

    case 'energyTipsSection':
      return withSuspense(<EnergyTipsSection block={block} />, 'energitips');

    case 'chargingBoxShowcase':
      return withSuspense(<ChargingBoxShowcase block={block as ChargingBoxShowcaseBlock} />, 'ladeboks');

    case 'regionalComparison':
      return withSuspense(<RegionalComparison block={block} />, 'regional sammenligning');

    case 'pricingComparison':
      return withSuspense(<PricingComparison block={block} />, 'prissammenligning');

    case 'dailyPriceTimeline':
      return withSuspense(<DailyPriceTimeline block={block} />, 'daglige priser');

    case 'infoCardsSection':
      return withSuspense(<InfoCardsSection block={block} />, 'info');

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
              <div
                key={layoutId}
                className={spacingClass}
                {...(!Array.isArray(block) && {
                  'data-block-type': (block as any)._type,
                  'data-block-key': (block as any)._key || String(index),
                })}
              >
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
          <div
            key={layoutId}
            className={spacingClass}
            {...(!Array.isArray(block) && {
              'data-block-type': (block as any)._type,
              'data-block-key': (block as any)._key || String(index),
            })}
          >
            {Array.isArray(block) ? (
              // This is a group of FAQ items
              <section className="container mx-auto px-4 py-8" data-block-type="faqGroup" data-block-key={`faq-group-${index}`}>
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
