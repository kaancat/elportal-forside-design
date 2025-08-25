/**
 * Provider logo resolver
 * - Prefers Sanity-hosted logo URLs when available
 * - Otherwise returns any provided absolute URL as-is
 * - Finally falls back to the global /placeholder.svg
 *
 * Rationale: Avoid referencing /public/providers/* files which may not exist
 * on preview deployments and cause 404s. Source of truth should be Sanity CDN.
 */

function normalizeName(name?: string | null): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

export function resolveProviderLogoUrl(
  providerName?: string | null,
  sanityLogoUrl?: string | null
): string {
  // Prefer Sanity-hosted logo and optimize it
  if (sanityLogoUrl && sanityLogoUrl.startsWith('https://cdn.sanity.io/')) {
    return `${sanityLogoUrl}${sanityLogoUrl.includes('?') ? '&' : '?'}w=200&auto=format&fit=max`;
  }

  // If we have another absolute URL, return it as-is
  if (sanityLogoUrl && /^https?:\/\//.test(sanityLogoUrl)) {
    return sanityLogoUrl;
  }

  // Fallback to global placeholder
  return '/placeholder.svg';
}



