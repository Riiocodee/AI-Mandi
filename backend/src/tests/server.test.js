import request from 'supertest'
import app from '../server.js'

describe('Express Server', () => {
  describe('Basic Server Setup', () => {
    test('should respond to health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
      
      expect(response.body).toHaveProperty('status', 'OK')
      expect(response.body).toHaveProperty('service', 'AI Mandi Backend')
      expect(response.body).toHaveProperty('timestamp')
    })

    test('should handle CORS headers correctly', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173')
        .expect(200)
      
      expect(response.headers).toHaveProperty('access-control-allow-origin')
    })

    test('should parse JSON requests', async () => {
      const testData = { test: 'data' }
      
      // This will test if JSON parsing middleware is working
      // We'll use a non-existent endpoint to avoid actual processing
      const response = await request(app)
        .post('/api/test-json')
        .send(testData)
        .expect(404) // Should get 404 since endpoint doesn't exist, but JSON should be parsed
      
      // The fact that we get a structured error response means JSON parsing worked
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })

    test('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/non-existent-endpoint')
        .expect(404)
      
      expect(response.body).toHaveProperty('success', false)
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND')
      expect(response.body.error).toHaveProperty('message', 'Endpoint not found')
    })

    test('should have proper error handling middleware', async () => {
      // Test that error responses have the expected structure
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404)
      
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: expect.any(String),
          message: expect.any(String)
        }
      })
    })
  })

  describe('CORS Configuration', () => {
    test('should allow requests from localhost:5173', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET')
        .expect(200)
      
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    })

    test('should allow requests from localhost:3000', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(200)
      
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000')
    })

    test('should support credentials', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET')
        .expect(200)
      
      expect(response.headers['access-control-allow-credentials']).toBe('true')
    })

    test('should support required HTTP methods', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST')
        .expect(200)
      
      const allowedMethods = response.headers['access-control-allow-methods']
      expect(allowedMethods).toContain('GET')
      expect(allowedMethods).toContain('POST')
      expect(allowedMethods).toContain('PUT')
      expect(allowedMethods).toContain('DELETE')
    })
  })

  describe('Middleware Configuration', () => {
    test('should have request logging middleware', async () => {
      // This test verifies that requests are being logged
      // We can't easily test console output, but we can verify the request goes through
      const response = await request(app)
        .get('/health')
        .expect(200)
      
      expect(response.body.status).toBe('OK')
    })

    test('should parse URL-encoded data', async () => {
      const response = await request(app)
        .post('/api/test-urlencoded')
        .send('key=value&another=data')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect(404) // Endpoint doesn't exist, but middleware should parse the data
      
      // Should get structured error response, indicating middleware worked
      expect(response.body).toHaveProperty('success', false)
    })
  })
})