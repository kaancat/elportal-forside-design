/**
 * Centralized date formatting utilities
 * Ensures consistent date/time rendering between server and client
 * Prevents hydration mismatches from locale/timezone differences
 */

/**
 * Danish timezone constant
 */
export const DK_TIMEZONE = 'Europe/Copenhagen'

/**
 * Danish locale constant
 */
export const DK_LOCALE = 'da-DK'

/**
 * Default date format options for consistency
 */
export const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: DK_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}

export const DEFAULT_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: DK_TIMEZONE,
  hour: '2-digit',
  minute: '2-digit',
}

export const DEFAULT_DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  ...DEFAULT_DATE_OPTIONS,
  hour: '2-digit',
  minute: '2-digit',
}

/**
 * Format date consistently across server and client
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  
  // Always use Danish locale and Copenhagen timezone
  return dateObj.toLocaleDateString(DK_LOCALE, {
    timeZone: DK_TIMEZONE,
    ...options
  })
}

/**
 * Format time consistently
 */
export function formatTime(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = DEFAULT_TIME_OPTIONS
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  
  return dateObj.toLocaleTimeString(DK_LOCALE, {
    timeZone: DK_TIMEZONE,
    ...options
  })
}

/**
 * Format date and time consistently
 */
export function formatDateTime(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATETIME_OPTIONS
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  
  return dateObj.toLocaleString(DK_LOCALE, {
    timeZone: DK_TIMEZONE,
    ...options
  })
}

/**
 * Format relative time (e.g., "2 timer siden")
 * Note: This can cause hydration issues if time passes between server and client render
 * Use with SafeHydrate or suppressHydrationWarning
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Lige nu'
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minut' : 'minutter'} siden`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'time' : 'timer'} siden`
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'dag' : 'dage'} siden`
  
  return formatDate(dateObj)
}

/**
 * Format number consistently (Danish format)
 */
export function formatNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(DK_LOCALE, options).format(value)
}

/**
 * Format currency consistently (DKK)
 */
export function formatCurrency(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(DK_LOCALE, {
    style: 'currency',
    currency: 'DKK',
    ...options
  }).format(value)
}

/**
 * Format percentage consistently
 */
export function formatPercent(
  value: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(DK_LOCALE, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    ...options
  }).format(value / 100)
}

/**
 * Get ISO string in Danish timezone
 * Useful for consistent date inputs/APIs
 */
export function toISOStringDK(date: Date): string {
  // Normalize to Europe/Copenhagen by formatting to a stable locale string
  // and re-parsing to a Date, then emit ISO. This avoids off‑by‑one issues
  // when the client is not in Danish timezone or during DST transitions.
  const normalized = new Date(
    date.toLocaleString('sv-SE', { timeZone: DK_TIMEZONE })
  )
  return normalized.toISOString()
}

/**
 * Parse Danish date string to Date object
 */
export function parseDanishDate(dateStr: string): Date | null {
  // Handle DD-MM-YYYY or DD/MM/YYYY format
  const parts = dateStr.split(/[-/]/)
  if (parts.length !== 3) return null
  
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
  const year = parseInt(parts[2], 10)
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null
  
  return new Date(year, month, day)
}
