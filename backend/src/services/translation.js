import { loadJsonData } from '../utils/fileUtils.js'

export class TranslationService {
  constructor() {
    this.translations = {}
    this.supportedLanguages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
    ]
    this.loadMockTranslations()
  }

  async loadMockTranslations() {
    try {
      this.translations = await loadJsonData('translations.json', {})
    } catch (error) {
      console.error('Error loading translations:', error)
      this.translations = this.getDefaultTranslations()
    }
  }

  async translate(request) {
    const { text, fromLanguage, toLanguage } = request

    try {
      // Check if translation exists in mock data
      const translationKey = `${fromLanguage}_${toLanguage}`
      const reverseKey = `${toLanguage}_${fromLanguage}`
      
      let translatedText = text
      let confidence = 0.3 // Default low confidence

      // Look for exact match in translations
      if (this.translations[translationKey] && this.translations[translationKey][text.toLowerCase()]) {
        translatedText = this.translations[translationKey][text.toLowerCase()]
        confidence = 0.9
      }
      // Try reverse translation
      else if (this.translations[reverseKey]) {
        const reverseTranslations = this.translations[reverseKey]
        const foundKey = Object.keys(reverseTranslations).find(
          key => reverseTranslations[key].toLowerCase() === text.toLowerCase()
        )
        if (foundKey) {
          translatedText = foundKey
          confidence = 0.8
        }
      }
      // Apply simple word substitution for common market terms
      else {
        const wordTranslation = this.translateCommonWords(text, fromLanguage, toLanguage)
        if (wordTranslation !== text) {
          translatedText = wordTranslation
          confidence = 0.6
        }
      }

      return {
        originalText: text,
        translatedText,
        confidence,
        fromLanguage,
        toLanguage
      }

    } catch (error) {
      console.error('Translation error:', error)
      return {
        originalText: text,
        translatedText: text,
        confidence: 0.0,
        fromLanguage,
        toLanguage,
        error: 'Translation failed'
      }
    }
  }

  translateCommonWords(text, fromLang, toLang) {
    const commonWords = {
      // English to Hindi
      'en_hi': {
        'hello': 'नमस्ते',
        'price': 'कीमत',
        'good': 'अच्छा',
        'bad': 'बुरा',
        'yes': 'हाँ',
        'no': 'नहीं',
        'buy': 'खरीदना',
        'sell': 'बेचना',
        'market': 'बाजार',
        'vegetable': 'सब्जी',
        'fruit': 'फल',
        'kg': 'किलो',
        'rupees': 'रुपये'
      },
      // English to Malayalam
      'en_ml': {
        'hello': 'നമസ്കാരം',
        'price': 'വില',
        'good': 'നല്ലത്',
        'bad': 'മോശം',
        'yes': 'അതെ',
        'no': 'ഇല്ല',
        'buy': 'വാങ്ങുക',
        'sell': 'വിൽക്കുക',
        'market': 'മാർക്കറ്റ്',
        'vegetable': 'പച്ചക്കറി',
        'fruit': 'പഴം',
        'kg': 'കിലോ',
        'rupees': 'രൂപ'
      },
      // English to Tamil
      'en_ta': {
        'hello': 'வணக்கம்',
        'price': 'விலை',
        'good': 'நல்லது',
        'bad': 'கெட்டது',
        'yes': 'ஆம்',
        'no': 'இல்லை',
        'buy': 'வாங்க',
        'sell': 'விற்க',
        'market': 'சந்தை',
        'vegetable': 'காய்கறி',
        'fruit': 'பழம்',
        'kg': 'கிலோ',
        'rupees': 'ரூபாய்'
      }
    }

    const translationKey = `${fromLang}_${toLang}`
    const wordMap = commonWords[translationKey]
    
    if (!wordMap) {
      return text
    }

    let translatedText = text.toLowerCase()
    
    // Replace common words
    Object.keys(wordMap).forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      translatedText = translatedText.replace(regex, wordMap[word])
    })

    return translatedText
  }

  getSupportedLanguages() {
    return this.supportedLanguages
  }

  getDefaultTranslations() {
    return {
      'en_hi': {
        'hello': 'नमस्ते',
        'how much': 'कितना',
        'good price': 'अच्छी कीमत',
        'too expensive': 'बहुत महंगा',
        'cheap': 'सस्ता',
        'deal': 'सौदा'
      },
      'en_ml': {
        'hello': 'നമസ്കാരം',
        'how much': 'എത്ര',
        'good price': 'നല്ല വില',
        'too expensive': 'വളരെ ചെലവേറിയത്',
        'cheap': 'വിലകുറഞ്ഞ',
        'deal': 'ഇടപാട്'
      },
      'en_ta': {
        'hello': 'வணக்கம்',
        'how much': 'எவ்வளவு',
        'good price': 'நல்ல விலை',
        'too expensive': 'மிகவும் விலை உயர்ந்தது',
        'cheap': 'மலிவான',
        'deal': 'ஒப்பந்தம்'
      }
    }
  }
}