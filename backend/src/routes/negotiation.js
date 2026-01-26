import express from 'express'
import { NegotiationAssistant } from '../services/negotiation.js'
import { loadJsonData } from '../utils/fileUtils.js'

const router = express.Router()
const negotiationAssistant = new NegotiationAssistant()

// POST /api/negotiation/suggest - Get negotiation suggestions
router.post('/suggest', async (req, res) => {
  try {
    const { currentPrice, marketPrice, chatHistory, productName } = req.body

    // Validate input
    if (!currentPrice && !chatHistory) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Either currentPrice or chatHistory is required'
        }
      })
    }

    // Generate suggestions
    const suggestions = await negotiationAssistant.generateSuggestions({
      currentPrice: currentPrice ? parseFloat(currentPrice) : null,
      marketPrice: marketPrice ? parseFloat(marketPrice) : null,
      chatHistory: chatHistory || [],
      productName: productName || null
    })

    res.json({
      success: true,
      suggestions
    })

  } catch (error) {
    console.error('Error generating negotiation suggestions:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'SUGGESTION_FAILED',
        message: 'Failed to generate negotiation suggestions'
      }
    })
  }
})

// GET /api/market/trends/:productName - Get market trends for a product
router.get('/market/trends/:productName', async (req, res) => {
  try {
    const { productName } = req.params
    const prices = await loadJsonData('prices.json', [])
    
    // Filter prices for the specific product
    const productPrices = prices.filter(
      price => price.productName.toLowerCase() === productName.toLowerCase()
    )

    // Calculate trends
    const trends = negotiationAssistant.calculateMarketTrends(productPrices)

    res.json({
      success: true,
      productName,
      trends
    })

  } catch (error) {
    console.error('Error fetching market trends:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'TRENDS_FAILED',
        message: 'Failed to fetch market trends'
      }
    })
  }
})

// GET /api/market/average-price/:productName - Get average market price
router.get('/average-price/:productName', async (req, res) => {
  try {
    const { productName } = req.params
    const prices = await loadJsonData('prices.json', [])
    
    const productPrices = prices.filter(
      price => price.productName.toLowerCase() === productName.toLowerCase()
    )

    if (productPrices.length === 0) {
      return res.json({
        success: true,
        productName,
        averagePrice: null,
        message: 'No price data available for this product'
      })
    }

    const averagePrice = productPrices.reduce((sum, price) => sum + price.price, 0) / productPrices.length

    res.json({
      success: true,
      productName,
      averagePrice: Math.round(averagePrice * 100) / 100,
      dataPoints: productPrices.length
    })

  } catch (error) {
    console.error('Error calculating average price:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'AVERAGE_FAILED',
        message: 'Failed to calculate average price'
      }
    })
  }
})

export default router