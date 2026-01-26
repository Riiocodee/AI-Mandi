# Socket.io Server Setup Documentation

## Overview

The AI Mandi backend implements a comprehensive Socket.io server setup for real-time communication between buyers and vendors. This document outlines the implementation details, features, and usage.

## Architecture

### Core Components

1. **HTTP Server**: Express.js server with Socket.io integration
2. **Socket.io Server**: Real-time WebSocket communication layer
3. **Chat Handlers**: Event handlers for chat functionality
4. **Room Management**: Dynamic room creation and user management
5. **Translation Integration**: Real-time message translation
6. **Session Management**: User session tracking and cleanup

### File Structure

```
backend/src/
├── server.js              # Main server with Socket.io setup
├── socket/
│   └── chatHandler.js      # Socket event handlers
├── services/
│   └── translation.js      # Translation service integration
└── tests/
    ├── socket.test.js      # Socket.io unit tests
    └── integration.test.js # Integration tests
```

## Configuration

### Socket.io Server Configuration

```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
})
```

### Environment Variables

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## Features Implemented

### ✅ Basic Connection Handling
- Client connection/disconnection events
- Connection logging and monitoring
- Error handling for connection issues

### ✅ Room Management
- Dynamic room creation
- User join/leave functionality
- Room cleanup when empty
- Multi-room support per user

### ✅ Real-time Messaging
- Instant message transmission
- Message broadcasting to room members
- Message persistence with unique IDs
- Timestamp tracking

### ✅ Translation Integration
- Automatic message translation between languages
- Language preference per user
- Fallback to original message if translation fails
- Translation confidence scoring

### ✅ Typing Indicators
- Real-time typing status broadcast
- Auto-clear typing indicators
- Room-specific typing notifications

### ✅ User Session Management
- Session tracking per socket connection
- User language preferences
- Session cleanup on disconnect
- Multi-device support

### ✅ Error Handling
- Graceful error handling for all events
- User-friendly error messages
- Connection recovery support
- Malformed data validation

## Socket Events

### Client to Server Events

#### `join_room`
Join a chat room for real-time communication.

```javascript
socket.emit('join_room', {
  roomId: 'room-123',
  userId: 'user-456'
})
```

#### `send_message`
Send a message to all users in a room.

```javascript
socket.emit('send_message', {
  roomId: 'room-123',
  message: 'Hello everyone!',
  language: 'en'
})
```

#### `typing`
Indicate that user is typing.

```javascript
socket.emit('typing', {
  roomId: 'room-123',
  userId: 'user-456'
})
```

#### `update_language`
Update user's language preference.

```javascript
socket.emit('update_language', {
  language: 'hi'
})
```

#### `leave_room`
Leave a chat room.

```javascript
socket.emit('leave_room', {
  roomId: 'room-123',
  userId: 'user-456'
})
```

### Server to Client Events

#### `message_received`
Receive a new message in the room.

```javascript
socket.on('message_received', (data) => {
  console.log('New message:', data.message)
  console.log('Translated:', data.translated)
})
```

#### `user_joined`
Notification when a user joins the room.

```javascript
socket.on('user_joined', (data) => {
  console.log('User joined:', data.userId)
})
```

#### `user_left`
Notification when a user leaves the room.

```javascript
socket.on('user_left', (data) => {
  console.log('User left:', data.userId)
})
```

#### `typing_indicator`
Typing status updates from other users.

```javascript
socket.on('typing_indicator', (data) => {
  console.log(`${data.userId} is typing: ${data.isTyping}`)
})
```

