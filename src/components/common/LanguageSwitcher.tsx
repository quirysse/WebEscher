import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'it', label: 'IT', flag: '🇮🇹' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'ja', label: 'JA', flag: '🇯🇵' },
] as const

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language?.split('-')[0] ?? 'en'
  const currentLang = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0]

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-lg leading-none" aria-hidden>
        {currentLang.flag}
      </span>
      <select
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="rounded-md border border-gray-300 bg-white py-1.5 pl-2 pr-7 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Language"
      >
        {LANGUAGES.map(({ code, label, flag }) => (
          <option key={code} value={code}>
            {flag} {label}
          </option>
        ))}
      </select>
    </div>
  )
}
