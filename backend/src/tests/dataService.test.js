import { jest } from '@jest/globals'
import { DataService } from '../services/dataService.js'
import { 
  loadJsonData, 
  saveJsonData, 
  appendToJsonArray, 
  generateId,
  fileExists 
} from '../utils/fileUtils.js'

// Mock the file utilities
jest.mock('../utils/fileUtils.js')

describe('DataService', () => {
  let dataService

  beforeEach(() => {
    jest.clearAllMocks()
    dataService = new DataService()
  })

  describe('Product Management', () => {
    test('should get all products', async () => {
      const mockProducts = [
        { id: 'prod_001', name: 'tomato', category: 'vegetables' },
        { id: 'prod_002', name: 'apple', category: 'fruits' }
      ]
      
      loadJsonData.mockResolvedValue(mockProducts)
      
      const result = await dataService.getAllProducts()
      
      expect(loadJsonData).toHaveBeenCalledWith('products.json', [])
      expect(result).toEqual(mockProducts)
    })

    test('should add a new product', async () => {
      const productData = {
        name: 'tomato',
        category: 'vegetables',
        quantity: 50,
        unit: 'kg',
        userId: 'vendor_001',
        description: 'Fresh tomatoes'
      }

      generateId.mockReturnValue('prod_123')
      appendToJsonArray.mockResolvedValue([])

      const result = await dataService.addProduct(productData)

      expect(generateId).toHaveBeenCalledWith('prod')
      expect(appendToJsonArray).toHaveBeenCalledWith('products.json', expect.objectContaining({
        id: 'prod_123',
        name: 'tomato',
        category: 'vegetables',
        quantity: 50,
        unit: 'kg',
        userId: 'vendor_001',
        description: 'Fresh tomatoes',
        status: 'active'
      }))
      expect(result.id).toBe('prod_123')
      expect(result.submittedAt).toBeDefined()
    })

    test('should search products by name', async () => {
      const mockProducts = [
        { id: 'prod_001', name: 'tomato', category: 'vegetables', description: 'Fresh red tomatoes' },
        { id: 'prod_002', name: 'apple', category: 'fruits', description: 'Sweet apples' },
        { id: 'prod_003', name: 'potato', category: 'vegetables', description: 'Fresh potatoes' }
      ]
      
      loadJsonData.mockResolvedValue(mockProducts)
      
      const result = await dataService.searchProducts('tom')
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('tomato')
    })

    test('should validate product data correctly', () => {
      const validProduct = {
        name: 'tomato',
        category: 'vegetables',
        quantity: 50,
        unit: 'kg',
        userId: 'vendor_001'
      }

      expect(() => dataService.validateProductData(validProduct)).not.toThrow()

      const invalidProduct = {
        name: 'tomato',
        category: 'vegetables',
        // missing quantity, unit, userId
      }

      expect(() => dataService.validateProductData(invalidProduct)).toThrow('Missing required fields')
    })

    test('should validate product quantity', () => {
      const invalidQuantityProduct = {
        name: 'tomato',
        category: 'vegetables',
        quantity: -5,
        unit: 'kg',
        userId: 'vendor_001'
      }

      expect(() => dataService.validateProductData(invalidQuantityProduct)).toThrow('Quantity must be a positive number')
    })

    test('should validate product unit', () => {
      const invalidUnitProduct = {
        name: 'tomato',
        category: 'vegetables',
        quantity: 50,
        unit: 'invalid_unit',
        userId: 'vendor_001'
      }

      expect(() => dataService.validateProductData(invalidUnitProduct)).toThrow('Invalid unit')
    })
  })

  describe('Price Management', () => {
    test('should get prices by product', async () => {
      const mockPrices = [
        { id: 'price_001', productName: 'tomato', price: 45, unit: 'kg' },
        { id: 'price_002', productName: 'onion', price: 30, unit: 'kg' },
        { id: 'price_003', productName: 'tomato', price: 48, unit: 'kg' }
      ]
      
      loadJsonData.mockResolvedValue(mockPrices)
      
      const result = await dataService.getPricesByProduct('tomato')
      
      // Since we're mocking findJsonArrayItems behavior
      expect(loadJsonData).toHaveBeenCalledWith('prices.json', [])
    })

    test('should add price entry', async () => {
      const priceData = {
        productName: 'tomato',
        price: 45,
        unit: 'kg',
        source: 'market_data',
        location: 'delhi'
      }

      generateId.mockReturnValue('price_123')
      appendToJsonArray.mockResolvedValue([])

      const result = await dataService.addPriceEntry(priceData)

      expect(generateId).toHaveBeenCalledWith('price')
      expect(appendToJsonArray).toHaveBeenCalledWith('prices.json', expect.objectContaining({
        id: 'price_123',
        productName: 'tomato',
        price: 45,
        unit: 'kg',
        source: 'market_data',
        location: 'delhi'
      }))
      expect(result.date).toBeDefined()
    })

    test('should calculate average price', async () => {
      const mockPrices = [
        { productName: 'tomato', price: 40, date: '2024-01-15T10:00:00.000Z' },
        { productName: 'tomato', price: 45, date: '2024-01-16T10:00:00.000Z' },
        { productName: 'tomato', price: 50, date: '2024-01-17T10:00:00.000Z' }
      ]
      
      // Mock the getPricesByProduct method
      dataService.getPricesByProduct = jest.fn().mockResolvedValue(mockPrices)
      
      const result = await dataService.getAveragePrice('tomato', 30)
      
      expect(result.averagePrice).toBe(45)
      expect(result.dataPoints).toBe(3)
      expect(result.period).toBe(30)
    })

    test('should validate price data correctly', () => {
      const validPrice = {
        productName: 'tomato',
        price: 45,
        unit: 'kg',
        source: 'market_data'
      }

      expect(() => dataService.validatePriceData(validPrice)).not.toThrow()

      const invalidPrice = {
        productName: 'tomato',
        price: -45,
        unit: 'kg',
        source: 'market_data'
      }

      expect(() => dataService.validatePriceData(invalidPrice)).toThrow('Price must be a positive number')
    })
  })

  describe('Translation Management', () => {
    test('should get translation', async () => {
      const mockTranslations = {
        'en_hi': {
          'hello': 'नमस्ते',
          'price': 'कीमत'
        }
      }
      
      loadJsonData.mockResolvedValue(mockTranslations)
      
      const result = await dataService.getTranslation('en', 'hi', 'hello')
      
      expect(loadJsonData).toHaveBeenCalledWith('translations.json', {})
    })

    test('should add translation', async () => {
      const mockTranslations = {
        'en_hi': {
          'hello': 'नमस्ते'
        }
      }
      
      loadJsonData.mockResolvedValue(mockTranslations)
      saveJsonData.mockResolvedValue()

      const result = await dataService.addTranslation('en', 'hi', 'price', 'कीमत')

      expect(saveJsonData).toHaveBeenCalledWith('translations.json', expect.objectContaining({
        'en_hi': expect.objectContaining({
          'hello': 'नमस्ते',
          'price': 'कीमत'
        })
      }))
      expect(result).toEqual({
        fromLang: 'en',
        toLang: 'hi',
        originalText: 'price',
        translatedText: 'कीमत'
      })
    })
  })

  describe('Market Analysis', () => {
    test('should get market trends', async () => {
      const mockPrices = [
        { productName: 'tomato', price: 40, date: '2024-01-10T10:00:00.000Z' },
        { productName: 'tomato', price: 50, date: '2024-01-17T10:00:00.000Z' }
      ]
      
      dataService.getPricesByProduct = jest.fn().mockResolvedValue(mockPrices)
      
      const result = await dataService.getMarketTrends('tomato', 30)
      
      expect(result.trend).toBe('increasing')
      expect(result.change).toBe(25)
      expect(result.firstPrice).toBe(40)
      expect(result.lastPrice).toBe(50)
    })

    test('should get popular products', async () => {
      const mockProducts = [
        { id: 'prod_001', name: 'tomato', quantity: 100, status: 'active' },
        { id: 'prod_002', name: 'onion', quantity: 50, status: 'active' },
        { id: 'prod_003', name: 'potato', quantity: 75, status: 'active' }
      ]
      
      loadJsonData.mockResolvedValue(mockProducts)
      
      const result = await dataService.getPopularProducts(2)
      
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('tomato')
      expect(result[1].name).toBe('potato')
    })

    test('should get category stats', async () => {
      const mockProducts = [
        { id: 'prod_001', name: 'tomato', category: 'vegetables', quantity: 50 },
        { id: 'prod_002', name: 'onion', category: 'vegetables', quantity: 30 },
        { id: 'prod_003', name: 'apple', category: 'fruits', quantity: 25 }
      ]
      
      loadJsonData.mockResolvedValue(mockProducts)
      
      const result = await dataService.getCategoryStats()
      
      expect(result.vegetables.count).toBe(2)
      expect(result.vegetables.totalQuantity).toBe(80)
      expect(result.fruits.count).toBe(1)
      expect(result.fruits.totalQuantity).toBe(25)
    })
  })
})