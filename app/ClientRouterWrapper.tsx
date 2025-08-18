'use client'

/**
 * Client Router Wrapper
 * Provides React Router context for SSR pages
 * This allows Navigation and Footer components to use RouterLink
 */

import { BrowserRouter } from 'react-router-dom'

export default function ClientRouterWrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>
}