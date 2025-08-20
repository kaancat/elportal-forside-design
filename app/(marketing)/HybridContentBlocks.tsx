/**
 * Hybrid Content Blocks
 * Renders SSR shells for SEO with client components for interactivity
 * This combines the best of both worlds - server and client rendering
 */

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Import SSR shells (these are server components)
import { LivePriceGraphShell } from '@/components/charts/shells/LivePriceGraphShell'
import { PriceCalculatorShell } from '@/components/calculators/shells/PriceCalculatorShell'
import { ProviderListShell } from '@/components/providers/shells/ProviderListShell'
import { CO2EmissionsShell } from '@/components/charts/shells/CO2EmissionsShell'
import { RenewableEnergyShell } from '@/components/charts/shells/RenewableEnergyShell'
import { MonthlyProductionShell } from '@/components/charts/shells/MonthlyProductionShell'
import { DailyPriceTimelineShell } from '@/components/charts/shells/DailyPriceTimelineShell'
import { ConsumptionMapShell } from './shells/ConsumptionMapShell'
import { ApplianceCalculatorShell } from './shells/ApplianceCalculatorShell'
import { ForbrugTrackerShell } from './shells/ForbrugTrackerShell'
import { DeclarationProductionShell } from '@/components/charts/shells/DeclarationProductionShell'
import { DeclarationGridmixShell } from '@/components/charts/shells/DeclarationGridmixShell'

// New shell imports for Phase 5 fixes
import RegionalComparisonShell from '@/components/charts/shells/RegionalComparisonShell'
import EnergyTipsSectionShell from '@/components/charts/shells/EnergyTipsSectionShell'
import VideoSectionShell from '@/components/charts/shells/VideoSectionShell'
import RealPriceComparisonShell from '@/components/charts/shells/RealPriceComparisonShell'
import LocationSelectorShell from '@/components/charts/shells/LocationSelectorShell'

// Import server components directly
import ServerContentBlocks from './ServerContentBlocks'

// Dynamically import client components with shells as loading states
const LivePriceGraphClient = dynamic(
  () => import('@/components/LivePriceGraphComponent'),
  { 
    ssr: false,
    loading: () => null // Shell handles loading state
  }
)

const PriceCalculatorClient = dynamic(
  () => import('@/components/PriceCalculatorWidget'),
  { 
    ssr: false,
    loading: () => null // Shell handles loading state
  }
)

const ProviderListClient = dynamic(
  () => import('@/components/ProviderList').then(mod => ({ default: mod.ProviderList })),
  { 
    ssr: false,
    loading: () => null // Shell handles loading state
  }
)

// Priority 2 charts with shells
const CO2EmissionsChart = dynamic(() => import('@/components/CO2EmissionsChart'), {
  ssr: false,
  loading: () => null // Shell handles loading state
})

const MonthlyProductionChart = dynamic(() => import('@/components/MonthlyProductionChart'), {
  ssr: false,
  loading: () => null // Shell handles loading state
})

const RenewableEnergyForecast = dynamic(() => import('@/components/RenewableEnergyForecast'), {
  ssr: false,
  loading: () => null // Shell handles loading state
})

const DailyPriceTimeline = dynamic(() => import('@/components/DailyPriceTimeline'), {
  ssr: false,
  loading: () => null // Shell handles loading state
})

// Priority 3 interactive components with shells
const ConsumptionMap = dynamic(() => import('@/components/ConsumptionMap'), {
  ssr: false,
  loading: () => null // Shell handles loading state
})

const ApplianceCalculatorSection = dynamic(
  () => import('@/components/ApplianceCalculatorSection').then(m => m.ApplianceCalculatorSection),
  {
    ssr: false,
    loading: () => null // Shell handles loading state
  }
)

const ForbrugTracker = dynamic(
  () => import('@/components/forbrugTracker/ForbrugTracker').then(m => m.ForbrugTracker),
  {
    ssr: false,
    loading: () => null // Shell handles loading state
  }
)

const DeclarationProductionChart = dynamic(
  () => import('@/components/DeclarationProductionChart'),
  {
    ssr: false,
    loading: () => null // Shell handles loading state
  }
)

const DeclarationGridmix = dynamic(
  () => import('@/components/DeclarationGridmix'),
  {
    ssr: false,
    loading: () => null // Shell handles loading state
  }
)

// New Phase 5 client components
const RegionalComparison = dynamic(() => import('@/components/RegionalComparison'), {
  ssr: false,
  loading: () => null // Shell handles loading state
})

const EnergyTipsSection = dynamic(() => import('@/components/EnergyTipsSection').then(m => ({ default: m.EnergyTipsSection })), {
  ssr: false,
  loading: () => null // Shell handles loading state
})

const VideoSectionComponent = dynamic(() => import('@/components/VideoSectionComponent'), {
  ssr: false,
  loading: () => null // Shell handles loading state
})

const RealPriceComparisonTable = dynamic(() => import('@/components/RealPriceComparisonTable'), {
  ssr: false,
  loading: () => null // Shell handles loading state
})

const LocationSelector = dynamic(() => import('@/components/LocationSelector'), {
  ssr: false,
  loading: () => null // Shell handles loading state
})

interface HybridContentBlocksProps {
  blocks: any[]
  showReadingProgress?: boolean
}

