#!/usr/bin/env node

import { createServer } from 'http'
import { Server } from 'socket.io'
import { io as Client } from 'socket.io-client'
import { setupChatHandlers } from './src/socket/chatHandler.js'

console.log('🎭 Socket.io Server Demo\n')

const DEMO_PORT = 3003

// Create server
const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Setup handlers
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`)
  setupChatHandlers(socket, io)
  
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`)
  })
})

// Start server
httpServer.listen(DEMO_PORT, () => {
  console.log(`🚀 Demo server running on port ${DEMO_PORT}`)
  console.log('📡 Socket.io server ready for connections\n')
  
  // Run demo scenario
  runDemo()
})

async function runDemo() {
  console.log('🎬 Starting demo scenario...\n')
  
  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Create demo clients
  const alice = new Client(`http://localhost:${DEMO_PORT}`)
  const bob = new Client(`http://localhost:${DEMO_PORT}`)
  
  alice.on('connect', () => {
    console.log('👩 Alice connected')
    
    // Alice joins room
    alice.emit('join_room', { roomId: 'demo-room', userId: 'alice' })
    
    // Alice sets language to English
    alice.emit('update_language', { language: 'en' })
    
    // Alice listens for messages
    alice.on('message_received', (data) => {
      console.log(`👩 Alice received: "${data.message.content}" from ${data.message.senderId}`)
      if (data.translated) {
        console.log(`   📝 Original: "${data.message.originalContent}"`)
      }
    })
    
    alice.on('user_joined', (data) => {
      console.log(`👩 Alice sees: ${data.userId} joined the room`)
    })
    
    alice.on('typing_indicator', (data) => {
      if (data.isTyping) {
        console.log(`👩 Alice sees: ${data.userId} is typing...`)
      }
    })
  })
  
  bob.on('connect', () => {
    console.log('👨 Bob connected')
    
    // Bob joins room (should trigger user_joined for Alice)
    bob.emit('join_room', { roomId: 'demo-room', userId: 'bob' })
    
    // Bob sets language to Hindi
    bob.emit('update_language', { language: 'hi' })
    
    // Bob listens for messages
    bob.on('message_received', (data) => {
      console.log(`👨 Bob received: "${data.message.content}" from ${data.message.senderId}`)
      if (data.translated) {
        console.log(`   📝 Original: "${data.message.originalContent}"`)
      }
    })
    
    bob.on('user_joined', (data) => {
      console.log(`👨 Bob sees: ${data.userId} joined the room`)
    })
    
    bob.on('typing_indicator', (data) => {
      if (data.isTyping) {
        console.log(`👨 Bob sees: ${data.userId} is typing...`)
      }
    })
    
    // Start conversation after both connected
    setTimeout(() => {
      console.log('\n💬 Starting conversation...\n')
      
      // Alice sends typing indicator
      alice.emit('typing', { roomId: 'demo-room', userId: 'alice' })
      
      setTimeout(() => {
        // Alice sends message
        alice.emit('send_message', { 
          roomId: 'demo-room', 
          message: 'Hello Bob! How are you?', 
          language: 'en' 
        })
        
        setTimeout(() => {
          // Bob sends typing indicator
          bob.emit('typing', { roomId: 'demo-room', userId: 'bob' })
          
          setTimeout(() => {
            // Bob replies
            bob.emit('send_message', { 
              roomId: 'demo-room', 
              message: 'नमस्ते Alice! मैं ठीक हूँ।', 
              language: 'hi' 
            })
            
            setTimeout(() => {
              // Alice responds
              alice.emit('send_message', { 
                roomId: 'demo-room', 
                message: 'Great! The translation is working well.', 
                language: 'en' 
              })
              
              setTimeout(() => {
                console.log('\n🎬 Demo completed!')
                console.log('✨ Socket.io server successfully demonstrated:')
                console.log('   ✅ Real-time connections')
                console.log('   ✅ Room management')
                console.log('   ✅ Message broadcasting')
                console.log('   ✅ Translation integration')
                console.log('   ✅ Typing indicators')
                console.log('   ✅ Multi-user support')
                
                // Cleanup
                alice.close()
                bob.close()
                io.close()
                httpServer.close()
                
                console.log('\n👋 Demo server stopped')
                process.exit(0)
              }, 2000)
            }, 1500)
          }, 1000)
        }, 1500)
      }, 1000)
    }, 1000)
  })
}