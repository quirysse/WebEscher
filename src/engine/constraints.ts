import type { Vector2D, AffineTransform } from './types'
import type { WallpaperGroupId } from '../store/tilingStore'

/**
 * Describes a constraint between two edges: edgeB must be the image of edgeA under the transform.
 */
export interface EdgeConstraint {
  edgeA: [number, number]
  edgeB: [number, number]
  transform: AffineTransform
}

/**
 * Get edge constraints for a wallpaper group (square cell with 4 vertices).
 * For p1: left edge (3,0) and right edge (1,2) are linked by translation.
 */
export function getEdgeConstraints(
  _groupId: WallpaperGroupId,
  _tileSize: number
): EdgeConstraint[] {
  return []
}

/**
 * Apply tiling constraints when a single point is moved.
 * Returns updated points (may update more than one point to keep edges matched).
 */
export function applyConstraints(
  points: Vector2D[],
  pointIndex: number,
  newPosition: Vector2D,
  _groupId: WallpaperGroupId,
  _tileSize: number
): Vector2D[] {
  const next = [...points]
  next[pointIndex] = { x: newPosition.x, y: newPosition.y }
  return next
}
