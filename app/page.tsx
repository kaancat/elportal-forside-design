'use client'

// Phase 1: Homepage wrapper for existing App component
// This maintains full compatibility with the existing Vite app

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import the existing App component with no SSR
// This ensures all existing functionality works as-is
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

export default function HomePage() {
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