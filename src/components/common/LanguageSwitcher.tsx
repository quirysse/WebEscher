import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const next = i18n.language === 'fr' ? 'en' : 'fr'
    i18n.changeLanguage(next)
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
      aria-label={i18n.language === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      {i18n.language === 'fr' ? 'EN' : 'FR'}
    </button>
  )
}
