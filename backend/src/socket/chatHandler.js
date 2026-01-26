import { v4 as uuidv4 } from 'uuid'
import { TranslationService } from '../services/translation.js'

const translationService = new TranslationService()

// In-memory storage for active sessions and rooms
const activeRooms = new Map()
const userSessions = new Map()

export function setupChatHandlers(socket, io) {
  
  // Handle user joining a room
  socket.on('join_room', async ({ roomId, userId }) => {
    try {
      console.log(`User ${userId} joining room ${roomId}`)
      
      // Join the socket room
      socket.join(roomId)
      
      // Store user session
      userSessions.set(socket.id, { userId, roomId, language: 'en' })
      
      // Add user to room tracking
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, new Set())
      }
      activeRooms.get(roomId).add(userId)
      
      // Notify other users in the room
      socket.to(roomId).emit('user_joined', { userId })
      
      console.log(`User ${userId} successfully joined room ${roomId}`)
      
    } catch (error) {
      console.error('Error joining room:', error)
      socket.emit('error', { message: 'Failed to join room' })
    }
  })

  // Handle sending messages
  socket.on('send_message', async ({ roomId, message, language }) => {
    try {
      const userSession = userSessions.get(socket.id)
      if (!userSession) {
        socket.emit('error', { message: 'User session not found' })
        return
      }

      const messageId = uuidv4()
      const timestamp = new Date()

      // Create message object
      const messageObj = {
        id: messageId,
        roomId,
        senderId: userSession.userId,
        content: message,
        originalLanguage: language || 'en',
        timestamp,
        messageType: 'text'
      }

      console.log(`Message from ${userSession.userId} in room ${roomId}: ${message}`)

      // Get all users in the room
      const roomUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
      
      // Send message to all users in the room
      for (const socketId of roomUsers) {
        const targetSocket = io.sockets.sockets.get(socketId)
        const targetSession = userSessions.get(socketId)
        
        if (targetSocket && targetSession) {
          let messageToSend = { ...messageObj }
          
          // If target user has different language preference, translate
          if (targetSession.language && targetSession.language !== language) {
            try {
              const translation = await translationService.translate({
                text: message,
                fromLanguage: language || 'en',
                toLanguage: targetSession.language
              })
              
              if (translation.confidence > 0.3) {
                messageToSend = {
                  ...messageObj,
                  content: translation.translatedText,
                  originalContent: message,
                  translated: true,
                  translationConfidence: translation.confidence
                }
              }
            } catch (translationError) {
              console.error('Translation error:', translationError)
              // Send original message if translation fails
            }
          }
          
          targetSocket.emit('message_received', { 
            message: messageToSend,
            translated: messageToSend.translated || false
          })
        }
      }

    } catch (error) {
      console.error('Error sending message:', error)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  // Handle typing indicators
  socket.on('typing', ({ roomId, userId }) => {
    try {
      // Broadcast typing indicator to other users in the room
      socket.to(roomId).emit('typing_indicator', { userId, isTyping: true })
      
      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        socket.to(roomId).emit('typing_indicator', { userId, isTyping: false })
      }, 3000)
      
    } catch (error) {
      console.error('Error handling typing indicator:', error)
    }
  })

  // Handle language preference updates
  socket.on('update_language', ({ language }) => {
    try {
      const userSession = userSessions.get(socket.id)
      if (userSession) {
        userSession.language = language
        userSessions.set(socket.id, userSession)
        console.log(`Updated language for user ${userSession.userId} to ${language}`)
      }
    } catch (error) {
      console.error('Error updating language:', error)
    }
  })

  // Handle leaving room
  socket.on('leave_room', ({ roomId, userId }) => {
    try {
      console.log(`User ${userId} leaving room ${roomId}`)
      
      socket.leave(roomId)
      
      // Remove from room tracking
      if (activeRooms.has(roomId)) {
        activeRooms.get(roomId).delete(userId)
        if (activeRooms.get(roomId).size === 0) {
          activeRooms.delete(roomId)
        }
      }
      
      // Notify other users
      socket.to(roomId).emit('user_left', { userId })
      
    } catch (error) {
      console.error('Error leaving room:', error)
    }
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    try {
      const userSession = userSessions.get(socket.id)
      if (userSession) {
        const { userId, roomId } = userSession
        console.log(`User ${userId} disconnected from room ${roomId}`)
        
        // Remove from room tracking
        if (activeRooms.has(roomId)) {
          activeRooms.get(roomId).delete(userId)
          if (activeRooms.get(roomId).size === 0) {
            activeRooms.delete(roomId)
          }
        }
        
        // Notify other users
        socket.to(roomId).emit('user_left', { userId })
        
        // Clean up session
        userSessions.delete(socket.id)
      }
    } catch (error) {
      console.error('Error handling disconnect:', error)
    }
  })

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error)
  })
}