import express from 'express'
import { TranslationService } from '../services/translation.js'

const router = express.Router()
const translationService = new TranslationService()

// POST /api/translate - Translate text between languages
router.post('/translate', async (req, res) => {
  try {
    const { text, fromLanguage, toLanguage } = req.body

    // Validate input
    if (!text || !fromLanguage || !toLanguage) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Text, fromLanguage, and toLanguage are required'
        }
      })
    }

    if (fromLanguage === toLanguage) {
      return res.json({
        success: true,
        translation: {
          originalText: text,
          translatedText: text,
          confidence: 1.0,
          fromLanguage,
          toLanguage
        }
      })
    }

    // Perform translation
    const translation = await translationService.translate({
      text,
      fromLanguage,
      toLanguage
    })

    res.json({
      success: true,
      translation
    })

  } catch (error) {
    console.error('Error translating text:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'TRANSLATION_FAILED',
        message: 'Failed to translate text'
      }
    })
  }
})

// GET /api/languages/supported - Get list of supported languages
router.get('/languages/supported', (req, res) => {
  try {
    const supportedLanguages = translationService.getSupportedLanguages()
    
    res.json({
      success: true,
      languages: supportedLanguages
    })

  } catch (error) {
    console.error('Error fetching supported languages:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch supported languages'
      }
    })
  }
})

export default router