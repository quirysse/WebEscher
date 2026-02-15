import type { AffineTransform, Vector2D, Viewport, LatticeType } from './types'
import { translation } from '../utils/math'

export type { LatticeType }

/**
 * Base vectors for each lattice type (unit cell).
 * Coordinates are in a normalized space; scale by tileSize when using.
 */
const LATTICE_BASE_VECTORS: Record<
  LatticeType,
  [[number, number], [number, number]]
> = {
  square: [[1, 0], [0, 1]],
  rectangular: [[1, 0], [0, 1]],
  rhombic: [[1, 0], [0.5, 0.866]], // 60° parallelogram
  oblique: [[1, 0], [0.5, 0.866]],
  hexagonal: [[1, 0], [0.5, Math.sqrt(3) / 2]], // 60°
}

/**
 * Get base vectors for a lattice type (normalized).
 */
export function getBaseVectors(
  latticeType: LatticeType
): [Vector2D, Vector2D] {
  const [u, v] = LATTICE_BASE_VECTORS[latticeType]
  return [
    { x: u[0], y: u[1] },
    { x: v[0], y: v[1] },
  ]
}

/**
 * Compute the bounding range of lattice indices (i, j) such that
 * the cell at (i * u + j * v) * tileSize intersects the viewport.
 * Returns { iMin, iMax, jMin, jMax }.
 */
function getLatticeRange(
  u: Vector2D,
  v: Vector2D,
  tileSize: number,
  viewport: Viewport
): { iMin: number; iMax: number; jMin: number; jMax: number } {
  const margin = 2
  const left = viewport.left - margin * tileSize
  const right = viewport.left + viewport.width + margin * tileSize
  const top = viewport.top - margin * tileSize
  const bottom = viewport.top + viewport.height + margin * tileSize

  const ux = u.x * tileSize
  const uy = u.y * tileSize
  const vx = v.x * tileSize
  const vy = v.y * tileSize

  const det = ux * vy - uy * vx
  if (Math.abs(det) < 1e-10) {
    return { iMin: -2, iMax: 2, jMin: -2, jMax: 2 }
  }

  const invDet = 1 / det
  const toIJ = (x: number, y: number) => ({
    i: (x * vy - y * vx) * invDet,
    j: (ux * y - uy * x) * invDet,
  })

  const tl = toIJ(left, top)
  const tr = toIJ(right, top)
  const bl = toIJ(left, bottom)
  const br = toIJ(right, bottom)

  const iMin = Math.floor(Math.min(tl.i, tr.i, bl.i, br.i)) - 1
  const iMax = Math.ceil(Math.max(tl.i, tr.i, bl.i, br.i)) + 1
  const jMin = Math.floor(Math.min(tl.j, tr.j, bl.j, br.j)) - 1
  const jMax = Math.ceil(Math.max(tl.j, tr.j, bl.j, br.j)) + 1

  return { iMin, iMax, jMin, jMax }
}

/**
 * Generate all translation transforms for tiles that intersect the viewport.
 * Each transform maps from cell (0,0) local coordinates to world coordinates.
 */
export function getTranslationsForViewport(
  latticeType: LatticeType,
  tileSize: number,
  viewport: Viewport
): AffineTransform[] {
  const [u, v] = getBaseVectors(latticeType)
  const { iMin, iMax, jMin, jMax } = getLatticeRange(
    u,
    v,
    tileSize,
    viewport
  )

  const result: AffineTransform[] = []
  for (let j = jMin; j <= jMax; j++) {
    for (let i = iMin; i <= iMax; i++) {
      const tx = (i * u.x + j * v.x) * tileSize
      const ty = (i * u.y + j * v.y) * tileSize
      result.push(translation(tx, ty))
    }
  }
  return result
}

/**
 * Count of translations for a viewport (for testing).
 */
export function countTranslations(
  latticeType: LatticeType,
  tileSize: number,
  viewport: Viewport
): number {
  return getTranslationsForViewport(latticeType, tileSize, viewport).length
}
