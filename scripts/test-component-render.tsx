// Test if the ValuePropositionComponent actually renders with the data
import React from 'react'

// Mock data that matches what Sanity returns
const mockBlock = {
  "_key": "saving-tips",
  "_type": "valueProposition",
  "heading": "Sådan Udnytter Du Historiske Prismønstre",
  "valueItems": [
    {
      "_key": "flexibility",
      "heading": "Vær Fleksibel",
      "description": "Flyt dit forbrug til timer med lave priser.",
      "icon": null
    }
  ]
}

// Simplified version of the component logic
function TestValueProposition({ block }: { block: any }) {
  console.log('[TEST] Component received block:', block)
  
  if (!block) {
    console.log('[TEST] Returning null - no block')
    return null
  }
  
  const items = block.valueItems || block.items || []
  console.log('[TEST] Items:', items)
  
  if (!items || items.length === 0) {
    console.log('[TEST] Returning null - no items')
    return null
  }
  
  console.log('[TEST] Component WOULD render!')
  return <div>Component would render here</div>
}

// Test the logic
console.log('Testing with mock data:')
TestValueProposition({ block: mockBlock })

// Test with empty data
console.log('\nTesting with empty block:')
TestValueProposition({ block: null })

// Test with no items
console.log('\nTesting with no items:')
TestValueProposition({ block: { ...mockBlock, valueItems: [], items: [] } })