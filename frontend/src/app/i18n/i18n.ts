import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enJSON from './en/en.json'
import bnJSON from './bn/bn.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {escapeValue: false},
    resources: {
      en: {translation: enJSON},
      bn: {translation: bnJSON},
    },
    detection: {
      order: ['localStorage', 'navigator', 'cookie'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'lang',
      lookupQuerystring: 'lang',
    },
  })

export default i18n
