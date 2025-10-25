'use client'

import React from 'react'
import ProviderList from '@/components/ProviderList'
import type { ProviderListBlock } from '@/types/sanity'

type Props = {
  block: ProviderListBlock
  className?: string
  variant?: 'default' | 'sidebar'
}

export default function ProviderListClientWrapper({ block, className = '', variant = 'default' }: Props) {
  return (
    <div className={className}>
      <ProviderList block={block as any} variant={variant} />
    </div>
  )
}
