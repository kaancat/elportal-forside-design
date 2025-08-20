'use client'

import dynamic from 'next/dynamic'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// Client components with ssr: false to prevent hydration issues
const Navigation = dynamic(
  () => import('@/components/Navigation'),
  { ssr: false }
)

const Footer = dynamic(
  () => import('@/components/Footer'),
  { ssr: false }
)

const ReadingProgress = dynamic(
  () => import('@/components/ReadingProgress'),
  { ssr: false }
)

interface ClientLayoutProps {
  children: React.ReactNode
  showReadingProgress?: boolean
}

export default function ClientLayout({ children, showReadingProgress }: ClientLayoutProps) {
  // Create QueryClient instance for client-side data fetching
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <Navigation />
      {showReadingProgress && <ReadingProgress />}
      {children}
      <Footer />
    </QueryClientProvider>
  )
}