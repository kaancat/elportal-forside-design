'use client'

/**
 * Client-side content blocks for interactivity
 * These components are rendered on the client for dynamic features
 */

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import interactive components
const LivePriceGraphComponent = dynamic(() => import('@/components/LivePriceGraphComponent'), {
  ssr: false,
  loading: () => <LoadingPlaceholder height="400px" />,
})

const CO2EmissionsChart = dynamic(() => import('@/components/CO2EmissionsChart'), {
  ssr: false,
  loading: () => <LoadingPlaceholder height="400px" />,
})

const MonthlyProductionChart = dynamic(() => import('@/components/MonthlyProductionChart'), {
  ssr: false,
  loading: () => <LoadingPlaceholder height="400px" />,
})

const RenewableEnergyForecast = dynamic(() => import('@/components/RenewableEnergyForecast'), {
  ssr: false,
  loading: () => <LoadingPlaceholder height="300px" />,
})

const PriceCalculatorWidget = dynamic(() => import('@/components/PriceCalculatorWidget'), {
  ssr: false,
  loading: () => <LoadingPlaceholder height="500px" />,
})

const ProviderList = dynamic(() => import('@/components/ProviderList'), {
  ssr: false,
  loading: () => <LoadingPlaceholder height="600px" />,
})

const ConsumptionMap = dynamic(() => import('@/components/ConsumptionMap'), {
  ssr: false,
  loading: () => <LoadingPlaceholder height="500px" />,
})

const DailyPriceTimeline = dynamic(() => import('@/components/DailyPriceTimeline'), {
  ssr: false,
  loading: () => <LoadingPlaceholder height="300px" />,
})

const ApplianceCalculatorSection = dynamic(
  () => import('@/components/ApplianceCalculatorSection').then(m => m.ApplianceCalculatorSection),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder height="400px" />,
  }
)

const ForbrugTracker = dynamic(
  () => import('@/components/forbrugTracker/ForbrugTracker').then(m => m.ForbrugTracker),
  {
    ssr: false,
    loading: () => <LoadingPlaceholder height="400px" />,
  }
)

interface ClientContentBlocksProps {
  blocks: any[]
}

export default function ClientContentBlocks({ blocks }: ClientContentBlocksProps) {
  return (
    <>
      {blocks.map((block) => {
        switch (block._type) {
          case 'livePriceGraph':
            return (
              <Suspense key={block._key} fallback={<LoadingPlaceholder height="400px" />}>
                <LivePriceGraphComponent block={block} />
              </Suspense>
            )
          case 'co2EmissionsDisplay':
            return (
              <Suspense key={block._key} fallback={<LoadingPlaceholder height="400px" />}>
                <CO2EmissionsChart block={block} />
              </Suspense>
            )
          case 'monthlyProductionChart':
            return (
              <Suspense key={block._key} fallback={<LoadingPlaceholder height="400px" />}>
                <MonthlyProductionChart block={block} />
              </Suspense>
            )
          case 'renewableEnergyForecast':
            return (
              <Suspense key={block._key} fallback={<LoadingPlaceholder height="300px" />}>
                <RenewableEnergyForecast block={block} />
              </Suspense>
            )
          case 'priceCalculatorWidget':
            return (
              <Suspense key={block._key} fallback={<LoadingPlaceholder height="500px" />}>
                <PriceCalculatorWidget 
                  block={block}
                  variant={block.variant || 'standalone'}
                />
              </Suspense>
            )
          case 'providerList':
            return (
              <Suspense key={block._key} fallback={<LoadingPlaceholder height="600px" />}>
                <ProviderList block={block} />
              </Suspense>
            )
          case 'consumptionMap':
            return (
              <Suspense key={block._key} fallback={<LoadingPlaceholder height="500px" />}>
                <ConsumptionMap block={block} />
              </Suspense>
            )
          case 'dailyPriceTimeline':
            return (
              <Suspense key={block._key} fallback={<LoadingPlaceholder height="300px" />}>
                <DailyPriceTimeline block={block} />
              </Suspense>
            )
          case 'applianceCalculator':
            return (
              <Suspense key={block._key} fallback={<LoadingPlaceholder height="400px" />}>
                <ApplianceCalculatorSection block={block} />
              </Suspense>
            )
          case 'forbrugTracker':
            return (
              <Suspense key={block._key} fallback={<LoadingPlaceholder height="400px" />}>
                <ForbrugTracker 
                  title={block.title}
                  description={block.description}
                  connectButtonText={block.connectButtonText}
                  connectedText={block.connectedText}
                  showBenefits={block.showBenefits}
                  headerAlignment={block.headerAlignment}
                />
              </Suspense>
            )
          default:
            return null
        }
      })}
    </>
  )
}

// Loading placeholder component
function LoadingPlaceholder({ height = '400px' }: { height?: string }) {
  return (
    <div 
      className="bg-gray-100 animate-pulse rounded-lg flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm">Indlæser...</p>
      </div>
    </div>
  )
}