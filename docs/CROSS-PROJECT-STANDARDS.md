# ElPortal Cross-Project Development Standards

## Overview

This document establishes unified development standards for both elportal-forside-design and sanityelpriscms projects to ensure consistency, quality, and seamless integration.

## 1. Code Style Standards

### 1.1 TypeScript Standards (Both Projects)

```typescript
// ✅ GOOD: Explicit types, clear naming
interface ProviderData {
  id: string;
  name: string;
  slug: string;
  spotPriceFee: number;
  monthlyFee: number;
  isPrimary?: boolean; // Optional fields clearly marked
}

// ❌ BAD: Implicit types, unclear naming
interface Provider {
  id: any;
  n: string;
  fee: number;
  primary: boolean | undefined;
}
```

### 1.2 Naming Conventions

#### File Naming
```
Frontend Components:     PascalCase.tsx      (PriceCalculator.tsx)
Sanity Schemas:         camelCase.ts        (heroSection.ts)
Utilities:              kebab-case.ts       (format-price.ts)
Types:                  PascalCase.types.ts (Provider.types.ts)
Constants:              UPPER_SNAKE.ts      (API_ENDPOINTS.ts)
```

#### Variable Naming
```typescript
// Components & Classes: PascalCase
const PriceCalculatorWidget: React.FC = () => {};

// Functions & Variables: camelCase
const calculateTotalPrice = (base: number) => {};
const currentPrice = 0;

// Constants: UPPER_SNAKE_CASE
const MAX_CONSUMPTION_KWH = 10000;
const API_BASE_URL = 'https://api.energidataservice.dk';

// Boolean Flags: is/has/should prefix
const isLoading = false;
const hasError = false;
const shouldUpdate = true;
```

### 1.3 Import Organization

```typescript
// 1. External dependencies
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// 2. Internal absolute imports
import { Button } from '@/components/ui/button';
import { calculatePrice } from '@/lib/utils';
import type { Provider } from '@/types/provider';

// 3. Relative imports
import { PriceDisplay } from './PriceDisplay';
import styles from './Calculator.module.css';

// 4. Type imports (separate)
import type { CalculatorProps } from './types';
```

## 2. Schema Design Standards

### 2.1 Sanity Schema Patterns

```typescript
// schemas/hero.ts
export default {
  name: 'hero',
  title: 'Hero Section',
  type: 'document',
  fields: [
    {
      name: 'headline',          // ✅ Consistent field naming
      title: 'Overskrift',       // ✅ Danish UI labels
      type: 'string',
      validation: (Rule) => Rule.required().max(60),
      description: 'Hovedoverskrift (maks 60 tegn for SEO)'
    },
    {
      name: 'subheadline',
      title: 'Underoverskrift',
      type: 'string',
      validation: (Rule) => Rule.max(160),
      description: 'Understøttende tekst (maks 160 tegn)'
    },
    {
      name: 'image',
      title: 'Billede',
      type: 'image',
      options: {
        hotspot: true,           // ✅ Enable focal point selection
        metadata: ['dimensions'] // ✅ Store image dimensions
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt tekst',
          validation: (Rule) => Rule.required(),
          description: 'Beskrivelse for skærmlæsere og SEO'
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'headline',
      subtitle: 'subheadline',
      media: 'image'
    }
  }
};
```

### 2.2 Field Naming Matrix

| Content Type | Title Field | Subtitle Field | Body Field | Items Field |
|--------------|-------------|----------------|------------|-------------|
| hero | headline | subheadline | - | - |
| pageSection | title | - | content | - |
| valueProposition | title | - | - | items |
| faqGroup | title | - | - | faqItems |
| featureList | title | subtitle | - | features |

### 2.3 Content Validation Rules

