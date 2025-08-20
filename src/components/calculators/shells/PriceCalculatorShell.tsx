/**
 * Server-side shell for PriceCalculator
 * Provides SEO-friendly content and structure while the interactive calculator loads
 * No 'use client' directive - this is a server component
 */

interface PriceCalculatorShellProps {
  title?: string
  subtitle?: string
  variant?: 'standalone' | 'hero'
}

export function PriceCalculatorShell({ 
  title = 'Beregn din elpris',
  subtitle = 'Find ud af hvad du kan spare på din elregning',
  variant = 'standalone'
}: PriceCalculatorShellProps) {
  const isHero = variant === 'hero'
  
  return (
    <div className={cn(
      "w-full",
      isHero ? "max-w-2xl" : "max-w-4xl mx-auto px-4 py-8"
    )}>
      {/* SEO-friendly header */}
      <div className="text-center mb-8">
        <h2 className={cn(
          "font-bold",
          isHero ? "text-3xl text-white" : "text-2xl text-gray-900"
        )}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn(
            "mt-2",
            isHero ? "text-lg text-white/90" : "text-gray-600"
          )}>
            {subtitle}
          </p>
        )}
      </div>

      {/* SEO-friendly content structure */}
      <div className={cn(
        "rounded-lg p-6",
        isHero ? "bg-white/10 backdrop-blur-sm" : "bg-white shadow-sm border border-gray-200"
      )}>
        <div className="space-y-6">
          {/* Step 1: Housing type selection */}
          <div>
            <h3 className={cn(
              "text-lg font-semibold mb-4",
              isHero ? "text-white" : "text-gray-900"
            )}>
              Vælg din boligtype
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <p className="font-medium">Lille lejlighed</p>
                <p className="text-sm text-gray-500">1-2 værelser</p>
                <p className="text-sm text-gray-500">~2.000 kWh/år</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="font-medium">Stor lejlighed</p>
                <p className="text-sm text-gray-500">3-4 værelser</p>
                <p className="text-sm text-gray-500">~3.000 kWh/år</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="font-medium">Mindre hus</p>
                <p className="text-sm text-gray-500">100-130 m²</p>
                <p className="text-sm text-gray-500">~4.000 kWh/år</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="font-medium">Stort hus</p>
                <p className="text-sm text-gray-500">Over 130 m²</p>
                <p className="text-sm text-gray-500">~6.000 kWh/år</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="font-medium">Sommerhus</p>
                <p className="text-sm text-gray-500">Begrænset forbrug</p>
                <p className="text-sm text-gray-500">~2.000 kWh/år</p>
              </div>
            </div>
          </div>

          {/* Step 2: Consumption info */}
          <div>
            <h3 className={cn(
              "text-lg font-semibold mb-2",
              isHero ? "text-white" : "text-gray-900"
            )}>
              Årligt elforbrug
            </h3>
            <p className={cn(
              "text-sm mb-4",
              isHero ? "text-white/80" : "text-gray-600"
            )}>
              Justér dit årlige forbrug for at få en mere præcis beregning
            </p>
            {/* Loading skeleton for slider */}
            <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="mt-2 text-center">
              <span className="text-2xl font-bold">4.000</span>
              <span className="text-sm ml-1">kWh/år</span>
            </div>
          </div>

          {/* Call to action */}
          <div className="flex justify-center pt-4">
            <div className="inline-block px-6 py-3 bg-brand-green text-white font-semibold rounded-lg">
              Beregn din pris →
            </div>
          </div>
        </div>
      </div>

      {/* SEO-friendly description */}
      <div className={cn(
        "mt-6 text-sm",
        isHero ? "text-white/80 text-center" : "text-gray-600"
      )}>
        <p>
          Brug vores prisberegner til at sammenligne elpriser fra forskellige udbydere. 
          Vi viser dig både spotpriser og faste priser, så du kan vælge den løsning, 
          der passer bedst til dit forbrug og dine behov.
        </p>
      </div>

      {/* Structured data for SEO (hidden) */}
      <div className="sr-only">
        <h3>Sådan fungerer prisberegneren</h3>
        <ol>
          <li>Vælg din boligtype eller indtast dit årlige forbrug</li>
          <li>Se aktuelle elpriser fra forskellige udbydere</li>
          <li>Sammenlign priser og find den bedste løsning</li>
          <li>Få hjælp til at skifte elselskab</li>
        </ol>
        <p>
          Priserne inkluderer spotpris, netafgifter, systemtarif, elafgift og moms. 
          Vindstød anbefales som det grønne valg med 100% vindenergi.
        </p>
      </div>
    </div>
  )
}

// Helper function (copied to avoid import issues in server component)
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}