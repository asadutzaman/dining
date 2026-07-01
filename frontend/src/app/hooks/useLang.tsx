import {useNavigate, useLocation} from 'react-router-dom'
import {useTranslation} from 'react-i18next'

export const useLang = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {t, i18n} = useTranslation()

  const normalize = (lng?: string) =>
    lng ? (lng.startsWith('en') ? 'en' : lng.startsWith('bn') ? 'bn' : lng) : 'en'
  const lang = normalize(i18n.language)
  const isEnglish = i18n.language === 'en'
  const isBangla = i18n.language === 'bn'

  const changeLanguage = (locale: string) => {
    if (lang !== locale && locale === 'en') {
      localStorage.setItem('lang', locale)
      i18n.changeLanguage(locale)
    }
    if (lang !== locale && locale === 'bn') {
      localStorage.setItem('lang', locale)
      i18n.changeLanguage(locale)
    }
  }

  return {
    t,
    lang,
    isEnglish,
    isBangla,
    changeLanguage,
  }
}
