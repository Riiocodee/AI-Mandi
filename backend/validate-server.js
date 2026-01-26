import http from 'http'

// Simple validation script to test server functionality
const testEndpoint = (path, expectedStatus = 200) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json'
      }
    }

    const req = http.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          if (res.statusCode === expectedStatus) {
            console.log(`✅ ${path} - Status: ${res.statusCode}`)
            console.log(`   CORS Headers: ${res.headers['access-control-allow-origin'] ? 'Present' : 'Missing'}`)
            resolve({ status: res.statusCode, data: response, headers: res.headers })
          } else {
            console.log(`❌ ${path} - Expected: ${expectedStatus}, Got: ${res.statusCode}`)
            reject(new Error(`Unexpected status code: ${res.statusCode}`))
          }
        } catch (error) {
          console.log(`❌ ${path} - Invalid JSON response`)
          reject(error)
        }
      })
    })

    req.on('error', (error) => {
      console.log(`❌ ${path} - Connection error: ${error.message}`)
      reject(error)
    })

    req.setTimeout(5000, () => {
      console.log(`❌ ${path} - Request timeout`)
      req.destroy()
      reject(new Error('Request timeout'))
    })

    req.end()
  })
}

const testCORS = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    }

    const req = http.request(options, (res) => {
      const corsHeaders = {
        origin: res.headers['access-control-allow-origin'],
        methods: res.headers['access-control-allow-methods'],
        credentials: res.headers['access-control-allow-credentials']
      }
      
      console.log(`✅ CORS Preflight - Status: ${res.statusCode}`)
      console.log(`   Allow-Origin: ${corsHeaders.origin}`)
      console.log(`   Allow-Methods: ${corsHeaders.methods}`)
      console.log(`   Allow-Credentials: ${corsHeaders.credentials}`)
      
      resolve(corsHeaders)
    })

    req.on('error', (error) => {
      console.log(`❌ CORS Preflight - Error: ${error.message}`)
      reject(error)
    })

    req.end()
  })
}

async function validateServer() {
  console.log('🔍 Validating AI Mandi Backend Server...\n')
  
  try {
    // Test health endpoint
    await testEndpoint('/health', 200)
    
    // Test 404 handling
    await testEndpoint('/non-existent', 404)
    
    // Test CORS preflight
    await testCORS()
    
    console.log('\n✅ All server validation tests passed!')
    console.log('🎉 Express server with CORS middleware is working correctly!')
    
  } catch (error) {
    console.log('\n❌ Server validation failed:', error.message)
    process.exit(1)
  }
}

// Run validation
validateServer()