```typescript
// Always validate user input
validation: (Rule) => Rule
  .required()
  .min(10)
  .max(160)
  .error('Skal være mellem 10 og 160 tegn'),

// Conditional validation
validation: (Rule) => Rule.custom((value, context) => {
  if (context.parent?.showButton && !value) {
    return 'Knaptekst er påkrævet når knap vises';
  }
  return true;
}),

// Array validation
validation: (Rule) => Rule
  .min(1)
  .max(6)
  .error('Skal have mellem 1 og 6 elementer')
```

## 3. Component Development Standards

### 3.1 Component Structure

```typescript
// components/PriceCalculator/PriceCalculator.tsx
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// 1. Type definitions
interface PriceCalculatorProps {
  variant?: 'default' | 'compact';
  initialConsumption?: number;
  onCalculate?: (result: CalculationResult) => void;
}

// 2. Validation schema
const calculatorSchema = z.object({
  consumption: z.number().min(0).max(50000),
  region: z.enum(['DK1', 'DK2']),
  period: z.enum(['month', 'year'])
});

// 3. Component implementation
export const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  variant = 'default',
  initialConsumption = 4000,
  onCalculate
}) => {
  // 4. State management
  const [isCalculating, setIsCalculating] = useState(false);
  
  // 5. Form handling
  const form = useForm({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      consumption: initialConsumption,
      region: 'DK1',
      period: 'year'
    }
  });
  
  // 6. Event handlers
  const handleSubmit = useCallback(async (data: z.infer<typeof calculatorSchema>) => {
    setIsCalculating(true);
    try {
      const result = await calculatePrice(data);
      onCalculate?.(result);
    } finally {
      setIsCalculating(false);
    }
  }, [onCalculate]);
  
  // 7. Render
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      {/* Component JSX */}
    </form>
  );
};

// 8. Display name for debugging
PriceCalculator.displayName = 'PriceCalculator';
```

### 3.2 Hook Standards

```typescript
// hooks/useElectricityPrices.ts
export function useElectricityPrices(region: 'DK1' | 'DK2') {
  return useQuery({
    queryKey: ['electricity-prices', region],
    queryFn: () => fetchElectricityPrices(region),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Failed to fetch electricity prices:', error);
    }
  });
}
```

## 4. API Integration Standards

### 4.1 API Client Pattern

```typescript
// services/api/energiDataService.ts
class EnergiDataService {
  private baseUrl = 'https://api.energidataservice.dk';
  private rateLimiter = new RateLimiter(40, 10000); // 40 req/10s
  
  async fetchPrices(params: PriceParams): Promise<PriceData[]> {
    await this.rateLimiter.acquire();
    
    const url = new URL(`${this.baseUrl}/dataset/Elspotprices`);
    url.searchParams.append('offset', '0');
    url.searchParams.append('start', params.startDate);
    url.searchParams.append('end', params.endDate);
    url.searchParams.append('filter', JSON.stringify({
      PriceArea: params.region
    }));
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'max-age=300' // 5 min cache
      }
    });
    
    if (!response.ok) {
      throw new ApiError(`API error: ${response.status}`, response.status);
    }
    
    const data = await response.json();
    return this.transformPriceData(data.records);
  }
  
  private transformPriceData(records: any[]): PriceData[] {
    return records.map(record => ({
      timestamp: record.HourDK,
      region: record.PriceArea,
      spotPrice: record.SpotPriceDKK / 1000, // Convert to kr/kWh
      currency: 'DKK'
    }));
  }
}

export const energiDataService = new EnergiDataService();
```

### 4.2 Error Handling Standards

```typescript
// lib/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Usage in components
try {
  const data = await api.fetchData();
} catch (error) {
  if (error instanceof ApiError) {
    if (error.statusCode === 429) {
      showNotification('For mange forespørgsler. Prøv igen senere.');
    } else {
      showNotification('Der opstod en fejl. Prøv igen.');
    }
  } else {
    console.error('Unexpected error:', error);
    showNotification('Uventet fejl opstod.');
  }
}
```

## 5. Testing Standards

### 5.1 Component Testing

