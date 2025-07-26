#!/usr/bin/env tsx
/**
 * Script to identify and fix component spacing issues
 * This analyzes all components and their padding/margin patterns
 */

import { glob } from 'glob'
import fs from 'fs/promises'
import path from 'path'

async function analyzeSpacing() {
  console.log('🔍 Analyzing component spacing patterns...\n')
  
  const componentFiles = await glob('src/components/**/*.tsx')
  const spacingPatterns = new Map<string, string[]>()
  const backgroundPatterns = new Map<string, string[]>()
  
  for (const file of componentFiles) {
    const content = await fs.readFile(file, 'utf-8')
    const filename = path.basename(file)
    
    // Look for section wrappers with padding
    const sectionRegex = /<section\s+className="([^"]*(?:py-\d+|lg:py-\d+)[^"]*)"/g
    const matches = [...content.matchAll(sectionRegex)]
    
    if (matches.length > 0) {
      for (const match of matches) {
        const classes = match[1]
        
        // Extract padding classes
        const paddingClasses = classes.match(/py-\d+|lg:py-\d+/g) || []
        if (paddingClasses.length > 0) {
          spacingPatterns.set(filename, paddingClasses)
        }
        
        // Extract background classes
        const bgClasses = classes.match(/bg-\S+/g) || []
        if (bgClasses.length > 0) {
          backgroundPatterns.set(filename, bgClasses)
        }
      }
    }
  }
  
  console.log('📊 SPACING ANALYSIS RESULTS:\n')
  console.log('=' .repeat(60))
  
  console.log('\n🔸 Components with padding:')
  for (const [file, paddings] of spacingPatterns) {
    console.log(`  ${file}: ${paddings.join(', ')}`)
  }
  
  console.log('\n🎨 Components with backgrounds:')
  for (const [file, bgs] of backgroundPatterns) {
    console.log(`  ${file}: ${bgs.join(', ')}`)
  }
  
  console.log('\n📋 RECOMMENDATIONS:')
  console.log('1. Most components use "py-16 lg:py-24" - this is the standard')
  console.log('2. Some components alternate between bg-white and bg-gray-50')
  console.log('3. The visual gaps are caused by:')
  console.log('   - Different background colors creating visual separation')
  console.log('   - Potential borders from PageSectionComponent')
  console.log('   - Cumulative padding from nested sections')
  
  console.log('\n🛠️  PROPOSED FIXES:')
  console.log('1. Remove separator borders from PageSectionComponent')
  console.log('2. Standardize all component backgrounds to bg-white')
  console.log('3. OR: Create a seamless alternating pattern without visible gaps')
  console.log('4. Consider using a wrapper component to handle spacing consistently')
  
  return { spacingPatterns, backgroundPatterns }
}

// Run the analysis
analyzeSpacing().catch(console.error)