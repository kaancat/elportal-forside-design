/**
 * Hook to detect if code is running on the client side
 * Prevents hydration mismatches by providing consistent server/client detection
 */

import { useEffect, useState } from 'react'

/**
 * Returns true if running on client, false on server
 * Starts as false to match server, then updates after mount
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    // Only runs on client after hydration
    setIsClient(true)
  }, [])
  
  return isClient
}

/**
 * Hook with callback for client-only operations
 * Ensures code only runs after hydration is complete
 */
export function useClientOnly(callback: () => void | (() => void)): void {
  useEffect(() => {
    const cleanup = callback()
    return cleanup
  }, [callback])
}

/**
 * Returns true immediately if on client (for conditional rendering)
 * WARNING: Can cause hydration mismatch if used incorrectly
 * Prefer useIsClient() for most cases
 */
export function isClientSide(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Safe window access that returns undefined on server
 */
export function getWindow(): Window | undefined {
  if (typeof window !== 'undefined') {
    return window
  }
  return undefined
}

/**
 * Safe document access that returns undefined on server
 */
export function getDocument(): Document | undefined {
  if (typeof document !== 'undefined') {
    return document
  }
  return undefined
}