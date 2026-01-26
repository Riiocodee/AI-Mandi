import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'

// Import custom CORS middleware
import corsMiddleware from './middleware/cors.js'

// Import routes
import productRoutes from './routes/products.js'
import translationRoutes from './routes/translation.js'
import negotiationRoutes from './routes/negotiation.js'

// Import socket handlers
import { setupChatHandlers } from './socket/chatHandler.js'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174", 
      "http://localhost:3000",
      process.env.FRONTEND_URL || "http://localhost:5173"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
})

const PORT = process.env.PORT || 3001

// Middleware
app.use(corsMiddleware)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'AI Mandi Backend'
  })
})

// API Routes
app.use('/api/products', productRoutes)
app.use('/api', translationRoutes)
app.use('/api/negotiation', negotiationRoutes)

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)
  
  // Setup chat handlers
  setupChatHandlers(socket, io)
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  })
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 AI Mandi Backend Server running on port ${PORT}`)
  console.log(`📡 Socket.io server ready for connections`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`)
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app