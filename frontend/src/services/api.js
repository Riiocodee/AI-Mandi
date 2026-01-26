import { API_BASE_URL } from '../utils/constants'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Product and Price Discovery
  async analyzeProduct(product) {
    return this.request('/api/products/analyze', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  }

  async getPriceHistory(productName) {
    return this.request(`/api/products/price-history/${encodeURIComponent(productName)}`)
  }

  async getMarketAverage(productName) {
    return this.request(`/api/market/average-price/${encodeURIComponent(productName)}`)
  }

  // Translation
  async translateText(text, fromLanguage, toLanguage) {
    return this.request('/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        fromLanguage,
        toLanguage,
      }),
    })
  }

  async getSupportedLanguages() {
    return this.request('/api/languages/supported')
  }

  // Negotiation
  async getNegotiationSuggestions(context) {
    return this.request('/api/negotiation/suggest', {
      method: 'POST',
      body: JSON.stringify(context),
    })
  }

  async getMarketTrends(productName) {
    return this.request(`/api/market/trends/${encodeURIComponent(productName)}`)
  }
}

export const apiService = new ApiService()
export default apiService