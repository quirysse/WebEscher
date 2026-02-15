import { describe, it, expect } from 'vitest'
import { updatePointAt, clampToTile, subdivideEdges } from './shapeEditor'

describe('shapeEditor', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ]

  it('updatePointAt replaces the point at index', () => {
    const next = updatePointAt(points, 1, { x: 5, y: 5 })
    expect(next).toHaveLength(3)
    expect(next[0]).toEqual({ x: 0, y: 0 })
    expect(next[1]).toEqual({ x: 5, y: 5 })
    expect(next[2]).toEqual({ x: 10, y: 10 })
  })

  it('updatePointAt does not mutate original', () => {
    const next = updatePointAt(points, 0, { x: 1, y: 1 })
    expect(points[0]).toEqual({ x: 0, y: 0 })
    expect(next[0]).toEqual({ x: 1, y: 1 })
  })

  it('updatePointAt returns same array for out-of-range index', () => {
    expect(updatePointAt(points, -1, { x: 0, y: 0 })).toBe(points)
    expect(updatePointAt(points, 10, { x: 0, y: 0 })).toBe(points)
  })

  it('subdivideEdges increases point count', () => {
    const tri = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 10 }]
    const smoothed = subdivideEdges(tri, 2)
    expect(smoothed.length).toBe(6)
  })

  it('subdivideEdges returns same when segmentsPerEdge < 2', () => {
    const tri = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 10 }]
    expect(subdivideEdges(tri, 1)).toBe(tri)
  })

  it('clampToTile clamps to [0, tileSize]', () => {
    const tileSize = 100
    expect(clampToTile({ x: -10, y: 50 }, tileSize)).toEqual({ x: 0, y: 50 })
    expect(clampToTile({ x: 150, y: 50 }, tileSize)).toEqual({ x: 100, y: 50 })
    expect(clampToTile({ x: 50, y: 50 }, tileSize)).toEqual({ x: 50, y: 50 })
  })
})
