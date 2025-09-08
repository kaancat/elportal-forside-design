/**
 * Server-side shell for ProviderList
 * Renders SEO-friendly provider list without interactivity
 * No 'use client' directive - this is a server component
 */

import { ProviderListBlock } from '@/types/sanity'
import { formatCurrency } from '@/utils/date-formatter'

interface ProviderListShellProps {
  block: ProviderListBlock
  fallbackSpotPrice?: number
}

export function ProviderListShell({ block, fallbackSpotPrice }: ProviderListShellProps) {
  // Safety check
  if (!block || !block.providers) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">
          <p>Udbyderliste indlæses...</p>
        </div>
      </div>
    )
  }

  // Get active providers
  const providers = (block.providers || [])
    .filter(Boolean)
    .filter((p: any) => p.isActive !== false)

  const title = block.title || 'Sammenlign elselskaber'
  const subtitle = block.subtitle || 'Find det bedste elselskab til din bolig'

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      {/* SEO-friendly header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-lg text-gray-600 mt-2">{subtitle}</p>
        )}
      </div>

      {/* Provider count and region info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          Vi sammenligner {providers.length} elselskaber for dig. 
          Priserne er baseret på et gennemsnitligt forbrug på 4.000 kWh/år.
        </p>
        {fallbackSpotPrice && (
          <p className="text-sm text-blue-700 mt-1">
            Aktuel spotpris: {formatCurrency(fallbackSpotPrice)} per kWh
          </p>
        )}
      </div>

      {/* Static provider list for SEO */}
      <div className="space-y-4">
        {providers.slice(0, 5).map((provider: any, index: number) => (
          <article 
            key={provider.id || provider._id || index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            itemScope
            itemType="https://schema.org/Product"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900" itemProp="name">
                  {provider.providerName || 'Ukendt udbyder'}
                </h3>
                {provider.productName && (
                  <p className="text-gray-600 mt-1">{provider.productName}</p>
                )}
                
                {/* Product features */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {provider.isGreen && (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      100% Grøn energi
                    </span>
                  )}
                  {provider.hasBinding && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      Binding: {provider.bindingPeriod || '6'} måneder
                    </span>
                  )}
                  {provider.priceType && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {provider.priceType === 'spot' ? 'Spotpris' : 'Fast pris'}
                    </span>
                  )}
                </div>
              </div>

              {/* Price display */}
              <div className="mt-4 md:mt-0 md:ml-6 text-right">
                <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  {provider.monthlyFee !== undefined && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">Abonnement:</span>
                      <span className="ml-2 text-lg font-semibold" itemProp="price">
                        {formatCurrency(provider.monthlyFee)}/md
                      </span>
                      <meta itemProp="priceCurrency" content="DKK" />
                    </div>
                  )}
                  {provider.spotPriceFee !== undefined && (
                    <div>
                      <span className="text-sm text-gray-500">Tillæg:</span>
                      <span className="ml-2 text-lg font-semibold">
                        {(provider.spotPriceFee * 100).toFixed(2)} øre/kWh
                      </span>
                    </div>
                  )}
                </div>
                
                {/* CTA button placeholder */}
                <div className="mt-3">
                  <div className="inline-block px-4 py-2 bg-brand-green text-white font-medium rounded-lg">
                    Se mere →
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden SEO content */}
            <div className="sr-only">
              <p itemProp="description">
                {provider.providerName} tilbyder {provider.priceType === 'spot' ? 'spotpris' : 'fast pris'} 
                med {provider.monthlyFee ? `${formatCurrency(provider.monthlyFee)} i månedligt abonnement` : 'intet abonnement'}
                {provider.spotPriceFee ? ` og ${(provider.spotPriceFee * 100).toFixed(2)} øre/kWh i tillæg` : ''}.
                {provider.isGreen ? ' 100% grøn strøm fra vedvarende energikilder.' : ''}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Show more providers message */}
      {providers.length > 5 && (
        <div className="text-center mt-6">
          <p className="text-gray-600">
            + {providers.length - 5} flere elselskaber tilgængelige
          </p>
        </div>
      )}

      {/* SEO-friendly footer content */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Om vores sammenligning</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            ✓ Vi sammenligner priser fra {providers.length} forskellige elselskaber
          </p>
          <p>
            ✓ Priserne opdateres løbende med aktuelle spotpriser
          </p>
          <p>
            ✓ Alle priser vises inklusive afgifter og moms
          </p>
          <p>
            ✓ Vi anbefaler Vindstød som det grønne valg med 100% vindenergi
          </p>
        </div>
      </div>

      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: title,
            description: subtitle,
            numberOfItems: providers.length,
            itemListElement: providers.slice(0, 5).map((provider: any, index: number) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Product',
                name: provider.providerName,
                offers: {
                  '@type': 'Offer',
                  price: provider.monthlyFee || 0,
                  priceCurrency: 'DKK'
                }
              }
            }))
          })
        }}
      />
    </section>
  )
}