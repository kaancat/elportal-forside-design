'use client'

// Error boundary for the app directory
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App error boundary:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-red-600">Ups!</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          Noget gik galt
        </h2>
        <p className="mb-8 text-gray-600">
          Vi beklager, men der opstod en fejl. Prøv venligst igen.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition-colors"
          >
            Prøv igen
          </button>
          <a
            href="/"
            className="inline-block rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Gå til forsiden
          </a>
        </div>
      </div>
    </div>
  )
}