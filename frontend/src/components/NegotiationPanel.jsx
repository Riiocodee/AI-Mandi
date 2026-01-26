import React, { useState, useEffect } from 'react'

function NegotiationPanel({ translations = {} }) {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock suggestions for initial display
  useEffect(() => {
    const mockSuggestions = [
      {
        type: 'market_info',
        content: translations.marketInfoSuggestion || 'Current market price for tomatoes is ₹40-45 per kg. Your suggested price of ₹42/kg is competitive.',
        suggestedPrice: 42
      },
      {
        type: 'strategy',
        content: translations.strategySuggestion || 'Consider offering bulk discounts for quantities over 10kg to attract wholesale buyers.',
      },
      {
        type: 'counter_offer',
        content: translations.counterOfferSuggestion || 'If buyer offers ₹35/kg, you could counter with ₹38/kg - still profitable above wholesale price.',
        suggestedPrice: 38
      }
    ]
    setSuggestions(mockSuggestions)
  }, [translations])

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'market_info':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      case 'strategy':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      case 'counter_offer':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getSuggestionTypeLabel = (type) => {
    switch (type) {
      case 'market_info':
        return translations.marketInfo || 'Market Info'
      case 'strategy':
        return translations.strategy || 'Strategy'
      case 'counter_offer':
        return translations.counterOffer || 'Counter Offer'
      default:
        return translations.suggestion || 'Suggestion'
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {translations.negotiationAssistant || 'AI Negotiation Assistant'}
        </h3>
        <div className="flex items-center text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {translations.aiPowered || 'AI Powered'}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">
            {translations.analyzingConversation || 'Analyzing conversation...'}
          </p>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
            </svg>
          </div>
          <p className="text-sm font-medium">
            {translations.startChatForSuggestions || 'Start chatting to get negotiation suggestions'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getSuggestionIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider bg-white px-2 py-1 rounded-full">
                      {getSuggestionTypeLabel(suggestion.type)}
                    </span>
                    {suggestion.suggestedPrice && (
                      <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        ₹{suggestion.suggestedPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {suggestion.content}
                  </p>
                  {suggestion.suggestedPrice && (
                    <div className="mt-3 flex space-x-2">
                      <button className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full transition-colors duration-200">
                        ✓ Accept
                      </button>
                      <button className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full transition-colors duration-200">
                        💬 Counter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <p className="text-xs text-yellow-800 flex items-start">
              <svg className="w-4 h-4 mr-1 mt-0.5 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>
                <strong>{translations.tip || 'Pro Tip'}:</strong> {translations.negotiationTip || 'These AI suggestions are based on market data and conversation context. Use them as guidance for your negotiations.'}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default NegotiationPanel