import { useTranslation } from 'react-i18next'
import { useTilingStore } from '../../store/tilingStore'
import { getWallpaperGroupDef } from '../../engine/wallpaperGroups'

const TILE_SIZE = 80

export function ColorPanel() {
  const { t } = useTranslation()
  const wallpaperGroup = useTilingStore((s) => s.wallpaperGroup)
  const getRoleColor = useTilingStore((s) => s.getRoleColor)
  const setRoleColor = useTilingStore((s) => s.setRoleColor)

  if (!wallpaperGroup) {
    return (
      <div className="config-group">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">
          {t('sidebar.colorPanel.title')}
        </h3>
        <p className="text-xs text-gray-500">{t('canvas.placeholder')}</p>
      </div>
    )
  }

  const groupDef = getWallpaperGroupDef(wallpaperGroup)
  const numRoles = groupDef.getCellTransforms(TILE_SIZE).length

  return (
    <div className="config-group">
      <h3 className="mb-2 text-sm font-semibold text-gray-700">
        {t('sidebar.colorPanel.title')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: numRoles }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <label className="text-xs text-gray-600" htmlFor={`color-${i}`}>
              {i + 1}
            </label>
            <input
              id={`color-${i}`}
              type="color"
              value={getRoleColor(i)}
              onChange={(e) => setRoleColor(i, e.target.value)}
              className="h-8 w-12 cursor-pointer rounded border border-gray-300"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
