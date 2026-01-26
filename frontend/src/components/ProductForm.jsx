import React, { useState, useEffect } from 'react'

const UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'liters', label: 'Liters' },
  { value: 'grams', label: 'Grams (g)' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'bundles', label: 'Bundles' }
]

function ProductForm({ onSubmit, isLoading, translations = {} }) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'kg'
  })
  const [errors, setErrors] = useState({})
  const [showToast, setShowToast] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = translations.productNameRequired || 'Product name is required'
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = translations.quantityRequired || 'Valid quantity is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      setShowToast('Getting price suggestion...')
      onSubmit({
        name: formData.name.trim(),
        quantity: parseFloat(formData.quantity),
        unit: formData.unit
      })
    }
  }

  const handleTryDemo = () => {
    setFormData({
      name: 'Tomatoes',
      quantity: '10',
      unit: 'kg'
    })
    setErrors({})
  }

  // Toast effect
  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  // Update toast based on loading state
  React.useEffect(() => {
    if (!isLoading && showToast === 'Getting price suggestion...') {
      setShowToast('Suggestion ready!')
    }
  }, [isLoading, showToast])

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Toast Notification */}
      {showToast && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm text-blue-800">{showToast}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          {translations.productDetails || 'Product Details'}
        </h2>
        <button
          type="button"
          onClick={handleTryDemo}
          className="text-sm bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-sm"
          disabled={isLoading}
        >
          ✨ Try Demo
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {translations.productName || 'Product Name'}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
            placeholder={translations.productNamePlaceholder || 'Enter product name'}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            {translations.quantity || 'Quantity'}
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className={`input-field ${errors.quantity ? 'border-red-500' : ''}`}
            placeholder={translations.quantityPlaceholder || 'Enter quantity'}
            min="0"
            step="0.1"
            disabled={isLoading}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
          )}
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
            {translations.unit || 'Unit'}
          </label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="input-field"
            disabled={isLoading}
          >
            {UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl transform hover:-translate-y-0.5'}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {translations.analyzing || 'Analyzing...'}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {translations.getPriceSuggestion || 'Get Price Suggestion'}
            </div>
          )}
        </button>
      </form>
    </div>
  )
}

export default ProductForm