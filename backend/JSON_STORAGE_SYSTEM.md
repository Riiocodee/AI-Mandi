# AI Mandi JSON Data Storage System

## Overview

The AI Mandi JSON Data Storage System provides a lightweight, file-based storage solution for products, prices, and translations. It's designed to be simple, reliable, and easy to use without requiring heavy database infrastructure.

## Architecture

### Core Components

1. **File Utilities (`src/utils/fileUtils.js`)**
   - Low-level JSON file operations
   - File system management
   - Data validation and error handling

2. **Data Service (`src/services/dataService.js`)**
   - High-level data operations
   - Business logic and validation
   - Market analysis functions

3. **Data Files (`src/data/`)**
   - `products.json` - Product catalog
   - `prices.json` - Price history and market data
   - `translations.json` - Multi-language translations

## Features

### ✅ File-based Storage
- JSON files for lightweight data persistence
- Automatic directory creation and initialization
- Error handling for file operations
- Backup functionality

### ✅ Product Management
- Add, update, delete products
- Search products by name, category, or description
- Product validation (required fields, units, quantities)
- Category-based organization

### ✅ Price Management
- Historical price tracking
- Market average calculations
- Price trend analysis
- Multiple data sources (user_input, market_data, ai_suggestion)

### ✅ Translation Management
- Multi-language support (English, Hindi, Malayalam, Tamil)
- Translation lookup and storage
- Fallback handling for missing translations

### ✅ Market Analysis
- Popular products ranking
- Category statistics
- Market trend analysis
- Price discovery insights

### ✅ Data Validation
- Input validation for all data types
- Type checking and format validation
- Business rule enforcement

## API Reference

### File Utilities

```javascript
import { 
  loadJsonData, 
  saveJsonData, 
  appendToJsonArray,
  updateJsonArrayItem,
  deleteJsonArrayItem,
  findJsonArrayItems,
  generateId 
} from './utils/fileUtils.js'

// Load JSON data with default fallback
const data = await loadJsonData('products.json', [])

// Save JSON data
await saveJsonData('products.json', data)

// Append to array
await appendToJsonArray('products.json', newProduct)

// Generate unique ID
const id = generateId('prod') // Returns: prod_1234567890_abc123
```

### Data Service

```javascript
import { dataService } from './services/dataService.js'

// Product operations
const products = await dataService.getAllProducts()
const product = await dataService.addProduct(productData)
const results = await dataService.searchProducts('tomato')

// Price operations
const prices = await dataService.getAllPrices()
const avgPrice = await dataService.getAveragePrice('tomato', 30)
const trends = await dataService.getMarketTrends('tomato', 30)

// Translation operations
const translation = await dataService.getTranslation('en', 'hi', 'hello')
await dataService.addTranslation('en', 'hi', 'new word', 'नया शब्द')

// Market analysis
const popular = await dataService.getPopularProducts(10)
const stats = await dataService.getCategoryStats()
```

## Data Models

### Product Model
```json
{
  "id": "prod_1234567890_abc123",
  "name": "tomato",
  "category": "vegetables",
  "quantity": 50,
  "unit": "kg",
  "submittedAt": "2024-01-15T10:30:00.000Z",
  "userId": "vendor_001",
  "description": "Fresh red tomatoes from local farm",
  "location": "Delhi",
  "status": "active"
}
```

### Price Model
```json
{
  "id": "price_1234567890_abc123",
  "productName": "tomato",
  "price": 45,
  "unit": "kg",
  "date": "2024-01-15T10:30:00.000Z",
  "source": "market_data",
  "location": "delhi"
}
```

### Translation Model
```json
{
  "en_hi": {
    "hello": "नमस्ते",
    "price": "कीमत",
    "good": "अच्छा"
  },
  "en_ml": {
    "hello": "നമസ്കാരം",
    "price": "വില"
  }
}
```

## Validation Rules

### Product Validation
- **Required fields**: name, category, quantity, unit, userId
- **Quantity**: Must be positive number
- **Unit**: Must be one of: kg, pieces, liters, grams, dozen, bundles
- **Category**: Any string (vegetables, fruits, grains, dairy, etc.)

### Price Validation
- **Required fields**: productName, price, unit, source
- **Price**: Must be positive number
- **Source**: Must be one of: user_input, market_data, ai_suggestion
- **Unit**: Should match product units

## Sample Data

The system comes pre-loaded with comprehensive sample data:

- **10 sample products** across different categories
- **20 price entries** with historical data
- **Extensive translations** for 4 languages
- **Market data** for trend analysis

## Testing

### Integration Tests
```bash
npm test -- --testPathPattern="jsonStorage.integration"
```

### Demo Script
```bash
node src/demo/jsonStorageDemo.js
```

## Performance Characteristics

- **File Size**: JSON files remain small and manageable
- **Read Performance**: Fast file-based reads
- **Write Performance**: Atomic writes with error handling
- **Memory Usage**: Minimal memory footprint
- **Scalability**: Suitable for prototype and small-scale applications

## Error Handling

- **File Not Found**: Automatic creation with default values
- **Invalid JSON**: Graceful fallback to defaults
- **Permission Errors**: Clear error messages
- **Validation Errors**: Detailed validation feedback
- **Concurrent Access**: Safe file operations

## Future Enhancements

- [ ] Data compression for large files
- [ ] Indexing for faster searches
- [ ] Data migration utilities
- [ ] Real-time file watching
- [ ] Distributed storage support

## Requirements Satisfied

This implementation satisfies the following requirements:

- **8.2**: JSON file or in-memory storage instead of heavy databases ✅
- **9.3**: Sample mock data for price discovery and translation features ✅

The system provides a robust, lightweight storage solution that's perfect for the AI Mandi prototype while maintaining the flexibility to scale as needed.