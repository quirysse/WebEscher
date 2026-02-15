import type { WallpaperGroupId } from '../store/tilingStore'

export type WallpaperFamily = 'oblique' | 'rectangular' | 'rhombic' | 'square' | 'hexagonal'

export interface WallpaperGroupOption {
  id: WallpaperGroupId
  family: WallpaperFamily
  nameKey: string
}

export const WALLPAPER_GROUPS: WallpaperGroupOption[] = [
  { id: 'p1', family: 'oblique', nameKey: 'sidebar.groups.p1' },
  { id: 'p2', family: 'oblique', nameKey: 'sidebar.groups.p2' },
  { id: 'pm', family: 'rectangular', nameKey: 'sidebar.groups.pm' },
  { id: 'pg', family: 'rectangular', nameKey: 'sidebar.groups.pg' },
  { id: 'pmm', family: 'rectangular', nameKey: 'sidebar.groups.pmm' },
  { id: 'pmg', family: 'rectangular', nameKey: 'sidebar.groups.pmg' },
  { id: 'pgg', family: 'rectangular', nameKey: 'sidebar.groups.pgg' },
  { id: 'cmm', family: 'rectangular', nameKey: 'sidebar.groups.cmm' },
  { id: 'cm', family: 'rhombic', nameKey: 'sidebar.groups.cm' },
  { id: 'p4', family: 'square', nameKey: 'sidebar.groups.p4' },
  { id: 'p4m', family: 'square', nameKey: 'sidebar.groups.p4m' },
  { id: 'p4g', family: 'square', nameKey: 'sidebar.groups.p4g' },
  { id: 'p3', family: 'hexagonal', nameKey: 'sidebar.groups.p3' },
  { id: 'p3m1', family: 'hexagonal', nameKey: 'sidebar.groups.p3m1' },
  { id: 'p31m', family: 'hexagonal', nameKey: 'sidebar.groups.p31m' },
  { id: 'p6', family: 'hexagonal', nameKey: 'sidebar.groups.p6' },
  { id: 'p6m', family: 'hexagonal', nameKey: 'sidebar.groups.p6m' },
]

export const GROUPS_BY_FAMILY: Record<WallpaperFamily, WallpaperGroupOption[]> = {
  oblique: WALLPAPER_GROUPS.filter((g) => g.family === 'oblique'),
  rectangular: WALLPAPER_GROUPS.filter((g) => g.family === 'rectangular'),
  rhombic: WALLPAPER_GROUPS.filter((g) => g.family === 'rhombic'),
  square: WALLPAPER_GROUPS.filter((g) => g.family === 'square'),
  hexagonal: WALLPAPER_GROUPS.filter((g) => g.family === 'hexagonal'),
}
