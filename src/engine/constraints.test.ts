import { describe, it, expect } from 'vitest'
import { getEdgeConstraints, applyConstraints } from './constraints'

describe('constraints', () => {
  it('getEdgeConstraints returns array for group', () => {
    const c = getEdgeConstraints('p1', 80)
    expect(Array.isArray(c)).toBe(true)
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
})
