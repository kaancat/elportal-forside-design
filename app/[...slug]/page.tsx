'use client'

// Phase 1: Catch-all route for SPA compatibility (non-root paths)
// This handles all non-root routes and delegates to the existing React Router

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import the existing App component with no SSR
const App = dynamic(() => import('@/App'), { 
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="mb-4 text-2xl font-bold text-green-600">DinElportal</div>
        <div className="text-gray-600">Indlæser...</div>
      </div>
    </div>
  )
})

// Generate static params for known routes (for static export)
export async function generateStaticParams() {
  // These are the known routes from the existing app
  // Add more routes as discovered
  return [
    { slug: ['elpriser'] },
    { slug: ['privacy-policy'] },
    { slug: ['test-eloverblik'] },
    { slug: ['admin', 'dashboard'] },
    { slug: ['icon-test'] },
    { slug: ['groen-energi'] },
    { slug: ['spar-penge'] },
    { slug: ['dk1-vs-dk2'] },
    { slug: ['elselskaber'] },
    { slug: ['spoergsmaal'] },
    { slug: ['om-os'] },
    { slug: ['kontakt'] },
  ]
}

// Page component - renders the existing App
export default function CatchAllPage({
  params,
}: {
  params: { slug?: string[] }
}) {
  // The App component will handle routing internally via React Router
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="mb-4 text-2xl font-bold text-green-600">DinElportal</div>
          <div className="text-gray-600">Indlæser...</div>
        </div>
      </div>
    }>
      <App />
    </Suspense>
  )
}