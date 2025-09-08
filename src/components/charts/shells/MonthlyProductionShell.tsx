/**
 * Server-side shell for MonthlyProductionChart
 * Renders SEO-friendly monthly production data without interactivity
 * No 'use client' directive - this is a server component
 */

interface MonthlyProductionShellProps {
  title?: string
  subtitle?: string
  headerAlignment?: 'left' | 'center' | 'right'
}

export function MonthlyProductionShell({ 
  title = 'Månedlig Elproduktion', 
  subtitle = 'Danmarks energiproduktion fordelt på kilder',
  headerAlignment = 'center' 
}: MonthlyProductionShellProps) {
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
          <div className="flex flex-wrap justify-center gap-4">
            {['Vind', 'Sol', 'Biomasse', 'Gas', 'Import'].map((source) => (
              <div key={source} className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* SEO content */}
        <div className="sr-only">
          <p>
            Danmarks elproduktion kommer fra en blanding af vedvarende og fossile energikilder.
            Vindkraft udgør den største andel af produktionen, efterfulgt af biomasse og solenergi.
            Import og naturgas supplerer når den vedvarende produktion er lav.
          </p>
          <ul>
            <li>Vindkraft: Typisk 40-60% af produktionen</li>
            <li>Biomasse: Stabil grundlast omkring 15-20%</li>
            <li>Solenergi: Varierer fra 2% om vinteren til 15% om sommeren</li>
            <li>Naturgas: Backup når vedvarende kilder ikke kan dække behovet</li>
            <li>Import/Eksport: Danmark handler elektricitet med nabolande</li>
          </ul>
        </div>
      </div>

      {/* Statistics boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">~80%</div>
          <div className="text-sm text-green-800">Vedvarende energi</div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">~50%</div>
          <div className="text-sm text-blue-800">Fra vindkraft</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">~10%</div>
          <div className="text-sm text-yellow-800">Fra solenergi</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-600">~20%</div>
          <div className="text-sm text-gray-800">Fossil energi</div>
        </div>
      </div>
    </section>
  )
}