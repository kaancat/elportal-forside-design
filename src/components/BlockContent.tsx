
import React from 'react'
import { BlockContent as BlockContentType } from '@/types/sanity'

interface BlockContentProps {
  content: BlockContentType[]
  className?: string
}

const BlockContent: React.FC<BlockContentProps> = ({ content, className = '' }) => {
  const renderBlock = (block: BlockContentType) => {
    if (block._type !== 'block') return null

    const style = block.style || 'normal'
    const linkMap: Record<string, string> = {}
    ;(block.markDefs || []).forEach(def => {
      if (def._type === 'link' && def._key && typeof def.href === 'string') {
        linkMap[def._key] = def.href
      }
    })

    const children = block.children?.map((child, index) => {
      if (child._type !== 'span') return null
      const text = child.text
      const marks = child.marks || []

      const isStrong = marks.includes('strong')
      const isEm = marks.includes('em')
      const linkKey = marks.find(m => linkMap[m])

      let el: React.ReactNode = text
      if (isStrong) el = <strong key={`s-${index}`}>{el}</strong>
      if (isEm) el = <em key={`e-${index}`}>{el}</em>

      if (linkKey) {
        const href = linkMap[linkKey]
        const external = /^https?:\/\//i.test(href) && !href.startsWith('/')
        el = (
          <a
            key={`a-${index}`}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'nofollow noopener' : undefined}
            className="text-brand-green hover:text-brand-green-dark underline underline-offset-2"
          >
            {el}
          </a>
        )
      }

      return <span key={index}>{el}</span>
    })

    // Render based on style
    switch (style) {
      case 'h1':
        return <h1 className="text-3xl font-bold mb-4">{children}</h1>
      case 'h2':
        return <h2 className="text-2xl font-bold mb-3">{children}</h2>
      case 'h3':
        return <h3 className="text-xl font-bold mb-2">{children}</h3>
      case 'blockquote':
        return <blockquote className="border-l-4 border-brand-green pl-4 italic mb-4">{children}</blockquote>
      default:
        return <p className="mb-4">{children}</p>
    }
  }

  return (
    <div className={className}>
      {content.map((block, index) => (
        <div key={index}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  )
}

export default BlockContent
