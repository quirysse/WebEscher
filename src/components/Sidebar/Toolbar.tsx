import { useTranslation } from 'react-i18next'
import { useTilingStore } from '../../store/tilingStore'
import { getDefaultShapePoints } from '../../utils/defaultShape'
import { subdivideEdges } from '../../editor/shapeEditor'

export const EXPORT_PNG_EVENT = 'webescher-export-png'

export function Toolbar() {
  const { t } = useTranslation()
  const wallpaperGroup = useTilingStore((s) => s.wallpaperGroup)
  const baseShape = useTilingStore((s) => s.baseShape)
  const shapePoints = useTilingStore((s) => s.shapePoints)
  const setShapePoints = useTilingStore((s) => s.setShapePoints)
  const resetShape = useTilingStore((s) => s.resetShape)
  const undo = useTilingStore((s) => s.undo)
  const redo = useTilingStore((s) => s.redo)
  const canUndo = useTilingStore((s) => s.canUndo())
  const canRedo = useTilingStore((s) => s.canRedo())
  const smoothEnabled = useTilingStore((s) => s.smoothEnabled)
  const smoothTension = useTilingStore((s) => s.smoothTension)
  const setSmoothEnabled = useTilingStore((s) => s.setSmoothEnabled)
  const setSmoothTension = useTilingStore((s) => s.setSmoothTension)
  const homothetyEnabled = useTilingStore((s) => s.homothetyEnabled)
  const homothetyMode = useTilingStore((s) => s.homothetyMode)
  const setHomothetyEnabled = useTilingStore((s) => s.setHomothetyEnabled)
  const setHomothetyMode = useTilingStore((s) => s.setHomothetyMode)
  const canReset = Boolean(wallpaperGroup && shapePoints !== null)
  const currentPoints = shapePoints ?? (wallpaperGroup ? getDefaultShapePoints(baseShape, 80) : [])
  const canSmooth = Boolean(wallpaperGroup && currentPoints.length > 0)
  const canCurves = Boolean(wallpaperGroup)
  const canHomothety = Boolean(wallpaperGroup)

  return (
    <div className="config-group flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={!canReset}
        onClick={() => resetShape()}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        title={t('sidebar.toolbar.reset')}
      >
        {t('sidebar.toolbar.reset')}
      </button>
      <button
        type="button"
        disabled={!canSmooth}
        onClick={() => {
          const smoothed = subdivideEdges(currentPoints, 2)
          setShapePoints(smoothed)
        }}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        title={t('sidebar.toolbar.smooth')}
      >
        {t('sidebar.toolbar.smooth')}
      </button>
      <button
        type="button"
        disabled={!canUndo}
        onClick={() => undo()}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        title={t('sidebar.toolbar.undo')}
      >
        {t('sidebar.toolbar.undo')}
      </button>
      <button
        type="button"
        disabled={!canRedo}
        onClick={() => redo()}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        title={t('sidebar.toolbar.redo')}
      >
        {t('sidebar.toolbar.redo')}
      </button>
      <button
        type="button"
        disabled={!wallpaperGroup}
        onClick={() => window.dispatchEvent(new CustomEvent(EXPORT_PNG_EVENT))}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        title={t('sidebar.toolbar.export')}
      >
        {t('sidebar.toolbar.export')}
      </button>
      <button
        type="button"
        disabled={!canCurves}
        onClick={() => setSmoothEnabled(!smoothEnabled)}
        className={`rounded-md border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${
          smoothEnabled
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
        title={t('sidebar.toolbar.curves')}
      >
        {t('sidebar.toolbar.curves')}
      </button>
      <button
        type="button"
        disabled={!canHomothety}
        onClick={() => setHomothetyEnabled(!homothetyEnabled)}
        className={`rounded-md border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${
          homothetyEnabled
            ? 'border-amber-500 bg-amber-50 text-amber-800 hover:bg-amber-100'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
        title={t('sidebar.toolbar.homothety')}
      >
        {t('sidebar.toolbar.homothety')}
      </button>
      </div>
      {homothetyEnabled && (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-700">{t('sidebar.toolbar.homothetyMode')}:</span>
            <button
              type="button"
              onClick={() => setHomothetyMode('horizontal')}
              className={`rounded px-2 py-1 text-xs font-medium ${homothetyMode === 'horizontal' ? 'bg-amber-200 text-amber-900' : 'bg-white text-gray-600 hover:bg-amber-100'}`}
            >
              {t('sidebar.toolbar.homothetyHorizontal')}
            </button>
            <button
              type="button"
              onClick={() => setHomothetyMode('border')}
              className={`rounded px-2 py-1 text-xs font-medium ${homothetyMode === 'border' ? 'bg-amber-200 text-amber-900' : 'bg-white text-gray-600 hover:bg-amber-100'}`}
            >
              {t('sidebar.toolbar.homothetyBorder')}
            </button>
            <button
              type="button"
              onClick={() => setHomothetyMode('hole')}
              className={`rounded px-2 py-1 text-xs font-medium ${homothetyMode === 'hole' ? 'bg-amber-200 text-amber-900' : 'bg-white text-gray-600 hover:bg-amber-100'}`}
            >
              {t('sidebar.toolbar.homothetyHole')}
            </button>
          </div>
        </div>
      )}
      {smoothEnabled && (
        <div className="flex flex-col gap-1">
          <label htmlFor="curvature-slider" className="text-xs font-medium text-gray-600">
            {t('sidebar.toolbar.curvature')}: {Math.round(smoothTension * 100)}%
          </label>
          <input
            id="curvature-slider"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={smoothTension}
            onChange={(e) => setSmoothTension(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-gray-100 accent-indigo-600"
          />
        </div>
      )}
    </div>
  )
}
