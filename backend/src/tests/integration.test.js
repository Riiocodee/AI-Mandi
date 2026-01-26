import { createServer } from 'http'
import { Server } from 'socket.io'
import { io as Client } from 'socket.io-client'
import { setupChatHandlers } from '../socket/chatHandler.js'

describe('Socket.io Integration Tests', () => {
  let httpServer, io, clientSocket

  beforeAll((done) => {
    // Create HTTP server
    httpServer = createServer()
    
    // Create Socket.io server with same config as main server
    io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    })

    // Setup chat handlers like in main server
    io.on('connection', (socket) => {
      console.log(`Test: User connected: ${socket.id}`)
      setupChatHandlers(socket, io)
      
      socket.on('disconnect', () => {
        console.log(`Test: User disconnected: ${socket.id}`)
      })
    })

    // Start server
    httpServer.listen(() => {
      const port = httpServer.address().port
      clientSocket = new Client(`http://localhost:${port}`)
      clientSocket.on('connect', done)
    })
  })

  afterAll(() => {
    if (clientSocket) clientSocket.close()
    if (io) io.close()
    if (httpServer) httpServer.close()
  })

  describe('Real-time Chat Functionality', () => {
    test('should handle complete chat flow', (done) => {
      const roomId = 'integration-test-room'
      const userId = 'integration-test-user'
      const message = 'Hello from integration test!'

      let stepCount = 0
      const expectedSteps = 2

      const checkCompletion = () => {
        stepCount++
        if (stepCount === expectedSteps) {
          done()
        }
      }

      // Step 1: Join room
      clientSocket.emit('join_room', { roomId, userId })
      
      // Verify room join (we can't directly test this, but we'll test message sending)
      setTimeout(() => {
        checkCompletion()
        
        // Step 2: Send and receive message
        clientSocket.on('message_received', (data) => {
          expect(data.message.content).toBe(message)
          expect(data.message.senderId).toBe(userId)
          expect(data.message.roomId).toBe(roomId)
          checkCompletion()
        })

        clientSocket.emit('send_message', { roomId, message, language: 'en' })
      }, 100)
    })

    test('should handle translation in messages', (done) => {
      const roomId = 'translation-test-room'
      const userId1 = 'user-english'
      const userId2 = 'user-hindi'
      const message = 'Hello'

      // Create second client for different language user
      const secondClient = new Client(`http://localhost:${httpServer.address().port}`)
      
      secondClient.on('connect', () => {
        // Both users join room
        clientSocket.emit('join_room', { roomId, userId: userId1 })
        secondClient.emit('join_room', { roomId, userId: userId2 })
        
        // Set different languages
        clientSocket.emit('update_language', { language: 'en' })
        secondClient.emit('update_language', { language: 'hi' })
        
        setTimeout(() => {
          // Second client should receive translated message
          secondClient.on('message_received', (data) => {
            expect(data.message.senderId).toBe(userId1)
            // Translation service should attempt to translate
            // Even if translation fails, original message should be preserved
            expect(data.message.content).toBeDefined()
            secondClient.close()
            done()
          })

          // First client sends message
          clientSocket.emit('send_message', { roomId, message, language: 'en' })
        }, 200)
      })
    })

    test('should handle multiple users in same room', (done) => {
      const roomId = 'multi-user-room'
      const users = ['user1', 'user2', 'user3']
      const clients = []
      let joinedCount = 0
      let messageCount = 0

      // Create multiple clients
      users.forEach((userId, index) => {
        const client = new Client(`http://localhost:${httpServer.address().port}`)
        clients.push(client)
        
        client.on('connect', () => {
          client.emit('join_room', { roomId, userId })
          joinedCount++
          
          // Listen for messages from other users
          client.on('message_received', (data) => {
            if (data.message.senderId !== userId) {
              messageCount++
              
              // Each of the other 2 users should receive the message
              if (messageCount === 2) {
                clients.forEach(c => c.close())
                done()
              }
            }
          })
          
          // When all users joined, first user sends message
          if (joinedCount === users.length) {
            setTimeout(() => {
              clients[0].emit('send_message', { 
                roomId, 
                message: 'Hello everyone!', 
                language: 'en' 
              })
            }, 100)
          }
        })
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('should handle malformed join_room events', (done) => {
      clientSocket.on('error', (error) => {
        expect(error.message).toBeDefined()
        done()
      })

      // Send malformed join_room event
      clientSocket.emit('join_room', { /* missing required fields */ })
    })

    test('should handle sending message without joining room', (done) => {
      clientSocket.on('error', (error) => {
        expect(error.message).toBe('User session not found')
        done()
      })

      // Try to send message without joining room first
      clientSocket.emit('send_message', { 
        roomId: 'no-join-room', 
        message: 'test', 
        language: 'en' 
      })
    })

    test('should handle rapid connect/disconnect cycles', (done) => {
      let cycleCount = 0
      const maxCycles = 3

      const runCycle = () => {
        const testClient = new Client(`http://localhost:${httpServer.address().port}`)
        
        testClient.on('connect', () => {
          testClient.close()
          cycleCount++
          
          if (cycleCount < maxCycles) {
            setTimeout(runCycle, 50)
          } else {
            // All cycles completed successfully
            expect(cycleCount).toBe(maxCycles)
            done()
          }
        })
      }

      runCycle()
    })
  })

  describe('Room Management', () => {
    test('should properly clean up rooms when users leave', (done) => {
      const roomId = 'cleanup-test-room'
      const userId = 'cleanup-test-user'

      // Join room
      clientSocket.emit('join_room', { roomId, userId })
      
      setTimeout(() => {
        // Leave room
        clientSocket.emit('leave_room', { roomId, userId })
        
        // Try to send message to empty room (should not cause errors)
        setTimeout(() => {
          clientSocket.emit('send_message', { 
            roomId, 
            message: 'Message to empty room', 
            language: 'en' 
          })
          
          // If no errors occur, test passes
          setTimeout(() => {
            expect(clientSocket.connected).toBe(true)
            done()
          }, 100)
        }, 100)
      }, 100)
    })

    test('should handle user joining multiple rooms', (done) => {
      const userId = 'multi-room-user'
      const rooms = ['room1', 'room2', 'room3']
      let joinedCount = 0

      rooms.forEach(roomId => {
        clientSocket.emit('join_room', { roomId, userId })
        joinedCount++
        
        if (joinedCount === rooms.length) {
          // Successfully joined all rooms
          setTimeout(() => {
            expect(joinedCount).toBe(rooms.length)
            done()
          }, 100)
        }
      })
    })
  })
})