```typescript
// PriceCalculator.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PriceCalculator } from './PriceCalculator';

describe('PriceCalculator', () => {
  it('should calculate price with default values', async () => {
    const onCalculate = jest.fn();
    render(<PriceCalculator onCalculate={onCalculate} />);
    
    const calculateButton = screen.getByRole('button', { name: /beregn/i });
    await userEvent.click(calculateButton);
    
    await waitFor(() => {
      expect(onCalculate).toHaveBeenCalledWith(
        expect.objectContaining({
          totalPrice: expect.any(Number),
          consumption: 4000
        })
      );
    });
  });
  
  it('should validate consumption input', async () => {
    render(<PriceCalculator />);
    
    const input = screen.getByLabelText(/forbrug/i);
    await userEvent.clear(input);
    await userEvent.type(input, '-100');
    
    const error = await screen.findByText(/skal være et positivt tal/i);
    expect(error).toBeInTheDocument();
  });
});
```

### 5.2 Integration Testing

```typescript
// tests/integration/content-sync.test.ts
describe('Content Synchronization', () => {
  it('should render all Sanity content blocks', async () => {
    const mockPage = {
      contentBlocks: [
        { _type: 'hero', _key: '1', headline: 'Test' },
        { _type: 'priceCalculator', _key: '2' },
        { _type: 'valueProposition', _key: '3', items: [] }
      ]
    };
    
    render(<Page data={mockPage} />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByTestId('price-calculator')).toBeInTheDocument();
    expect(screen.getByTestId('value-proposition')).toBeInTheDocument();
  });
});
```

## 6. Documentation Standards

### 6.1 Code Documentation

```typescript
/**
 * Calculates the total electricity price including all fees and VAT
 * 
 * @param spotPrice - The spot price in øre/kWh from the API
 * @param provider - The electricity provider with fee structure
 * @param consumption - Monthly consumption in kWh
 * @returns Total price breakdown including all components
 * 
 * @example
 * ```typescript
 * const price = calculateTotalPrice(150, vindstodProvider, 300);
 * console.log(price.total); // 2.59 kr/kWh
 * ```
 */
export function calculateTotalPrice(
  spotPrice: number,
  provider: Provider,
  consumption: number
): PriceBreakdown {
  // Implementation
}
```

### 6.2 Component Documentation

```typescript
/**
 * PriceCalculator Component
 * 
 * Interactive calculator for electricity price estimation.
 * Integrates with real-time pricing data and provider information.
 * 
 * @component
 * @example
 * ```tsx
 * <PriceCalculator
 *   variant="compact"
 *   initialConsumption={3500}
 *   onCalculate={(result) => console.log(result)}
 * />
 * ```
 */
```

## 7. Git Standards

### 7.1 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks
- `sync`: Cross-project synchronization

#### Examples
```
feat(calculator): add monthly payment estimation

- Add monthly cost calculation based on consumption
- Include all fees and taxes in calculation
- Show breakdown of cost components

Closes #123

---

sync(schemas): update hero schema field names

- Change title -> headline in hero schema
- Change subtitle -> subheadline for consistency
- Update TypeScript types in frontend
- Update both ContentBlocks renderers

Breaking change: Requires content migration
```

### 7.2 Branch Naming

```
feature/[ticket-id]-brief-description
bugfix/[ticket-id]-brief-description
hotfix/critical-issue-description
release/v[major].[minor].[patch]
sync/schema-update-description
```

## 8. Performance Standards

### 8.1 Bundle Size Limits

```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui', 'framer-motion'],
          'data-vendor': ['@tanstack/react-query', '@sanity/client']
        }
      }
    },
    // Warn if chunks exceed limits
    chunkSizeWarningLimit: 500, // 500kb
  }
};
```

### 8.2 Performance Budgets

```typescript
// performance.config.ts
export const performanceBudgets = {
  lighthouse: {
    performance: 90,
    accessibility: 100,
    bestPractices: 90,
    seo: 100
  },
  metrics: {
    fcp: 1800,    // First Contentful Paint: 1.8s
    lcp: 2500,    // Largest Contentful Paint: 2.5s
    fid: 100,     // First Input Delay: 100ms
    cls: 0.1,     // Cumulative Layout Shift: 0.1
    ttfb: 600     // Time to First Byte: 600ms
  }
};
```

