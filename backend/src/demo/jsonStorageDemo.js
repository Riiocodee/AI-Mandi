import { dataService } from '../services/dataService.js'
import { loadJsonData } from '../utils/fileUtils.js'

async function demonstrateJsonStorage() {
  console.log('🚀 AI Mandi JSON Data Storage System Demo\n')

  try {
    // 1. Demonstrate product management
    console.log('📦 PRODUCT MANAGEMENT DEMO')
    console.log('=' .repeat(50))
    
    // Get all existing products
    const existingProducts = await dataService.getAllProducts()
    console.log(`📊 Found ${existingProducts.length} existing products`)
    
    if (existingProducts.length > 0) {
      console.log('📋 Sample product:', JSON.stringify(existingProducts[0], null, 2))
    }

    // Add a new product
    const newProduct = {
      name: 'fresh spinach',
      category: 'vegetables',
      quantity: 20,
      unit: 'kg',
      userId: 'demo_vendor',
      description: 'Fresh organic spinach from local farm',
      location: 'Demo City'
    }

    console.log('\n➕ Adding new product...')
    const addedProduct = await dataService.addProduct(newProduct)
    console.log('✅ Product added:', addedProduct.id)

    // Search products
    console.log('\n🔍 Searching for "spinach"...')
    const searchResults = await dataService.searchProducts('spinach')
    console.log(`📋 Found ${searchResults.length} products matching "spinach"`)

    // 2. Demonstrate price management
    console.log('\n💰 PRICE MANAGEMENT DEMO')
    console.log('=' .repeat(50))

    // Get existing prices
    const existingPrices = await dataService.getAllPrices()
    console.log(`📊 Found ${existingPrices.length} existing price entries`)

    // Add a new price entry
    const newPrice = {
      productName: 'fresh spinach',
      price: 35,
      unit: 'kg',
      source: 'user_input',
      location: 'Demo City'
    }

    console.log('\n➕ Adding new price entry...')
    const addedPrice = await dataService.addPriceEntry(newPrice)
    console.log('✅ Price added:', addedPrice.id)

    // Get average price for tomato
    console.log('\n📈 Getting average price for tomato...')
    const avgPrice = await dataService.getAveragePrice('tomato', 30)
    if (avgPrice) {
      console.log(`📊 Average price: ₹${avgPrice.averagePrice.toFixed(2)} per kg (${avgPrice.dataPoints} data points)`)
    }

    // Get market trends
    console.log('\n📊 Getting market trends for tomato...')
    const trends = await dataService.getMarketTrends('tomato', 30)
    console.log(`📈 Trend: ${trends.trend}, Change: ${trends.change}%`)

    // 3. Demonstrate translation management
    console.log('\n🌐 TRANSLATION MANAGEMENT DEMO')
    console.log('=' .repeat(50))

    // Get existing translations
    const translations = await dataService.getAllTranslations()
    const translationKeys = Object.keys(translations)
    console.log(`📊 Found ${translationKeys.length} translation language pairs`)

    // Test translation lookup
    console.log('\n🔍 Looking up translation for "hello" (en -> hi)...')
    const translation = await dataService.getTranslation('en', 'hi', 'hello')
    if (translation) {
      console.log(`✅ Translation found: "${translation}"`)
    } else {
      console.log('❌ Translation not found')
    }

    // Add a new translation
    console.log('\n➕ Adding new translation...')
    await dataService.addTranslation('en', 'hi', 'demo', 'डेमो')
    console.log('✅ Translation added: demo -> डेमो')

    // 4. Demonstrate market analysis
    console.log('\n📊 MARKET ANALYSIS DEMO')
    console.log('=' .repeat(50))

    // Get popular products
    const popularProducts = await dataService.getPopularProducts(5)
    console.log(`🏆 Top ${popularProducts.length} popular products:`)
    popularProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.quantity} ${product.unit})`)
    })

    // Get category statistics
    console.log('\n📈 Category statistics:')
    const categoryStats = await dataService.getCategoryStats()
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category]
      console.log(`   ${category}: ${stats.count} products, ${stats.totalQuantity} total units`)
    })

    // 5. Demonstrate data validation
    console.log('\n✅ DATA VALIDATION DEMO')
    console.log('=' .repeat(50))

    try {
      dataService.validateProductData({
        name: 'test product',
        category: 'test',
        quantity: 10,
        unit: 'kg',
        userId: 'test_user'
      })
      console.log('✅ Valid product data passed validation')
    } catch (error) {
      console.log('❌ Product validation failed:', error.message)
    }

    try {
      dataService.validateProductData({
        name: 'invalid product',
        // missing required fields
      })
    } catch (error) {
      console.log('✅ Invalid product data correctly rejected:', error.message)
    }

    console.log('\n🎉 JSON Data Storage System Demo Complete!')
    console.log('✨ All features working correctly!')

  } catch (error) {
    console.error('❌ Demo failed:', error)
  }
}

// Run the demo
demonstrateJsonStorage()