import { describe, it, expect } from 'vitest'
import { getEdgeConstraints, applyConstraints } from './constraints'
import { applyToPoint } from '../utils/math'

describe('constraints', () => {
  describe('getEdgeConstraints', () => {
    it('p1 returns 2 constraints: G-D and H-B by translation', () => {
      const c = getEdgeConstraints('p1', 100)
      expect(c).toHaveLength(2)
      expect(c[0].edgeA).toEqual([3, 0])
      expect(c[0].edgeB).toEqual([1, 2])
      expect(applyToPoint(c[0].transform, { x: 0, y: 50 })).toEqual({ x: 100, y: 50 })
      expect(c[1].edgeA).toEqual([0, 1])
      expect(c[1].edgeB).toEqual([2, 3])
      expect(applyToPoint(c[1].transform, { x: 50, y: 0 })).toEqual({ x: 50, y: 100 })
    })

    it('p2 returns 2 constraints with rotation 180 around center', () => {
      const c = getEdgeConstraints('p2', 100)
      expect(c).toHaveLength(2)
      expect(c[0].edgeA).toEqual([3, 0])
      expect(c[0].edgeB).toEqual([1, 2])
      expect(c[1].edgeA).toEqual([0, 1])
      expect(c[1].edgeB).toEqual([2, 3])
      const onLeft = { x: 0, y: 25 }
      const image = applyToPoint(c[0].transform, onLeft)
      expect(image.x).toBeCloseTo(100, 10)
      expect(image.y).toBeCloseTo(75, 10)
    })

    it('p4 returns 2 constraints (180 deg like p2)', () => {
      const c = getEdgeConstraints('p4', 100)
      expect(c).toHaveLength(2)
      expect(c[0].edgeA).toEqual([3, 0])
      expect(c[0].edgeB).toEqual([1, 2])
    })

    it('hexagonal groups return empty array (6-sided cell not yet supported)', () => {
      expect(getEdgeConstraints('p3', 100)).toHaveLength(0)
      expect(getEdgeConstraints('p6', 100)).toHaveLength(0)
    })
  })

  it('applyConstraints updates the moved point', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 80, y: 0 },
      { x: 80, y: 80 },
      { x: 0, y: 80 },
    ]
    const next = applyConstraints(points, 0, { x: 10, y: 10 }, 'p1', 80)
    expect(next[0]).toEqual({ x: 10, y: 10 })
  })

  it('applyConstraints propagates to paired edge for p1 (mid-edge point)', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 50 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
      { x: 10, y: 50 },
    ]
    const cornerIndices: [number, number, number, number] = [0, 1, 3, 4]
    const next = applyConstraints(points, 5, { x: 15, y: 55 }, 'p1', 100, cornerIndices)
    expect(next[5]).toEqual({ x: 15, y: 55 })
    expect(next[2].x).toBeCloseTo(115, 10)
    expect(next[2].y).toBeCloseTo(55, 10)
  })

  it('applyConstraints propagates to paired edge for p2 (rotation 180)', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 50 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
      { x: 20, y: 40 },
    ]
    const cornerIndices: [number, number, number, number] = [0, 1, 3, 4]
    const next = applyConstraints(points, 5, { x: 20, y: 40 }, 'p2', 100, cornerIndices)
    expect(next[5]).toEqual({ x: 20, y: 40 })
    const cx = 50
    const cy = 50
    const expectedX = cx + (cx - 20)
    const expectedY = cy + (cy - 40)
    expect(next[2].x).toBeCloseTo(expectedX, 10)
    expect(next[2].y).toBeCloseTo(expectedY, 10)
  })
})
