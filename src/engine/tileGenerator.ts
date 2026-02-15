import type { Viewport, TileInstance, AffineTransform } from './types'
import { getWallpaperGroupDef } from './wallpaperGroups'
import { getTranslationsForViewport } from './lattice'
import { multiply } from '../utils/math'
import type { WallpaperGroupId } from '../store/tilingStore'
import type { Vector2D } from './types'

/**
 * Generate all tile instances for a viewport.
 * Each instance has a transform from prototype space ([0,tileSize]^2) to world coordinates.
 */
export function generateTileInstances(
  groupId: WallpaperGroupId,
  tileSize: number,
  viewport: Viewport
): TileInstance[] {
  const groupDef = getWallpaperGroupDef(groupId)
  const translations = getTranslationsForViewport(
    groupDef.latticeType,
    tileSize,
    viewport
  )
  const cellTransforms = groupDef.getCellTransforms(tileSize)

  const instances: TileInstance[] = []
  for (const T of translations) {
    for (let roleIndex = 0; roleIndex < cellTransforms.length; roleIndex++) {
      const G = cellTransforms[roleIndex]
      const transform = multiply(T, G) as AffineTransform
      instances.push({ roleIndex, transform })
    }
  }
  return instances
}

/**
 * Apply an affine transform (3x3 row-major) to a point.
 */
export function transformPoint(
  m: AffineTransform,
  p: Vector2D
): Vector2D {
  return {
    x: m[0] * p.x + m[1] * p.y + m[2],
    y: m[3] * p.x + m[4] * p.y + m[5],
  }
}
