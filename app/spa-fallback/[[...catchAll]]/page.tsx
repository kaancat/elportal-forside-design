'use client'

// Phase 2: SPA Fallback Route
// This handles all unmigrated routes via middleware rewrite
// It mounts the existing React Router app for backward compatibility

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import the existing App component with no SSR
// This ensures all existing React Router functionality works as-is
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

// SPA Fallback page component
export default function SPAFallbackPage({
  params,
}: {
  params: { catchAll?: string[] }
}) {
  // The App component will handle routing internally via React Router
  // The catchAll params are ignored as React Router reads from window.location
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