/**
 * Phase 5: Client-Only Components - Comprehensive Tests
 * Tests for hydration safety, SSR shells, and client component functionality
 */

import { test, expect } from '@playwright/test'

// Set environment variable for SSR mode
test.use({
  extraHTTPHeaders: {
    'x-test-mode': 'ssr'
  }
})

test.describe('Phase 5: Hydration Safety Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set environment for SSR
    await page.addInitScript(() => {
      (window as any).__TEST_MODE__ = 'ssr'
    })
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Fail test on hydration errors
        if (text.includes('Hydration') || text.includes('Text content does not match')) {
          throw new Error(`Hydration error detected: ${text}`)
        }
      }
    })
  })

  test('homepage loads without hydration errors', async ({ page }) => {
    // Navigate to homepage
    const response = await page.goto('http://localhost:3002/', {
      waitUntil: 'networkidle'
    })
    
    // Check response status
    expect(response?.status()).toBe(200)
    
    // Wait for hydration to complete
    await page.waitForTimeout(2000)
    
    // Check that no hydration errors occurred (handled by console listener)
    
    // Verify key elements are present
    await expect(page.locator('h1:has-text("Spar penge på din elregning")')).toBeVisible()
  })

  test.describe('Priority 1: Core Interactive Components', () => {
    
    test('LivePriceGraph - SSR shell renders then hydrates', async ({ page }) => {
      await page.goto('http://localhost:3002/')
      
      // Check SSR shell is present (immediate)
      const shell = page.locator('[data-testid="live-price-shell"], .bg-gradient-to-br.from-blue-50')
      await expect(shell.first()).toBeVisible({ timeout: 100 })
      
      // Wait for hydration and check interactive component loads
      await page.waitForTimeout(3000)
      
      // Check for interactive elements (charts use canvas or svg)
      const chart = page.locator('canvas, svg.recharts-surface').first()
      await expect(chart).toBeVisible({ timeout: 10000 })
    })

    test('PriceCalculator - form interaction works after hydration', async ({ page }) => {
      await page.goto('http://localhost:3002/')
      
      // Wait for calculator to hydrate
      await page.waitForTimeout(2000)
      
      // Find consumption input
      const input = page.locator('input[type="number"]').first()
      await expect(input).toBeVisible({ timeout: 5000 })
      
      // Test interaction
      await input.fill('2000')
      
      // Check that calculation happens
      const result = page.locator('text=/kr\\/måned/i').first()
      await expect(result).toBeVisible()
    })

    test('ProviderList - loads and displays providers', async ({ page }) => {
      await page.goto('http://localhost:3002/')
      
      // Check SSR shell shows loading state
      const shell = page.locator('text=/Indlæser eludbydere/i, text=/Henter priser/i').first()
      
      // Wait for providers to load
      await page.waitForTimeout(3000)
      
      // Check that Vindstød appears (business requirement)
      const vindstod = page.locator('text=/Vindstød/i').first()
      await expect(vindstod).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Priority 2: Data Visualization Components', () => {
    
    test('CO2EmissionsChart - renders with data', async ({ page }) => {
      await page.goto('http://localhost:3002/')
      
      // Look for CO2 chart or its shell
      const co2Section = page.locator('text=/CO2/i').first()
      
      if (await co2Section.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Wait for chart to hydrate
        await page.waitForTimeout(2000)
        
        // Check for chart elements
        const chart = page.locator('.recharts-wrapper, canvas').first()
        await expect(chart).toBeVisible({ timeout: 10000 })
      }
    })

    test('MonthlyProductionChart - displays production data', async ({ page }) => {
      await page.goto('http://localhost:3002/')
      
      // Look for production chart section
      const productionSection = page.locator('text=/produktion/i').first()
      
      if (await productionSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Wait for hydration
        await page.waitForTimeout(2000)
        
        // Verify chart renders
        const chart = page.locator('.recharts-surface, canvas').first()
        await expect(chart).toBeVisible({ timeout: 10000 })
      }
    })
  })

  test.describe('Priority 3: Complex Interactive Components', () => {
    
    test('ConsumptionMap - map shell renders correctly', async ({ page }) => {
      await page.goto('http://localhost:3002/')
      
      // Look for map section
      const mapSection = page.locator('text=/Elforbrug pr. Region/i, text=/Danmarks Forbrugskort/i').first()
      
      if (await mapSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Check shell is present
        await expect(mapSection).toBeVisible()
        
        // Check for region cards in shell
        const regionCard = page.locator('text=/Østdanmark/i, text=/Vestdanmark/i').first()
        await expect(regionCard).toBeVisible()
      }
    })

    test('ApplianceCalculator - calculator shell and interaction', async ({ page }) => {
      await page.goto('http://localhost:3002/')
      
      // Look for appliance calculator
      const calcSection = page.locator('text=/Beregn dit strømforbrug/i').first()
      
      if (await calcSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Check shell renders with sample appliances
        const sampleAppliance = page.locator('text=/Kaffemaskine/i, text=/Vaskemaskine/i').first()
        await expect(sampleAppliance).toBeVisible()
        
        // Wait for hydration
        await page.waitForTimeout(2000)
        
        // Check "Add appliance" button becomes interactive
        const addButton = page.locator('button:has-text("Tilføj apparat")').first()
        if (await addButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
          await addButton.click()
          // Check modal or dropdown appears
          const modal = page.locator('[role="dialog"], [role="listbox"]').first()
          await expect(modal).toBeVisible({ timeout: 3000 })
        }
      }
    })

    test('ForbrugTracker - authentication flow shell', async ({ page }) => {
      await page.goto('http://localhost:3002/')
      
      // Look for Forbrug Tracker section
      const trackerSection = page.locator('text=/Forbrug Tracker/i, text=/Eloverblik/i').first()
      
      if (await trackerSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Check shell shows connect button
        const connectButton = page.locator('button:has-text("Forbind med Eloverblik")').first()
        await expect(connectButton).toBeVisible()
        
        // Check benefits cards are shown
        const benefitCard = page.locator('text=/Faktiske Data/i, text=/Præcise Priser/i').first()
        await expect(benefitCard).toBeVisible()
      }
    })
  })

  test.describe('Hydration-Safe Patterns', () => {
    
    test('date rendering is consistent between server and client', async ({ page }) => {
      await page.goto('http://localhost:3002/')
      
      // Get initial HTML
      const initialHtml = await page.content()
      
      // Wait for hydration
      await page.waitForTimeout(2000)
      
      // Get hydrated HTML
      const hydratedHtml = await page.content()
      
      // Check that date formats haven't changed (no hydration mismatch)
      // Dates should use consistent Danish timezone
      const datePattern = /\d{1,2}\.\s*(januar|februar|marts|april|maj|juni|juli|august|september|oktober|november|december)/i
      
      const initialDates = initialHtml.match(datePattern) || []
      const hydratedDates = hydratedHtml.match(datePattern) || []
      
      // Dates should remain consistent
      if (initialDates.length > 0) {
        expect(initialDates[0]).toBe(hydratedDates[0])
      }
    })

    test('localStorage access is properly guarded', async ({ page }) => {
      // Clear localStorage before test
      await page.goto('http://localhost:3002/')
      await page.evaluate(() => localStorage.clear())
      
      // Reload page
      await page.reload()
      
      // Should not have hydration errors even with empty localStorage
      await page.waitForTimeout(2000)
      
      // Check page still works
      await expect(page.locator('h1').first()).toBeVisible()
    })

    test('window and document access is properly guarded', async ({ page }) => {
      // Test SSR build doesn't break
      const response = await page.goto('http://localhost:3002/', {
        waitUntil: 'domcontentloaded'
      })
      
      // Check HTML was returned (not an error)
      const html = await response?.text()
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html')
      
      // No window/document errors during SSR
      expect(html).not.toContain('window is not defined')
      expect(html).not.toContain('document is not defined')
    })
  })

  test.describe('Progressive Enhancement', () => {
    
    test('page is usable before JavaScript loads', async ({ page }) => {
      // Disable JavaScript
      await page.setJavaScriptEnabled(false)
      
      await page.goto('http://localhost:3002/')
      
      // Check critical content is visible
      await expect(page.locator('h1').first()).toBeVisible()
      await expect(page.locator('h2').first()).toBeVisible()
      
      // Check SSR shells provide meaningful content
      const content = await page.textContent('body')
      expect(content).toContain('DinElportal')
      expect(content).toContain('elpriser')
    })

    test('Suspense boundaries work correctly', async ({ page }) => {
      await page.goto('http://localhost:3002/')
      
      // Initially shells should be visible
      const shells = await page.locator('.animate-pulse, [data-loading="true"]').count()
      
      // Wait for components to load
      await page.waitForTimeout(5000)
      
      // Loading indicators should be replaced
      const loadingAfter = await page.locator('.animate-pulse:visible, [data-loading="true"]:visible').count()
      expect(loadingAfter).toBeLessThan(shells)
    })
  })

  test.describe('Performance', () => {
    
    test('First Contentful Paint is fast', async ({ page }) => {
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const fcp = entries.find(entry => entry.name === 'first-contentful-paint')
            if (fcp) {
              resolve(fcp.startTime)
            }
          }).observe({ entryTypes: ['paint'] })
          
          // Fallback if already painted
          setTimeout(() => {
            const fcp = performance.getEntriesByName('first-contentful-paint')[0]
            resolve(fcp ? fcp.startTime : 0)
          }, 100)
        })
      })
      
      await page.goto('http://localhost:3002/')
      
      // FCP should be under 2 seconds in dev mode
      expect(Number(metrics)).toBeLessThan(2000)
    })

    test('Time to Interactive is reasonable', async ({ page }) => {
      const start = Date.now()
      
      await page.goto('http://localhost:3002/')
      
      // Wait for main interactive elements
      await page.locator('button').first().waitFor({ state: 'visible', timeout: 10000 })
      
      const tti = Date.now() - start
      
      // TTI should be under 5 seconds in dev mode
      expect(tti).toBeLessThan(5000)
    })
  })
})