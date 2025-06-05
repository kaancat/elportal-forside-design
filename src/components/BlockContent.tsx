
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
    const children = block.children?.map((child, index) => {
      if (child._type === 'span') {
        let element = <span key={index}>{child.text}</span>
        
        // Apply marks (bold, italic, etc.)
        if (child.marks?.includes('strong')) {
          element = <strong key={index}>{child.text}</strong>
        }
        if (child.marks?.includes('em')) {
          element = <em key={index}>{child.text}</em>
        }
        
        return element
      }
      return null
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
