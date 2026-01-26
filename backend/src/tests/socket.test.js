import { createServer } from 'http'
import { Server } from 'socket.io'
import { io as Client } from 'socket.io-client'
import app from '../server.js'

describe('Socket.io Server Setup', () => {
  let server, io, clientSocket, serverSocket

  beforeAll((done) => {
    // Create HTTP server with Express app
    server = createServer(app)
    
    // Create Socket.io server
    io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    })

    // Start server on random port
    server.listen(() => {
      const port = server.address().port
      
      // Create client connection
      clientSocket = new Client(`http://localhost:${port}`)
      
      // Wait for connection
      io.on('connection', (socket) => {
        serverSocket = socket
      })
      
      clientSocket.on('connect', done)
    })
  })

  afterAll(() => {
    io.close()
    clientSocket.close()
    server.close()
  })

  describe('Basic Connection', () => {
    test('should establish Socket.io connection', (done) => {
      expect(clientSocket.connected).toBe(true)
      done()
    })

    test('should have proper CORS configuration', () => {
      expect(io.engine.opts.cors).toMatchObject({
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      })
    })

    test('should handle connection events', (done) => {
      const testClient = new Client(`http://localhost:${server.address().port}`)
      
      io.on('connection', (socket) => {
        expect(socket.id).toBeDefined()
        expect(typeof socket.id).toBe('string')
        testClient.close()
        done()
      })
    })
  })

  describe('Room Management', () => {
    test('should handle join_room event', (done) => {
      const roomId = 'test-room-123'
      const userId = 'test-user-456'

      clientSocket.emit('join_room', { roomId, userId })

      // Verify user joined room
      setTimeout(() => {
        const rooms = Array.from(serverSocket.rooms)
        expect(rooms).toContain(roomId)
        done()
      }, 100)
    })

    test('should handle leave_room event', (done) => {
      const roomId = 'test-room-leave'
      const userId = 'test-user-leave'

      // First join the room
      clientSocket.emit('join_room', { roomId, userId })

      setTimeout(() => {
        // Then leave the room
        clientSocket.emit('leave_room', { roomId, userId })
        
        setTimeout(() => {
          const rooms = Array.from(serverSocket.rooms)
          expect(rooms).not.toContain(roomId)
          done()
        }, 100)
      }, 100)
    })

    test('should broadcast user_joined event to room members', (done) => {
      const roomId = 'test-broadcast-room'
      const userId = 'test-broadcast-user'

      // Create second client to receive broadcast
      const secondClient = new Client(`http://localhost:${server.address().port}`)
      
      secondClient.on('connect', () => {
        // Second client joins room first
        secondClient.emit('join_room', { roomId, userId: 'existing-user' })
        
        setTimeout(() => {
          // Listen for user_joined event
          secondClient.on('user_joined', (data) => {
            expect(data.userId).toBe(userId)
            secondClient.close()
            done()
          })
          
          // First client joins room (should trigger broadcast)
          clientSocket.emit('join_room', { roomId, userId })
        }, 100)
      })
    })
  })

  describe('Message Handling', () => {
    test('should handle send_message event', (done) => {
      const roomId = 'test-message-room'
      const userId = 'test-message-user'
      const message = 'Hello, this is a test message!'

      // Join room first
      clientSocket.emit('join_room', { roomId, userId })

      setTimeout(() => {
        // Listen for message_received event
        clientSocket.on('message_received', (data) => {
          expect(data.message).toMatchObject({
            content: message,
            senderId: userId,
            roomId: roomId,
            messageType: 'text'
          })
          expect(data.message.id).toBeDefined()
          expect(data.message.timestamp).toBeDefined()
          done()
        })

        // Send message
        clientSocket.emit('send_message', { roomId, message, language: 'en' })
      }, 100)
    })

    test('should handle typing indicators', (done) => {
      const roomId = 'test-typing-room'
      const userId = 'test-typing-user'

      // Create second client to receive typing indicator
      const secondClient = new Client(`http://localhost:${server.address().port}`)
      
      secondClient.on('connect', () => {
        // Both clients join room
        clientSocket.emit('join_room', { roomId, userId })
        secondClient.emit('join_room', { roomId, userId: 'other-user' })
        
        setTimeout(() => {
          // Listen for typing indicator
          secondClient.on('typing_indicator', (data) => {
            expect(data.userId).toBe(userId)
            expect(data.isTyping).toBe(true)
            secondClient.close()
            done()
          })
          
          // Send typing event
          clientSocket.emit('typing', { roomId, userId })
        }, 100)
      })
    })
  })

  describe('Language Support', () => {
    test('should handle update_language event', (done) => {
      const newLanguage = 'hi'
      
      clientSocket.emit('update_language', { language: newLanguage })
      
      // Since this is an internal state change, we can't directly test it
      // but we can verify the event doesn't cause errors
      setTimeout(() => {
        expect(clientSocket.connected).toBe(true)
        done()
      }, 100)
    })
  })

  describe('Error Handling', () => {
    test('should handle invalid room join attempts', (done) => {
      clientSocket.on('error', (error) => {
        expect(error).toHaveProperty('message')
        done()
      })

      // Try to send message without joining room
      clientSocket.emit('send_message', { 
        roomId: 'non-existent-room', 
        message: 'test', 
        language: 'en' 
      })
    })

    test('should handle disconnect events', (done) => {
      const testClient = new Client(`http://localhost:${server.address().port}`)
      const roomId = 'test-disconnect-room'
      const userId = 'test-disconnect-user'

      testClient.on('connect', () => {
        // Join room
        testClient.emit('join_room', { roomId, userId })
        
        setTimeout(() => {
          // Listen for user_left event on main client
          clientSocket.on('user_left', (data) => {
            expect(data.userId).toBe(userId)
            done()
          })
          
          // Join main client to same room to receive disconnect notification
          clientSocket.emit('join_room', { roomId, userId: 'main-user' })
          
          setTimeout(() => {
            // Disconnect test client
            testClient.close()
          }, 100)
        }, 100)
      })
    })
  })

  describe('Performance and Scalability', () => {
    test('should handle multiple concurrent connections', (done) => {
      const clients = []
      const numClients = 5
      let connectedCount = 0

      for (let i = 0; i < numClients; i++) {
        const client = new Client(`http://localhost:${server.address().port}`)
        clients.push(client)
        
        client.on('connect', () => {
          connectedCount++
          if (connectedCount === numClients) {
            // All clients connected successfully
            expect(connectedCount).toBe(numClients)
            
            // Clean up
            clients.forEach(client => client.close())
            done()
          }
        })
      }
    })

    test('should handle rapid message sending', (done) => {
      const roomId = 'test-rapid-messages'
      const userId = 'test-rapid-user'
      const messageCount = 10
      let receivedCount = 0

      // Join room
      clientSocket.emit('join_room', { roomId, userId })

      setTimeout(() => {
        clientSocket.on('message_received', () => {
          receivedCount++
          if (receivedCount === messageCount) {
            expect(receivedCount).toBe(messageCount)
            done()
          }
        })

        // Send multiple messages rapidly
        for (let i = 0; i < messageCount; i++) {
          clientSocket.emit('send_message', { 
            roomId, 
            message: `Message ${i}`, 
            language: 'en' 
          })
        }
      }, 100)
    })
  })
})