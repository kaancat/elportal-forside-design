'use client'

// Phase 2: SPA Fallback Route
// This handles all unmigrated routes via middleware rewrite
// It mounts the existing React Router app for backward compatibility

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// SPA fallback disabled - return 404 for unmigrated routes
const App = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-4xl font-bold text-green-600">404</div>
        <div className="mb-4 text-xl text-gray-800">Siden blev ikke fundet</div>
        <div className="text-gray-600 mb-4">Denne rute er ikke migreret til App Router</div>
        <a href="/" className="text-green-600 hover:text-green-700 underline">
          Tilbage til forsiden
        </a>
      </div>
    </div>
  );
}

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