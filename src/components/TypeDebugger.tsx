import React from 'react';

interface TypeDebuggerProps {
  block: any;
  index: number;
}

export const TypeDebugger: React.FC<TypeDebuggerProps> = ({ block, index }) => {
  const typeString = block._type;
  const typeLength = typeString?.length;
  const charCodes = typeString ? Array.from(typeString).map((c: string) => c.charCodeAt(0)) : [];
  
  // Check for invisible characters
  const hasInvisibleChars = charCodes.some(code => 
    code < 32 || // Control characters
    code === 127 || // DEL
    code === 160 || // Non-breaking space
    (code >= 0x200B && code <= 0x200F) || // Zero-width characters
    (code >= 0x2028 && code <= 0x202F) || // Line/paragraph separators
    code === 0xFEFF // Zero-width no-break space (BOM)
  );
  
  const expectedTypes = ['regionalComparison', 'pricingComparison', 'dailyPriceTimeline', 'infoCardsSection'];
  const isExpectedType = expectedTypes.includes(typeString);
  
  return (
    <div className="p-4 m-2 border border-gray-300 bg-gray-50 text-xs font-mono">
      <div className="font-bold mb-2">Block {index} Type Debug:</div>
      <div>Type string: "{typeString}"</div>
      <div>Type length: {typeLength}</div>
      <div>Char codes: [{charCodes.join(', ')}]</div>
      <div>Has invisible chars: {hasInvisibleChars ? '⚠️ YES' : '✅ NO'}</div>
      <div>Is expected type: {isExpectedType ? '✅ YES' : '❌ NO'}</div>
      {!isExpectedType && (
        <div className="mt-2 text-red-600">
          ⚠️ Type mismatch! Expected one of: {expectedTypes.join(', ')}
        </div>
      )}
      <div className="mt-2">
        Exact match tests:
        {expectedTypes.map(expected => (
          <div key={expected}>
            - {expected}: {typeString === expected ? '✅' : '❌'} 
            {typeString !== expected && ` (${typeString?.localeCompare(expected)})`}
          </div>
        ))}
      </div>
    </div>
  );
};