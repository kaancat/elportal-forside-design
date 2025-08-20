'use client'

/**
 * Client Router Wrapper
 * Provides React Router context for SSR pages
 * This allows Navigation and Footer components to use RouterLink
 */

import { BrowserRouter } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function ClientRouterWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only render BrowserRouter on client side to avoid document access during SSR
  if (!mounted) {
    return <>{children}</>
  }

  return <BrowserRouter>{children}</BrowserRouter>
}