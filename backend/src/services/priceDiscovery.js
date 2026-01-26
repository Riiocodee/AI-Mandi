import { loadJsonData, saveJsonData } from '../utils/fileUtils.js'

export class PriceDiscoveryEngine {
  constructor() {
    this.priceDatabase = []
    this.loadPriceDatabase()
  }

  async loadPriceDatabase() {
    try {
      this.priceDatabase = await loadJsonData('prices.json', [])
    } catch (error) {
      console.error('Error loading price database:', error)
      this.priceDatabase = []
    }
  }

  async suggestPrice(product) {
    try {
      // Calculate base price using rule-based logic
      const basePrice = this.calculateBasePrice(product.name, product.unit)
      
      // Apply quantity-based adjustments
      const quantityAdjustedPrice = this.applyQuantityDiscount(basePrice, product.quantity)
      
      // Apply seasonal adjustments (mock)
      const seasonalPrice = this.applySeasonalAdjustment(quantityAdjustedPrice, product.name)
      
      // Calculate confidence based on available data
      const confidence = this.calculateConfidence(product.name)
      
      // Get market average if available
      const marketAverage = await this.getMarketAverage(product.name)
      
      // Save price entry to database
      const priceEntry = {
        productName: product.name,
        price: seasonalPrice,
        unit: product.unit,
        date: new Date().toISOString(),
        source: 'ai_suggestion',
        location: 'general'
      }
      
      this.priceDatabase.push(priceEntry)
      await saveJsonData('prices.json', this.priceDatabase)

      return {
        suggestedPrice: Math.round(seasonalPrice * 100) / 100,
        currency: 'INR',
        unit: product.unit,
        confidence: Math.round(confidence * 100) / 100,
        marketAverage: marketAverage ? Math.round(marketAverage * 100) / 100 : null
      }

    } catch (error) {
      console.error('Error suggesting price:', error)
      throw new Error('Failed to generate price suggestion')
    }
  }

  calculateBasePrice(productName, unit) {
    // Mock price database with common Indian market products
    const basePrices = {
      // Vegetables (per kg)
      'tomato': 45, 'onion': 30, 'potato': 25, 'carrot': 40, 'cabbage': 20,
      'cauliflower': 35, 'brinjal': 30, 'okra': 50, 'spinach': 25, 'cucumber': 20,
      
      // Fruits (per kg)
      'apple': 120, 'banana': 40, 'orange': 60, 'mango': 80, 'grapes': 100,
      'pomegranate': 150, 'papaya': 30, 'watermelon': 15, 'pineapple': 35,
      
      // Grains (per kg)
      'rice': 50, 'wheat': 25, 'dal': 80, 'chickpea': 70, 'lentil': 90,
      
      // Dairy (per liter/kg)
      'milk': 55, 'curd': 60, 'paneer': 300, 'butter': 400,
      
      // Spices (per kg)
      'turmeric': 200, 'chili': 300, 'coriander': 150, 'cumin': 400,
      
      // Default fallback
      'default': 50
    }

    const normalizedName = productName.toLowerCase().trim()
    let basePrice = basePrices[normalizedName] || basePrices['default']

    // Adjust for different units
    if (unit === 'pieces') {
      basePrice = basePrice * 0.1 // Assume 1 piece = 0.1 kg equivalent
    } else if (unit === 'dozen') {
      basePrice = basePrice * 1.2 // Dozen pricing
    } else if (unit === 'bundles') {
      basePrice = basePrice * 0.5 // Bundle pricing
    } else if (unit === 'grams') {
      basePrice = basePrice / 1000 // Convert to per gram
    }

    return basePrice
  }

  applyQuantityDiscount(basePrice, quantity) {
    // Apply bulk discounts
    if (quantity >= 100) {
      return basePrice * 0.85 // 15% discount for 100+ units
    } else if (quantity >= 50) {
      return basePrice * 0.90 // 10% discount for 50+ units
    } else if (quantity >= 20) {
      return basePrice * 0.95 // 5% discount for 20+ units
    }
    
    return basePrice
  }

  applySeasonalAdjustment(price, productName) {
    // Mock seasonal adjustments based on current month
    const month = new Date().getMonth() + 1 // 1-12
    const normalizedName = productName.toLowerCase()

    // Summer vegetables (April-June) - higher prices
    if ([4, 5, 6].includes(month) && ['tomato', 'cucumber', 'okra'].includes(normalizedName)) {
      return price * 1.2
    }
    
    // Winter vegetables (Dec-Feb) - lower prices
    if ([12, 1, 2].includes(month) && ['cabbage', 'carrot', 'cauliflower'].includes(normalizedName)) {
      return price * 0.8
    }
    
    // Mango season (March-June) - lower prices
    if ([3, 4, 5, 6].includes(month) && normalizedName === 'mango') {
      return price * 0.7
    }

    return price
  }

  calculateConfidence(productName) {
    // Calculate confidence based on available data points
    const productPrices = this.priceDatabase.filter(
      price => price.productName.toLowerCase() === productName.toLowerCase()
    )

    if (productPrices.length >= 10) {
      return 0.9 // High confidence
    } else if (productPrices.length >= 5) {
      return 0.7 // Medium confidence
    } else if (productPrices.length >= 1) {
      return 0.5 // Low confidence
    }
    
    return 0.3 // Very low confidence for new products
  }

  async getMarketAverage(productName) {
    const productPrices = this.priceDatabase.filter(
      price => price.productName.toLowerCase() === productName.toLowerCase()
    )

    if (productPrices.length === 0) {
      return null
    }

    const sum = productPrices.reduce((total, price) => total + price.price, 0)
    return sum / productPrices.length
  }
}