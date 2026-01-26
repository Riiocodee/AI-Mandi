#!/usr/bin/env node

import { existsSync } from 'fs'
import { join } from 'path'

const requiredFiles = [
  // Root files
  'README.md',
  '.env.example',
  
  // Backend files
  'backend/package.json',
  'backend/jest.config.js',
  'backend/src/server.js',
  'backend/src/routes/products.js',
  'backend/src/routes/translation.js',
  'backend/src/routes/negotiation.js',
  'backend/src/services/priceDiscovery.js',
  'backend/src/services/translation.js',
  'backend/src/services/negotiation.js',
  'backend/src/data/products.json',
  'backend/src/data/prices.json',
  'backend/src/data/translations.json',
  'backend/src/middleware/cors.js',
  'backend/src/socket/chatHandler.js',
  'backend/src/utils/fileUtils.js',
  
  // Frontend files
  'frontend/package.json',
  'frontend/vite.config.js',
  'frontend/tailwind.config.js',
  'frontend/postcss.config.js',
  'frontend/index.html',
  'frontend/src/main.jsx',
  'frontend/src/App.jsx',
  'frontend/src/index.css',
  'frontend/src/components/LanguageSelector.jsx',
  'frontend/src/components/ProductForm.jsx',
  'frontend/src/components/PriceCard.jsx',
  'frontend/src/components/ChatInterface.jsx',
  'frontend/src/components/NegotiationPanel.jsx',
  'frontend/src/hooks/useSocket.js',
  'frontend/src/hooks/useLanguage.js',
  'frontend/src/hooks/useLocalStorage.js',
  'frontend/src/services/api.js',
  'frontend/src/services/socket.js',
  'frontend/src/utils/translations.js',
  'frontend/src/utils/constants.js',
  'frontend/src/test/setup.js'
]

console.log('🔍 Validating AI Mandi project setup...\n')

let allFilesExist = true
let missingFiles = []

for (const file of requiredFiles) {
  const filePath = join(process.cwd(), file)
  if (existsSync(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - MISSING`)
    allFilesExist = false
    missingFiles.push(file)
  }
}

console.log('\n' + '='.repeat(50))

if (allFilesExist) {
  console.log('🎉 All required files are present!')
  console.log('✨ Project setup is complete and ready for development.')
} else {
  console.log(`⚠️  ${missingFiles.length} files are missing:`)
  missingFiles.forEach(file => console.log(`   - ${file}`))
}

console.log('\n📋 Next steps:')
console.log('1. cd backend && npm install')
console.log('2. cd frontend && npm install') 
console.log('3. Start backend: cd backend && npm run dev')
console.log('4. Start frontend: cd frontend && npm run dev')
console.log('5. Open http://localhost:5173 in your browser')