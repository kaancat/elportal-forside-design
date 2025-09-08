/**
 * Server-side shell for DailyPriceTimeline
 * Renders SEO-friendly daily price timeline without interactivity
 * No 'use client' directive - this is a server component
 */

interface DailyPriceTimelineShellProps {
  title?: string
  subtitle?: string
  region?: 'DK1' | 'DK2'
  headerAlignment?: 'left' | 'center' | 'right'
}

export function DailyPriceTimelineShell({ 
  title = 'Dagens Elpriser', 
  subtitle = 'Time for time priser gennem døgnet',
  region = 'DK2',
  headerAlignment = 'center' 
}: DailyPriceTimelineShellProps) {
  const alignmentClass = 
    headerAlignment === 'left' ? 'text-left' : 
    headerAlignment === 'right' ? 'text-right' : 
    'text-center'

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className={`mb-6 ${alignmentClass}`}>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-gray-600 mt-2">{subtitle}</p>
        )}
        <div className="mt-2">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {region === 'DK1' ? 'Vestdanmark' : 'Østdanmark'}
          </span>
        </div>
      </div>

      {/* Timeline placeholder with loading skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          {/* Chart area skeleton */}
          <div className="h-[300px] bg-gray-100 rounded-lg mb-4" />
          
          {/* Time period indicators */}
          <div className="flex justify-between mt-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2" />
              <div className="h-3 w-16 bg-gray-200 rounded mx-auto" />
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2" />
              <div className="h-3 w-16 bg-gray-200 rounded mx-auto" />
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2" />
              <div className="h-3 w-16 bg-gray-200 rounded mx-auto" />
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2" />
              <div className="h-3 w-16 bg-gray-200 rounded mx-auto" />
            </div>
          </div>
        </div>

        {/* SEO content */}
        <div className="sr-only">
          <p>
            Elprisen varierer hver time gennem døgnet baseret på udbud og efterspørgsel.
            Typiske prismønstre for {region === 'DK1' ? 'Vestdanmark (Jylland og Fyn)' : 'Østdanmark (Sjælland og Bornholm)'}:
          </p>
          <ul>
            <li>Nat (00-06): Ofte de laveste priser, god tid for opladning og vask</li>
            <li>Morgen (06-09): Stigende priser når forbruget øges</li>
            <li>Formiddag (09-12): Moderate priser</li>
            <li>Middag (12-15): Ofte lave priser når solceller producerer mest</li>
            <li>Eftermiddag (15-17): Stigende priser</li>
            <li>Aften (17-21): Typisk dagens højeste priser (spidsbelastning)</li>
            <li>Sen aften (21-00): Faldende priser</li>
          </ul>
        </div>
      </div>

      {/* Price tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌙</span>
            <span className="font-semibold text-green-900">Nat</span>
          </div>
          <p className="text-sm text-green-800">
            Billigste timer: 02-05
          </p>
        </div>
        
        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">☀️</span>
            <span className="font-semibold text-yellow-900">Middag</span>
          </div>
          <p className="text-sm text-yellow-800">
            Lav pris når solen skinner
          </p>
        </div>
        
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏠</span>
            <span className="font-semibold text-red-900">Aften</span>
          </div>
          <p className="text-sm text-red-800">
            Dyreste timer: 17-20
          </p>
        </div>
      </div>
    </section>
  )
}