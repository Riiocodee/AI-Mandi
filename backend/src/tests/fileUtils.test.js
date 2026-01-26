import { jest } from '@jest/globals'
import fs from 'fs/promises'
import { 
  loadJsonData, 
  saveJsonData, 
  appendToJsonArray, 
  generateId,
  fileExists,
  initializeDataFiles 
} from '../utils/fileUtils.js'

// Mock fs module
jest.mock('fs/promises')

describe('FileUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loadJsonData', () => {
    test('should load valid JSON data', async () => {
      const mockData = { test: 'data' }
      fs.readFile.mockResolvedValue(JSON.stringify(mockData))
      fs.access.mockResolvedValue()

      const result = await loadJsonData('test.json')

      expect(result).toEqual(mockData)
      expect(fs.readFile).toHaveBeenCalled()
    })

    test('should return default value when file does not exist', async () => {
      const defaultValue = []
      fs.access.mockResolvedValue()
      fs.readFile.mockRejectedValue({ code: 'ENOENT' })
      fs.writeFile.mockResolvedValue()

      const result = await loadJsonData('test.json', defaultValue)

      expect(result).toEqual(defaultValue)
      expect(fs.writeFile).toHaveBeenCalled()
    })

    test('should handle invalid JSON', async () => {
      const defaultValue = {}
      fs.access.mockResolvedValue()
      fs.readFile.mockResolvedValue('invalid json')
      fs.writeFile.mockResolvedValue()

      const result = await loadJsonData('test.json', defaultValue)

      expect(result).toEqual(defaultValue)
    })
  })

  describe('saveJsonData', () => {
    test('should save JSON data to file', async () => {
      const testData = { test: 'data' }
      fs.access.mockResolvedValue()
      fs.writeFile.mockResolvedValue()

      await saveJsonData('test.json', testData)

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('test.json'),
        JSON.stringify(testData, null, 2),
        'utf8'
      )
    })
  })

  describe('generateId', () => {
    test('should generate unique ID with prefix', () => {
      const id1 = generateId('test')
      const id2 = generateId('test')

      expect(id1).toMatch(/^test_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^test_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })
  })
})