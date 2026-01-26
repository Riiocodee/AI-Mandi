#!/usr/bin/env node

import { createServer } from 'http'
import { Server } from 'socket.io'
import { io as Client } from 'socket.io-client'
import { setupChatHandlers } from './src/socket/chatHandler.js'

console.log('🧪 Validating Socket.io Server Setup...\n')

// Test configuration
const TEST_PORT = 3002
const TEST_TIMEOUT = 5000

let httpServer, io, testResults = []

function addResult(test, passed, message = '') {
  testResults.push({ test, passed, message })
  const status = passed ? '✅' : '❌'
  console.log(`${status} ${test}${message ? ': ' + message : ''}`)
}

function cleanup() {
  if (io) io.close()
  if (httpServer) httpServer.close()
}

async function runTests() {
  try {
    // Test 1: Create HTTP server
    httpServer = createServer()
    addResult('HTTP Server Creation', true)

    // Test 2: Create Socket.io server
    io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    })
    addResult('Socket.io Server Creation', true)

    // Test 3: Setup chat handlers
    io.on('connection', (socket) => {
      setupChatHandlers(socket, io)
      addResult('Chat Handlers Setup', true)
    })

    // Test 4: Start server
    await new Promise((resolve, reject) => {
      httpServer.listen(TEST_PORT, (err) => {
        if (err) reject(err)
        else {
          addResult('Server Start', true, `listening on port ${TEST_PORT}`)
          resolve()
        }
      })
    })

    // Test 5: Client connection
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'))
      }, TEST_TIMEOUT)

      const client = new Client(`http://localhost:${TEST_PORT}`)
      
      client.on('connect', () => {
        clearTimeout(timeout)
        addResult('Client Connection', true, `connected with ID: ${client.id}`)
        
        // Test 6: Room join
        client.emit('join_room', { roomId: 'test-room', userId: 'test-user' })
        
        setTimeout(() => {
          addResult('Room Join Event', true, 'join_room event sent')
          
          // Test 7: Message sending
          client.on('message_received', (data) => {
            addResult('Message Handling', true, 'message received successfully')
            client.close()
            resolve()
          })
          
          client.emit('send_message', { 
            roomId: 'test-room', 
            message: 'Test message', 
            language: 'en' 
          })
        }, 100)
      })

      client.on('connect_error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })
    })

  } catch (error) {
    addResult('Test Execution', false, error.message)
  } finally {
    cleanup()
  }
}

// Run tests
runTests().then(() => {
  console.log('\n📊 Test Results Summary:')
  console.log('========================')
  
  const passed = testResults.filter(r => r.passed).length
  const total = testResults.length
  const failed = total - passed
  
  console.log(`Total Tests: ${total}`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    testResults.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.test}: ${r.message}`)
    })
  }
  
  console.log(`\n${failed === 0 ? '🎉' : '⚠️'} Socket.io Server Setup ${failed === 0 ? 'PASSED' : 'FAILED'}`)
  
  process.exit(failed === 0 ? 0 : 1)
}).catch((error) => {
  console.error('\n💥 Validation failed:', error.message)
  cleanup()
  process.exit(1)
})