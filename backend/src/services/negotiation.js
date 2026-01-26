export class NegotiationAssistant {
  constructor() {
    this.marketData = {}
  }

  async generateSuggestions(context) {
    const { currentPrice, marketPrice, chatHistory, productName } = context
    const suggestions = []

    try {
      // Generate market info suggestion
      if (marketPrice) {
        suggestions.push(this.generateMarketInfoSuggestion(currentPrice, marketPrice, productName))
      }

      // Generate strategy suggestion
      suggestions.push(this.generateStrategySuggestion(currentPrice, marketPrice, productName))

      // Generate counter offer suggestion
      if (currentPrice) {
        suggestions.push(this.generateCounterOfferSuggestion(currentPrice, marketPrice, productName))
      }

      // Analyze chat history for context-specific suggestions
      if (chatHistory && chatHistory.length > 0) {
        const contextSuggestion = this.analyzeNegotiationContext(chatHistory)
        if (contextSuggestion) {
          suggestions.push(contextSuggestion)
        }
      }

      return suggestions.filter(suggestion => suggestion !== null)

    } catch (error) {
      console.error('Error generating negotiation suggestions:', error)
      return this.getDefaultSuggestions()
    }
  }

  generateMarketInfoSuggestion(currentPrice, marketPrice, productName) {
    const priceDifference = currentPrice - marketPrice
    const percentageDiff = Math.abs((priceDifference / marketPrice) * 100)

    let content = `Current market average for ${productName || 'this product'} is ₹${marketPrice}`
    
    if (priceDifference > 0) {
      content += `. The offered price is ${percentageDiff.toFixed(1)}% above market rate.`
    } else if (priceDifference < 0) {
      content += `. The offered price is ${percentageDiff.toFixed(1)}% below market rate.`
    } else {
      content += `. The offered price matches the market rate.`
    }

    return {
      type: 'market_info',
      content,
      suggestedPrice: marketPrice
    }
  }

  generateStrategySuggestion(currentPrice, marketPrice, productName) {
    const strategies = [
      'Consider offering bulk discounts for quantities over 10 units',
      'Highlight the quality and freshness of your products',
      'Mention seasonal availability to justify pricing',
      'Offer package deals with complementary products',
      'Emphasize local sourcing and support for farmers',
      'Provide flexible payment terms for regular customers',
      'Suggest alternative products with better margins',
      'Offer loyalty discounts for repeat customers'
    ]

    // Select strategy based on context
    let selectedStrategy = strategies[Math.floor(Math.random() * strategies.length)]

    // Customize strategy based on price comparison
    if (marketPrice && currentPrice > marketPrice * 1.1) {
      selectedStrategy = 'Consider highlighting premium quality to justify the higher price point'
    } else if (marketPrice && currentPrice < marketPrice * 0.9) {
      selectedStrategy = 'You have competitive pricing - emphasize the value proposition'
    }

    return {
      type: 'strategy',
      content: selectedStrategy
    }
  }

  generateCounterOfferSuggestion(currentPrice, marketPrice, productName) {
    let suggestedPrice = currentPrice
    let reasoning = ''

    if (marketPrice) {
      // If current price is above market, suggest closer to market
      if (currentPrice > marketPrice * 1.1) {
        suggestedPrice = marketPrice * 1.05 // 5% above market
        reasoning = 'which is closer to market rate while maintaining profit margin'
      }
      // If current price is below market, suggest slight increase
      else if (currentPrice < marketPrice * 0.9) {
        suggestedPrice = marketPrice * 0.95 // 5% below market
        reasoning = 'which better reflects the market value'
      }
      // If price is reasonable, suggest small adjustment
      else {
        suggestedPrice = currentPrice * 0.97 // 3% reduction
        reasoning = 'as a goodwill gesture to close the deal'
      }
    } else {
      // Without market data, suggest 5% reduction
      suggestedPrice = currentPrice * 0.95
      reasoning = 'to show flexibility in negotiation'
    }

    return {
      type: 'counter_offer',
      content: `You could counter with ₹${Math.round(suggestedPrice)} per unit, ${reasoning}`,
      suggestedPrice: Math.round(suggestedPrice)
    }
  }

  analyzeNegotiationContext(chatHistory) {
    // Analyze recent messages for negotiation patterns
    const recentMessages = chatHistory.slice(-5) // Last 5 messages
    const messageText = recentMessages.map(msg => msg.content.toLowerCase()).join(' ')

    // Look for price mentions
    const priceRegex = /₹?(\d+)/g
    const prices = []
    let match
    while ((match = priceRegex.exec(messageText)) !== null) {
      prices.push(parseInt(match[1]))
    }

    // Look for negotiation keywords
    const negotiationKeywords = {
      'too expensive': 'The buyer finds the price too high. Consider offering a discount or highlighting value.',
      'cheap': 'The buyer is price-sensitive. Emphasize affordability and value for money.',
      'quality': 'Quality is important to the buyer. Focus on product quality and freshness.',
      'bulk': 'The buyer is interested in bulk purchase. Offer quantity discounts.',
      'urgent': 'The buyer has urgency. You may have stronger negotiating position.',
      'budget': 'The buyer has budget constraints. Consider flexible payment options.'
    }

    for (const [keyword, suggestion] of Object.entries(negotiationKeywords)) {
      if (messageText.includes(keyword)) {
        return {
          type: 'strategy',
          content: suggestion
        }
      }
    }

    // If prices were mentioned, analyze the trend
    if (prices.length >= 2) {
      const lastPrice = prices[prices.length - 1]
      const previousPrice = prices[prices.length - 2]
      
      if (lastPrice < previousPrice) {
        return {
          type: 'strategy',
          content: 'Prices are trending downward in the negotiation. Consider holding firm or highlighting unique value.'
        }
      } else if (lastPrice > previousPrice) {
        return {
          type: 'strategy',
          content: 'The buyer is showing willingness to pay more. You may have room for better terms.'
        }
      }
    }

    return null
  }

  calculateMarketTrends(priceHistory) {
    if (priceHistory.length < 2) {
      return {
        trend: 'insufficient_data',
        message: 'Not enough data to determine trends'
      }
    }

    // Sort by date
    const sortedPrices = priceHistory.sort((a, b) => new Date(a.date) - new Date(b.date))
    
    // Calculate trend over last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentPrices = sortedPrices.filter(price => new Date(price.date) >= thirtyDaysAgo)
    
    if (recentPrices.length < 2) {
      return {
        trend: 'stable',
        message: 'Limited recent data, prices appear stable'
      }
    }

    const firstPrice = recentPrices[0].price
    const lastPrice = recentPrices[recentPrices.length - 1].price
    const percentageChange = ((lastPrice - firstPrice) / firstPrice) * 100

    if (percentageChange > 5) {
      return {
        trend: 'increasing',
        change: percentageChange,
        message: `Prices have increased by ${percentageChange.toFixed(1)}% in the last 30 days`
      }
    } else if (percentageChange < -5) {
      return {
        trend: 'decreasing',
        change: percentageChange,
        message: `Prices have decreased by ${Math.abs(percentageChange).toFixed(1)}% in the last 30 days`
      }
    } else {
      return {
        trend: 'stable',
        change: percentageChange,
        message: `Prices have remained relatively stable with ${percentageChange.toFixed(1)}% change`
      }
    }
  }

  getDefaultSuggestions() {
    return [
      {
        type: 'strategy',
        content: 'Start with a friendly greeting and ask about their specific needs'
      },
      {
        type: 'market_info',
        content: 'Research current market prices to make informed offers'
      },
      {
        type: 'counter_offer',
        content: 'Be prepared to negotiate but know your minimum acceptable price'
      }
    ]
  }
}