import type { WallpaperGroupDef } from './types'
import { getBaseVectors } from './lattice'
import {
  identity,
  translation,
  rotationAround,
  reflectX,
  reflectY,
  multiply,
} from '../utils/math'
import type { LatticeType } from './types'
import type { AffineTransform } from './types'

type WallpaperGroupId = import('../store/tilingStore').WallpaperGroupId

/**
 * Build cell transforms for a group (transforms from prototype in [0,tileSize]^2 to each tile in the cell).
 * Center of cell is (tileSize/2, tileSize/2).
 */
function cellTransforms(
  _tileSize: number,
  ...transforms: AffineTransform[]
): AffineTransform[] {
  return transforms.length > 0 ? [...transforms] : [identity()]
}

const c = (tileSize: number) => tileSize / 2

/**
 * All 17 wallpaper group definitions.
 * Cell transforms are in pixel space for a cell of size tileSize.
 */
export function getWallpaperGroupDef(id: WallpaperGroupId): WallpaperGroupDef {
  const latticeTypes: Record<WallpaperGroupId, LatticeType> = {
    p1: 'oblique',
    p2: 'oblique',
    pm: 'rectangular',
    pg: 'rectangular',
    pmm: 'rectangular',
    pmg: 'rectangular',
    pgg: 'rectangular',
    cmm: 'rectangular',
    cm: 'rhombic',
    p4: 'square',
    p4m: 'square',
    p4g: 'square',
    p3: 'hexagonal',
    p3m1: 'hexagonal',
    p31m: 'hexagonal',
    p6: 'hexagonal',
    p6m: 'hexagonal',
  }

  const latticeType = latticeTypes[id]
  const baseVectors = getBaseVectors(latticeType)

  const build = (tileSize: number): AffineTransform[] => {
    const cx = c(tileSize)
    const cy = c(tileSize)
    const I = identity()

    switch (id) {
      case 'p1':
        return cellTransforms(tileSize, I)

      case 'p2':
        return cellTransforms(
          tileSize,
          I,
          rotationAround(cx, cy, Math.PI)
        )

      case 'pm':
        return cellTransforms(
          tileSize,
          I,
          multiply(translation(tileSize, 0), reflectY())
        )

      case 'pg':
        return cellTransforms(
          tileSize,
          I,
          multiply(translation(tileSize, cy), multiply(reflectY(), translation(0, -cy)))
        )

      case 'pmm':
        return cellTransforms(
          tileSize,
          I,
          multiply(translation(tileSize, 0), reflectY()),
          multiply(translation(0, tileSize), reflectX()),
          multiply(translation(tileSize, tileSize), multiply(reflectX(), reflectY()))
        )

      case 'pmg':
        return cellTransforms(
          tileSize,
          I,
          multiply(translation(tileSize, 0), reflectY()),
          multiply(translation(cx, tileSize), multiply(reflectX(), translation(-cx, 0))),
          multiply(translation(tileSize + cx, tileSize), multiply(reflectX(), multiply(reflectY(), translation(-cx, 0))))
        )

      case 'pgg':
        return cellTransforms(
          tileSize,
          I,
          rotationAround(cx, cy, Math.PI),
          multiply(translation(tileSize, 0), rotationAround(0, cy, Math.PI)),
          multiply(translation(0, tileSize), rotationAround(cx, 0, Math.PI))
        )

      case 'cmm':
        return cellTransforms(
          tileSize,
          I,
          multiply(translation(tileSize, 0), reflectY()),
          multiply(translation(0, tileSize), reflectX()),
          multiply(translation(tileSize, tileSize), multiply(reflectX(), reflectY()))
        )

      case 'cm':
        return cellTransforms(
          tileSize,
          I,
          multiply(translation(tileSize, 0), reflectY())
        )

      case 'p4':
        return cellTransforms(
          tileSize,
          I,
          rotationAround(cx, cy, Math.PI / 2),
          rotationAround(cx, cy, Math.PI),
          rotationAround(cx, cy, (3 * Math.PI) / 2)
        )

      case 'p4m':
        return cellTransforms(
          tileSize,
          I,
          rotationAround(cx, cy, Math.PI / 2),
          rotationAround(cx, cy, Math.PI),
          rotationAround(cx, cy, (3 * Math.PI) / 2),
          reflectY(),
          multiply(rotationAround(cx, cy, Math.PI / 2), reflectY()),
          multiply(rotationAround(cx, cy, Math.PI), reflectY()),
          multiply(rotationAround(cx, cy, (3 * Math.PI) / 2), reflectY())
        )

      case 'p4g':
        return cellTransforms(
          tileSize,
          I,
          rotationAround(cx, cy, Math.PI / 2),
          rotationAround(cx, cy, Math.PI),
          rotationAround(cx, cy, (3 * Math.PI) / 2),
          multiply(translation(cx, cy), multiply(reflectY(), translation(-cx, -cy))),
          multiply(translation(cx, cy), multiply(reflectY(), multiply(rotationAround(cx, cy, Math.PI / 2), translation(-cx, -cy)))),
          multiply(translation(cx, cy), multiply(reflectY(), multiply(rotationAround(cx, cy, Math.PI), translation(-cx, -cy)))),
          multiply(translation(cx, cy), multiply(reflectY(), multiply(rotationAround(cx, cy, (3 * Math.PI) / 2), translation(-cx, -cy))))
        )

      case 'p3':
        return cellTransforms(
          tileSize,
          I,
          rotationAround(cx, cy, (2 * Math.PI) / 3),
          rotationAround(cx, cy, (4 * Math.PI) / 3)
        )

      case 'p3m1':
      case 'p31m':
        return cellTransforms(
          tileSize,
          I,
          rotationAround(cx, cy, (2 * Math.PI) / 3),
          rotationAround(cx, cy, (4 * Math.PI) / 3),
          reflectY(),
          multiply(rotationAround(cx, cy, (2 * Math.PI) / 3), reflectY()),
          multiply(rotationAround(cx, cy, (4 * Math.PI) / 3), reflectY())
        )

      case 'p6':
        return cellTransforms(
          tileSize,
          I,
          rotationAround(cx, cy, Math.PI / 3),
          rotationAround(cx, cy, (2 * Math.PI) / 3),
          rotationAround(cx, cy, Math.PI),
          rotationAround(cx, cy, (4 * Math.PI) / 3),
          rotationAround(cx, cy, (5 * Math.PI) / 3)
        )

      case 'p6m':
        return cellTransforms(
          tileSize,
          I,
          rotationAround(cx, cy, Math.PI / 3),
          rotationAround(cx, cy, (2 * Math.PI) / 3),
          rotationAround(cx, cy, Math.PI),
          rotationAround(cx, cy, (4 * Math.PI) / 3),
          rotationAround(cx, cy, (5 * Math.PI) / 3),
          reflectY(),
          multiply(rotationAround(cx, cy, Math.PI / 3), reflectY()),
          multiply(rotationAround(cx, cy, (2 * Math.PI) / 3), reflectY()),
          multiply(rotationAround(cx, cy, Math.PI), reflectY()),
          multiply(rotationAround(cx, cy, (4 * Math.PI) / 3), reflectY()),
          multiply(rotationAround(cx, cy, (5 * Math.PI) / 3), reflectY())
        )

      default:
        return cellTransforms(tileSize, I)
    }
  }

  return {
    id,
    latticeType,
    baseVectors,
    getCellTransforms: build,
  }
}
