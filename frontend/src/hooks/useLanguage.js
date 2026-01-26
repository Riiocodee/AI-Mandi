import { useState, useEffect } from 'react'
import { translations } from '../utils/translations'

export function useLanguage() {
  const [language, setLanguageState] = useState(() => {
    // Get language from localStorage or default to English
    return localStorage.getItem('ai-mandi-language') || 'en'
  })

  const setLanguage = (newLanguage) => {
    setLanguageState(newLanguage)
    localStorage.setItem('ai-mandi-language', newLanguage)
  }

  const currentTranslations = translations[language] || translations.en

  return {
    language,
    setLanguage,
    translations: currentTranslations
  }
}