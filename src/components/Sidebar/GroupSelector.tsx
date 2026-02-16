import { useTranslation } from 'react-i18next'
import { useTilingStore } from '../../store/tilingStore'
import { GROUPS_BY_FAMILY, type WallpaperFamily } from '../../data/wallpaperGroupsData'

const FAMILY_ORDER: WallpaperFamily[] = [
  'oblique',
  'rectangular',
  'rhombic',
  'square',
  'hexagonal',
]

function GroupThumbnail() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="flex-shrink-0 rounded border border-gray-200"
      aria-hidden
    >
      <rect x="0" y="0" width="12" height="12" fill="currentColor" opacity="0.6" />
      <rect x="12" y="0" width="12" height="12" fill="currentColor" opacity="0.4" />
      <rect x="0" y="12" width="12" height="12" fill="currentColor" opacity="0.4" />
      <rect x="12" y="12" width="12" height="12" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

export function GroupSelector() {
  const { t } = useTranslation()
  const { wallpaperGroup, setWallpaperGroup } = useTilingStore()

  return (
    <div className="config-group">
      <h3 className="mb-2 text-sm font-semibold text-gray-700">
        {t('sidebar.groupSelector.title')}
      </h3>
      <ul className="space-y-1" role="list">
        {FAMILY_ORDER.map((family) => {
          const groups = GROUPS_BY_FAMILY[family]
          return (
            <li key={family}>
              <span className="text-xs font-medium text-gray-500">
                {t(`sidebar.groupSelector.family.${family}`)}
              </span>
              <ul className="mt-0.5 space-y-0.5">
                {groups.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setWallpaperGroup(g.id)}
                      title={t(`sidebar.groups.${g.id}Help`)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                        wallpaperGroup === g.id
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <GroupThumbnail />
                      {t(g.nameKey)}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
