import express from 'express'
import { PriceDiscoveryEngine } from '../services/priceDiscovery.js'
import { loadJsonData, saveJsonData } from '../utils/fileUtils.js'

const router = express.Router()
const priceEngine = new PriceDiscoveryEngine()

// POST /api/products/analyze - Analyze product and get price suggestion
router.post('/analyze', async (req, res) => {
  try {
    const { name, quantity, unit } = req.body

    // Validate input
    if (!name || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Product name, quantity, and unit are required'
        }
      })
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_QUANTITY',
          message: 'Quantity must be greater than 0'
        }
      })
    }

    // Create product object
    const product = {
      id: Date.now().toString(),
      name: name.trim(),
      quantity: parseFloat(quantity),
      unit,
      submittedAt: new Date().toISOString(),
      userId: req.headers['user-id'] || 'anonymous'
    }

    // Get price suggestion
    const priceData = await priceEngine.suggestPrice(product)

    // Save product to history
    const products = await loadJsonData('products.json', [])
    products.push(product)
    await saveJsonData('products.json', products)

    res.json({
      success: true,
      product,
      priceData
    })

  } catch (error) {
    console.error('Error analyzing product:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: 'Failed to analyze product and generate price suggestion'
      }
    })
  }
})

// GET /api/products/price-history/:productName - Get price history for a product
router.get('/price-history/:productName', async (req, res) => {
  try {
    const { productName } = req.params
    const prices = await loadJsonData('prices.json', [])
    
    const productPrices = prices.filter(
      price => price.productName.toLowerCase() === productName.toLowerCase()
    )

    res.json({
      success: true,
      productName,
      priceHistory: productPrices
    })

  } catch (error) {
    console.error('Error fetching price history:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch price history'
      }
    })
  }
})

export default router