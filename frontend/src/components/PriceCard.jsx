import React from 'react'

function PriceCard({ priceData, productName, translations = {} }) {
  if (!priceData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          {translations.priceSuggestion || 'Fair Price Range'}
        </h3>
        <div className="text-center py-8 text-gray-500">
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <p className="text-sm">{translations.submitProductForPrice || 'Submit a product to get price suggestions'}</p>
        </div>
      </div>
    )
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price)
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return translations.highConfidence || 'High Confidence'
    if (confidence >= 0.6) return translations.mediumConfidence || 'Medium Confidence'
    return translations.lowConfidence || 'Low Confidence'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        {translations.priceSuggestion || 'Fair Price Range'}
      </h3>
      
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-gray-600 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {translations.product || 'Product'}: <span className="font-medium">{productName}</span>
          </p>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              ₹{priceData.suggestedPrice.toFixed(2)}
            </span>
            <span className="ml-2 text-gray-600 font-medium">
              / {priceData.unit}
            </span>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              💡 AI Suggested Price
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {translations.confidence || 'Confidence'}:
            </span>
            <span className={`text-sm font-bold px-2 py-1 rounded-full ${getConfidenceColor(priceData.confidence)} bg-opacity-10`}>
              {getConfidenceText(priceData.confidence)} ({Math.round(priceData.confidence * 100)}%)
            </span>
          </div>
          
          {/* Confidence Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                priceData.confidence >= 0.8 ? 'bg-green-500' : 
                priceData.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${priceData.confidence * 100}%` }}
            ></div>
          </div>
        </div>

        {priceData.marketAverage && (
          <div className="border-t border-gray-200 pt-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {translations.marketAverage || 'Market Average'}:
                </span>
                <span className="font-bold text-blue-700">
                  ₹{priceData.marketAverage.toFixed(2)} / {priceData.unit}
                </span>
              </div>
              <div className="text-xs text-blue-700 flex items-center">
                {priceData.suggestedPrice > priceData.marketAverage ? (
                  <>
                    <svg className="w-3 h-3 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    {translations.aboveMarket || 'Above market average'}
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                    {translations.belowMarket || 'Below market average'}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <p className="text-xs text-blue-800 flex items-start">
            <svg className="w-4 h-4 mr-1 mt-0.5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong>{translations.note || 'Note'}:</strong> {translations.priceNote || 'Prices are AI-generated suggestions based on market data and may vary by location and quality.'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PriceCard