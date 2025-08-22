'use client'

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return

    // Track Next.js hydration time
    const handleWebVitals = (metric: any) => {
      switch (metric.name) {
        case 'Next.js-hydration':
          console.log(`🚀 Hydration completed in ${metric.value}ms`)
          break
        case 'Next.js-route-change-to-render':
          console.log(`🔄 Route change to render: ${metric.value}ms`)
          break
        case 'Next.js-render':
          console.log(`🎨 Render completed in ${metric.value}ms`)
          break
        case 'FCP':
          console.log(`🎯 First Contentful Paint: ${metric.value}ms`)
          break
        case 'LCP':
          console.log(`📊 Largest Contentful Paint: ${metric.value}ms`)
          break
        case 'CLS':
          console.log(`📐 Cumulative Layout Shift: ${metric.value}`)
          break
        case 'FID':
          console.log(`⚡ First Input Delay: ${metric.value}ms`)
          break
        case 'INP':
          console.log(`🖱️ Interaction to Next Paint: ${metric.value}ms`)
          break
        case 'TTFB':
          console.log(`🌐 Time to First Byte: ${metric.value}ms`)
          break
      }
    }

    // Use dynamic import to avoid SSR issues
    import('web-vitals').then(({ onCLS, onFCP, onFID, onINP, onLCP, onTTFB }) => {
      onCLS(handleWebVitals)
      onFCP(handleWebVitals)
      onFID(handleWebVitals)
      onINP(handleWebVitals)
      onLCP(handleWebVitals)
      onTTFB(handleWebVitals)
    }).catch(() => {
      // Silently fail if web-vitals isn't available
    })

    // Listen for Next.js specific metrics
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.startsWith('Next.js')) {
          handleWebVitals({
            name: entry.name,
            value: entry.duration,
            id: Date.now().toString(),
          })
        }
      }
    })

    observer.observe({ type: 'measure', buffered: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null // This component doesn't render anything
}