'use client'

/**
 * SafeHydrate Component
 * Prevents hydration mismatches by rendering fallback content on server
 * and actual content only after client hydration
 */

import { ReactNode } from 'react'
import { useIsClient } from '@/hooks/useIsClient'

interface SafeHydrateProps {
  children: ReactNode
  fallback?: ReactNode
  /**
   * If true, renders children on server too (with suppressHydrationWarning)
   * Use only when you're certain the content is identical
   */
  force?: boolean
}

/**
 * Safely renders client-only content without hydration errors
 * @example
 * <SafeHydrate fallback={<div>Loading...</div>}>
 *   <ComponentWithWindowAccess />
 * </SafeHydrate>
 */
export function SafeHydrate({ children, fallback = null, force = false }: SafeHydrateProps) {
  const isClient = useIsClient()
  
  if (force) {
    return <div suppressHydrationWarning>{children}</div>
  }
  
  return <>{isClient ? children : fallback}</>
}

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
}

/**
 * Wrapper for components that should only render on client
 * More semantic than SafeHydrate for pure client components
 */
export function ClientOnly({ children, fallback = null, className }: ClientOnlyProps) {
  const isClient = useIsClient()
  
  if (!isClient) {
    return fallback ? <>{fallback}</> : className ? <div className={className} /> : null
  }
  
  return <>{children}</>
}

interface ClientGateProps {
  children: (isClient: boolean) => ReactNode
}

/**
 * Render prop pattern for conditional client rendering
 * @example
 * <ClientGate>
 *   {(isClient) => isClient ? <InteractiveChart /> : <StaticChart />}
 * </ClientGate>
 */
export function ClientGate({ children }: ClientGateProps) {
  const isClient = useIsClient()
  return <>{children(isClient)}</>
}

/**
 * Higher-order component for making components client-only
 */
export function withClientOnly<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function ClientOnlyComponent(props: P) {
    return (
      <ClientOnly fallback={fallback}>
        <Component {...props} />
      </ClientOnly>
    )
  }
}