/**
 * Provider logo resolver
 * - Prefers Sanity-hosted logo URLs when available
 * - Falls back to local static placeholders under /providers
 * - Finally falls back to the global /placeholder.svg
 */

const LOCAL_BASE = '/providers';

// Known providers mapped to local filenames (placeholders that can be swapped later)
const KNOWN_PROVIDER_FILES: Record<string, string> = {
  'vindstød': 'vindstod-logo.svg',
  'vindstod': 'vindstod-logo.svg',
  'norlys': 'norlys-logo.svg',
  'andel energi': 'andel-energi-logo.svg',
  'andel': 'andel-energi-logo.svg',
  'nrgi': 'nrgi-logo.svg',
  'energifyn': 'energifyn-logo.svg',
  'ok': 'ok-logo.svg',
  'velkommen': 'velkommen-logo.svg',
  'ewii': 'ewii-logo.svg',
  'dcc energi': 'dcc-logo.svg',
  'energi viborg': 'energi-viborg-logo.svg',
  'verdo': 'verdo-logo.svg'
};

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

  // Try known local placeholder by normalized provider name
  const key = normalizeName(providerName);
  const localFile = key ? KNOWN_PROVIDER_FILES[key] : undefined;
  if (localFile) {
    return `${LOCAL_BASE}/${localFile}`;
  }

  // Fallback to global placeholder
  return '/placeholder.svg';
}


