import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get the data directory path
const DATA_DIR = path.join(__dirname, '..', 'data')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(DATA_DIR, { recursive: true })
      console.log('Created data directory:', DATA_DIR)
    } else {
      throw error
    }
  }
}

// Load JSON data from file
export async function loadJsonData(filename, defaultValue = null) {
  try {
    await ensureDataDir()
    const filePath = path.join(DATA_DIR, filename)
    
    try {
      const data = await fs.readFile(filePath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return default value
        if (defaultValue !== null) {
          await saveJsonData(filename, defaultValue)
          return defaultValue
        }
        return null
      } else if (error instanceof SyntaxError) {
        console.error(`Invalid JSON in file ${filename}:`, error.message)
        // Return default value for invalid JSON
        if (defaultValue !== null) {
          await saveJsonData(filename, defaultValue)
          return defaultValue
        }
        return null
      }
      throw error
    }
  } catch (error) {
    console.error(`Error loading JSON data from ${filename}:`, error)
    throw error
  }
}

// Save JSON data to file
export async function saveJsonData(filename, data) {
  try {
    await ensureDataDir()
    const filePath = path.join(DATA_DIR, filename)
    const jsonData = JSON.stringify(data, null, 2)
    await fs.writeFile(filePath, jsonData, 'utf8')
    console.log(`Saved data to ${filename}`)
  } catch (error) {
    console.error(`Error saving JSON data to ${filename}:`, error)
    throw error
  }
}

// Append data to JSON array file
export async function appendToJsonArray(filename, newItem) {
  try {
    const existingData = await loadJsonData(filename, [])
    if (!Array.isArray(existingData)) {
      throw new Error(`File ${filename} does not contain an array`)
    }
    
    existingData.push(newItem)
    await saveJsonData(filename, existingData)
    return existingData
  } catch (error) {
    console.error(`Error appending to JSON array ${filename}:`, error)
    throw error
  }
}

// Update item in JSON array by ID
export async function updateJsonArrayItem(filename, itemId, updatedItem, idField = 'id') {
  try {
    const existingData = await loadJsonData(filename, [])
    if (!Array.isArray(existingData)) {
      throw new Error(`File ${filename} does not contain an array`)
    }
    
    const itemIndex = existingData.findIndex(item => item[idField] === itemId)
    if (itemIndex === -1) {
      throw new Error(`Item with ${idField} ${itemId} not found`)
    }
    
    existingData[itemIndex] = { ...existingData[itemIndex], ...updatedItem }
    await saveJsonData(filename, existingData)
    return existingData[itemIndex]
  } catch (error) {
    console.error(`Error updating item in JSON array ${filename}:`, error)
    throw error
  }
}

// Delete item from JSON array by ID
export async function deleteJsonArrayItem(filename, itemId, idField = 'id') {
  try {
    const existingData = await loadJsonData(filename, [])
    if (!Array.isArray(existingData)) {
      throw new Error(`File ${filename} does not contain an array`)
    }
    
    const itemIndex = existingData.findIndex(item => item[idField] === itemId)
    if (itemIndex === -1) {
      throw new Error(`Item with ${idField} ${itemId} not found`)
    }
    
    const deletedItem = existingData.splice(itemIndex, 1)[0]
    await saveJsonData(filename, existingData)
    return deletedItem
  } catch (error) {
    console.error(`Error deleting item from JSON array ${filename}:`, error)
    throw error
  }
}

// Find items in JSON array by criteria
export async function findJsonArrayItems(filename, criteria = {}) {
  try {
    const data = await loadJsonData(filename, [])
    if (!Array.isArray(data)) {
      throw new Error(`File ${filename} does not contain an array`)
    }
    
    if (Object.keys(criteria).length === 0) {
      return data
    }
    
    return data.filter(item => {
      return Object.keys(criteria).every(key => {
        if (typeof criteria[key] === 'string') {
          return item[key] && item[key].toLowerCase().includes(criteria[key].toLowerCase())
        }
        return item[key] === criteria[key]
      })
    })
  } catch (error) {
    console.error(`Error finding items in JSON array ${filename}:`, error)
    throw error
  }
}

// Get item from JSON array by ID
export async function getJsonArrayItem(filename, itemId, idField = 'id') {
  try {
    const data = await loadJsonData(filename, [])
    if (!Array.isArray(data)) {
      throw new Error(`File ${filename} does not contain an array`)
    }
    
    return data.find(item => item[idField] === itemId) || null
  } catch (error) {
    console.error(`Error getting item from JSON array ${filename}:`, error)
    throw error
  }
}

// Generate unique ID for new items
export function generateId(prefix = 'item') {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${prefix}_${timestamp}_${random}`
}

// Check if file exists
export async function fileExists(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename)
    await fs.access(filePath)
    return true
  } catch (error) {
    return false
  }
}

// Get file stats
export async function getFileStats(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename)
    return await fs.stat(filePath)
  } catch (error) {
    console.error(`Error getting file stats for ${filename}:`, error)
    return null
  }
}

// List all files in data directory
export async function listDataFiles() {
  try {
    await ensureDataDir()
    const files = await fs.readdir(DATA_DIR)
    return files.filter(file => file.endsWith('.json'))
  } catch (error) {
    console.error('Error listing data files:', error)
    return []
  }
}

// Backup data file
export async function backupJsonData(filename) {
  try {
    const data = await loadJsonData(filename)
    if (data) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupFilename = `${filename.replace('.json', '')}_backup_${timestamp}.json`
      await saveJsonData(backupFilename, data)
      console.log(`Backup created: ${backupFilename}`)
      return backupFilename
    }
    return null
  } catch (error) {
    console.error(`Error creating backup for ${filename}:`, error)
    throw error
  }
}

// Initialize data files with default content if they don't exist
export async function initializeDataFiles() {
  try {
    await ensureDataDir()
    
    // Initialize products.json if it doesn't exist
    const productsExist = await fileExists('products.json')
    if (!productsExist) {
      await saveJsonData('products.json', [])
      console.log('Initialized products.json')
    }
    
    // Initialize prices.json if it doesn't exist
    const pricesExist = await fileExists('prices.json')
    if (!pricesExist) {
      await saveJsonData('prices.json', [])
      console.log('Initialized prices.json')
    }
    
    // Initialize translations.json if it doesn't exist
    const translationsExist = await fileExists('translations.json')
    if (!translationsExist) {
      await saveJsonData('translations.json', {})
      console.log('Initialized translations.json')
    }
    
    console.log('Data files initialization complete')
  } catch (error) {
    console.error('Error initializing data files:', error)
    throw error
  }
}