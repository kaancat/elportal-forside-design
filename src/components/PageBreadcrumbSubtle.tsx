'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageBreadcrumbSubtleProps {
  items: BreadcrumbItem[]
  variant?: 'floating' | 'inline' | 'sticky-bottom' | 'after-first'
  className?: string
}

export const PageBreadcrumbSubtle: React.FC<PageBreadcrumbSubtleProps> = ({ 
  items, 
  variant = 'floating',
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    // Show breadcrumb after user starts scrolling
    const handleScroll = () => {
      setScrollY(window.scrollY)
      if (window.scrollY > 100) {
        setIsVisible(true)
      } else if (window.scrollY < 50) {
        setIsVisible(false)
      }
    }

    // Initial check
    handleScroll()
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!items || items.length === 0) {
    return null
  }

  const baseStyles = cn(
    "transition-all duration-300 ease-in-out",
    className
  )

  const variantStyles = {
    floating: cn(
      baseStyles,
      "fixed top-20 left-4 z-40 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-100",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
    ),
    inline: cn(
      baseStyles,
      "text-xs text-gray-400"
    ),
    'sticky-bottom': cn(
      baseStyles,
      "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-40 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-100",
      "opacity-70 hover:opacity-100"
    ),
    'after-first': cn(
      baseStyles,
      "opacity-60 hover:opacity-100"
    )
  }

  const breadcrumbContent = (
    <Breadcrumb className={variantStyles[variant]}>
      <BreadcrumbList className="text-xs">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="text-gray-500 hover:text-gray-700">Forside</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbSeparator className="text-gray-400" />
            <BreadcrumbItem>
              {index === items.length - 1 ? (
                <BreadcrumbPage className="text-gray-600">{item.label}</BreadcrumbPage>
              ) : item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href} className="text-gray-500 hover:text-gray-700">{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-gray-600">{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )

  // For SEO purposes, we always render the breadcrumb in the DOM
  // but control visibility with CSS
  if (variant === 'floating' || variant === 'sticky-bottom') {
    return breadcrumbContent
  }

  return breadcrumbContent
}