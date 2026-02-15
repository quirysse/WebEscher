import { useTranslation } from 'react-i18next'
import { useTilingStore, type BaseShapeId } from '../../store/tilingStore'

const SHAPES: BaseShapeId[] = ['square', 'triangle', 'hexagon']

function ShapePreview({ shapeId }: { shapeId: BaseShapeId }) {
  const size = 32
  const cx = size / 2
  const cy = size / 2
  const r = size / 3

  if (shapeId === 'square') {
    const s = r * 1.2
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
        <rect
          x={cx - s}
          y={cy - s}
          width={s * 2}
          height={s * 2}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    )
  }

  if (shapeId === 'triangle') {
    const h = r * 1.5
    const points = `${cx},${cy - h} ${cx + h},${cy + h * 0.6} ${cx - h},${cy + h * 0.6}`
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
        <polygon points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }

  // hexagon
  const points = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  }).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <polygon points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function ShapeSelector() {
  const { t } = useTranslation()
  const { baseShape, setBaseShape } = useTilingStore()

  return (
    <div className="config-group">
      <h3 className="mb-2 text-sm font-semibold text-gray-700">
        {t('sidebar.shapeSelector.title')}
      </h3>
      <ul className="flex flex-wrap gap-2" role="list">
        {SHAPES.map((shapeId) => (
          <li key={shapeId}>
            <button
              type="button"
              onClick={() => setBaseShape(shapeId)}
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                baseShape === shapeId
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ShapePreview shapeId={shapeId} />
              {t(`sidebar.shapeSelector.${shapeId}`)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