## 9. Security Standards

### 9.1 Environment Variables

```bash
# Frontend (.env)
VITE_SANITY_PROJECT_ID=yxesi03x        # ✅ Public
VITE_SANITY_DATASET=production         # ✅ Public
VITE_SANITY_API_TOKEN=                 # ❌ Never commit
VITE_SENTRY_DSN=                       # ⚠️  Public but sensitive

# Sanity (.env)
SANITY_STUDIO_PROJECT_ID=yxesi03x      # ✅ Public
SANITY_STUDIO_DATASET=production       # ✅ Public
SANITY_AUTH_TOKEN=                     # ❌ Never commit
```

### 9.2 Input Validation

```typescript
// Always validate user input
const userInputSchema = z.object({
  consumption: z.number()
    .min(0, 'Forbrug skal være positivt')
    .max(50000, 'Forbrug er for højt')
    .transform(val => Math.round(val * 100) / 100), // Round to 2 decimals
  
  email: z.string()
    .email('Ugyldig email')
    .toLowerCase()
    .trim(),
  
  region: z.enum(['DK1', 'DK2'], {
    errorMap: () => ({ message: 'Vælg venligst DK1 eller DK2' })
  })
});
```

## 10. Accessibility Standards

### 10.1 Component Accessibility

```tsx
// Always include proper ARIA labels and semantic HTML
<button
  aria-label="Beregn elpris"
  aria-busy={isCalculating}
  aria-disabled={!isValid}
  onClick={handleCalculate}
>
  {isCalculating ? (
    <>
      <Spinner aria-hidden="true" />
      <span className="sr-only">Beregner...</span>
    </>
  ) : (
    'Beregn pris'
  )}
</button>

// Provide keyboard navigation
<div
  role="tablist"
  aria-label="Vælg prisperiode"
  onKeyDown={handleKeyNavigation}
>
  {periods.map((period, index) => (
    <button
      key={period}
      role="tab"
      aria-selected={selectedPeriod === period}
      aria-controls={`panel-${period}`}
      tabIndex={selectedPeriod === period ? 0 : -1}
    >
      {period}
    </button>
  ))}
</div>
```

### 10.2 Color Contrast Requirements

```scss
// Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
$color-primary: #0066CC;      // 4.5:1 on white
$color-text: #333333;         // 12.6:1 on white
$color-text-muted: #666666;   // 5.7:1 on white
$color-error: #CC0000;        // 5.9:1 on white
$color-success: #008000;      // 5.1:1 on white
```

## 11. Monitoring Standards

### 11.1 Logging Standards

```typescript
// Structured logging with correlation IDs
import { logger } from '@/lib/logger';

logger.info('Price calculation started', {
  correlationId: requestId,
  userId: user?.id,
  action: 'calculate_price',
  metadata: {
    consumption: input.consumption,
    region: input.region
  }
});

// Error logging with context
logger.error('API request failed', {
  correlationId: requestId,
  error: error.message,
  stack: error.stack,
  endpoint: '/api/prices',
  statusCode: error.statusCode
});
```

### 11.2 Performance Monitoring

```typescript
// Track key user interactions
import { trackEvent } from '@/lib/analytics';

trackEvent('price_calculation', {
  consumption: formData.consumption,
  region: formData.region,
  provider: selectedProvider.slug,
  calculationTime: endTime - startTime,
  success: true
});

// Monitor API performance
const startTime = performance.now();
const response = await fetch(url);
const duration = performance.now() - startTime;

if (duration > 1000) {
  logger.warn('Slow API response', {
    endpoint: url,
    duration,
    statusCode: response.status
  });
}
```

---

*These standards ensure consistent, high-quality development across both ElPortal projects. Review and update regularly based on team feedback and evolving best practices.*