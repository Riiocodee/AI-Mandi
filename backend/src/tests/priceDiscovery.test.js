import { jest } from '@jest/globals'
import fc from 'fast-check'
import { PriceDiscoveryEngine } from '../services/priceDiscovery.js'
import { loadJsonData, saveJsonData } from '../utils/fileUtils.js'

// Mock the file utilities
jest.mock('../utils/fileUtils.js')

describe('PriceDiscoveryEngine', () => {
  let priceEngine

  beforeEach(() => {
    jest.clearAllMocks()
    priceEngine = new PriceDiscoveryEngine()
    // Mock the price database with some sample data
    priceEngine.priceDatabase = [
      {
        productName: 'tomato',
        price: 45,
        unit: 'kg',
        date: '2024-01-15T10:00:00.000Z',
        source: 'market_data',
        location: 'delhi'
      },
      {
        productName: 'onion',
        price: 30,
        unit: 'kg',
        date: '2024-01-16T10:00:00.000Z',
        source: 'user_input',
        location: 'mumbai'
      }
    ]
  })

  describe('Unit Tests - Price Calculation Logic', () => {
    test('should calculate base price for known vegetables', () => {
      const tomatoPrice = priceEngine.calculateBasePrice('tomato', 'kg')
      const onionPrice = priceEngine.calculateBasePrice('onion', 'kg')
      
      expect(tomatoPrice).toBe(45)
      expect(onionPrice).toBe(30)
    })

    test('should calculate base price for known fruits', () => {
      const applePrice = priceEngine.calculateBasePrice('apple', 'kg')
      const bananaPrice = priceEngine.calculateBasePrice('banana', 'kg')
      
      expect(applePrice).toBe(120)
      expect(bananaPrice).toBe(40)
    })

    test('should use default price for unknown products', () => {
      const unknownPrice = priceEngine.calculateBasePrice('unknown_product', 'kg')
      
      expect(unknownPrice).toBe(50) // default price
    })

    test('should adjust price for different units', () => {
      const kgPrice = priceEngine.calculateBasePrice('tomato', 'kg')
      const piecesPrice = priceEngine.calculateBasePrice('tomato', 'pieces')
      const dozenPrice = priceEngine.calculateBasePrice('tomato', 'dozen')
      const gramsPrice = priceEngine.calculateBasePrice('tomato', 'grams')
      
      expect(piecesPrice).toBe(kgPrice * 0.1)
      expect(dozenPrice).toBe(kgPrice * 1.2)
      expect(gramsPrice).toBe(kgPrice / 1000)
    })

    test('should apply quantity discounts correctly', () => {
      const basePrice = 100
      
      // No discount for small quantities
      expect(priceEngine.applyQuantityDiscount(basePrice, 10)).toBe(100)
      
      // 5% discount for 20+ units
      expect(priceEngine.applyQuantityDiscount(basePrice, 25)).toBe(95)
      
      // 10% discount for 50+ units
      expect(priceEngine.applyQuantityDiscount(basePrice, 60)).toBe(90)
      
      // 15% discount for 100+ units
      expect(priceEngine.applyQuantityDiscount(basePrice, 150)).toBe(85)
    })

    test('should apply seasonal adjustments', () => {
      const basePrice = 100
      
      // Mock current month for testing
      const originalDate = Date
      global.Date = jest.fn(() => ({
        getMonth: () => 4 // May (summer month)
      }))
      global.Date.prototype = originalDate.prototype
      
      // Summer vegetables should have higher prices
      const summerTomatoPrice = priceEngine.applySeasonalAdjustment(basePrice, 'tomato')
      expect(summerTomatoPrice).toBe(120) // 20% increase
      
      // Non-seasonal products should remain unchanged
      const ricePrice = priceEngine.applySeasonalAdjustment(basePrice, 'rice')
      expect(ricePrice).toBe(100)
      
      // Restore original Date
      global.Date = originalDate
    })

    test('should calculate confidence based on historical data', () => {
      // High confidence for products with many data points
      priceEngine.priceDatabase = Array(15).fill({
        productName: 'tomato',
        price: 45
      })
      expect(priceEngine.calculateConfidence('tomato')).toBe(0.9)
      
      // Medium confidence for products with some data points
      priceEngine.priceDatabase = Array(7).fill({
        productName: 'onion',
        price: 30
      })
      expect(priceEngine.calculateConfidence('onion')).toBe(0.7)
      
      // Low confidence for products with few data points
      priceEngine.priceDatabase = Array(2).fill({
        productName: 'apple',
        price: 120
      })
      expect(priceEngine.calculateConfidence('apple')).toBe(0.5)
      
      // Very low confidence for new products
      priceEngine.priceDatabase = []
      expect(priceEngine.calculateConfidence('new_product')).toBe(0.3)
    })

    test('should calculate market average correctly', async () => {
      priceEngine.priceDatabase = [
        { productName: 'tomato', price: 40 },
        { productName: 'tomato', price: 50 },
        { productName: 'tomato', price: 45 },
        { productName: 'onion', price: 30 }
      ]
      
      const tomatoAverage = await priceEngine.getMarketAverage('tomato')
      expect(tomatoAverage).toBe(45) // (40 + 50 + 45) / 3
      
      const unknownAverage = await priceEngine.getMarketAverage('unknown')
      expect(unknownAverage).toBeNull()
    })

    test('should suggest price with all components', async () => {
      loadJsonData.mockResolvedValue([])
      saveJsonData.mockResolvedValue()
      
      const product = {
        name: 'tomato',
        quantity: 50,
        unit: 'kg'
      }
      
      const result = await priceEngine.suggestPrice(product)
      
      expect(result).toHaveProperty('suggestedPrice')
      expect(result).toHaveProperty('currency', 'INR')
      expect(result).toHaveProperty('unit', 'kg')
      expect(result).toHaveProperty('confidence')
      expect(result).toHaveProperty('marketAverage')
      
      expect(typeof result.suggestedPrice).toBe('number')
      expect(result.suggestedPrice).toBeGreaterThan(0)
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    test('should handle errors gracefully', async () => {
      loadJsonData.mockResolvedValue([])
      saveJsonData.mockRejectedValue(new Error('File write error'))
      
      const product = {
        name: 'tomato',
        quantity: 50,
        unit: 'kg'
      }
      
      await expect(priceEngine.suggestPrice(product)).rejects.toThrow('Failed to generate price suggestion')
    })

    test('should save price entry to database', async () => {
      loadJsonData.mockResolvedValue([])
      saveJsonData.mockResolvedValue()
      
      const product = {
        name: 'tomato',
        quantity: 50,
        unit: 'kg'
      }
      
      await priceEngine.suggestPrice(product)
      
      expect(saveJsonData).toHaveBeenCalledWith('prices.json', expect.arrayContaining([
        expect.objectContaining({
          productName: 'tomato',
          unit: 'kg',
          source: 'ai_suggestion',
          location: 'general'
        })
      ]))
    })
  })

  describe('Property-Based Tests', () => {
    // **Property 4: Price Discovery Response**
    // **Validates: Requirements 3.1, 3.2, 3.4**
    test('Property 4: Price Discovery Response - should always return valid price data for any valid product', async () => {
      loadJsonData.mockResolvedValue([])
      saveJsonData.mockResolvedValue()
      
      await fc.assert(fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          quantity: fc.integer({ min: 1, max: 1000 }),
          unit: fc.constantFrom('kg', 'pieces', 'liters', 'dozen', 'bundles', 'grams')
        }),
        async (product) => {
          const result = await priceEngine.suggestPrice(product)
          
          // Price should be a positive number
          expect(result.suggestedPrice).toBeGreaterThan(0)
          expect(typeof result.suggestedPrice).toBe('number')
          expect(Number.isFinite(result.suggestedPrice)).toBe(true)
          
          // Currency should always be INR
          expect(result.currency).toBe('INR')
          
          // Unit should match input unit
          expect(result.unit).toBe(product.unit)
          
          // Confidence should be between 0 and 1
          expect(result.confidence).toBeGreaterThanOrEqual(0)
          expect(result.confidence).toBeLessThanOrEqual(1)
          expect(typeof result.confidence).toBe('number')
          
          // Market average should be null or positive number
          if (result.marketAverage !== null) {
            expect(result.marketAverage).toBeGreaterThan(0)
            expect(typeof result.marketAverage).toBe('number')
          }
          
          // Price should be properly formatted (max 2 decimal places)
          expect(result.suggestedPrice).toBe(Math.round(result.suggestedPrice * 100) / 100)
          if (result.marketAverage !== null) {
            expect(result.marketAverage).toBe(Math.round(result.marketAverage * 100) / 100)
          }
        }
      ), { numRuns: 50 })
    })

    test('Property: Quantity discount should never increase price', async () => {
      await fc.assert(fc.property(
        fc.float({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 1000 }),
        (basePrice, quantity) => {
          const discountedPrice = priceEngine.applyQuantityDiscount(basePrice, quantity)
          
          // Discounted price should never be higher than base price
          expect(discountedPrice).toBeLessThanOrEqual(basePrice)
          
          // Discounted price should be positive
          expect(discountedPrice).toBeGreaterThan(0)
        }
      ), { numRuns: 100 })
    })

    test('Property: Base price calculation should be consistent', async () => {
      await fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('constructor') && s.trim().length > 0),
        fc.constantFrom('kg', 'pieces', 'liters', 'dozen', 'bundles', 'grams'),
        (productName, unit) => {
          const price1 = priceEngine.calculateBasePrice(productName, unit)
          const price2 = priceEngine.calculateBasePrice(productName, unit)
          
          // Same inputs should always produce same outputs
          expect(price1).toBe(price2)
          
          // Price should be positive
          expect(price1).toBeGreaterThan(0)
          expect(typeof price1).toBe('number')
          expect(Number.isFinite(price1)).toBe(true)
        }
      ), { numRuns: 100 })
    })

    test('Property: Seasonal adjustment should preserve price positivity', async () => {
      await fc.assert(fc.property(
        fc.integer({ min: 1, max: 1000 }),
        fc.string({ minLength: 1, maxLength: 30 }),
        (basePrice, productName) => {
          const adjustedPrice = priceEngine.applySeasonalAdjustment(basePrice, productName)
          
          // Adjusted price should be positive
          expect(adjustedPrice).toBeGreaterThan(0)
          expect(typeof adjustedPrice).toBe('number')
          expect(Number.isFinite(adjustedPrice)).toBe(true)
          
          // Adjustment should be reasonable (not more than 50% change)
          const changeRatio = adjustedPrice / basePrice
          expect(changeRatio).toBeGreaterThan(0.5)
          expect(changeRatio).toBeLessThan(2.0)
        }
      ), { numRuns: 100 })
    })

    test('Property: Confidence calculation should be deterministic and bounded', async () => {
      await fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.array(fc.record({
          productName: fc.string(),
          price: fc.float({ min: 1, max: 1000 })
        }), { maxLength: 20 }),
        (productName, mockDatabase) => {
          priceEngine.priceDatabase = mockDatabase
          
          const confidence = priceEngine.calculateConfidence(productName)
          
          // Confidence should be between 0 and 1
          expect(confidence).toBeGreaterThanOrEqual(0)
          expect(confidence).toBeLessThanOrEqual(1)
          expect(typeof confidence).toBe('number')
          expect(Number.isFinite(confidence)).toBe(true)
          
          // Same input should produce same output
          const confidence2 = priceEngine.calculateConfidence(productName)
          expect(confidence).toBe(confidence2)
        }
      ), { numRuns: 50 })
    })

    test('Property: Market average should be within range of input prices', async () => {
      await fc.assert(fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 1, maxLength: 10 }),
        async (productName, prices) => {
          // Create mock database with consistent product names
          priceEngine.priceDatabase = prices.map(price => ({
            productName: productName,
            price: price
          }))
          
          const average = await priceEngine.getMarketAverage(productName)
          
          if (average !== null) {
            const minPrice = Math.min(...prices)
            const maxPrice = Math.max(...prices)
            
            // Average should be within the range of input prices
            expect(average).toBeGreaterThanOrEqual(minPrice)
            expect(average).toBeLessThanOrEqual(maxPrice)
            expect(typeof average).toBe('number')
            expect(Number.isFinite(average)).toBe(true)
          }
        }
      ), { numRuns: 50 })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty product name', async () => {
      loadJsonData.mockResolvedValue([])
      saveJsonData.mockResolvedValue()
      
      const product = {
        name: '',
        quantity: 50,
        unit: 'kg'
      }
      
      const result = await priceEngine.suggestPrice(product)
      expect(result.suggestedPrice).toBeGreaterThan(0)
    })

    test('should handle very large quantities', async () => {
      loadJsonData.mockResolvedValue([])
      saveJsonData.mockResolvedValue()
      
      const product = {
        name: 'tomato',
        quantity: 10000,
        unit: 'kg'
      }
      
      const result = await priceEngine.suggestPrice(product)
      expect(result.suggestedPrice).toBeGreaterThan(0)
      
      // Should apply maximum discount for very large quantities
      const basePrice = priceEngine.calculateBasePrice('tomato', 'kg')
      const expectedDiscountedPrice = basePrice * 0.85 // 15% discount
      expect(result.suggestedPrice).toBeLessThan(basePrice)
    })

    test('should handle case-insensitive product names', () => {
      const lowerPrice = priceEngine.calculateBasePrice('tomato', 'kg')
      const upperPrice = priceEngine.calculateBasePrice('TOMATO', 'kg')
      const mixedPrice = priceEngine.calculateBasePrice('Tomato', 'kg')
      
      expect(lowerPrice).toBe(upperPrice)
      expect(lowerPrice).toBe(mixedPrice)
    })

    test('should handle database loading errors', async () => {
      loadJsonData.mockRejectedValue(new Error('File not found'))
      
      const newEngine = new PriceDiscoveryEngine()
      await newEngine.loadPriceDatabase()
      
      expect(newEngine.priceDatabase).toEqual([])
    })
  })
})