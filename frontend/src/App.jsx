import React, { useState, useEffect } from 'react'
import LanguageSelector from './components/LanguageSelector'
import ProductForm from './components/ProductForm'
import PriceCard from './components/PriceCard'
import ChatInterface from './components/ChatInterface'
import NegotiationPanel from './components/NegotiationPanel'
import { useLanguage } from './hooks/useLanguage'
import { useSocket } from './hooks/useSocket'

function App() {
  const { language, setLanguage, translations } = useLanguage()
  const { socket, isConnected } = useSocket()
  const [priceData, setPriceData] = useState(null)
  const [productName, setProductName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleProductSubmit = async (product) => {
    setIsLoading(true)
    setProductName(product.name)
    showToast('Getting price suggestion...', 'loading')
    
    try {
      const response = await fetch('http://localhost:3001/api/products/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })
      
      if (response.ok) {
        const data = await response.json()
        setPriceData(data.priceData)
        showToast('Suggestion ready!', 'success')
      } else {
        console.error('Failed to get price suggestion')
        showToast('Server error - please try again', 'error')
      }
    } catch (error) {
      console.error('Error submitting product:', error)
      showToast('Connection error - please check your internet', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border animate-fadeIn ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center">
            {toast.type === 'loading' && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            )}
            {toast.type === 'success' && (
              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-4 h-4 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-2 mr-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  AI Mandi
                </h1>
                <span className="text-sm text-gray-500">
                  {translations.subtitle || 'Multilingual Smart Market Assistant'}
                </span>
              </div>
            </div>
            <LanguageSelector 
              selectedLanguage={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Form and Price Card */}
          <div className="lg:col-span-1 space-y-6">
            <ProductForm 
              onSubmit={handleProductSubmit}
              isLoading={isLoading}
              translations={translations}
            />
            <PriceCard 
              priceData={priceData}
              productName={productName}
              translations={translations}
            />
          </div>

          {/* Right Column - Chat and Negotiation */}
          <div className="lg:col-span-2 space-y-6">
            <ChatInterface 
              socket={socket}
              isConnected={isConnected}
              language={language}
              translations={translations}
            />
            <NegotiationPanel 
              translations={translations}
            />
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">
              🚀 Built with <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Kiro AI</span> for seamless development
            </p>
            <p className="text-xs text-gray-500">
              Hackathon-ready MVP • Real-time multilingual market assistant
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App