/**
 * Component that shows SSR shell until client component loads
 * Shell provides immediate SEO content, then is replaced by interactive component
 */
function HybridComponent({ 
  shell, 
  children 
}: { 
  shell: React.ReactNode
  children: React.ReactNode 
}) {
  return (
    <Suspense fallback={shell}>
      {children}
    </Suspense>
  )
}

export default function HybridContentBlocks({ blocks, showReadingProgress }: HybridContentBlocksProps) {
  return (
    <>
      {blocks.map((block) => {
        switch (block._type) {
          // Priority 1 components with shells
          case 'livePriceGraph':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <LivePriceGraphShell
                    title={block.title}
                    subtitle={block.subtitle}
                    region={block.apiRegion}
                    headerAlignment={block.headerAlignment}
                  />
                }
              >
                <LivePriceGraphClient block={block} />
              </HybridComponent>
            )
            
          case 'priceCalculator':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <PriceCalculatorShell
                    title={block.title}
                    variant={block.variant || 'standalone'}
                  />
                }
              >
                <PriceCalculatorClient block={block} variant={block.variant} />
              </HybridComponent>
            )
            
          case 'providerList':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <ProviderListShell
                    block={block}
                  />
                }
              >
                <ProviderListClient block={block} />
              </HybridComponent>
            )
            
          // Priority 2 components with shells
          case 'co2EmissionsDisplay':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <CO2EmissionsShell
                    title={block.title}
                    subtitle={block.subtitle}
                    headerAlignment={block.headerAlignment}
                  />
                }
              >
                <CO2EmissionsChart block={block} />
              </HybridComponent>
            )
            
          case 'monthlyProductionChart':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <MonthlyProductionShell
                    title={block.title}
                    subtitle={block.subtitle}
                    headerAlignment={block.headerAlignment}
                  />
                }
              >
                <MonthlyProductionChart block={block} />
              </HybridComponent>
            )
            
          case 'renewableEnergyForecast':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <RenewableEnergyShell
                    title={block.title}
                    subtitle={block.subtitle}
                    headerAlignment={block.headerAlignment}
                  />
                }
              >
                <RenewableEnergyForecast block={block} />
              </HybridComponent>
            )
            
          case 'consumptionMap':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <ConsumptionMapShell
                    block={block}
                  />
                }
              >
                <ConsumptionMap block={block} />
              </HybridComponent>
            )
            
          case 'dailyPriceTimeline':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <DailyPriceTimelineShell
                    title={block.title}
                    subtitle={block.subtitle}
                    region={block.region}
                    headerAlignment={block.headerAlignment}
                  />
                }
              >
                <DailyPriceTimeline block={block} />
              </HybridComponent>
            )
            
          case 'applianceCalculator':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <ApplianceCalculatorShell
                    block={block}
                  />
                }
              >
                <ApplianceCalculatorSection block={block} />
              </HybridComponent>
            )
            
          case 'forbrugTracker':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <ForbrugTrackerShell
                    title={block.title}
                    description={block.description}
                    connectButtonText={block.connectButtonText}
                    showBenefits={block.showBenefits}
                    headerAlignment={block.headerAlignment}
                  />
                }
              >
                <ForbrugTracker {...block} />
              </HybridComponent>
            )
            
          case 'declarationProduction':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <DeclarationProductionShell
                    title={block.title}
                    subtitle={block.subtitle}
                    headerAlignment={block.headerAlignment}
                  />
                }
              >
                <DeclarationProductionChart block={block} />
              </HybridComponent>
            )
            
          case 'declarationGridmix':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <DeclarationGridmixShell
                    title={block.title}
                    subtitle={block.subtitle}
                    headerAlignment={block.headerAlignment}
                  />
                }
              >
                <DeclarationGridmix block={block} />
              </HybridComponent>
            )
            
          // New Phase 5 client components with shells
          case 'regionalComparison':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <RegionalComparisonShell
                    block={block}
                  />
                }
              >
                <RegionalComparison block={block} />
              </HybridComponent>
            )
            
          case 'energyTipsSection':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <EnergyTipsSectionShell
                    block={block}
                  />
                }
              >
                <EnergyTipsSection block={block} />
              </HybridComponent>
            )
            
          case 'videoSection':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <VideoSectionShell
                    block={block}
                  />
                }
              >
                <VideoSectionComponent block={block} />
              </HybridComponent>
            )
            
          case 'realPriceComparisonTable':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <RealPriceComparisonShell
                    block={block}
                  />
                }
              >
                <RealPriceComparisonTable block={block} />
              </HybridComponent>
            )
            
          case 'locationSelector':
            return (
              <HybridComponent
                key={block._key}
                shell={
                  <LocationSelectorShell
                    placeholder={block.placeholder}
                    label={block.label}
                  />
                }
              >
                <LocationSelector onLocationChange={() => {}} />
              </HybridComponent>
            )
            
          // All other blocks are server-rendered
          default:
            // Delegate to ServerContentBlocks for static content
            return <ServerContentBlocks key={block._key} blocks={[block]} />
        }
      })}
    </>
  )
}

// Loading placeholder component
function LoadingPlaceholder({ height }: { height: string }) {
  return (
    <div 
      className="animate-pulse bg-gray-100 rounded-lg"
      style={{ height }}
      aria-label="Indlæser..."
    />
  )
}