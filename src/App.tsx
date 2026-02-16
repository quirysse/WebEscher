import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTilingStore } from './store/tilingStore'
import { LanguageSwitcher } from './components/common/LanguageSwitcher'
import { GroupSelector } from './components/Sidebar/GroupSelector'
import { ShapeSelector } from './components/Sidebar/ShapeSelector'
import { ColorPanel } from './components/Sidebar/ColorPanel'
import { Toolbar } from './components/Sidebar/Toolbar'
import { TilingCanvas } from './components/Canvas/TilingCanvas'

function App() {
  const { t } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        useTilingStore.getState().undo()
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        useTilingStore.getState().redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200"
      style={{
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 md:hidden"
            aria-label={sidebarOpen ? t('sidebar.close') : t('sidebar.open')}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-800 sm:text-2xl">{t('app.title')}</h1>
            <p className="truncate text-xs text-slate-600 sm:text-sm">{t('app.subtitle')}</p>
          </div>
          <a
            href="https://github.com/quirysse/WebEscher"
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 sm:gap-2.5 sm:px-4 sm:py-2.5 sm:text-base"
            aria-label={t('app.viewCode')}
          >
            <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span>{t('app.viewCode')}</span>
          </a>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Mobile overlay when sidebar is open */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={() => setSidebarOpen(false)}
        className="fixed inset-0 z-30 bg-black/30 md:hidden"
        style={{ display: sidebarOpen ? 'block' : 'none' }}
      />

      <main className="relative flex min-h-0 flex-1 gap-4 overflow-hidden p-2 sm:p-4 md:gap-6 md:p-4">
        <aside
          className={`
            fixed left-0 top-0 z-40 flex h-full w-[min(20rem,85vw)] shrink-0 flex-col
            overflow-y-auto rounded-r-xl border-r border-slate-200 bg-white p-4 shadow-xl
            transition-transform duration-200 ease-out
            md:relative md:left-auto md:top-auto md:z-auto md:h-auto md:w-80
            md:translate-x-0 md:rounded-xl md:border md:p-6 md:shadow-lg
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="mb-4 flex items-center justify-between md:hidden">
            <span className="text-sm font-semibold text-slate-700">{t('sidebar.title')}</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label={t('sidebar.close')}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <GroupSelector />
          <hr className="my-4 border-slate-200 md:my-6" />
          <ShapeSelector />
          <hr className="my-4 border-slate-200 md:my-6" />
          <ColorPanel />
          <hr className="my-4 border-slate-200 md:my-6" />
          <Toolbar />
        </aside>

        <section className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <TilingCanvas />
        </section>
      </main>
    </div>
  )
}

export default App
