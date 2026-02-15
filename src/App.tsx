import { useEffect } from 'react'
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
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 shadow-sm backdrop-blur">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('app.title')}</h1>
          <p className="text-sm text-slate-600">{t('app.subtitle')}</p>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="flex min-h-0 flex-1 gap-4 overflow-hidden p-4 md:gap-6 md:p-4">
        <aside className="flex w-full shrink-0 flex-col overflow-y-auto rounded-xl bg-white p-6 shadow-lg md:w-80">
          <GroupSelector />
          <hr className="my-6 border-slate-200" />
          <ShapeSelector />
          <hr className="my-6 border-slate-200" />
          <ColorPanel />
          <hr className="my-6 border-slate-200" />
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
