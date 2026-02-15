import type { Vector2D } from './types'

function lerp(a: Vector2D, b: Vector2D, t: number): Vector2D {
  return {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  }
}

export interface Canvas2DContext {
  beginPath: () => void
  moveTo: (x: number, y: number) => void
  lineTo: (x: number, y: number) => void
  quadraticCurveTo: (cpX: number, cpY: number, x: number, y: number) => void
  closePath: () => void
}

/**
 * Draw a closed shape path: either polygonal (lineTo) or smooth (quadraticCurveTo
 * through edge midpoints with tension-controlled control points).
 */
export function drawShapePath(
  ctx: Canvas2DContext,
  points: Vector2D[],
  smooth: boolean,
  tension: number
): void {
  if (points.length < 3)
  {
    return
  }

  const t = Math.max(0, Math.min(1, tension))

  if (!smooth)
  {
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++)
    {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.closePath()
    return
  }

  const n = points.length
  const midpoints: Vector2D[] = []
  for (let i = 0; i < n; i++)
  {
    const a = points[i]
    const b = points[(i + 1) % n]
    midpoints.push(lerp(a, b, 0.5))
  }

  ctx.beginPath()
  ctx.moveTo(midpoints[0].x, midpoints[0].y)
  for (let i = 0; i < n; i++)
  {
    const vertex = points[(i + 1) % n]
    const nextMid = midpoints[(i + 1) % n]
    const cp = lerp(midpoints[i], vertex, t)
    ctx.quadraticCurveTo(cp.x, cp.y, nextMid.x, nextMid.y)
  }
  ctx.closePath()
}
