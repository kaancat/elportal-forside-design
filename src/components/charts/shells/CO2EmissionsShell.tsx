/**
 * Server-side shell for CO2EmissionsChart
 * Renders SEO-friendly CO2 emissions info without interactivity
 * No 'use client' directive - this is a server component
 */

interface CO2EmissionsShellProps {
  title?: string
  subtitle?: string
  headerAlignment?: 'left' | 'center' | 'right'
}

export function CO2EmissionsShell({ 
  title = 'CO2 Udledning', 
  subtitle = 'Realtids CO2-intensitet i det danske elnet',
  headerAlignment = 'center' 
}: CO2EmissionsShellProps) {
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
      </div>

      {/* Chart placeholder with loading skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          {/* Chart area skeleton */}
          <div className="h-[400px] bg-gray-100 rounded-lg mb-4" />
          
          {/* Legend skeleton */}
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-300 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-300 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-300 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* SEO content */}
        <div className="sr-only">
          <p>
            CO2-udledningen fra elproduktion i Danmark varierer gennem døgnet baseret på 
            energimixet. Når vindmøller og solceller producerer meget, er CO2-intensiteten lav.
            I perioder med høj efterspørgsel og lav vedvarende produktion stiger CO2-udledningen.
          </p>
          <p>
            Grøn zone: Under 100g CO2/kWh - primært vedvarende energi
          </p>
          <p>
            Gul zone: 100-200g CO2/kWh - blandet energi
          </p>
          <p>
            Rød zone: Over 200g CO2/kWh - høj andel fossil energi
          </p>
        </div>
      </div>

      {/* Information text */}
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-900">
          💡 Tip: Planlæg dit elforbrug efter CO2-intensiteten for at reducere din klimapåvirkning.
        </p>
      </div>
    </section>
  )
}