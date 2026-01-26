import { 
  loadJsonData, 
  saveJsonData, 
  appendToJsonArray, 
  generateId,
  fileExists,
  initializeDataFiles,
  findJsonArrayItems,
  updateJsonArrayItem,
  deleteJsonArrayItem
} from '../utils/fileUtils.js'
import { dataService } from '../services/dataService.js'
import fs from 'fs/promises'
import path from 'path'

describe('JSON Storage Integration Tests', () => {
  const testDataDir = path.join(process.cwd(), 'src', 'data', 'test')
  const originalDataDir = path.join(process.cwd(), 'src', 'data')

  beforeAll(async () => {
    // Create test data directory
    try {
      await fs.mkdir(testDataDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
  })

  afterAll(async () => {
    // Clean up test files
    try {
      const files = await fs.readdir(testDataDir)
      for (const file of files) {
        await fs.unlink(path.join(testDataDir, file))
      }
      await fs.rmdir(testDataDir)
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  describe('File Utilities', () => {
    test('should generate unique IDs', () => {
      const id1 = generateId('test')
      const id2 = generateId('test')
      
      expect(id1).toMatch(/^test_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^test_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    test('should save and load JSON data', async () => {
      const testData = { name: 'test', value: 123 }
      
      await saveJsonData('test-save-load.json', testData)
      const loadedData = await loadJsonData('test-save-load.json')
      
      expect(loadedData).toEqual(testData)
    })

    test('should handle non-existent files with default values', async () => {
      const defaultValue = { default: true }
      const result = await loadJsonData('non-existent.json', defaultValue)
      
      expect(result).toEqual(defaultValue)
    })

    test('should append to JSON arrays', async () => {
      const initialData = [{ id: 1, name: 'first' }]
      const newItem = { id: 2, name: 'second' }
      
      await saveJsonData('test-append.json', initialData)
      await appendToJsonArray('test-append.json', newItem)
      
      const result = await loadJsonData('test-append.json')
      expect(result).toHaveLength(2)
      expect(result[1]).toEqual(newItem)
    })
  })

  describe('Data Service Integration', () => {
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
        // missing required fields
      }

      expect(() => dataService.validateProductData(invalidProduct)).toThrow()
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
        price: -45, // negative price
        unit: 'kg',
        source: 'market_data'
      }

      expect(() => dataService.validatePriceData(invalidPrice)).toThrow()
    })
  })

  describe('Real Data Files', () => {
    test('should load existing products data', async () => {
      const products = await loadJsonData('products.json', [])
      
      expect(Array.isArray(products)).toBe(true)
      if (products.length > 0) {
        expect(products[0]).toHaveProperty('id')
        expect(products[0]).toHaveProperty('name')
        expect(products[0]).toHaveProperty('category')
      }
    })

    test('should load existing prices data', async () => {
      const prices = await loadJsonData('prices.json', [])
      
      expect(Array.isArray(prices)).toBe(true)
      if (prices.length > 0) {
        expect(prices[0]).toHaveProperty('productName')
        expect(prices[0]).toHaveProperty('price')
        expect(prices[0]).toHaveProperty('unit')
      }
    })

    test('should load existing translations data', async () => {
      const translations = await loadJsonData('translations.json', {})
      
      expect(typeof translations).toBe('object')
      // Check if it has expected language pairs
      const keys = Object.keys(translations)
      expect(keys.some(key => key.includes('en_'))).toBe(true)
    })
  })

  describe('Data Operations', () => {
    test('should find items by criteria', async () => {
      const testData = [
        { id: 1, category: 'fruits', name: 'apple' },
        { id: 2, category: 'vegetables', name: 'tomato' },
        { id: 3, category: 'fruits', name: 'banana' }
      ]
      
      await saveJsonData('test-find.json', testData)
      
      const fruits = await findJsonArrayItems('test-find.json', { category: 'fruits' })
      expect(fruits).toHaveLength(2)
      expect(fruits.every(item => item.category === 'fruits')).toBe(true)
    })

    test('should update items by ID', async () => {
      const testData = [
        { id: 1, name: 'original', status: 'active' }
      ]
      
      await saveJsonData('test-update.json', testData)
      
      const updated = await updateJsonArrayItem('test-update.json', 1, { name: 'updated' })
      expect(updated.name).toBe('updated')
      expect(updated.status).toBe('active') // should preserve other fields
    })

    test('should delete items by ID', async () => {
      const testData = [
        { id: 1, name: 'first' },
        { id: 2, name: 'second' }
      ]
      
      await saveJsonData('test-delete.json', testData)
      
      const deleted = await deleteJsonArrayItem('test-delete.json', 1)
      expect(deleted.name).toBe('first')
      
      const remaining = await loadJsonData('test-delete.json')
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe(2)
    })
  })
})