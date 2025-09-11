'use client'

import dynamic from 'next/dynamic'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

// Navigation and Footer can now be server-side rendered since we fixed React Router issues
import Navigation from '@/components/Navigation'
import type { SiteSettings } from '@/types/sanity'
import Footer from '@/components/Footer'

const ReadingProgress = dynamic(
  () => import('@/components/ReadingProgress'),
  { ssr: false }
)

interface ClientLayoutProps {
  children: React.ReactNode
  showReadingProgress?: boolean
  initialSiteSettings?: SiteSettings | null
}

export default function ClientLayout({ children, showReadingProgress, initialSiteSettings }: ClientLayoutProps) {
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
      <Navigation initialSettings={initialSiteSettings} />
      {showReadingProgress && <ReadingProgress />}
      {children}
      <Footer initialSettings={initialSiteSettings} />
    </QueryClientProvider>
  )
}
