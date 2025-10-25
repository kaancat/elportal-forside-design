import React from 'react';
import Image from 'next/image';
import { ArrowRight, Check, X, ExternalLink, Info, Leaf, Wind, Calculator, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ElectricityProduct } from '@/types/product';
import {
  calculatePricePerKwh,
  calculateMonthlyCost,
  getPriceBreakdown,
  PRICE_CONSTANTS
} from '@/services/priceCalculationService';
import { TrackedLink } from '@/components/tracking/TrackedLink';
import { resolveProviderLogoUrl } from '@/lib/providerLogos';

interface ProviderCardProps {
  product: ElectricityProduct;
  annualConsumption: number;
  spotPrice: number | null;
  networkTariff?: number;
  additionalFees?: {
    greenCertificates?: number;
    tradingCosts?: number;
  };
  pricingMode?: 'simplified' | 'full';
  density?: 'default' | 'compact' | 'sidebar';
  priceSourceDate?: string; // from Sanity (providerList block)
  providerMarkupKrOverride?: number; // in kr/kWh (simplified mode)
  monthlySubscriptionOverride?: number; // in kr (simplified mode)
  regionCode?: 'DK1' | 'DK2';
  priority?: boolean; // Mobile optimization: eager load first few cards
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  product,
  annualConsumption,
  spotPrice,
  networkTariff,
  additionalFees,
  pricingMode = 'full',
  density = 'default',
  priceSourceDate,
  providerMarkupKrOverride,
  monthlySubscriptionOverride,
  regionCode,
  priority = false, // Default to lazy loading
}) => {
  // Add safety checks
  if (!product) {
    console.error('ProviderCard: product is undefined');
    return null;
  }

  // Region can be passed via props or context in the future
  const userRegion = networkTariff && networkTariff > 0.26 ? 'DK2' : 'DK1'; // Simple heuristic

  // Pricing calculations
  const baseSpotPrice = spotPrice !== null ? spotPrice : PRICE_CONSTANTS.DEFAULT_SPOT_PRICE;
  const fullPricePerKwh = calculatePricePerKwh(
    baseSpotPrice,
    product.displayPrice_kWh || 0,
    networkTariff,
    additionalFees
  );
  const fullEstimatedMonthly = calculateMonthlyCost(annualConsumption, fullPricePerKwh, product.displayMonthlyFee || 0);
  const breakdown = getPriceBreakdown(baseSpotPrice, product.displayPrice_kWh || 0, networkTariff, additionalFees);

  // Simplified mode values
  const markupKr = typeof providerMarkupKrOverride === 'number'
    ? providerMarkupKrOverride
    : (product.displayPrice_kWh || 0); // product.displayPrice_kWh is used as markup in øre in some data; ensure conversion below if needed
  // If markup is very likely in øre, convert to kr when needed
  const markupKrNormalized = markupKr > 3 ? (markupKr / 100) : markupKr; // heuristic: >3 likely øre
  const monthlySub = typeof monthlySubscriptionOverride === 'number' ? monthlySubscriptionOverride : (product.displayMonthlyFee || 0);
  const spotKr = typeof spotPrice === 'number' ? spotPrice : PRICE_CONSTANTS.DEFAULT_SPOT_PRICE;
  const simplifiedKrPerKwh = spotKr + markupKrNormalized;
  const simplifiedMonthly = monthlySub + (annualConsumption / 12) * simplifiedKrPerKwh;


  const isSidebar = density === 'sidebar'
  const pad = isSidebar ? 'p-3' : (density === 'compact' ? 'p-4' : 'p-8')
  const gap = isSidebar ? 'gap-2' : (density === 'compact' ? 'gap-4' : 'gap-8')
  const logoBox = isSidebar ? 'w-12 h-12' : (density === 'compact' ? 'w-16 h-16' : 'w-28 h-28')
  const titleSize = isSidebar ? 'text-sm' : (density === 'compact' ? 'text-base' : 'text-xl')
  const priceBoxPad = isSidebar ? 'px-3 py-2' : (density === 'compact' ? 'px-4 py-3' : 'px-6 py-4')
  const priceText = isSidebar ? 'text-xl' : (density === 'compact' ? 'text-2xl' : 'text-3xl')
  const btnPad = isSidebar ? 'py-1.5 px-3 text-xs' : (density === 'compact' ? 'py-2 px-4 text-sm' : 'py-3 px-6')

  // Sidebar: Ultra-compact vertical layout
  if (isSidebar) {
    return (
      <div className={`rounded-lg overflow-hidden transition-all duration-200 ${product.isVindstoedProduct
          ? 'bg-gradient-to-br from-white via-white to-brand-green/5 shadow-md border-2 border-brand-green/20 hover:shadow-lg relative'
          : 'bg-white shadow-sm border border-gray-100 hover:shadow-md'
        }`}>
        {product.isVindstoedProduct && (
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-green/60 via-brand-green to-brand-green/60"></div>
        )}
        <div className={pad}>
          {/* Logo and title - horizontal */}
          <div className="flex items-center gap-3 mb-2">
            <div className={`flex-shrink-0 ${logoBox} flex items-center justify-center p-1.5 bg-white rounded-md border border-gray-100 shadow-sm relative`}>
              <Image
                src={resolveProviderLogoUrl(product.supplierName, product.supplierLogoURL) || '/placeholder.svg'}
                alt={`${product.supplierName || 'Ukendt'} logo`}
                className="object-contain"
                fill
                sizes="48px"
                priority={priority}
                loading={priority ? undefined : "lazy"}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              {product.isVindstoedProduct && (
                <Badge className="bg-brand-green text-white mb-1 font-semibold px-2 py-0 text-[10px]">
                  ⭐ Anbefalet
                </Badge>
              )}
              <h3 className={`font-bold ${titleSize} text-brand-dark leading-tight`}>{product.productName || 'Ukendt produkt'}</h3>
              <p className="text-xs text-gray-600 font-medium truncate">{product.supplierName || 'Ukendt leverandør'}</p>
            </div>
          </div>

          {/* Price box */}
          <div className={`bg-gradient-to-br from-brand-dark/5 to-gray-50 ${priceBoxPad} rounded-lg border border-gray-100 mb-2`}>
            <div className="text-center">
              <div className={`${priceText} font-bold text-brand-green mb-0.5`}>
                {(pricingMode === 'simplified' ? simplifiedMonthly : fullEstimatedMonthly).toFixed(0)} kr
              </div>
              <div className="text-[10px] text-gray-600 mb-0.5">
                pr. måned
              </div>
              <div className="text-[10px] text-brand-dark font-semibold">
                {pricingMode === 'simplified' 
                  ? `${simplifiedKrPerKwh.toFixed(2)} kr/kWh` 
                  : `${fullPricePerKwh.toFixed(2)} kr/kWh`}
              </div>
              <div className="text-[9px] text-gray-500 mt-0.5">
                Abonnement: {monthlySub.toFixed(0)} kr
              </div>
            </div>
          </div>

          {/* CTA Button */}
          {product.signupLink ? (
            <TrackedLink
              href={product.signupLink}
              partner={product.supplierName || 'unknown'}
              component="provider_card"
              variant={product.isVindstoedProduct ? 'featured' : 'standard'}
              consumption={annualConsumption}
              region={userRegion}
              estimatedValue={pricingMode === 'simplified' ? simplifiedMonthly : fullEstimatedMonthly}
              className="w-full"
            >
              <Button
                className={`bg-brand-dark hover:bg-brand-dark/90 text-white rounded-lg w-full font-semibold ${btnPad}`}
              >
                Skift <ExternalLink className="ml-1 h-3 w-3 inline" />
              </Button>
            </TrackedLink>
          ) : (
            <Button
              className={`bg-gray-300 text-gray-500 rounded-lg w-full font-semibold ${btnPad} cursor-not-allowed`}
              disabled
            >
              Ikke tilgængelig
            </Button>
          )}

          {/* Minimal source disclaimer */}
          <div className="text-[9px] text-gray-500 leading-tight mt-1.5 text-center">
            Kilde: elpris.dk & Nord Pool
          </div>
        </div>
      </div>
    );
  }

  // Default and compact layouts
  return (
    <div className={`rounded-xl overflow-hidden transition-all duration-200 ${product.isVindstoedProduct
        ? 'bg-gradient-to-br from-white via-white to-brand-green/5 shadow-lg border-2 border-brand-green/20 ring-1 ring-brand-green/10 hover:shadow-xl relative'
        : 'bg-white shadow-sm border border-gray-100 hover:shadow-lg'
      }`}>
      {product.isVindstoedProduct && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-green/60 via-brand-green to-brand-green/60"></div>
      )}
      <div className={pad}>
        <div className={`flex flex-col lg:flex-row lg:items-center ${gap}`}>
          {/* Logo and company info */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-6">
              <div className={`flex-shrink-0 ${logoBox} flex items-center justify-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm relative`}>
                <Image
                  src={resolveProviderLogoUrl(product.supplierName, product.supplierLogoURL) || '/placeholder.svg'}
                  alt={`${product.supplierName || 'Ukendt'} logo`}
                  className="object-contain"
                  fill
                  sizes="(max-width: 768px) 64px, 112px"
                  priority={priority}
                  loading={priority ? undefined : "lazy"}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEyIiBoZWlnaHQ9IjExMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTEyIiBoZWlnaHQ9IjExMiIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>

              <div>
                {product.isVindstoedProduct && (
                  <Badge className="bg-brand-green text-white mb-3 font-semibold px-3 py-1">
                    ⭐ Anbefalet partner
                  </Badge>
                )}

                <h3 className={`font-bold ${titleSize} text-brand-dark mb-1`}>{product.productName || 'Ukendt produkt'}</h3>
                <p className="text-base text-gray-600 font-medium">{product.supplierName || 'Ukendt leverandør'}</p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          {density === 'compact' ? null : (
          <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-l-brand-green lg:flex-1">
            <h4 className="text-sm text-brand-dark uppercase font-bold mb-4 tracking-wide">Inkluderet</h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                {product.isVariablePrice ? (
                  <Check className="h-5 w-5 text-brand-green mr-3 flex-shrink-0" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                )}
                <span className="text-brand-dark font-medium">Variabel pris</span>
              </div>

              <div className="flex items-center text-sm">
                {product.hasNoBinding ? (
                  <Check className="h-5 w-5 text-brand-green mr-3 flex-shrink-0" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                )}
                <span className="text-brand-dark font-medium">Ingen binding</span>
              </div>

              <div className="flex items-center text-sm">
                {product.hasFreeSignup ? (
                  <>
                    <Check className="h-5 w-5 text-brand-green mr-3 flex-shrink-0" />
                    <span className="text-brand-dark font-medium">Gratis oprettelse</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                    <span className="text-brand-dark font-medium">
                      Oprettelse: {product.signupFee ? `${product.signupFee} kr` : 'Gebyr påkrævet'}
                    </span>
                  </>
                )}
              </div>

              {/* Green energy indicator */}
              {product.isGreenEnergy && (
                <div className="flex items-center text-sm">
                  {product.isVindstoedProduct ? (
                    <Wind className="h-5 w-5 text-brand-green mr-3 flex-shrink-0" />
                  ) : (
                    <Leaf className="h-5 w-5 text-brand-green mr-3 flex-shrink-0" />
                  )}
                  <span className="text-brand-dark font-medium">100% grøn strøm</span>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Price and action */}
          <div className="flex flex-col items-end lg:min-w-[200px]">
            <div className={`bg-gradient-to-br from-brand-dark/5 to-gray-50 ${priceBoxPad} rounded-lg border border-gray-100 mb-3 w-full`}>
              <div className="text-right">
                <div className={`${priceText} font-bold text-brand-green mb-1`}>
                  {(pricingMode === 'simplified' ? simplifiedMonthly : fullEstimatedMonthly).toFixed(0)} kr
                </div>
                <div className={`${density === 'compact' ? 'text-xs' : 'text-sm'} text-gray-600 mb-1`}>
                  pr. måned
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  {pricingMode === 'simplified' ? (
                    <div className={`${density === 'compact' ? 'text-xs' : 'text-sm'} text-brand-dark font-semibold`}>Spotpris + tillæg: {simplifiedKrPerKwh.toFixed(2)} kr/kWh</div>
                  ) : (
                    <div className={`${density === 'compact' ? 'text-xs' : 'text-sm'} text-brand-dark font-semibold`}>Estimeret {fullPricePerKwh.toFixed(2)} kr/kWh</div>
                  )}

                  {density !== 'compact' && pricingMode === 'full' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button aria-label="Se prisdetaljer" className="text-xs text-brand-green hover:underline mt-1 inline-flex items-center gap-1">
                          Se prisdetaljer <Info size={14} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Prisudregning</h4>
                          <p className="text-sm text-muted-foreground">Estimat baseret på live spotpris.</p>
                          <div className="text-xs space-y-1 pt-2">
                            <div className="flex justify-between"><span>Spotpris:</span> <span>{breakdown.spotPrice.toFixed(2)} kr.</span></div>
                            <div className="flex justify-between"><span>Leverandør tillæg:</span> <span>{breakdown.providerMarkup.toFixed(2)} kr.</span></div>
                            {breakdown.greenCertificates > 0 && (
                              <div className="flex justify-between"><span>Grønne certifikater:</span> <span>{breakdown.greenCertificates.toFixed(2)} kr.</span></div>
                            )}
                            {breakdown.tradingCosts > 0 && (
                              <div className="flex justify-between"><span>Handelsomkostninger:</span> <span>{breakdown.tradingCosts.toFixed(2)} kr.</span></div>
                            )}
                            <div className="border-t my-1"></div>
                            <div className="flex justify-between text-gray-600"><span>Nettarif ({breakdown.networkTariff.toFixed(2)} kr):</span> <span className="text-gray-600">{breakdown.networkTariff.toFixed(2)} kr.</span></div>
                            <div className="flex justify-between text-gray-600"><span>Systemtarif:</span> <span className="text-gray-600">{PRICE_CONSTANTS.SYSTEM_TARIFF.toFixed(2)} kr.</span></div>
                            <div className="flex justify-between text-gray-600"><span>Transmissionstarif:</span> <span className="text-gray-600">{PRICE_CONSTANTS.TRANSMISSION_FEE.toFixed(2)} kr.</span></div>
                            <div className="flex justify-between"><span>Elafgift:</span> <span>{breakdown.electricityTax.toFixed(2)} kr.</span></div>
                            <div className="border-t my-1"></div>
                            <div className="flex justify-between font-semibold"><span>Pris u. moms:</span> <span>{breakdown.subtotal.toFixed(2)} kr.</span></div>
                            <div className="flex justify-between font-semibold"><span>Moms (25%):</span> <span>{breakdown.vatAmount.toFixed(2)} kr.</span></div>
                            <div className="border-t border-dashed my-1"></div>
                            <div className="flex justify-between font-bold"><span>Total pr. kWh:</span> <span>{breakdown.total.toFixed(2)} kr.</span></div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}

                  <div className={`${density === 'compact' ? 'text-[11px]' : ''}`}>Månedligt abonnement: {monthlySub.toFixed(0)} kr</div>
                </div>
              </div>
            </div>
            {/* Source disclaimer */}
            <div className={`w-full text-right text-[11px] text-gray-500 leading-tight ${density === 'compact' ? 'mt-2 mb-2' : 'mt-3 mb-3'}`}>
              <div>
                {(() => {
                  const fallback = new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'long' }).format(new Date());
                  const formatted = priceSourceDate
                    ? new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(priceSourceDate))
                    : fallback;
                  return `Abonnement og tillæg fra elpris.dk d. ${formatted}`;
                })()}
              </div>
              <div>
                {`Spotpris: måneds-gennemsnit ${regionCode ? `(${regionCode}) ` : ''}fra Nord Pool.`}
              </div>
            </div>

            {product.signupLink ? (
              <TrackedLink
                href={product.signupLink}
                partner={product.supplierName || 'unknown'}
                component="provider_card"
                variant={product.isVindstoedProduct ? 'featured' : 'standard'}
                consumption={annualConsumption}
                region={userRegion}
                estimatedValue={pricingMode === 'simplified' ? simplifiedMonthly : fullEstimatedMonthly}
                className="w-full"
              >
                <Button
                  className={`bg-brand-dark hover:bg-brand-dark/90 text-white rounded-lg w-full font-semibold ${btnPad}`}
                >
                  Skift til {product.supplierName || 'denne leverandør'} <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </TrackedLink>
            ) : (
              <Button
                className={`bg-gray-300 text-gray-500 rounded-lg w-full font-semibold ${btnPad} cursor-not-allowed`}
                disabled
              >
                Link ikke tilgængelig
              </Button>
            )}

            {/* Bottom-right helper icons */}
            <div className={`w-full flex justify-end gap-2 ${density === 'compact' ? 'mt-2' : 'mt-3'}`}>
              {/* Pricing calc icon (green) */}
              {density !== 'compact' && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Beregning"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-brand-green/10 text-brand-dark border border-brand-green/20 hover:bg-brand-green/20 transition-colors"
                  >
                    <Calculator className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent sideOffset={8} align="end" className="max-w-xs sm:max-w-sm text-sm">
                  <div className="space-y-2">
                    <p className="font-medium">Sådan beregner vi prisen</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Spotpris: måneds-gennemsnit {regionCode ? `(${regionCode}) ` : ''}fra Nord Pool</li>
                      <li>Tillæg og abonnement: elpris.dk{priceSourceDate ? ` d. ${new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(priceSourceDate))}` : ''}</li>
                      <li>Beløb ekskl. nettariffer, afgifter, system/transmission og moms</li>
                    </ul>
                    <p className="text-xs text-gray-500">Priserne er estimater baseret på dit valgte forbrug.</p>
                  </div>
                </PopoverContent>
              </Popover>
              )}

              {/* Education icon (invite click): different color + subtle animated gradient */}
              {density !== 'compact' && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Hvorfor viser vi disse priser?"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[#a5e96d]/30 text-brand-dark bg-[#a5e96d]/20 hover:bg-[#a5e96d]/30 transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent sideOffset={8} align="end" className="max-w-xs sm:max-w-sm text-sm">
                  <div className="space-y-3">
                    <p className="font-semibold">Hvorfor ser prisen sådan ud?</p>
                    <div className="space-y-2 text-gray-700">
                      <p>
                        Din regning består overvejende af <strong>obligatoriske</strong> ting: nettariffer og afgifter til staten.
                        De er ens uanset leverandør og ligger <strong>uden for</strong> selskabets kontrol.
                      </p>
                      <p>Spotprisen er fælles for alle – den kan du ikke selv påvirke.</p>
                      <p>Derfor sammenligner vi kun det, du kan påvirke ved at vælge leverandør:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Elselskabets tillæg til spotpris</li>
                        <li>Månedligt abonnement</li>
                      </ul>
                      <p className="text-xs text-gray-500">
                        Alt det andet (nettariffer, afgifter, system/transmission, moms) betaler alle det samme for – uanset leverandør.
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
