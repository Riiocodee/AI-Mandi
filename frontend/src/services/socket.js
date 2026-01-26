import { io } from 'socket.io-client'
import { SOCKET_URL } from '../utils/constants'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect() {
    if (this.socket) {
      return this.socket
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      console.log('Socket connected:', this.socket.id)
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      console.log('Socket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Room Management
  joinRoom(roomId, userId) {
    if (this.socket) {
      this.socket.emit('join_room', { roomId, userId })
    }
  }

  leaveRoom(roomId, userId) {
    if (this.socket) {
      this.socket.emit('leave_room', { roomId, userId })
    }
  }

  // Message Handling
  sendMessage(roomId, message, language) {
    if (this.socket) {
      this.socket.emit('send_message', { roomId, message, language })
    }
  }

  onMessageReceived(callback) {
    if (this.socket) {
      this.socket.on('message_received', callback)
    }
  }

  offMessageReceived(callback) {
    if (this.socket) {
      this.socket.off('message_received', callback)
    }
  }

  // Typing Indicators
  sendTyping(roomId, userId) {
    if (this.socket) {
      this.socket.emit('typing', { roomId, userId })
    }
  }

  onTypingIndicator(callback) {
    if (this.socket) {
      this.socket.on('typing_indicator', callback)
    }
  }

  offTypingIndicator(callback) {
    if (this.socket) {
      this.socket.off('typing_indicator', callback)
    }
  }

  // User Management
  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user_joined', callback)
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user_left', callback)
    }
  }

  // Generic event handling
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }
}

export const socketService = new SocketService()
export default socketService