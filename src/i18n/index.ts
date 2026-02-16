import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import es from './locales/es.json'
import ja from './locales/ja.json'
import de from './locales/de.json'
import ko from './locales/ko.json'
import ptBR from './locales/pt-BR.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      it: { translation: it },
      es: { translation: es },
      ja: { translation: ja },
      de: { translation: de },
      ko: { translation: ko },
      'pt-BR': { translation: ptBR },
    },
    lng: 'fr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
