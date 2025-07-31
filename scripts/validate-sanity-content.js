#!/usr/bin/env node

/**
 * Validates Sanity content against common schema errors
 * Run before creating content via API
 */

const SCHEMA_RULES = {
  hero: {
    requiredFields: ['headline', 'subheadline'],
    fieldNames: {
      headline: 'headline', // NOT 'title'
      subheadline: 'subheadline', // NOT 'subtitle'
    },
    optionalFields: ['image'],
  },
  
  heroWithCalculator: {
    requiredFields: ['title'],
    fieldNames: {
      title: 'title',
      subtitle: 'subtitle',
    },
    optionalFields: ['subtitle'],
  },
  
  valueItem: {
    requiredFields: ['heading', 'description'],
    fieldNames: {
      heading: 'heading', // NOT 'title'
    },
    iconFormat: 'icon.manager', // Must be object, not string
  },
  
  featureItem: {
    requiredFields: ['title', 'description'],
    fieldNames: {
      title: 'title', // NOT 'name'
    },
    iconFormat: 'icon.manager',
  },
  
  pageSection: {
    requiredFields: ['title', 'content'],
    allowedContentTypes: [
      'block',
      'image',
      'livePriceGraph',
      'renewableEnergyForecast',
      'monthlyProductionChart',
      'priceCalculator',
      'realPriceComparisonTable',
      'videoSection'
    ],
    notAllowedInContent: [
      'valueProposition',
      'priceExampleTable',
      'faqGroup',
      'featureList',
      'providerList',
      'hero',
      'heroWithCalculator',
      'callToActionSection'
    ],
  },
};

function validateContent(content, depth = 0) {
  const errors = [];
  const warnings = [];
  
  if (!content._type) {
    errors.push('Missing _type field');
    return { errors, warnings };
  }
  
  const rules = SCHEMA_RULES[content._type];
  if (!rules) {
    warnings.push(`No validation rules for type: ${content._type}`);
    return { errors, warnings };
  }
  
  // Check required fields
  if (rules.requiredFields) {
    for (const field of rules.requiredFields) {
      if (!content[field]) {
        errors.push(`${content._type}: Missing required field '${field}'`);
      }
    }
  }
  
  // Check field names
  if (rules.fieldNames) {
    for (const [correct, expected] of Object.entries(rules.fieldNames)) {
      // Check for common mistakes
      const commonMistakes = {
        headline: ['title'],
        subheadline: ['subtitle'],
        heading: ['title', 'name'],
      };
      
      if (commonMistakes[correct]) {
        for (const mistake of commonMistakes[correct]) {
          if (content[mistake] && !content[correct]) {
            errors.push(`${content._type}: Field '${mistake}' should be '${correct}'`);
          }
        }
      }
    }
  }
  
  // Check icon format
  if (rules.iconFormat && content.icon) {
    if (typeof content.icon === 'string') {
      errors.push(`${content._type}: Icon must be an object with _type: '${rules.iconFormat}', not a string`);
    } else if (content.icon._type !== rules.iconFormat) {
      errors.push(`${content._type}: Icon must have _type: '${rules.iconFormat}'`);
    }
  }
  
  // Special validation for pageSection content
  if (content._type === 'pageSection' && content.content) {
    for (const item of content.content) {
      if (item._type && rules.notAllowedInContent.includes(item._type)) {
        errors.push(`pageSection: '${item._type}' is not allowed inside pageSection.content. It must be a top-level contentBlock.`);
      }
      if (item._type && !rules.allowedContentTypes.includes(item._type)) {
        warnings.push(`pageSection: Unusual content type '${item._type}' in pageSection.content`);
      }
    }
  }
  
  // Validate nested content blocks
  if (content.contentBlocks && Array.isArray(content.contentBlocks)) {
    for (const block of content.contentBlocks) {
      const nested = validateContent(block, depth + 1);
      errors.push(...nested.errors);
      warnings.push(...nested.warnings);
    }
  }
  
  // Check for _key on array items
  if (depth > 0 && !content._key) {
    warnings.push(`${content._type}: Missing _key for array item`);
  }
  
  return { errors, warnings };
}

// Example usage
if (require.main === module) {
  const exampleContent = {
    _type: 'page',
    contentBlocks: [
      {
        _type: 'hero',
        _key: 'hero1',
        title: 'Wrong field name!', // This will be caught
        subtitle: 'Also wrong!', // This will be caught
      },
      {
        _type: 'valueItem',
        _key: 'value1',
        heading: 'Correct field name',
        description: 'This is correct',
        icon: 'Wind', // This will be caught - should be object
      },
      {
        _type: 'pageSection',
        _key: 'section1',
        title: 'Section Title',
        content: [
          {
            _type: 'block',
            _key: 'text1',
            children: [{ text: 'This is allowed' }],
          },
          {
            _type: 'valueProposition', // This will be caught - not allowed here
            _key: 'vp1',
          },
        ],
      },
    ],
  };
  
  console.log('Validating example content...\n');
  const { errors, warnings } = validateContent(exampleContent);
  
  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.forEach(err => console.log(`   - ${err}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warn => console.log(`   - ${warn}`));
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Content is valid!');
  }
}

module.exports = { validateContent, SCHEMA_RULES };