import { useTranslation } from 'react-i18next'
import { US, FR, IT, ES, JP, DE, KR, BR } from 'country-flag-icons/react/3x2'

const LANGUAGES = [
  { code: 'en', label: 'EN', Flag: US },
  { code: 'fr', label: 'FR', Flag: FR },
  { code: 'it', label: 'IT', Flag: IT },
  { code: 'es', label: 'ES', Flag: ES },
  { code: 'ja', label: 'JA', Flag: JP },
  { code: 'de', label: 'DE', Flag: DE },
  { code: 'ko', label: 'KO', Flag: KR },
  { code: 'pt-BR', label: 'PT-BR', Flag: BR },
] as const

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentLang =
    LANGUAGES.find(
      (l) =>
        l.code === i18n.language || i18n.language?.startsWith(l.code + '-')
    ) ?? LANGUAGES[0]
  const CurrentFlag = currentLang.Flag

  return (
    <div className="flex items-center gap-2">
      <CurrentFlag
        className="h-5 w-7 rounded border border-gray-200 object-cover"
        aria-hidden
      />
      <select
        value={currentLang.code}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="rounded-md border border-gray-300 bg-white py-1.5 pl-2 pr-8 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Language"
      >
        {LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
