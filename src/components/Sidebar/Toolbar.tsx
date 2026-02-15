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
  const canReset = Boolean(wallpaperGroup && shapePoints !== null)
  const currentPoints = shapePoints ?? (wallpaperGroup ? getDefaultShapePoints(baseShape, 80) : [])
  const canSmooth = Boolean(wallpaperGroup && currentPoints.length > 0)
  const canCurves = Boolean(wallpaperGroup)

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
      </div>
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
