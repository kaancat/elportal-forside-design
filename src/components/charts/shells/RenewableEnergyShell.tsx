/**
 * Server-side shell for RenewableEnergyForecast
 * Renders SEO-friendly renewable energy forecast without interactivity
 * No 'use client' directive - this is a server component
 */

interface RenewableEnergyShellProps {
  title?: string
  subtitle?: string
  headerAlignment?: 'left' | 'center' | 'right'
}

export function RenewableEnergyShell({ 
  title = 'Grøn Energi Prognose', 
  subtitle = 'Forventet vedvarende energiproduktion de næste 24 timer',
  headerAlignment = 'center' 
}: RenewableEnergyShellProps) {
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
          <div className="h-[300px] bg-gray-100 rounded-lg mb-4" />
          
          {/* Legend skeleton */}
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-300 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-300 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* SEO content */}
        <div className="sr-only">
          <p>
            Danmarks vedvarende energiproduktion kommer primært fra vindmøller og solceller.
            Vindenergi dominerer ofte om natten og i blæsende perioder, mens solenergi 
            bidrager mest midt på dagen i sommermånederne.
          </p>
          <p>
            Prognosen viser forventet produktion baseret på vejrudsigter og historiske mønstre,
            hvilket hjælper forbrugere med at planlægge deres elforbrug efter grøn energi.
          </p>
        </div>
      </div>

      {/* Information boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-200 rounded-full" />
            <span className="font-semibold text-blue-900">Vindenergi</span>
          </div>
          <p className="text-sm text-blue-800">
            Produceres døgnet rundt når det blæser
          </p>
        </div>
        
        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-yellow-200 rounded-full" />
            <span className="font-semibold text-yellow-900">Solenergi</span>
          </div>
          <p className="text-sm text-yellow-800">
            Højest produktion midt på dagen
          </p>
        </div>
      </div>
    </section>
  )
}