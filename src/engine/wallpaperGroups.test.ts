import { describe, it, expect } from 'vitest'
import { getWallpaperGroupDef } from './wallpaperGroups'
import type { WallpaperGroupId } from '../store/tilingStore'
import { applyToPoint } from '../utils/math'

const ALL_GROUP_IDS: WallpaperGroupId[] = [
  'p1',
  'p2',
  'pm',
  'pg',
  'pmm',
  'pmg',
  'pgg',
  'cmm',
  'cm',
  'p4',
  'p4m',
  'p4g',
  'p3',
  'p3m1',
  'p31m',
  'p6',
  'p6m',
]

describe('wallpaperGroups', () => {
  it('returns a definition for every group id', () => {
    for (const id of ALL_GROUP_IDS) {
      const def = getWallpaperGroupDef(id)
      expect(def.id).toBe(id)
      expect(def.baseVectors).toHaveLength(2)
      expect(def.getCellTransforms(100).length).toBeGreaterThanOrEqual(1)
    }
  })

  it('p1 has one cell transform (identity)', () => {
    const def = getWallpaperGroupDef('p1')
    const transforms = def.getCellTransforms(80)
    expect(transforms).toHaveLength(1)
    const p = applyToPoint(transforms[0], { x: 0, y: 0 })
    expect(p.x).toBe(0)
    expect(p.y).toBe(0)
  })

  it('p2 has two cell transforms', () => {
    const def = getWallpaperGroupDef('p2')
    const transforms = def.getCellTransforms(80)
    expect(transforms).toHaveLength(2)
  })

  it('p4 has four cell transforms', () => {
    const def = getWallpaperGroupDef('p4')
    const transforms = def.getCellTransforms(80)
    expect(transforms).toHaveLength(4)
  })

  it('p6 has six cell transforms', () => {
    const def = getWallpaperGroupDef('p6')
    const transforms = def.getCellTransforms(80)
    expect(transforms).toHaveLength(6)
  })

  it('each transform preserves center of cell', () => {
    const def = getWallpaperGroupDef('p4')
    const tileSize = 80
    const cx = tileSize / 2
    const cy = tileSize / 2
    const center = { x: cx, y: cy }
    const transforms = def.getCellTransforms(tileSize)
    for (const T of transforms) {
      const p = applyToPoint(T, center)
      expect(p.x).toBeCloseTo(cx)
      expect(p.y).toBeCloseTo(cy)
    }
  })

  it('p4 transforms are distinct', () => {
    const def = getWallpaperGroupDef('p4')
    const transforms = def.getCellTransforms(80)
    const testPoint = { x: 10, y: 20 }
    const images = new Set(
      transforms.map((T) => `${applyToPoint(T, testPoint).x},${applyToPoint(T, testPoint).y}`)
    )
    expect(images.size).toBe(4)
  })
})
