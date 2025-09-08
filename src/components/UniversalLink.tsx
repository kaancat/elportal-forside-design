'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface UniversalLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  target?: string
  rel?: string
  'data-testid'?: string
  title?: string
  role?: string
  'aria-label'?: string
}

/**
 * Universal Link component that works with Next.js App Router
 * - Internal links (starting with '/') use Next.js Link for client-side navigation
 * - External links use regular anchor tags
 * - Maintains compatibility with existing link props
 */
const UniversalLink = React.forwardRef<HTMLAnchorElement, UniversalLinkProps>(
  ({
    href,
    children,
    className,
    onClick,
    target,
    rel,
    'data-testid': dataTestId,
    title,
    role,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    // Check if this is an internal link
    const isInternalLink = href.startsWith('/')

    // Handle click events
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick()
      }
    }

    if (isInternalLink) {
      // Use Next.js Link for internal navigation
      return (
        <Link
          href={href}
          className={className}
          onClick={handleClick}
          data-testid={dataTestId}
          title={title}
          role={role}
          aria-label={ariaLabel}
          ref={ref}
          {...props}
        >
          {children}
        </Link>
      )
    }

    // Use regular anchor tag for external links
    return (
      <a
        href={href}
        className={className}
        onClick={handleClick}
        target={target || '_blank'}
        rel={rel || 'noopener noreferrer'}
        data-testid={dataTestId}
        title={title}
        role={role}
        aria-label={ariaLabel}
        ref={ref}
        {...props}
      >
        {children}
      </a>
    )
  }
)

UniversalLink.displayName = 'UniversalLink'

export default UniversalLink