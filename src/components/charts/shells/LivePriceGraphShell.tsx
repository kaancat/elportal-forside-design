/**
 * Server-side shell for LivePriceGraph
 * Provides SEO-friendly content while the interactive chart loads
 * No 'use client' directive - this is a server component
 */

import { formatTime, formatCurrency } from '@/utils/date-formatter'

interface LivePriceGraphShellProps {
  title: string
  subtitle?: string
  region: 'DK1' | 'DK2'
  headerAlignment?: 'left' | 'center' | 'right'
  fallbackData?: {
    currentPrice?: number
    averagePrice?: number
    highPrice?: number
    lowPrice?: number
    lastUpdated?: Date
  }
}

export function LivePriceGraphShell({ 
  title, 
  subtitle, 
  region,
  headerAlignment = 'left',
  fallbackData 
}: LivePriceGraphShellProps) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[headerAlignment]

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* SEO-friendly header */}
      <div className={`mb-6 ${alignmentClass}`}>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-gray-600 mt-2">{subtitle}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Elpriser for {region === 'DK1' ? 'Vestdanmark' : 'Østdanmark'}
        </p>
      </div>

      {/* SEO-friendly content for search engines */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {fallbackData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {fallbackData.currentPrice !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Aktuel pris</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(fallbackData.currentPrice)} per kWh
                  </p>
                </div>
              )}
              {fallbackData.averagePrice !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Gennemsnitspris i dag</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(fallbackData.averagePrice)} per kWh
                  </p>
                </div>
              )}
              {fallbackData.highPrice !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Højeste pris i dag</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(fallbackData.highPrice)} per kWh
                  </p>
                </div>
              )}
              {fallbackData.lowPrice !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Laveste pris i dag</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(fallbackData.lowPrice)} per kWh
                  </p>
                </div>
              )}
            </div>
            {fallbackData.lastUpdated && (
              <p className="text-xs text-gray-500">
                Sidst opdateret: {formatTime(fallbackData.lastUpdated)}
              </p>
            )}
          </div>
        ) : (
          /* Loading skeleton that matches the chart dimensions */
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-64 bg-gray-100 rounded"></div>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Accessible table for screen readers (hidden visually) */}
        <table className="sr-only" aria-label={`Timepriser for el i ${region}`}>
          <caption>
            Elpriser per time for {region === 'DK1' ? 'Vestdanmark' : 'Østdanmark'}. 
            Alle priser er inklusive afgifter og moms.
          </caption>
          <thead>
            <tr>
              <th scope="col">Klokkeslæt</th>
              <th scope="col">Spotpris (kr/kWh)</th>
              <th scope="col">Total pris (kr/kWh)</th>
            </tr>
          </thead>
          <tbody>
            {/* This will be populated by the client component if needed */}
            <tr>
              <td colSpan={3}>Data indlæses...</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SEO-friendly description */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          Se de aktuelle elpriser time for time i {region === 'DK1' ? 'Vestdanmark' : 'Østdanmark'}. 
          Priserne opdateres løbende og viser både spotpriser og den samlede pris inklusive 
          transport, systemgebyrer, elafgift og moms.
        </p>
      </div>
    </div>
  )
}