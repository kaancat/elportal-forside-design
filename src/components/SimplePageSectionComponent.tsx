import React from 'react';

// We'll need a proper type for this later from sanity.ts
interface PageSectionProps {
  block: any; 
}

const SimplePageSectionComponent: React.FC<PageSectionProps> = ({ block }) => {
  // Very basic renderer for the Portable Text array
  const renderContent = (content: any[]) => {
    if (!content || !Array.isArray(content)) return null;
    
    return content.map(block => {
      if (block._type === 'block' && block.children) {
        return (
          <p key={block._key} className="mb-4 text-gray-700 leading-relaxed">
            {block.children.map((child: any) => child.text).join('')}
          </p>
        );
      }
      return null;
    }).filter(Boolean);
  };

  // Handle missing or invalid block data
  if (!block) {
    return (
      <div className="py-8 border-b border-gray-200">
        <p className="text-gray-500 italic">No content available</p>
      </div>
    );
  }

  return (
    <div className="py-8 border-b border-gray-200">
      {block.title && (
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          {block.title}
        </h2>
      )}
      <div className="prose prose-lg max-w-none">
        {renderContent(block.content)}
      </div>
    </div>
  );
};

export default SimplePageSectionComponent; 