/**
 * 2D vector.
 */
export interface Vector2D {
  x: number
  y: number
}

/**
 * 2D affine transformation as 3x3 homogeneous matrix (row-major).
 * [a, b, c, d, e, f, 0, 0, 1]
 * (x', y') = (a*x + b*y + c, d*x + e*y + f)
 */
export type AffineTransform = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

/**
 * Lattice type for the fundamental domain.
 */
export type LatticeType = 'square' | 'hexagonal' | 'rectangular' | 'rhombic' | 'oblique'

/**
 * Definition of a wallpaper group: lattice and cell symmetry transforms.
 */
export interface WallpaperGroupDef {
  id: string
  latticeType: LatticeType
  /** Base vectors for the lattice. */
  baseVectors: [Vector2D, Vector2D]
  /** Transforms from prototype (in cell [0,tileSize]^2) to each tile in one cell. */
  getCellTransforms: (tileSize: number) => AffineTransform[]
}

/**
 * A tile instance: reference to prototype geometry + transform to apply.
 */
export interface TileInstance {
  /** Index of the "role" for coloring (0, 1, ...). */
  roleIndex: number
  /** Affine transform from prototype space to world space. */
  transform: AffineTransform
}

/**
 * Viewport in world coordinates.
 */
export interface Viewport {
  left: number
  top: number
  width: number
  height: number
}
