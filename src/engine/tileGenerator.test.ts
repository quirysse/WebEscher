import { describe, it, expect } from 'vitest'
import { generateTileInstances } from './tileGenerator'
import type { WallpaperGroupId } from '../store/tilingStore'

const ALL_GROUP_IDS: WallpaperGroupId[] = [
  'p1', 'p2', 'pm', 'pg', 'pmm', 'pmg', 'pgg', 'cmm', 'cm',
  'p4', 'p4m', 'p4g', 'p3', 'p3m1', 'p31m', 'p6', 'p6m',
]

describe('tileGenerator', () => {
  const viewport = { left: 0, top: 0, width: 400, height: 400 }
  const tileSize = 80

  it('generates instances for every wallpaper group', () => {
    for (const groupId of ALL_GROUP_IDS) {
      const instances = generateTileInstances(groupId, tileSize, viewport)
      expect(instances.length).toBeGreaterThan(0)
      for (const inst of instances) {
        expect(inst.transform).toHaveLength(9)
        expect(inst.roleIndex).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('p1 generates instances', () => {
    const instances = generateTileInstances('p1', tileSize, viewport)
    expect(instances.length).toBeGreaterThan(0)
    expect(instances.every((i) => i.roleIndex === 0)).toBe(true)
  })

  it('p4 generates instances with four roles per cell', () => {
    const instances = generateTileInstances('p4', tileSize, viewport)
    const roleIndices = new Set(instances.map((i) => i.roleIndex))
    expect(roleIndices.size).toBe(4)
  })

  it('p6 generates instances with six roles per cell', () => {
    const instances = generateTileInstances('p6', tileSize, viewport)
    const roleIndices = new Set(instances.map((i) => i.roleIndex))
    expect(roleIndices.size).toBe(6)
  })

  it('each instance has roleIndex and transform', () => {
    const instances = generateTileInstances('p4', tileSize, viewport)
    for (const inst of instances) {
      expect(inst).toHaveProperty('roleIndex')
      expect(inst).toHaveProperty('transform')
      expect(inst.transform).toHaveLength(9)
    }
  })
})
