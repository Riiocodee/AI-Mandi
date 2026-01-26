import React, { useState, useEffect, useRef } from 'react'

function ChatInterface({ socket, isConnected, language, translations = {} }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const currentUser = 'user_' + Math.random().toString(36).substring(2, 9)

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        socket.emit('join_room', { roomId: 'general', userId: currentUser })
      })

      socket.on('message_received', (data) => {
        setMessages(prev => [...prev, data.message])
        if (data.translated) {
          // Show translated version if available
          setMessages(prev => [...prev.slice(0, -1), data.translated])
        }
      })

      socket.on('typing_indicator', ({ userId, isTyping }) => {
        if (userId !== currentUser) {
          setIsTyping(isTyping)
        }
      })

      return () => {
        socket.off('connect')
        socket.off('message_received')
        socket.off('typing_indicator')
      }
    }
  }, [socket, currentUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    
    if (newMessage.trim() && socket && isConnected) {
      const message = {
        id: Date.now().toString(),
        sender: currentUser,
        content: newMessage.trim(),
        timestamp: new Date(),
        translated: false
      }

      socket.emit('send_message', {
        roomId: 'general',
        message: newMessage.trim(),
        language: language
      })

      setMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    
    if (socket && isConnected) {
      socket.emit('typing', { roomId: 'general', userId: currentUser })
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-96 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {translations.chat || 'Live Chat'}
        </h3>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
            {isConnected 
              ? (translations.connected || '🟢 Connected') 
              : (translations.disconnected || '🔴 Disconnected')
            }
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium">{translations.noMessages || 'No messages yet'}</p>
            <p className="text-xs text-gray-400 mt-1">Start negotiating with other vendors!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                message.sender === currentUser 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white ml-auto' 
                  : 'bg-gray-100 text-gray-800 mr-auto border border-gray-200'
              }`}>
                <p className="text-sm">{message.content}</p>
                {message.originalContent && message.originalContent !== message.content && (
                  <p className="text-xs opacity-75 mt-2 italic border-t border-white border-opacity-20 pt-2">
                    <span className="font-medium">{translations.original || 'Original'}:</span> {message.originalContent}
                  </p>
                )}
                <p className="text-xs opacity-75 mt-2 text-right">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex justify-start px-4">
            <div className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder={translations.typeMessage || 'Type your message...'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg ${
              !newMessage.trim() || !isConnected 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatInterface