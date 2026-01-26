// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

// Language Configuration
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
]

export const DEFAULT_LANGUAGE = 'en'

// Product Units
export const PRODUCT_UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'liters', label: 'Liters' },
  { value: 'grams', label: 'Grams (g)' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'bundles', label: 'Bundles' }
]

// Chat Configuration
export const CHAT_ROOM_ID = 'general'
export const MESSAGE_TYPES = {
  TEXT: 'text',
  PRICE_OFFER: 'price_offer',
  SYSTEM: 'system'
}

// Negotiation Types
export const NEGOTIATION_TYPES = {
  COUNTER_OFFER: 'counter_offer',
  MARKET_INFO: 'market_info',
  STRATEGY: 'strategy'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  LANGUAGE: 'ai-mandi-language',
  USER_ID: 'ai-mandi-user-id',
  CHAT_HISTORY: 'ai-mandi-chat-history'
}