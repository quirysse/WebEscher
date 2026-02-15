import type { Vector2D } from '../engine/types'

export type BaseShapeId = 'square' | 'triangle' | 'hexagon'

/**
 * Default polygon points for a shape in [0, tileSize] x [0, tileSize].
 */
export function getDefaultShapePoints(
  shapeId: BaseShapeId,
  tileSize: number
): Vector2D[] {
  const cx = tileSize / 2
  const cy = tileSize / 2
  const r = tileSize / 2

  switch (shapeId) {
    case 'square':
      return [
        { x: 0, y: 0 },
        { x: tileSize, y: 0 },
        { x: tileSize, y: tileSize },
        { x: 0, y: tileSize },
      ]
    case 'triangle':
      return [
        { x: cx, y: cy - r },
        { x: cx + r, y: cy + r },
        { x: cx - r, y: cy + r },
      ]
    case 'hexagon': {
      const points: Vector2D[] = []
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        points.push({
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
        })
      }
      return points
    }
    default:
      return getDefaultShapePoints('square', tileSize)
  }
}
