import { 
  loadJsonData, 
  saveJsonData, 
  appendToJsonArray, 
  updateJsonArrayItem, 
  deleteJsonArrayItem, 
  findJsonArrayItems, 
  getJsonArrayItem, 
  generateId,
  initializeDataFiles 
} from '../utils/fileUtils.js'

export class DataService {
  constructor() {
    this.initializeData()
  }

  async initializeData() {
    try {
      await initializeDataFiles()
    } catch (error) {
      console.error('Error initializing data service:', error)
    }
  }

  // Product management methods
  async getAllProducts() {
    return await loadJsonData('products.json', [])
  }

  async getProductById(productId) {
    return await getJsonArrayItem('products.json', productId)
  }

  async getProductsByCategory(category) {
    return await findJsonArrayItems('products.json', { category })
  }

  async getProductsByUser(userId) {
    return await findJsonArrayItems('products.json', { userId })
  }

  async searchProducts(searchTerm) {
    const products = await loadJsonData('products.json', [])
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  async addProduct(productData) {
    const product = {
      id: generateId('prod'),
      ...productData,
      submittedAt: new Date().toISOString(),
      status: 'active'
    }
    
    await appendToJsonArray('products.json', product)
    return product
  }

  async updateProduct(productId, updateData) {
    return await updateJsonArrayItem('products.json', productId, {
      ...updateData,
      updatedAt: new Date().toISOString()
    })
  }

  async deleteProduct(productId) {
    return await deleteJsonArrayItem('products.json', productId)
  }

  // Price management methods
  async getAllPrices() {
    return await loadJsonData('prices.json', [])
  }

  async getPricesByProduct(productName) {
    return await findJsonArrayItems('prices.json', { productName })
  }

  async getPricesByLocation(location) {
    return await findJsonArrayItems('prices.json', { location })
  }

  async getRecentPrices(days = 7) {
    const prices = await loadJsonData('prices.json', [])
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return prices.filter(price => new Date(price.date) >= cutoffDate)
  }

  async addPriceEntry(priceData) {
    const priceEntry = {
      id: generateId('price'),
      ...priceData,
      date: new Date().toISOString()
    }
    
    await appendToJsonArray('prices.json', priceEntry)
    return priceEntry
  }

  async getAveragePrice(productName, days = 30) {
    const prices = await this.getPricesByProduct(productName)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    const recentPrices = prices.filter(price => new Date(price.date) >= cutoffDate)
    
    if (recentPrices.length === 0) {
      return null
    }
    
    const sum = recentPrices.reduce((total, price) => total + price.price, 0)
    return {
      averagePrice: sum / recentPrices.length,
      dataPoints: recentPrices.length,
      period: days
    }
  }

  // Translation management methods
  async getAllTranslations() {
    return await loadJsonData('translations.json', {})
  }

  async getTranslation(fromLang, toLang, text) {
    const translations = await loadJsonData('translations.json', {})
    const key = `${fromLang}_${toLang}`
    
    if (translations[key] && translations[key][text.toLowerCase()]) {
      return translations[key][text.toLowerCase()]
    }
    
    return null
  }

  async addTranslation(fromLang, toLang, originalText, translatedText) {
    const translations = await loadJsonData('translations.json', {})
    const key = `${fromLang}_${toLang}`
    
    if (!translations[key]) {
      translations[key] = {}
    }
    
    translations[key][originalText.toLowerCase()] = translatedText
    await saveJsonData('translations.json', translations)
    
    return { fromLang, toLang, originalText, translatedText }
  }

  async getTranslationPairs(fromLang, toLang) {
    const translations = await loadJsonData('translations.json', {})
    const key = `${fromLang}_${toLang}`
    
    return translations[key] || {}
  }

  // Market data analysis methods
  async getMarketTrends(productName, days = 30) {
    const prices = await this.getPricesByProduct(productName)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    const recentPrices = prices
      .filter(price => new Date(price.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    
    if (recentPrices.length < 2) {
      return {
        trend: 'insufficient_data',
        change: 0,
        dataPoints: recentPrices.length
      }
    }
    
    const firstPrice = recentPrices[0].price
    const lastPrice = recentPrices[recentPrices.length - 1].price
    const change = ((lastPrice - firstPrice) / firstPrice) * 100
    
    let trend = 'stable'
    if (change > 5) trend = 'increasing'
    else if (change < -5) trend = 'decreasing'
    
    return {
      trend,
      change: Math.round(change * 100) / 100,
      firstPrice,
      lastPrice,
      dataPoints: recentPrices.length,
      period: days
    }
  }

  async getPopularProducts(limit = 10) {
    const products = await loadJsonData('products.json', [])
    
    // Sort by quantity (assuming higher quantity means more popular)
    return products
      .filter(product => product.status === 'active')
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit)
  }

  async getCategoryStats() {
    const products = await loadJsonData('products.json', [])
    const stats = {}
    
    products.forEach(product => {
      if (!stats[product.category]) {
        stats[product.category] = {
          count: 0,
          totalQuantity: 0,
          products: []
        }
      }
      
      stats[product.category].count++
      stats[product.category].totalQuantity += product.quantity
      stats[product.category].products.push(product.name)
    })
    
    return stats
  }

  // Data validation methods
  validateProductData(productData) {
    const required = ['name', 'category', 'quantity', 'unit', 'userId']
    const missing = required.filter(field => !productData[field])
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }
    
    if (typeof productData.quantity !== 'number' || productData.quantity <= 0) {
      throw new Error('Quantity must be a positive number')
    }
    
    const validUnits = ['kg', 'pieces', 'liters', 'grams', 'dozen', 'bundles']
    if (!validUnits.includes(productData.unit)) {
      throw new Error(`Invalid unit. Must be one of: ${validUnits.join(', ')}`)
    }
    
    return true
  }

  validatePriceData(priceData) {
    const required = ['productName', 'price', 'unit', 'source']
    const missing = required.filter(field => !priceData[field])
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }
    
    if (typeof priceData.price !== 'number' || priceData.price <= 0) {
      throw new Error('Price must be a positive number')
    }
    
    const validSources = ['user_input', 'market_data', 'ai_suggestion']
    if (!validSources.includes(priceData.source)) {
      throw new Error(`Invalid source. Must be one of: ${validSources.join(', ')}`)
    }
    
    return true
  }
}

// Export singleton instance
export const dataService = new DataService()