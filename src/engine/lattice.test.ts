import { describe, it, expect } from 'vitest'
import {
  getBaseVectors,
  getTranslationsForViewport,
  countTranslations,
} from './lattice'

describe('lattice', () => {
  it('square base vectors are unit', () => {
    const [u, v] = getBaseVectors('square')
    expect(u).toEqual({ x: 1, y: 0 })
    expect(v).toEqual({ x: 0, y: 1 })
  })

  it('returns translations for viewport', () => {
    const viewport = { left: 0, top: 0, width: 200, height: 200 }
    const transforms = getTranslationsForViewport('square', 50, viewport)
    expect(transforms.length).toBeGreaterThan(0)
    expect(transforms.length).toBeLessThanOrEqual(200)
  })

  it('count increases with viewport size', () => {
    const small = countTranslations('square', 50, {
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    })
    const large = countTranslations('square', 50, {
      left: 0,
      top: 0,
      width: 500,
      height: 500,
    })
    expect(large).toBeGreaterThan(small)
  })

  it('hexagonal lattice has correct base vectors', () => {
    const [u, v] = getBaseVectors('hexagonal')
    expect(u.x).toBe(1)
    expect(u.y).toBe(0)
    expect(v.x).toBeCloseTo(0.5)
    expect(v.y).toBeCloseTo(Math.sqrt(3) / 2)
  })
})
