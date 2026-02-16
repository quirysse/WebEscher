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

/**
 * Insert a new point after the given index (new point will be at index afterIndex + 1).
 */
export function insertPointAt(
  points: Vector2D[],
  afterIndex: number,
  newPoint: Vector2D
): Vector2D[] {
  if (points.length < 2 || afterIndex < 0 || afterIndex >= points.length) return points
  const next = [...points]
  next.splice(afterIndex + 1, 0, { x: newPoint.x, y: newPoint.y })
  return next
}

/**
 * Distance from point P to segment AB. Returns distance and the closest point on the segment.
 */
function pointToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): { distance: number; x: number; y: number; t: number } {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  let t = len2 <= 1e-10 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const x = ax + t * dx
  const y = ay + t * dy
  const distance = Math.hypot(px - x, py - y)
  return { distance, x, y, t }
}

const EDGE_HIT_TOLERANCE = 15

/**
 * Hit-test for an edge (segment between consecutive points). Returns the edge index
 * (segment from points[i] to points[i+1]) and the projected point on that segment, or null.
 */
export function hitTestEdge(
  points: Vector2D[],
  worldX: number,
  worldY: number,
  tolerance: number = EDGE_HIT_TOLERANCE
): { edgeIndex: number; projectedPoint: Vector2D } | null {
  if (points.length < 3) return null
  let best: { edgeIndex: number; projectedPoint: Vector2D; distance: number } | null = null
  const n = points.length
  for (let i = 0; i < n; i++) {
    const a = points[i]
    const b = points[(i + 1) % n]
    const { distance, x, y } = pointToSegment(worldX, worldY, a.x, a.y, b.x, b.y)
    if (distance <= tolerance && (best === null || distance < best.distance)) {
      best = { edgeIndex: i, projectedPoint: { x, y }, distance }
    }
  }
  return best ? { edgeIndex: best.edgeIndex, projectedPoint: best.projectedPoint } : null
}
