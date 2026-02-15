import type { Vector2D } from '../engine/types'

/**
 * Sample a polygon with more points along edges for a "smoother" appearance.
 * Does not add Bézier curves; just subdivides edges.
 */
export function subdivideEdges(points: Vector2D[], segmentsPerEdge: number): Vector2D[] {
  if (points.length < 3 || segmentsPerEdge < 2) return points
  const result: Vector2D[] = []
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    for (let k = 0; k < segmentsPerEdge; k++) {
      const t = k / segmentsPerEdge
      result.push({
        x: a.x + t * (b.x - a.x),
        y: a.y + t * (b.y - a.y),
      })
    }
  }
  return result
}

/**
 * Replace the point at the given index. Used when dragging a vertex.
 */
export function updatePointAt(
  points: Vector2D[],
  index: number,
  newPoint: Vector2D
): Vector2D[] {
  if (index < 0 || index >= points.length) return points
  const next = [...points]
  next[index] = { x: newPoint.x, y: newPoint.y }
  return next
}

/**
 * Clamp a point to stay within the tile bounds [0, tileSize]^2.
 * Prevents the shape from escaping the fundamental cell during drag.
 */
export function clampToTile(point: Vector2D, tileSize: number): Vector2D {
  return {
    x: Math.max(0, Math.min(tileSize, point.x)),
    y: Math.max(0, Math.min(tileSize, point.y)),
  }
}
