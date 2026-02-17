import type { Vector2D, AffineTransform } from './types'
import type { WallpaperGroupId } from '../store/tilingStore'
import {
  translation,
  rotationAround,
  applyToPoint,
  inverse,
  multiply,
  reflectX,
  reflectY,
} from '../utils/math'

/**
 * Describes a constraint between two edges: edgeB must be the image of edgeA under the transform.
 * edgeA/edgeB are [startVertexIndex, endVertexIndex] (indices of the cell corners).
 */
export interface EdgeConstraint {
  edgeA: [number, number]
  edgeB: [number, number]
  transform: AffineTransform
}

function reflectInVerticalLine(cx: number): AffineTransform {
  return multiply(translation(cx, 0), multiply(reflectY(), translation(-cx, 0)))
}

function reflectInHorizontalLine(cy: number): AffineTransform {
  return multiply(translation(0, cy), multiply(reflectX(), translation(0, -cy)))
}

/**
 * Get edge constraints for a wallpaper group (square cell with 4 vertices: 0=top-left, 1=top-right, 2=bottom-right, 3=bottom-left).
 * Edges: H=[0,1], D=[1,2], B=[2,3], G=[3,0].
 */
export function getEdgeConstraints(
  groupId: WallpaperGroupId,
  tileSize: number
): EdgeConstraint[] {
  const cx = tileSize / 2
  const cy = tileSize / 2
  const T = Math.PI

  switch (groupId) {
    case 'p1':
      return [
        { edgeA: [3, 0], edgeB: [1, 2], transform: translation(tileSize, 0) },
        { edgeA: [0, 1], edgeB: [2, 3], transform: translation(0, tileSize) },
      ]
    case 'p2':
      const rot180 = rotationAround(cx, cy, T)
      return [
        { edgeA: [3, 0], edgeB: [1, 2], transform: rot180 },
        { edgeA: [0, 1], edgeB: [2, 3], transform: rot180 },
      ]
    case 'pm':
      return [
        { edgeA: [3, 0], edgeB: [1, 2], transform: reflectInVerticalLine(cx) },
        { edgeA: [0, 1], edgeB: [2, 3], transform: translation(0, tileSize) },
      ]
    case 'pg':
      return [
        {
          edgeA: [3, 0],
          edgeB: [1, 2],
          transform: multiply(translation(tileSize, 0), reflectInHorizontalLine(cy)),
        },
        { edgeA: [0, 1], edgeB: [2, 3], transform: translation(0, tileSize) },
      ]
    case 'pmm':
      return [
        { edgeA: [3, 0], edgeB: [1, 2], transform: reflectInVerticalLine(cx) },
        { edgeA: [0, 1], edgeB: [2, 3], transform: reflectInHorizontalLine(cy) },
      ]
    case 'pmg':
      return [
        {
          edgeA: [3, 0],
          edgeB: [1, 2],
          transform: multiply(translation(tileSize, 0), reflectInHorizontalLine(cy)),
        },
        { edgeA: [0, 1], edgeB: [2, 3], transform: reflectInHorizontalLine(cy) },
      ]
    case 'pgg':
      return [
        { edgeA: [3, 0], edgeB: [1, 2], transform: rotationAround(cx, cy, T) },
        { edgeA: [0, 1], edgeB: [2, 3], transform: rotationAround(cx, cy, T) },
      ]
    case 'cmm':
      return [
        { edgeA: [3, 0], edgeB: [1, 2], transform: reflectInVerticalLine(cx) },
        { edgeA: [0, 1], edgeB: [2, 3], transform: reflectInHorizontalLine(cy) },
      ]
    case 'cm':
      return [
        { edgeA: [3, 0], edgeB: [1, 2], transform: multiply(translation(tileSize, 0), reflectY()) },
        { edgeA: [0, 1], edgeB: [2, 3], transform: translation(0, tileSize) },
      ]
    case 'p4':
    case 'p4m':
    case 'p4g':
      {
        const rot180 = rotationAround(cx, cy, T)
        return [
          { edgeA: [3, 0], edgeB: [1, 2], transform: rot180 },
          { edgeA: [0, 1], edgeB: [2, 3], transform: rot180 },
        ]
      }
    case 'p3':
    case 'p3m1':
    case 'p31m':
    case 'p6':
    case 'p6m':
      return []
    default:
      return []
  }
}

/**
 * Return list of point indices on the edge from array index start to array index end (in polygon order).
 */
function indicesOnEdge(n: number, arrayStart: number, arrayEnd: number): number[] {
  const result: number[] = []
  let i = arrayStart
  while (true) {
    result.push(i)
    if (i === arrayEnd) break
    i = (i + 1) % n
  }
  return result
}

/**
 * Apply tiling constraints when a single point is moved.
 * If the point is a corner (0–3 for square cell), only that point is updated.
 * Otherwise the paired point on the constrained edge is updated to T(newPosition) so edges stay matched.
 * @param cornerIndices - Optional: [arrayIndex of corner 0, 1, 2, 3]. Default [0,1,2,3] when points.length === 4.
 */
export function applyConstraints(
  points: Vector2D[],
  pointIndex: number,
  newPosition: Vector2D,
  groupId: WallpaperGroupId,
  tileSize: number,
  cornerIndices?: [number, number, number, number]
): Vector2D[] {
  const next = points.map((p) => ({ ...p }))
  next[pointIndex] = { x: newPosition.x, y: newPosition.y }

  const constraints = getEdgeConstraints(groupId, tileSize)
  if (constraints.length === 0) return next

  const n = points.length
  const corners = cornerIndices ?? ([0, 1, 2, 3] as [number, number, number, number])
  if (corners.includes(pointIndex)) return next

  for (const { edgeA, edgeB, transform } of constraints) {
    const [cA0, cA1] = edgeA
    const [cB0, cB1] = edgeB
    const aStart = corners[cA0]
    const aEnd = corners[cA1]
    const bStart = corners[cB0]
    const bEnd = corners[cB1]
    const indicesA = indicesOnEdge(n, aStart, aEnd)
    const indicesB = indicesOnEdge(n, bStart, bEnd)
    if (indicesA.length !== indicesB.length) continue

    const posA = indicesA.indexOf(pointIndex)
    if (posA >= 0) {
      const pairedIndex = indicesB[posA]
      next[pairedIndex] = applyToPoint(transform, newPosition)
      return next
    }
    const posB = indicesB.indexOf(pointIndex)
    if (posB >= 0) {
      const pairedIndex = indicesA[posB]
      next[pairedIndex] = applyToPoint(inverse(transform), newPosition)
      return next
    }
  }
  return next
}