#### `error`
Error notifications.

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message)
})
```

## Message Format

### Standard Message Object

```javascript
{
  id: 'uuid-v4-string',
  roomId: 'room-identifier',
  senderId: 'user-identifier',
  content: 'message-content',
  originalLanguage: 'en',
  timestamp: '2024-01-01T12:00:00.000Z',
  messageType: 'text'
}
```

### Translated Message Object

```javascript
{
  id: 'uuid-v4-string',
  roomId: 'room-identifier',
  senderId: 'user-identifier',
  content: 'translated-content',
  originalContent: 'original-content',
  originalLanguage: 'en',
  timestamp: '2024-01-01T12:00:00.000Z',
  messageType: 'text',
  translated: true,
  translationConfidence: 0.85
}
```

## Room Management

### Room Lifecycle

1. **Creation**: Rooms are created automatically when first user joins
2. **Population**: Multiple users can join the same room
3. **Communication**: All users in room receive messages and notifications
4. **Cleanup**: Rooms are automatically deleted when last user leaves

### Room Tracking

- Active rooms stored in memory using `Map` data structure
- User sessions tracked per socket connection
- Automatic cleanup on disconnect events

## Translation Features

### Supported Languages

- English (en)
- Hindi (hi)
- Malayalam (ml)
- Tamil (ta)

### Translation Process

1. User sends message in their preferred language
2. Server detects recipient language preferences
3. If languages differ, translation service is called
4. Translated message is sent to recipients
5. Original message preserved for sender

### Fallback Handling

- If translation fails, original message is sent
- Translation confidence scores provided
- Graceful degradation to ensure communication continues

## Performance Considerations

### Scalability Features

- In-memory session storage for fast access
- Efficient room management with automatic cleanup
- Connection pooling and reuse
- Minimal message overhead

### Resource Management

- Automatic session cleanup on disconnect
- Room cleanup when empty
- Memory-efficient data structures
- Connection timeout handling

## Testing

### Test Coverage

- ✅ Basic connection establishment
- ✅ Room join/leave functionality
- ✅ Message sending and receiving
- ✅ Translation integration
- ✅ Typing indicators
- ✅ Error handling
- ✅ Multi-user scenarios
- ✅ Performance under load

### Running Tests

```bash
# Run all tests
npm test

# Run Socket.io specific tests
npm test socket.test.js

# Run integration tests
npm test integration.test.js

# Validate Socket.io setup
node validate-socket.js
```

## Monitoring and Logging

### Connection Logging

```
User connected: socket-id-123
User user-456 joining room room-123
User user-456 successfully joined room room-123
Message from user-456 in room room-123: Hello!
User user-456 disconnected from room room-123
```

### Error Logging

```
Error joining room: [error details]
Translation error: [error details]
Socket error: [error details]
```

## Security Considerations

### CORS Configuration

- Restricted to specific frontend origins
- Credentials support enabled
- Method restrictions in place

### Input Validation

- Room ID and User ID validation
- Message content sanitization
- Language code validation
- Malformed data handling

### Session Security

- Session isolation per socket
- Automatic cleanup on disconnect
- No persistent session storage

## Deployment Notes

### Environment Setup

1. Set `FRONTEND_URL` to production frontend URL
2. Configure `PORT` for production environment
3. Set `NODE_ENV=production` for production builds
4. Ensure CORS origins match deployment URLs

### Production Considerations

- Use Redis adapter for multi-server deployments
- Implement rate limiting for message sending
- Add authentication middleware
- Monitor connection counts and performance

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check CORS configuration and frontend URL
2. **Messages Not Received**: Verify room join before sending messages
3. **Translation Failures**: Check translation service availability
4. **Memory Leaks**: Ensure proper disconnect handling

### Debug Mode

Enable debug logging:

```bash
DEBUG=socket.io* node src/server.js
```

## Requirements Validation

This implementation satisfies the following requirements:

- ✅ **Requirement 4.2**: Real-time message transmission using Socket.io
- ✅ **Requirement 4.5**: Maintain real-time connection without manual refresh
- ✅ **Requirement 5.1**: Detect sender's selected language
- ✅ **Requirement 5.2**: Translate messages for different language users
- ✅ **Requirement 5.3**: Display both original and translated text

## Future Enhancements

### Planned Features

- [ ] Message persistence to database
- [ ] File/image sharing support
- [ ] Voice message support
- [ ] Message encryption
- [ ] User presence indicators
- [ ] Message read receipts
- [ ] Push notifications
- [ ] Rate limiting per user
- [ ] Admin moderation tools
- [ ] Message search functionality

### Scalability Improvements

- [ ] Redis adapter for horizontal scaling
- [ ] Message queuing for reliability
- [ ] Connection load balancing
- [ ] Metrics and monitoring dashboard
- [ ] Automated testing in CI/CD

## Conclusion

The Socket.io server setup for AI Mandi provides a robust, scalable foundation for real-time communication with built-in translation support. The implementation follows best practices for WebSocket communication and includes comprehensive error handling and testing.

The server is production-ready and can handle multiple concurrent users across different rooms with automatic translation between supported languages.